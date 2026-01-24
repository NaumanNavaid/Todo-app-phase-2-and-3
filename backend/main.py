"""
FastAPI Todo Application with Authentication and PostgreSQL Database
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from db import init_db
from routes import auth, tasks, chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler for startup and shutdown
    Initializes database on startup
    """
    # Startup
    print("Starting Todo API...")
    print(f"Environment: {settings.environment}")
    print(f"CORS Origins: {settings.cors_origins_list}")

    # Initialize database tables
    try:
        init_db()
        print("OK Database initialized successfully")
    except Exception as e:
        print(f"WARNING Database initialization warning: {e}")

    yield

    # Shutdown
    print("Shutting down Todo API...")


# Create FastAPI app
app = FastAPI(
    title="Todo API",
    description="REST API for task management with JWT authentication",
    version="2.0.0",
    lifespan=lifespan
)

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
app.include_router(chat.router)


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "Todo API",
        "version": "2.0.0",
        "status": "running",
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
            "chat": {
                "POST /api/{user_id}/chat": "Send message to AI assistant (requires auth)"
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
        "environment": settings.environment
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.environment == "development"
    )
