"""
Task service - business logic for task management
"""

from typing import Optional, List
from datetime import datetime
from sqlmodel import Session, select
from uuid import UUID

from models import Task, User
from exceptions import NotFoundError, ValidationError


def create_task(session: Session, user: User, title: str, description: Optional[str] = None) -> Task:
    """
    Create a new task for a user

    Args:
        session: Database session
        user: User object (owner of the task)
        title: Task title
        description: Optional task description

    Returns:
        Created Task object
    """
    task = Task(
        user_id=user.id,
        title=title,
        description=description,
        status="pending"
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    return task


def list_tasks(session: Session, user: User, status: Optional[str] = None) -> List[Task]:
    """
    List all tasks for a user, optionally filtered by status

    Args:
        session: Database session
        user: User object
        status: Optional filter for task status ("pending" or "done")

    Returns:
        List of Task objects sorted by created_at DESC
    """
    query = select(Task).where(Task.user_id == user.id)

    if status and status in ("pending", "in_progress", "done", "cancelled"):
        query = query.where(Task.status == status)

    query = query.order_by(Task.created_at.desc())

    return list(session.exec(query).all())


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

    return task


def update_task(session: Session, task_id: UUID, user: User,
                title: Optional[str] = None,
                description: Optional[str] = None,
                status: Optional[str] = None) -> Task:
    """
    Update a task

    Args:
        session: Database session
        task_id: Task UUID
        user: User object (for ownership verification)
        title: Optional new title
        description: Optional new description
        status: Optional new status

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

    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

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
    session.refresh(task)

    return task
