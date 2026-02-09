"""
FastAPI Todo Application with Authentication and PostgreSQL Database
Phase V: Event-Driven Architecture with Dapr + Kafka
Phase V+: Reminder Notifications with Background Scheduler
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from config import settings
from db import init_db
from routes import auth, tasks, chat, tags, events, notifications
from core.logger import get_logger, configure_logging
from middleware.error_handler import global_exception_handler, validation_exception_handler

# Configure structured logging
configure_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler for startup and shutdown
    Initializes database and starts reminder scheduler on startup
    """
    # Startup
    logger.info(
        "Starting Todo API",
        environment=settings.environment,
        cors_origins=settings.cors_origins_list,
    )

    # Initialize database tables
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error("Database initialization failed", error=str(e))
        raise

    # Start reminder scheduler
    try:
        from core.scheduler import start_scheduler
        start_scheduler(check_interval_minutes=60)  # Check every hour
        logger.info("Reminder scheduler started")
    except Exception as e:
        logger.warning("Failed to start reminder scheduler", error=str(e))

    yield

    # Shutdown
    logger.info("Shutting down Todo API")

    # Stop reminder scheduler
    try:
        from core.scheduler import stop_scheduler
        stop_scheduler()
        logger.info("Reminder scheduler stopped")
    except Exception as e:
        logger.warning("Failed to stop reminder scheduler", error=str(e))


# Create FastAPI app
app = FastAPI(
    title="Todo API",
    description="REST API for task management with JWT auth, tags, AI assistant, event-driven architecture, and reminder notifications",
    version="5.1.0",
    lifespan=lifespan
)

# Register global exception handlers
app.add_exception_handler(Exception, global_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(StarletteHTTPException, global_exception_handler)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(tags.router)
app.include_router(chat.router)
app.include_router(events.router)
app.include_router(notifications.router)


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "Todo API",
        "version": "5.1.0",
        "status": "running",
        "features": [
            "JWT Authentication",
            "Task CRUD with tags",
            "AI Chatbot (OpenAI + MCP)",
            "Event-driven architecture (Dapr + Kafka)",
            "Recurring tasks (daily/weekly/monthly)",
            "Reminder notifications (email)",
            "Background job scheduler",
            "Structured logging"
        ],
        "endpoints": {
            "authentication": {
                "POST /api/auth/register": "Create a new user account",
                "POST /api/auth/login": "Login and get JWT token",
                "GET /api/auth/me": "Get current user info (requires auth)"
            },
            "tasks": {
                "GET /api/tasks": "List all tasks (requires auth)",
                "POST /api/tasks": "Create a new task (requires auth)",
                "GET /api/tasks/{id}": "Get a specific task (requires auth)",
                "PUT /api/tasks/{id}": "Update a task (requires auth)",
                "DELETE /api/tasks/{id}": "Delete a task (requires auth)",
                "PATCH /api/tasks/{id}/toggle": "Toggle task status (requires auth)"
            },
            "tags": {
                "GET /api/tags": "List all tags (requires auth)",
                "POST /api/tags": "Create a new tag (requires auth)",
                "GET /api/tags/{id}": "Get a specific tag (requires auth)",
                "PUT /api/tags/{id}": "Update a tag (requires auth)",
                "DELETE /api/tags/{id}": "Delete a tag (requires auth)"
            },
            "chat": {
                "POST /api/{user_id}/chat": "Send message to AI assistant with tag support (requires auth)"
            },
            "events": {
                "POST /api/events/task-completed": "Subscribe to task completion events (Dapr)"
            },
            "notifications": {
                "GET /api/notifications/preferences": "Get notification preferences (requires auth)",
                "PUT /api/notifications/preferences": "Update notification preferences (requires auth)",
                "POST /api/notifications/test-email": "Send test email (requires auth)",
                "GET /api/notifications/scheduler/status": "Get scheduler status",
                "POST /api/notifications/scheduler/start": "Start reminder scheduler",
                "POST /api/notifications/scheduler/stop": "Stop reminder scheduler"
            }
        },
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc",
            "openapi": "/openapi.json"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "environment": settings.environment,
        "version": "5.1.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.environment == "development"
    )
