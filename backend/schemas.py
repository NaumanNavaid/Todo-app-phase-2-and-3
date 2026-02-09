"""
Pydantic schemas for request/response validation
"""

from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, field_validator


# ==================== Authentication Schemas ====================

class UserRegister(BaseModel):
    """Schema for user registration"""

    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    name: Optional[str] = Field(None, max_length=100)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Ensure password is not just whitespace"""
        if v.strip() != v:
            raise ValueError("Password cannot start or end with whitespace")
        return v


class UserLogin(BaseModel):
    """Schema for user login"""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Schema for token response"""

    access_token: str
    token_type: str = "bearer"
    user: "UserPublic"


# ==================== User Schemas ====================

class UserPublic(BaseModel):
    """Public user information"""

    id: UUID
    email: str
    name: Optional[str] = None
    created_at: datetime
    email_notifications_enabled: bool = True
    reminder_hours_before: int = 24
    reminder_time_preference: str = "09:00"


# ==================== Task Schemas ====================

class TaskCreate(BaseModel):
    """Schema for creating a task"""

    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    status: str = Field(default="pending", pattern="^(pending|in_progress|done|cancelled)$")
    priority: str = Field(default="medium", pattern="^(low|medium|high|urgent)$")
    due_date: Optional[datetime] = None
    recurring_type: str = Field(default="none", pattern="^(none|daily|weekly|monthly)$")
    recurring_end_date: Optional[datetime] = None
    tag_ids: list[UUID] = Field(default_factory=list)
    parent_task_id: Optional[UUID] = None


class TaskUpdate(BaseModel):
    """Schema for updating a task"""

    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[str] = Field(None, pattern="^(pending|in_progress|done|cancelled)$")
    priority: Optional[str] = Field(None, pattern="^(low|medium|high|urgent)$")
    due_date: Optional[datetime] = None
    recurring_type: Optional[str] = Field(None, pattern="^(none|daily|weekly|monthly)$")
    recurring_end_date: Optional[datetime] = None
    tag_ids: Optional[list[UUID]] = None
    parent_task_id: Optional[UUID] = None


class TaskPublic(BaseModel):
    """Public task information"""

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


# ==================== Tag Schemas ====================

class TagCreate(BaseModel):
    """Schema for creating a tag"""

    name: str = Field(min_length=1, max_length=50)
    color: str = Field(default="#3B82F6", max_length=7)


class TagUpdate(BaseModel):
    """Schema for updating a tag"""

    name: Optional[str] = Field(None, min_length=1, max_length=50)
    color: Optional[str] = Field(None, max_length=7)


class TagPublic(BaseModel):
    """Public tag information"""

    id: UUID
    user_id: UUID
    name: str
    color: str
    created_at: datetime


# ==================== Error Schemas ====================

class ErrorDetail(BaseModel):
    """Schema for error details"""

    error: str
    detail: Optional[str] = None


# ==================== Chat Schemas ====================

class ChatRequest(BaseModel):
    """Schema for chat request"""

    message: str = Field(min_length=1, max_length=2000)
    conversation_id: Optional[UUID] = None


class ChatResponse(BaseModel):
    """Schema for chat response"""

    response: str
    conversation_id: UUID
    message_id: UUID
    tool_calls: list[str] = Field(default_factory=list)


class ConversationPublic(BaseModel):
    """Schema for public conversation information"""

    id: UUID
    user_id: UUID
    title: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    message_count: int = 0


class MessagePublic(BaseModel):
    """Schema for public message information"""

    id: UUID
    conversation_id: UUID
    role: str
    content: str
    created_at: datetime
