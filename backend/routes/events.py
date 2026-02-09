"""
Event consumer routes for Dapr pub/sub
Handles task-completed events to create recurring tasks
"""

from typing import Optional
from datetime import datetime, timedelta
from uuid import UUID
from dateutil.relativedelta import relativedelta

from fastapi import APIRouter, Request, HTTPException, status, Depends
from sqlmodel import Session, select

from db import get_session
from core.logger import get_logger
from models import Task, User
from exceptions import NotFoundError

logger = get_logger(__name__)

router = APIRouter(prefix="/api/events", tags=["Events"])


def calculate_next_due_date(completed_date: datetime, recurring_type: str) -> Optional[datetime]:
    """
    Calculate the next due date based on recurring type

    Args:
        completed_date: The date the task was completed
        recurring_type: Type of recurrence (daily, weekly, monthly)

    Returns:
        Next due date or None if invalid recurring_type
    """
    if recurring_type == "daily":
        return completed_date + timedelta(days=1)
    elif recurring_type == "weekly":
        return completed_date + timedelta(weeks=1)
    elif recurring_type == "monthly":
        return completed_date + relativedelta(months=1)
    else:
        return None


@router.post("/task-completed")
async def handle_task_completed_event(
    request: Request,
    session: Session = Depends(get_session)
):
    """
    Handle task-completed events from Dapr pub/sub

    Event payload:
    {
        "event_type": "task-completed",
        "task_id": "uuid",
        "user_id": "uuid",
        "title": "string",
        "description": "string" | null,
        "priority": "string",
        "recurring_type": "none|daily|weekly|monthly",
        "recurring_end_date": "ISO8601" | null,
        "completed_at": "ISO8601"
    }

    This endpoint:
    1. Receives task-completed event
    2. Checks if task has recurring_type != "none"
    3. Checks if recurring_end_date not exceeded
    4. Calculates next due_date
    5. Creates new task with same properties
    6. Links to parent task via parent_task_id
    """
    try:
        # Parse event payload from Dapr
        event_data = await request.json()

        logger.info(
            "Received task-completed event",
            task_id=event_data.get("task_id"),
            user_id=event_data.get("user_id"),
            recurring_type=event_data.get("recurring_type"),
        )

        # Validate required fields
        required_fields = ["event_type", "task_id", "user_id", "title", "completed_at"]
        for field in required_fields:
            if field not in event_data:
                logger.error("Missing required field in event", field=field)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required field: {field}"
                )

        # Verify this is a task-completed event
        if event_data["event_type"] != "task-completed":
            logger.warning("Ignoring non-task-completed event", event_type=event_data["event_type"])
            return {"status": "ignored", "reason": "Not a task-completed event"}

        # Check if task is recurring
        recurring_type = event_data.get("recurring_type", "none")
        if recurring_type == "none":
            logger.info("Task is not recurring, skipping")
            return {"status": "skipped", "reason": "Task is not recurring"}

        # Parse dates
        try:
            completed_at = datetime.fromisoformat(event_data["completed_at"].replace("Z", "+00:00"))
            recurring_end_date_str = event_data.get("recurring_end_date")
            recurring_end_date = (
                datetime.fromisoformat(recurring_end_date_str.replace("Z", "+00:00"))
                if recurring_end_date_str
                else None
            )
        except ValueError as e:
            logger.error("Invalid date format in event", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format in event"
            )

        # Check if recurring end date has passed
        if recurring_end_date and completed_at >= recurring_end_date:
            logger.info(
                "Recurring end date passed, not creating new task",
                recurring_end_date=recurring_end_date.isoformat(),
                completed_at=completed_at.isoformat()
            )
            return {"status": "skipped", "reason": "Recurring end date passed"}

        # Calculate next due date
        next_due_date = calculate_next_due_date(completed_at, recurring_type)
        if not next_due_date:
            logger.warning("Could not calculate next due date", recurring_type=recurring_type)
            return {"status": "skipped", "reason": "Invalid recurring type"}

        # Get user
        try:
            user_id = UUID(event_data["user_id"])
            user = session.get(User, user_id)
            if not user:
                logger.error("User not found", user_id=str(user_id))
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
        except ValueError:
            logger.error("Invalid user_id format", user_id=event_data["user_id"])
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user_id format"
            )

        # Get parent task
        try:
            parent_task_id = UUID(event_data["task_id"])
            parent_task = session.get(Task, parent_task_id)
            if not parent_task:
                logger.error("Parent task not found", task_id=str(parent_task_id))
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent task not found"
                )
        except ValueError:
            logger.error("Invalid task_id format", task_id=event_data["task_id"])
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid task_id format"
            )

        # Get parent task tags
        from models import TaskTag, Tag
        parent_tags = session.exec(
            select(Tag)
            .join(TaskTag, TaskTag.tag_id == Tag.id)
            .where(TaskTag.task_id == parent_task_id)
        ).all()

        # Create new recurring task
        new_task = Task(
            user_id=user.id,
            title=event_data["title"],
            description=event_data.get("description"),
            status="pending",
            priority=event_data.get("priority", "medium"),
            due_date=next_due_date,
            recurring_type=recurring_type,
            recurring_end_date=recurring_end_date,
            parent_task_id=parent_task_id,
        )

        session.add(new_task)
        session.commit()
        session.refresh(new_task)

        # Copy tags from parent task
        for tag in parent_tags:
            task_tag = TaskTag(task_id=new_task.id, tag_id=tag.id)
            session.add(task_tag)

        session.commit()

        logger.info(
            "Created recurring task",
            new_task_id=str(new_task.id),
            parent_task_id=str(parent_task_id),
            next_due_date=next_due_date.isoformat(),
        )

        return {
            "status": "success",
            "message": "Recurring task created",
            "new_task_id": str(new_task.id),
            "next_due_date": next_due_date.isoformat(),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error processing task-completed event", error=str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process task-completed event"
        )
