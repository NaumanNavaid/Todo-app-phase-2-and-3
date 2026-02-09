"""
Notification service for sending task reminders
Supports email notifications (extensible for SMS, push, etc.)
"""

from typing import Optional
from datetime import datetime, timedelta
from uuid import UUID

from sqlalchemy.orm import Session
from sqlmodel import select

from core.logger import get_logger
from models import Task, User
from services.email_service import send_email

logger = get_logger(__name__)


def get_tasks_due_soon(
    session: Session,
    hours_ahead: int = 24,
    reminder_type: str = "email"
) -> list[Task]:
    """
    Get tasks that are due soon and haven't had reminders sent

    Args:
        session: Database session
        hours_ahead: How many hours ahead to look for due tasks
        reminder_type: Type of reminder (email, sms, push)

    Returns:
        List of tasks that need reminders
    """
    now = datetime.utcnow()
    due_threshold = now + timedelta(hours=hours_ahead)

    # Get tasks where:
    # 1. Task is not done
    # 2. Due date is within the next X hours
    # 3. Reminder hasn't been sent yet
    statement = select(Task).join(User).where(
        Task.status == "pending",
        Task.due_date >= now,
        Task.due_date <= due_threshold,
        Task.reminder_sent == False
    )

    results = session.exec(statement)
    tasks = results.all()

    logger.info(
        f"Found {len(tasks)} tasks due within {hours_ahead} hours",
        count=len(tasks),
        hours_ahead=hours_ahead
    )

    return tasks


def send_task_reminder(task: Task, user: User) -> bool:
    """
    Send a reminder notification for a task

    Args:
        task: The task to remind about
        user: The user to notify

    Returns:
        True if reminder sent successfully, False otherwise
    """
    try:
        # Send email reminder
        subject = f"Reminder: {task.title} is due soon!"
        body = f"""
Hi {user.name},

This is a reminder that your task is due soon:

Task: {task.title}
Due: {task.due_date.strftime('%Y-%m-%d at %I:%M %p')}
Priority: {task.priority.upper()}
{f'Description: {task.description}' if task.description else ''}

Please make sure to complete it on time!

Best regards,
Todo App
        """.strip()

        success = send_email(
            to_email=user.email,
            subject=subject,
            body=body
        )

        if success:
            logger.info(
                "Reminder sent successfully",
                task_id=str(task.id),
                user_id=str(user.id),
                user_email=user.email
            )
            return True
        else:
            logger.warning(
                "Failed to send reminder",
                task_id=str(task.id),
                user_id=str(user.id)
            )
            return False

    except Exception as e:
        logger.error(
            "Error sending task reminder",
            task_id=str(task.id),
            user_id=str(user.id),
            error=str(e),
            exc_info=True
        )
        return False


def mark_reminder_sent(session: Session, task: Task) -> None:
    """
    Mark a task as having had its reminder sent

    Args:
        session: Database session
        task: The task to mark
    """
    task.reminder_sent = True
    session.add(task)
    session.commit()

    logger.info(
        "Marked reminder as sent",
        task_id=str(task.id)
    )


def process_reminders(session: Session, hours_ahead: int = 24) -> dict:
    """
    Process all pending reminders

    Args:
        session: Database session
        hours_ahead: How many hours ahead to check

    Returns:
        Dictionary with processing statistics
    """
    tasks = get_tasks_due_soon(session, hours_ahead=hours_ahead)

    stats = {
        "total": len(tasks),
        "sent": 0,
        "failed": 0,
        "errors": 0
    }

    for task in tasks:
        try:
            # Refresh task to get user relationship
            session.refresh(task)
            user = session.get(User, task.user_id)

            if not user:
                logger.warning(
                    "User not found for task",
                    task_id=str(task.id),
                    user_id=str(task.user_id)
                )
                stats["errors"] += 1
                continue

            # Send reminder
            success = send_task_reminder(task, user)

            if success:
                # Mark reminder as sent
                mark_reminder_sent(session, task)
                stats["sent"] += 1
            else:
                stats["failed"] += 1

        except Exception as e:
            logger.error(
                "Error processing reminder for task",
                task_id=str(task.id),
                error=str(e),
                exc_info=True
            )
            stats["errors"] += 1

    logger.info(
        "Reminder processing complete",
        **stats
    )

    return stats
