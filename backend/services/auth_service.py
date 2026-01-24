"""
Authentication service - business logic for user authentication
"""

from typing import Optional, Dict
import bcrypt
from datetime import datetime, timedelta
from sqlmodel import Session, select
from jose import JWTError, jwt

from models import User
from exceptions import ValidationError, ConflictError, AuthError
from config import settings


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt

    Args:
        password: Plain text password

    Returns:
        Hashed password
    """
    # Convert to bytes and hash
    password_bytes = password.encode('utf-8')
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hash

    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to compare against

    Returns:
        True if password matches, False otherwise
    """
    password_bytes = plain_password.encode('utf-8')
    hash_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hash_bytes)


def create_user(session: Session, email: str, password: str, name: Optional[str] = None) -> User:
    """
    Create a new user

    Args:
        session: Database session
        email: User email address
        password: Plain text password (will be hashed)
        name: Optional display name

    Returns:
        Created User object

    Raises:
        ConflictError: If email already exists
    """
    # Check if email already exists
    existing_user = session.exec(select(User).where(User.email == email)).first()
    if existing_user:
        raise ConflictError("Email already registered")

    # Create new user with hashed password
    password_hash = hash_password(password)
    user = User(
        email=email,
        password_hash=password_hash,
        name=name
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    return user


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    """
    Get a user by email address

    Args:
        session: Database session
        email: User email address

    Returns:
        User object or None if not found
    """
    return session.exec(select(User).where(User.email == email)).first()


def authenticate_user(session: Session, email: str, password: str) -> User:
    """
    Authenticate a user with email and password

    Args:
        session: Database session
        email: User email address
        password: Plain text password

    Returns:
        Authenticated User object

    Raises:
        AuthError: If credentials are invalid
    """
    user = get_user_by_email(session, email)

    if not user:
        raise AuthError("Invalid email or password")

    if not verify_password(password, user.password_hash):
        raise AuthError("Invalid email or password")

    return user


def create_access_token(data: Dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token

    Args:
        data: Data to encode in token (e.g., {"sub": user_id})
        expires_delta: Optional expiration time delta

    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm
    )

    return encoded_jwt


def verify_token(token: str) -> Dict:
    """
    Verify and decode JWT token

    Args:
        token: JWT token to verify

    Returns:
        Decoded token payload

    Raises:
        AuthError: If token is invalid
    """
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm]
        )
        return payload
    except JWTError:
        raise AuthError("Invalid token")
