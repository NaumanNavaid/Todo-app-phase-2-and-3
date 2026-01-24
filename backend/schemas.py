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


# ==================== Task Schemas ====================

class TaskCreate(BaseModel):
    """Schema for creating a task"""

    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)


class TaskUpdate(BaseModel):
    """Schema for updating a task"""

    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[str] = Field(None, pattern="^(pending|in_progress|done|cancelled)$")


class TaskPublic(BaseModel):
    """Public task information"""

    id: UUID
    user_id: UUID
    title: str
    description: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime


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
