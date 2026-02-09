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

    # Notification preferences
    email_notifications_enabled: bool = Field(default=True)
    reminder_hours_before: int = Field(default=24)  # How many hours before due date to remind
    reminder_time_preference: str = Field(default="09:00")  # Preferred time for daily reminders (HH:MM)

    # Relationships
    tasks: list["Task"] = Relationship(back_populates="user")
    tags: list["Tag"] = Relationship(back_populates="user")


class TaskTag(SQLModel, table=True):
    """Junction table for many-to-many relationship between tasks and tags"""

    __tablename__ = "task_tags"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    task_id: UUID = Field(foreign_key="tasks.id", ondelete="CASCADE")
    tag_id: UUID = Field(foreign_key="tags.id", ondelete="CASCADE")


class Task(SQLModel, table=True):
    """Task model representing a todo item"""

    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True, ondelete="CASCADE")

    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    status: str = Field(default="pending", max_length=20)  # pending, in_progress, done, cancelled

    # Phase V: Advanced features
    priority: str = Field(default="medium", max_length=10)  # low, medium, high, urgent
    due_date: Optional[datetime] = Field(default=None)
    reminder_sent: bool = Field(default=False)
    recurring_type: str = Field(default="none", max_length=10)  # none, daily, weekly, monthly
    recurring_end_date: Optional[datetime] = Field(default=None)
    parent_task_id: Optional[UUID] = Field(default=None, foreign_key="tasks.id")

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})

    # Relationship to user
    user: Optional["User"] = Relationship(back_populates="tasks")

    # Relationship to tags (many-to-many)
    tags: list["Tag"] = Relationship(back_populates="tasks", link_model=TaskTag)

    # Self-referential relationship for recurring tasks
    parent_task: Optional["Task"] = Relationship(
        back_populates="child_tasks",
        sa_relationship_kwargs={"remote_side": "Task.id"}
    )
    child_tasks: list["Task"] = Relationship(back_populates="parent_task")


class Tag(SQLModel, table=True):
    """Tag model for categorizing tasks"""

    __tablename__ = "tags"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True, ondelete="CASCADE")

    name: str = Field(max_length=50)
    color: str = Field(default="#3B82F6", max_length=7)  # Default blue color

    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to user
    user: Optional["User"] = Relationship(back_populates="tags")

    # Relationship to tasks (many-to-many)
    tasks: list["Task"] = Relationship(back_populates="tags", link_model=TaskTag)


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
    priority: str
    due_date: Optional[datetime] = None
    reminder_sent: bool
    recurring_type: str
    recurring_end_date: Optional[datetime] = None
    parent_task_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    tags: list["TagPublic"] = []


class TagPublic(SQLModel):
    """Public tag model"""

    id: UUID
    user_id: UUID
    name: str
    color: str
    created_at: datetime


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
