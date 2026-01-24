"""
Task endpoints - CRUD operations for tasks
"""

from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from db import get_session
from middleware.auth import get_current_user
from models import User
from schemas import TaskCreate, TaskUpdate, TaskPublic
from services import task_service
from exceptions import NotFoundError

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.get("", response_model=List[TaskPublic])
async def list_tasks(
    status: Optional[str] = Query(None, description="Filter by status: pending, in_progress, done, cancelled"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List all tasks for the authenticated user

    - **status**: Optional filter ("pending", "in_progress", "done", "cancelled")
    - Returns tasks sorted by created_at DESC
    """
    tasks = task_service.list_tasks(session=session, user=current_user, status=status)
    return [TaskPublic(**task.model_dump()) for task in tasks]


@router.post("", response_model=TaskPublic, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new task

    - **title**: Task title (required, 1-200 characters)
    - **description**: Optional description (max 1000 characters)
    """
    task = task_service.create_task(
        session=session,
        user=current_user,
        title=task_data.title,
        description=task_data.description
    )
    return TaskPublic(**task.model_dump())


@router.get("/{task_id}", response_model=TaskPublic)
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
        return TaskPublic(**task.model_dump())
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": e.message}
        )


@router.put("/{task_id}", response_model=TaskPublic)
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
    """
    try:
        task = task_service.update_task(
            session=session,
            task_id=task_id,
            user=current_user,
            title=task_data.title,
            description=task_data.description,
            status=task_data.status
        )
        return TaskPublic(**task.model_dump())
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


@router.patch("/{task_id}/toggle", response_model=TaskPublic)
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
        return TaskPublic(**task.model_dump())
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": e.message}
        )
