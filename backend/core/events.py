"""
Event publishing utilities for Dapr pub/sub
Handles publishing events to Kafka via Dapr sidecar
"""

import httpx
from typing import Any, Dict
from datetime import datetime
from uuid import UUID

from core.logger import get_logger

logger = get_logger(__name__)

# Dapr sidecar HTTP endpoint
DAPR_HTTP_PORT = 3500
DAPR_PUBSUB_URL = f"http://localhost:{DAPR_HTTP_PORT}/v1.0/publish/kafka-pubsub/task-events"


async def publish_task_completed_event(task: Any) -> bool:
    """
    Publish a task-completed event to Dapr pub/sub

    Args:
        task: Task model instance

    Returns:
        True if event published successfully, False otherwise
    """
    try:
        # Prepare event payload
        event_payload = {
            "event_type": "task-completed",
            "task_id": str(task.id),
            "user_id": str(task.user_id),
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "recurring_type": task.recurring_type,
            "recurring_end_date": task.recurring_end_date.isoformat() if task.recurring_end_date else None,
            "completed_at": datetime.utcnow().isoformat(),
        }

        # Publish to Dapr sidecar
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(
                DAPR_PUBSUB_URL,
                json=event_payload,
                headers={"Content-Type": "application/json"}
            )

            if response.status_code == 200:
                logger.info(
                    "Published task-completed event",
                    task_id=str(task.id),
                    recurring_type=task.recurring_type,
                )
                return True
            else:
                logger.warning(
                    "Failed to publish event",
                    task_id=str(task.id),
                    status_code=response.status_code,
                    response=response.text,
                )
                return False

    except Exception as e:
        logger.error(
            "Error publishing task-completed event",
            task_id=str(task.id),
            error=str(e),
            exc_info=True
        )
        # Don't fail the request if event publishing fails
        return False
