"""
Task endpoints - CRUD operations for tasks
Phase V: Event publishing for recurring tasks
"""

from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from db import get_session
from middleware.auth import get_current_user
from models import User, TaskTag, Tag
from schemas import TaskCreate, TaskUpdate, TaskPublic, TagPublic
from services import task_service
from exceptions import NotFoundError
from core.events import publish_task_completed_event
from core.logger import get_logger

logger = get_logger(__name__)


def get_tags_for_task(session: Session, task_id: UUID) -> List[dict]:
    """
    Manually query tags for a task and return as dict list with JSON-serializable values
    """
    task_tag_results = session.exec(
        select(Tag)
        .join(TaskTag, TaskTag.tag_id == Tag.id)
        .where(TaskTag.task_id == task_id)
    ).all()

    # Convert to dict with JSON-serializable values
    return [
        {
            "id": str(tag.id),
            "user_id": str(tag.user_id),
            "name": tag.name,
            "color": tag.color,
            "created_at": tag.created_at.isoformat()
        }
        for tag in task_tag_results
    ]


def task_to_dict_with_tags(session: Session, task) -> dict:
    """
    Convert task to dict with tags included (JSON-serializable)
    """
    task_dict = task.model_dump(exclude={'tags'})

    # Convert UUIDs to strings
    task_dict['id'] = str(task_dict['id'])
    task_dict['user_id'] = str(task_dict['user_id'])

    # Convert datetime to ISO format (handle None values)
    if task_dict.get('created_at'):
        task_dict['created_at'] = task_dict['created_at'].isoformat()
    if task_dict.get('updated_at'):
        task_dict['updated_at'] = task_dict['updated_at'].isoformat()
    if task_dict.get('due_date') is not None:
        task_dict['due_date'] = task_dict['due_date'].isoformat()
    if task_dict.get('recurring_end_date') is not None:
        task_dict['recurring_end_date'] = task_dict['recurring_end_date'].isoformat()

    # Add tags
    task_dict['tags'] = get_tags_for_task(session, task.id)

    return task_dict

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.get("")
async def list_tasks(
    status: Optional[str] = Query(None, description="Filter by status: pending, in_progress, done, cancelled"),
    priority: Optional[str] = Query(None, description="Filter by priority: low, medium, high, urgent"),
    tag_id: Optional[str] = Query(None, description="Filter by tag ID"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List all tasks for the authenticated user

    - **status**: Optional filter ("pending", "in_progress", "done", "cancelled")
    - **priority**: Optional filter ("low", "medium", "high", "urgent")
    - **tag_id**: Optional filter by tag ID (UUID)
    - Returns tasks sorted by created_at DESC
    """
    tasks = task_service.list_tasks(session=session, user=current_user, status=status, priority=priority, tag_id=tag_id)
    return [task_to_dict_with_tags(session, task) for task in tasks]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new task

    - **title**: Task title (required, 1-200 characters)
    - **description**: Optional description (max 1000 characters)
    - **priority**: Task priority (low, medium, high, urgent)
    - **due_date**: Optional due date
    - **tag_ids**: Optional list of tag IDs to associate
    """
    task = task_service.create_task(
        session=session,
        user=current_user,
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        due_date=task_data.due_date,
        recurring_type=task_data.recurring_type,
        recurring_end_date=task_data.recurring_end_date,
        tag_ids=task_data.tag_ids
    )
    return task_to_dict_with_tags(session, task)


@router.get("/{task_id}")
async def get_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get a specific task by ID

    Only returns tasks that belong to the authenticated user
    """
    try:
        task = task_service.get_task_by_id(session=session, task_id=task_id, user=current_user)
        return task_to_dict_with_tags(session, task)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": e.message}
        )


@router.put("/{task_id}")
async def update_task(
    task_id: UUID,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update a task

    - **title**: Optional new title
    - **description**: Optional new description
    - **status**: Optional new status ("pending", "in_progress", "done", "cancelled")
    - **priority**: Optional new priority (low, medium, high, urgent)
    - **due_date**: Optional new due date (set to null to clear)
    - **tag_ids**: Optional new list of tag IDs
    """
    try:
        # Get current task before update to check status change
        try:
            old_task = task_service.get_task_by_id(session=session, task_id=task_id, user=current_user)
            old_status = old_task.status
        except NotFoundError:
            old_status = None

        # Check if due_date was explicitly set to None (to clear it)
        provided_fields = task_data.model_dump(exclude_unset=True)
        clear_due_date = 'due_date' in provided_fields and task_data.due_date is None

        task = task_service.update_task(
            session=session,
            task_id=task_id,
            user=current_user,
            title=task_data.title,
            description=task_data.description,
            status=task_data.status,
            priority=task_data.priority,
            due_date=task_data.due_date,
            tag_ids=task_data.tag_ids,
            clear_due_date=clear_due_date
        )

        # Phase V: Publish task-completed event if status changed to "done"
        if task.status == "done" and old_status != "done":
            logger.info(
                "Task completed, publishing event",
                task_id=str(task.id),
                recurring_type=task.recurring_type
            )
            await publish_task_completed_event(task)

        return task_to_dict_with_tags(session, task)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": e.message}
        )


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete a task

    Only deletes tasks that belong to the authenticated user
    """
    try:
        task_service.delete_task(session=session, task_id=task_id, user=current_user)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": e.message}
        )


@router.patch("/{task_id}/toggle")
async def toggle_task_status(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Toggle task status through the workflow

    - Cycles: pending → in_progress → done → pending
    - Cancelled tasks reset to pending
    - Only works on tasks that belong to the authenticated user
    """
    try:
        task = task_service.toggle_task_status(session=session, task_id=task_id, user=current_user)

        # Phase V: Publish task-completed event if status changed to "done"
        if task.status == "done":
            logger.info(
                "Task completed via toggle, publishing event",
                task_id=str(task.id),
                recurring_type=task.recurring_type
            )
            await publish_task_completed_event(task)

        return task_to_dict_with_tags(session, task)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": e.message}
        )
