"""
Background task scheduler for reminder notifications
Uses APScheduler to run periodic reminder checks
"""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
import asyncio

from core.logger import get_logger
from db import get_session
from services.notification_service import process_reminders

logger = get_logger(__name__)

# Global scheduler instance
scheduler: AsyncIOScheduler = None


def reminder_job():
    """
    Background job to process and send reminders
    Runs every hour by default
    """
    logger.info("Starting reminder job...")

    try:
        with get_session() as session:
            # Process reminders for tasks due in the next 24 hours
            stats = process_reminders(session, hours_ahead=24)

            logger.info(
                "Reminder job completed",
                **stats
            )

    except Exception as e:
        logger.error(
            "Error in reminder job",
            error=str(e),
            exc_info=True
        )


def start_scheduler(check_interval_minutes: int = 60) -> None:
    """
    Start the background scheduler

    Args:
        check_interval_minutes: How often to check for reminders (default: 60 minutes)
    """
    global scheduler

    if scheduler is not None and scheduler.running:
        logger.warning("Scheduler already running")
        return

    logger.info(
        "Starting reminder scheduler",
        interval_minutes=check_interval_minutes
    )

    # Create scheduler
    scheduler = AsyncIOScheduler()

    # Add reminder job - runs every X minutes
    scheduler.add_job(
        reminder_job,
        trigger=IntervalTrigger(minutes=check_interval_minutes),
        id="reminder_job",
        name="Process Task Reminders",
        replace_existing=True
    )

    # Start scheduler
    scheduler.start()

    logger.info(
        "Scheduler started successfully",
        next_run_time=scheduler.get_job("reminder_job").next_run_time
    )


def stop_scheduler() -> None:
    """Stop the background scheduler"""
    global scheduler

    if scheduler is None or not scheduler.running:
        logger.warning("Scheduler not running")
        return

    logger.info("Stopping scheduler...")
    scheduler.shutdown()
    scheduler = None
    logger.info("Scheduler stopped")


def get_scheduler_status() -> dict:
    """
    Get the current status of the scheduler

    Returns:
        Dictionary with scheduler status information
    """
    global scheduler

    if scheduler is None:
        return {
            "running": False,
            "status": "not_initialized"
        }

    if not scheduler.running:
        return {
            "running": False,
            "status": "stopped"
        }

    job = scheduler.get_job("reminder_job")

    return {
        "running": True,
        "status": "running",
        "next_run_time": job.next_run_time.isoformat() if job else None,
        "job_count": len(scheduler.get_jobs())
    }
