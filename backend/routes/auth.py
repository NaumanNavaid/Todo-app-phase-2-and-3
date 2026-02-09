"""
Authentication endpoints - register, login, get current user
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from db import get_session
from middleware.auth import get_current_user
from models import User
from schemas import UserRegister, UserLogin, TokenResponse, UserPublic
from services import auth_service
from services.auth_service import create_access_token
from exceptions import ConflictError, AuthError

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    session: Session = Depends(get_session)
):
    """
    Register a new user

    - **email**: User email address (must be unique)
    - **password**: Password (min 8 characters)
    - **name**: Optional display name
    """
    try:
        user = auth_service.create_user(
            session=session,
            email=user_data.email,
            password=user_data.password,
            name=user_data.name
        )
        return UserPublic(**user.model_dump(exclude={'password_hash'}))

    except ConflictError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": e.message}
        )


@router.post("/login", response_model=TokenResponse)
async def login(
    user_data: UserLogin,
    session: Session = Depends(get_session)
):
    """
    Login and get JWT token

    - **email**: User email address
    - **password**: User password

    Returns access token and user information
    """
    try:
        # Authenticate user
        user = auth_service.authenticate_user(
            session=session,
            email=user_data.email,
            password=user_data.password
        )

        # Create JWT token
        access_token = create_access_token(data={"sub": str(user.id)})

        # Return token with user info
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserPublic(**user.model_dump())
        )

    except AuthError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": e.message},
            headers={"WWW-Authenticate": "Bearer"}
        )


@router.get("/me", response_model=UserPublic)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current authenticated user information

    Requires valid JWT token in Authorization header
    """
    return UserPublic(**current_user.model_dump())
