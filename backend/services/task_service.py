"""
Task service - business logic for task management
"""

from typing import Optional, List
from datetime import datetime
from sqlmodel import Session, select
from uuid import UUID

from models import Task, User, TaskTag, Tag
from exceptions import NotFoundError, ValidationError
from services import task_service_helper


def create_task(session: Session, user: User, title: str, description: Optional[str] = None,
                priority: str = "medium", due_date: Optional[datetime] = None,
                recurring_type: str = "none", recurring_end_date: Optional[datetime] = None,
                tag_ids: list[UUID] = None) -> Task:
    """
    Create a new task for a user

    Args:
        session: Database session
        user: User object (owner of the task)
        title: Task title
        description: Optional task description
        priority: Task priority (low, medium, high, urgent)
        due_date: Optional due date for the task
        recurring_type: Type of recurrence (none, daily, weekly, monthly)
        recurring_end_date: Optional end date for recurrence
        tag_ids: Optional list of tag IDs to associate with the task

    Returns:
        Created Task object
    """
    if tag_ids is None:
        tag_ids = []

    task = Task(
        user_id=user.id,
        title=title,
        description=description,
        status="pending",
        priority=priority,
        due_date=due_date,
        recurring_type=recurring_type,
        recurring_end_date=recurring_end_date
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    # Associate tags with the task
    if tag_ids:
        for tag_id in tag_ids:
            task_tag = TaskTag(task_id=task.id, tag_id=tag_id)
            session.add(task_tag)
        session.commit()

    # Reload task with tags
    task = get_task_by_id(session, task.id, user)

    return task


def list_tasks(session: Session, user: User, status: Optional[str] = None,
                priority: Optional[str] = None, tag_id: Optional[str] = None) -> List[Task]:
    """
    List all tasks for a user, optionally filtered by status, priority, and tag

    Args:
        session: Database session
        user: User object
        status: Optional filter for task status ("pending", "in_progress", "done", "cancelled")
        priority: Optional filter for task priority
        tag_id: Optional filter by tag ID (UUID as string)

    Returns:
        List of Task objects sorted by created_at DESC
    """
    query = select(Task).where(Task.user_id == user.id)

    if status and status in ("pending", "in_progress", "done", "cancelled"):
        query = query.where(Task.status == status)

    if priority and priority in ("low", "medium", "high", "urgent"):
        query = query.where(Task.priority == priority)

    if tag_id:
        try:
            # Convert tag_id string to UUID for proper comparison
            tag_uuid = UUID(tag_id)
            # Join with TaskTag to filter by tag_id and use distinct to avoid duplicates
            query = query.join(TaskTag, TaskTag.task_id == Task.id).where(TaskTag.tag_id == tag_uuid).distinct()
        except ValueError:
            # Invalid UUID format, ignore filter
            pass

    query = query.order_by(Task.created_at.desc())

    tasks = list(session.exec(query).all())

    # Manually load tags for all tasks
    tasks = task_service_helper.load_tags_for_tasks(session, tasks)

    return tasks


def get_task_by_id(session: Session, task_id: UUID, user: User) -> Task:
    """
    Get a specific task by ID, verifying user ownership

    Args:
        session: Database session
        task_id: Task UUID
        user: User object (for ownership verification)

    Returns:
        Task object

    Raises:
        NotFoundError: If task not found or doesn't belong to user
    """
    task = session.get(Task, task_id)

    if not task or task.user_id != user.id:
        raise NotFoundError("Task")

    # Manually load tags
    task = task_service_helper.load_tags_for_task(session, task)

    return task


def update_task(session: Session, task_id: UUID, user: User,
                title: Optional[str] = None,
                description: Optional[str] = None,
                status: Optional[str] = None,
                priority: Optional[str] = None,
                due_date: Optional[datetime] = None,
                tag_ids: Optional[list[UUID]] = None,
                clear_due_date: bool = False) -> Task:
    """
    Update a task

    Args:
        session: Database session
        task_id: Task UUID
        user: User object (for ownership verification)
        title: Optional new title
        description: Optional new description
        status: Optional new status
        priority: Optional new priority
        due_date: Optional new due date
        tag_ids: Optional new list of tag IDs
        clear_due_date: If True, clear the due_date field

    Returns:
        Updated Task object

    Raises:
        NotFoundError: If task not found or doesn't belong to user
    """
    task = get_task_by_id(session, task_id, user)

    if title is not None:
        task.title = title
    if description is not None:
        task.description = description
    if status is not None:
        task.status = status
    if priority is not None:
        task.priority = priority
    if due_date is not None:
        task.due_date = due_date
    if clear_due_date:
        task.due_date = None

    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()

    # Update tags if provided
    if tag_ids is not None:
        # Remove existing tag associations using DELETE statement
        from sqlalchemy import delete
        session.exec(delete(TaskTag).where(TaskTag.task_id == task_id))

        # Add new tag associations
        for tag_id in tag_ids:
            task_tag = TaskTag(task_id=task.id, tag_id=tag_id)
            session.add(task_tag)

        session.commit()

    # Reload task with tags
    task = get_task_by_id(session, task_id, user)

    return task


def delete_task(session: Session, task_id: UUID, user: User) -> None:
    """
    Delete a task

    Args:
        session: Database session
        task_id: Task UUID
        user: User object (for ownership verification)

    Raises:
        NotFoundError: If task not found or doesn't belong to user
    """
    task = get_task_by_id(session, task_id, user)

    session.delete(task)
    session.commit()


def toggle_task_status(session: Session, task_id: UUID, user: User) -> Task:
    """
    Toggle task status through the workflow: pending -> in_progress -> done -> pending

    Cancelled tasks reset to pending when toggled.

    Args:
        session: Database session
        task_id: Task UUID
        user: User object (for ownership verification)

    Returns:
        Updated Task object

    Raises:
        NotFoundError: If task not found or doesn't belong to user
    """
    task = get_task_by_id(session, task_id, user)

    # Cycle through statuses: pending -> in_progress -> done -> pending
    # Cancelled tasks reset to pending
    status_flow = {
        "pending": "in_progress",
        "in_progress": "done",
        "done": "pending",
        "cancelled": "pending"
    }

    task.status = status_flow.get(task.status, "pending")
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()

    # Reload task with tags
    task = get_task_by_id(session, task_id, user)

    return task
