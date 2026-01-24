"""
Database models using SQLModel
"""

from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship, Column, String
from uuid import UUID, uuid4


class User(SQLModel, table=True):
    """User model representing an authenticated user"""

    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    name: Optional[str] = Field(default=None, max_length=100)
    password_hash: str = Field(max_length=255)

    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to tasks
    tasks: list["Task"] = Relationship(back_populates="user")


class Task(SQLModel, table=True):
    """Task model representing a todo item"""

    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True, ondelete="CASCADE")

    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    status: str = Field(default="pending", max_length=20)  # pending, in_progress, done, cancelled

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})

    # Relationship to user
    user: Optional["User"] = Relationship(back_populates="tasks")


# Public models (without password_hash)
class UserPublic(SQLModel):
    """Public user model without sensitive data"""

    id: UUID
    email: str
    name: Optional[str] = None
    created_at: datetime


class TaskPublic(SQLModel):
    """Public task model"""

    id: UUID
    user_id: UUID
    title: str
    description: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime


class Conversation(SQLModel, table=True):
    """Conversation model representing a chat session"""

    __tablename__ = "conversations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True, ondelete="CASCADE")
    title: Optional[str] = Field(default=None, max_length=200)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})

    # Relationship to messages
    messages: list["Message"] = Relationship(back_populates="conversation")


class Message(SQLModel, table=True):
    """Message model representing a single chat message"""

    __tablename__ = "messages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="conversations.id", index=True, ondelete="CASCADE")
    role: str = Field(max_length=20)  # user, assistant, system
    content: str = Field(max_length=5000)

    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to conversation
    conversation: Optional["Conversation"] = Relationship(back_populates="messages")
