"""
Helper functions for task tag loading
"""

from sqlmodel import Session, select
from uuid import UUID
from models import Task, Tag


def load_tags_for_tasks(session: Session, tasks: list[Task]) -> list[Task]:
    """
    Manually load tags for a list of tasks.
    This is a workaround for SQLModel relationship loading issues.

    Args:
        session: Database session
        tasks: List of Task objects

    Returns:
        Same Task objects with tags populated
    """
    # Get all task IDs
    task_ids = [task.id for task in tasks]

    if not task_ids:
        return tasks

    # Query all task_tags for these tasks
    from sqlalchemy import and_
    from models import TaskTag

    task_tag_results = session.exec(
        select(TaskTag.task_id, TaskTag.tag_id, Tag)
        .join(Tag, TaskTag.tag_id == Tag.id)
        .where(TaskTag.task_id.in_(task_ids))
    ).all()

    # Build a dictionary of task_id -> list of tags
    task_tags_map = {}
    for task_id, tag_id, tag in task_tag_results:
        if task_id not in task_tags_map:
            task_tags_map[task_id] = []
        task_tags_map[task_id].append(tag)

    # Attach tags to tasks
    for task in tasks:
        if task.id in task_tags_map:
            task.tags = task_tags_map[task.id]
        else:
            task.tags = []

    return tasks


def load_tags_for_task(session: Session, task: Task) -> Task:
    """
    Manually load tags for a single task.

    Args:
        session: Database session
        task: Task object

    Returns:
        Same Task object with tags populated
    """
    return load_tags_for_tasks(session, [task])[0]
