"""
Global exception handler middleware for FastAPI
Catches all exceptions and returns structured JSON error responses
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException
from typing import Union
import uuid

from core.logger import get_logger

logger = get_logger(__name__)


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Global exception handler that catches all unhandled exceptions

    Args:
        request: FastAPI request object
        exc: The exception that was raised

    Returns:
        JSONResponse with error details
    """
    # Handle HTTPException by converting to JSONResponse
    if isinstance(exc, HTTPException):
        logger.warning(
            "HTTP exception",
            status_code=exc.status_code,
            detail=exc.detail,
            path=request.url.path,
            method=request.method,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.detail if isinstance(exc.detail, dict) else {"detail": exc.detail},
        )

    # Generate a unique error ID for tracing
    error_id = str(uuid.uuid4())

    # Log the full error with context
    logger.error(
        "Unhandled exception",
        error_id=error_id,
        error_type=type(exc).__name__,
        error_message=str(exc),
        path=request.url.path,
        method=request.method,
    )

    # Determine appropriate status code
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR

    # Return user-friendly error response
    return JSONResponse(
        status_code=status_code,
        content={
            "error": "Internal Server Error",
            "detail": "An unexpected error occurred. Please try again later.",
            "error_id": error_id,
        },
    )


async def validation_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle validation errors (Pydantic validation failures)

    Args:
        request: FastAPI request object
        exc: The validation exception

    Returns:
        JSONResponse with validation error details
    """
    error_id = str(uuid.uuid4())

    logger.warning(
        "Validation error",
        error_id=error_id,
        error_type=type(exc).__name__,
        error_message=str(exc),
        path=request.url.path,
        method=request.method,
    )

    # Try to extract validation details from FastAPI's RequestValidationError
    if hasattr(exc, "errors"):
        errors = exc.errors()  # type: ignore
        detail = [
            {
                "field": " -> ".join(str(loc) for loc in error["loc"]),
                "message": error["msg"],
                "type": error["type"],
            }
            for error in errors
        ]
    else:
        detail = str(exc)

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "detail": detail,
            "error_id": error_id,
        },
    )
