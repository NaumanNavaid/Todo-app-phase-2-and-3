"""
Database connection and session management
"""

from typing import Generator
from sqlmodel import SQLModel, create_engine, Session
from config import settings

# Create database engine
engine = create_engine(
    settings.database_url,
    echo=settings.environment == "development",  # Log SQL in development
    pool_pre_ping=True,  # Verify connections before using
    pool_size=5,
    max_overflow=10
)


def init_db():
    """
    Initialize database tables
    Call this on application startup
    """
    from models import User, Task
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """
    Dependency for FastAPI to get database session

    Yields:
        Database session
    """
    with Session(engine) as session:
        yield session
