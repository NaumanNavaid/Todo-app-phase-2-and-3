"""
Notification preference management endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from db import get_session
from middleware.auth import get_current_user
from models import User
from schemas import UserPublic
from core.logger import get_logger
from core.scheduler import start_scheduler, stop_scheduler, get_scheduler_status

logger = get_logger(__name__)

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("/preferences", response_model=UserPublic)
async def get_notification_preferences(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user's notification preferences

    Returns user's notification settings including:
    - email_notifications_enabled: Whether email notifications are on
    - reminder_hours_before: How many hours before due date to remind
    - reminder_time_preference: Preferred time for daily reminders
    """
    return UserPublic(**current_user.model_dump())


@router.put("/preferences", response_model=UserPublic)
async def update_notification_preferences(
    email_notifications_enabled: bool = None,
    reminder_hours_before: int = None,
    reminder_time_preference: str = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update current user's notification preferences

    - **email_notifications_enabled**: Turn email notifications on/off
    - **reminder_hours_before**: Hours before due date to send reminder (1-168 hours)
    - **reminder_time_preference**: Preferred time for daily reminders (HH:MM format)
    """
    # Update only provided fields
    if email_notifications_enabled is not None:
        current_user.email_notifications_enabled = email_notifications_enabled

    if reminder_hours_before is not None:
        if not (1 <= reminder_hours_before <= 168):  # 1 hour to 7 days
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="reminder_hours_before must be between 1 and 168"
            )
        current_user.reminder_hours_before = reminder_hours_before

    if reminder_time_preference is not None:
        # Validate HH:MM format
        try:
            hours, minutes = map(int, reminder_time_preference.split(":"))
            if not (0 <= hours <= 23 and 0 <= minutes <= 59):
                raise ValueError()
        except (ValueError, AttributeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="reminder_time_preference must be in HH:MM format (e.g., 09:00)"
            )
        current_user.reminder_time_preference = reminder_time_preference

    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    logger.info(
        "Notification preferences updated",
        user_id=str(current_user.id),
        email_enabled=current_user.email_notifications_enabled,
        hours_before=current_user.reminder_hours_before
    )

    return UserPublic(**current_user.model_dump())


@router.post("/test-email")
async def send_test_notification(
    current_user: User = Depends(get_current_user)
):
    """
    Send a test email to verify email configuration

    Useful for testing if email notifications are working correctly
    """
    from services.email_service import send_test_email

    success = send_test_email(current_user.email)

    if success:
        logger.info(
            "Test email sent successfully",
            user_id=str(current_user.id),
            email=current_user.email
        )
        return {
            "status": "success",
            "message": f"Test email sent to {current_user.email}"
        }
    else:
        logger.warning(
            "Failed to send test email",
            user_id=str(current_user.id),
            email=current_user.email
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send test email. Check email configuration."
        )


@router.get("/scheduler/status")
async def get_scheduler_info():
    """
    Get the current status of the reminder scheduler

    Returns information about:
    - Whether scheduler is running
    - Next run time
    - Number of scheduled jobs
    """
    status = get_scheduler_status()
    return status


@router.post("/scheduler/start")
async def start_reminder_scheduler(
    check_interval_minutes: int = 60
):
    """
    Start the reminder background scheduler

    - **check_interval_minutes**: How often to check for reminders (default: 60 minutes)

    This is typically started automatically when the app starts.
    Use this endpoint to restart the scheduler if needed.
    """
    try:
        start_scheduler(check_interval_minutes)
        return {
            "status": "success",
            "message": f"Scheduler started with {check_interval_minutes} minute interval"
        }
    except Exception as e:
        logger.error("Failed to start scheduler", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start scheduler: {str(e)}"
        )


@router.post("/scheduler/stop")
async def stop_reminder_scheduler():
    """
    Stop the reminder background scheduler

    Use this endpoint to stop the scheduler if needed.
    Changes take effect immediately.
    """
    try:
        stop_scheduler()
        return {
            "status": "success",
            "message": "Scheduler stopped"
        }
    except Exception as e:
        logger.error("Failed to stop scheduler", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to stop scheduler: {str(e)}"
        )
