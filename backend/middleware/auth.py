"""
JWT Authentication middleware for FastAPI
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session
from uuid import UUID

from db import get_session
from models import User
from exceptions import AuthError, NotFoundError

# JWT token functions
def decode_access_token(token: str) -> dict:
    """Decode JWT access token"""
    from services.auth_service import verify_token
    return verify_token(token)


# HTTP Bearer token scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    """
    Dependency to get current authenticated user from JWT token

    Args:
        credentials: HTTP Bearer credentials
        session: Database session

    Returns:
        Authenticated User object

    Raises:
        HTTPException: If token is invalid or user not found
    """
    try:
        # Decode and verify token
        token = credentials.credentials
        payload = decode_access_token(token)

        # Extract user ID from token
        user_id: str = payload.get("sub")
        if user_id is None:
            raise AuthError("Invalid token payload")

        # Convert string to UUID for database query
        user_id_uuid = UUID(user_id)

        # Get user from database
        user = session.get(User, user_id_uuid)
        if user is None:
            raise NotFoundError("User")

        return user

    except AuthError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=e.message,
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    session: Session = Depends(get_session)
) -> Optional[User]:
    """
    Optional authentication - returns user if token provided, None otherwise

    Args:
        credentials: Optional HTTP Bearer credentials
        session: Database session

    Returns:
        User object if authenticated, None otherwise
    """
    if credentials is None:
        return None

    try:
        token = credentials.credentials
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")

        if user_id:
            return session.get(User, user_id)

    except Exception:
        pass

    return None
