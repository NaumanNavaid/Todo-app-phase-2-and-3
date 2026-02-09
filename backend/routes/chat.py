"""
Chat routes - AI chatbot endpoint for task management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from uuid import UUID

from db import get_session
from middleware.auth import get_current_user
from models import User
from schemas import ChatRequest, ChatResponse
from services.chat_service import process_chat_message


router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/{user_id}/chat", response_model=ChatResponse)
async def chat(
    user_id: UUID,
    request: ChatRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Send a message to the AI assistant and get a response

    The AI can perform task operations through MCP tools:
    - add_task: Create new tasks
    - list_tasks: Show all or filtered tasks
    - complete_task: Mark task as done
    - delete_task: Remove a task
    - update_task: Modify task details

    Request body:
    {
        "message": "Add a task to buy groceries",
        "conversation_id": "uuid-or-null"
    }

    Response:
    {
        "response": "I've added the task 'Buy groceries'",
        "conversation_id": "uuid",
        "message_id": "uuid",
        "tool_calls": ["add_task: {...}"]
    }
    """
    # Verify user_id matches authenticated user
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot chat on behalf of another user"
        )

    try:
        response = await process_chat_message(
            session=session,
            user=current_user,
            message_content=request.message,
            conversation_id=request.conversation_id
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat processing error: {str(e)}"
        )
