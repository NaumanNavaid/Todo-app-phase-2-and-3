"""
Chat service - OpenAI Agents SDK with MCP tools for task management
Stateless: All conversation state stored in database

Uses OpenAI Agents SDK (Agent + Runner pattern) as per Phase III spec
"""

from typing import Optional, List
from datetime import datetime
from sqlmodel import Session, select
from uuid import UUID
import os
import asyncio
import logging

from agents import Agent, Runner, function_tool

from config import settings
from models import User, Conversation, Message
from services.mcp_server import execute_mcp_tool
from schemas import ChatResponse

# Set OpenAI API key in environment
os.environ.setdefault("OPENAI_API_KEY", settings.openai_api_key)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Agent instructions
AGENT_INSTRUCTIONS = """You are a helpful todo assistant. You can help users manage their tasks and tags.

Available operations:
- add_task: Create a new task with title, description, and optional tag IDs
- list_tasks: Show all tasks or filter by status (pending, in_progress, done, cancelled)
- list_tags: Show all available tags with their IDs and colors
- complete_task: Mark a task as complete (sets status to 'done')
- delete_task: Remove a task from the list
- update_task: Change a task's title, description, status, or tags

Guidelines:
- Be friendly and helpful
- Confirm actions clearly (e.g., "I've added the task 'Buy groceries'")
- When listing tasks, show them in a clear format
- If a task isn't found, let the user know
- Use natural language - don't mention "tools" or "MCP"
- For task IDs, users can refer to tasks by number (1, 2, 3...) from the list
- When users mention tags or categories, use list_tags first to get available tag IDs, then use those IDs when creating/updating tasks
- If a user asks to add a tag to a task but the tag doesn't exist, let them know they need to create it through the API first

Task statuses:
- pending: Not yet started
- in_progress: Currently being worked on
- done: Completed
- cancelled: Cancelled

Tag usage:
- Use list_tags to see all available tags with their IDs
- When creating or updating tasks, include tag_ids as a list of tag ID strings
- Tags help organize and categorize tasks
"""


def get_conversation_messages(session: Session, conversation_id: UUID) -> List[dict]:
    """
    Get all messages in a conversation for Agent context

    Args:
        session: Database session
        conversation_id: Conversation UUID

    Returns:
        List of message dicts with role and content
    """
    messages = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    ).all()

    return [
        {"role": msg.role, "content": msg.content}
        for msg in messages
    ]


def create_conversation(session: Session, user: User, title: Optional[str] = None) -> Conversation:
    """
    Create a new conversation

    Args:
        session: Database session
        user: User object
        title: Optional title

    Returns:
        Created Conversation
    """
    conversation = Conversation(
        user_id=user.id,
        title=title or "New Chat"
    )

    session.add(conversation)
    session.commit()
    session.refresh(conversation)

    return conversation


def add_message(session: Session, conversation_id: UUID, role: str, content: str) -> Message:
    """
    Add a message to a conversation

    Args:
        session: Database session
        conversation_id: Conversation UUID
        role: Message role (user/assistant/system)
        content: Message content

    Returns:
        Created Message
    """
    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content
    )

    session.add(message)
    session.commit()
    session.refresh(message)

    # Update conversation updated_at
    conversation = session.get(Conversation, conversation_id)
    if conversation:
        conversation.updated_at = datetime.utcnow()
        session.add(conversation)
        session.commit()

    return message


def create_mcp_tools(user_id: str):
    """
    Create OpenAI Agents SDK Tools from MCP tool definitions

    Args:
        user_id: User ID as string

    Returns:
        List of FunctionTool objects for the Agent
    """
    from db import engine

    tools = []

    # Sync wrapper function to run database operations in thread pool
    def run_mcp_tool_sync(tool_name: str, kwargs: dict):
        """Run MCP tool in a synchronous context"""
        with Session(engine) as session:
            # Map parameter names for MCP tool functions
            # MCP_TOOLS uses 'user_id' but functions expect 'user_id_str'
            if 'user_id' in kwargs:
                kwargs['user_id_str'] = kwargs.pop('user_id')
            # MCP_TOOLS uses 'task_id' but functions expect 'task_id_str'
            if 'task_id' in kwargs:
                kwargs['task_id_str'] = kwargs.pop('task_id')
            return execute_mcp_tool(session, tool_name, kwargs)

    # Tool: add_task
    @function_tool
    async def add_task(title: str, description: str = "", tag_ids: list[str] = None) -> str:
        """Create a new task with a title, optional description, and optional tag IDs.

        Args:
            title: The title of the task
            description: Optional description of the task
            tag_ids: Optional list of tag IDs to assign (use list_tags to see available tags)

        Note: Tag IDs should be obtained from the list_tags function
        """
        try:
            kwargs = {"user_id": user_id, "title": title, "description": description}
            if tag_ids:
                kwargs["tag_ids"] = tag_ids

            result = await asyncio.to_thread(
                run_mcp_tool_sync,
                "add_task",
                kwargs
            )
            logger.info(f"add_task result: {result}")
            return f"Task created successfully: {result['title']}"
        except Exception as e:
            logger.error(f"add_task error: {e}", exc_info=True)
            raise Exception(f"Failed to create task: {str(e)}")

    tools.append(add_task)

    # Tool: list_tasks
    @function_tool
    async def list_tasks(status: str = "all") -> str:
        """List all tasks or filter by status.

        Args:
            status: Filter by status - one of: all, pending, in_progress, done, cancelled
        """
        try:
            result = await asyncio.to_thread(
                run_mcp_tool_sync,
                "list_tasks",
                {"user_id": user_id, "status": status}
            )
            logger.info(f"list_tasks result: {len(result)} tasks")
            # Format the result nicely for display
            if not result:
                return "No tasks found."
            task_list = []
            for task in result:
                task_list.append(f"- {task['title']} ({task['status']})")
            return "Your tasks:\n" + "\n".join(task_list)
        except Exception as e:
            logger.error(f"list_tasks error: {e}", exc_info=True)
            raise Exception(f"Failed to list tasks: {str(e)}")

    tools.append(list_tasks)

    # Tool: complete_task
    @function_tool
    async def complete_task(task_id: str) -> str:
        """Mark a task as complete (sets status to 'done'). Use task number from list.

        Args:
            task_id: The ID of the task to complete
        """
        try:
            result = await asyncio.to_thread(
                run_mcp_tool_sync,
                "complete_task",
                {"user_id": user_id, "task_id": task_id}
            )
            logger.info(f"complete_task result: {result}")
            return f"Task completed: {result['title']}"
        except Exception as e:
            logger.error(f"complete_task error: {e}", exc_info=True)
            raise Exception(f"Failed to complete task: {str(e)}")

    tools.append(complete_task)

    # Tool: delete_task
    @function_tool
    async def delete_task(task_id: str) -> str:
        """Delete a task from the list. Use task number from list.

        Args:
            task_id: The ID of the task to delete
        """
        try:
            result = await asyncio.to_thread(
                run_mcp_tool_sync,
                "delete_task",
                {"user_id": user_id, "task_id": task_id}
            )
            logger.info(f"delete_task result: {result}")
            return f"Task deleted: {result['title']}"
        except Exception as e:
            logger.error(f"delete_task error: {e}", exc_info=True)
            raise Exception(f"Failed to delete task: {str(e)}")

    tools.append(delete_task)

    # Tool: update_task
    @function_tool
    async def update_task(task_id: str, title: str = "", description: str = "", status: str = "", tag_ids: list[str] = None) -> str:
        """Update a task's title, description, status, or tags. Use task number from list.

        Args:
            task_id: The ID of the task to update
            title: New title (optional)
            description: New description (optional)
            status: New status - one of: pending, in_progress, done, cancelled (optional)
            tag_ids: New list of tag IDs to assign (optional, use list_tags to see available tags)
        """
        try:
            kwargs = {"user_id": user_id, "task_id": task_id}
            if title:
                kwargs["title"] = title
            if description:
                kwargs["description"] = description
            if status:
                kwargs["status"] = status
            if tag_ids:
                kwargs["tag_ids"] = tag_ids
            result = await asyncio.to_thread(
                run_mcp_tool_sync,
                "update_task",
                kwargs
            )
            logger.info(f"update_task result: {result}")
            return f"Task updated: {result['title']}"
        except Exception as e:
            logger.error(f"update_task error: {e}", exc_info=True)
            raise Exception(f"Failed to update task: {str(e)}")

    tools.append(update_task)

    # Tool: list_tags
    @function_tool
    async def list_tags() -> str:
        """List all available tags for this user.

        Returns tag IDs, names, and colors that can be used when creating or updating tasks.
        """
        try:
            result = await asyncio.to_thread(
                run_mcp_tool_sync,
                "list_tags",
                {"user_id": user_id}
            )
            logger.info(f"list_tags result: {len(result)} tags")
            # Format the result nicely for display
            if not result:
                return "No tags found. You can create tags through the API."
            tag_list = []
            for tag in result:
                tag_list.append(f"- {tag['name']} (ID: {tag['id']}, Color: {tag['color']})")
            return "Available tags:\n" + "\n".join(tag_list)
        except Exception as e:
            logger.error(f"list_tags error: {e}", exc_info=True)
            raise Exception(f"Failed to list tags: {str(e)}")

    tools.append(list_tags)

    return tools


async def process_chat_message(
    session: Session,
    user: User,
    message_content: str,
    conversation_id: Optional[UUID] = None
) -> ChatResponse:
    """
    Process a chat message using OpenAI Agents SDK with MCP tools (synchronous)

    Args:
        session: Database session
        user: User object
        message_content: User's message
        conversation_id: Optional existing conversation ID

    Returns:
        ChatResponse with AI response and metadata
    """
    # Get or create conversation
    if conversation_id:
        conversation = session.get(Conversation, conversation_id)
        if not conversation or conversation.user_id != user.id:
            conversation = create_conversation(session, user)
    else:
        conversation = create_conversation(session, user)

    # Get conversation history for context
    history = get_conversation_messages(session, conversation.id)

    # Build context string from history (simple format for LLM)
    context_parts = []
    for msg in history:
        if msg["role"] == "user":
            context_parts.append(f"User: {msg['content']}")
        elif msg["role"] == "assistant":
            context_parts.append(f"Assistant: {msg['content']}")

    context = "\n".join(context_parts)

    # Create full input with context
    full_input = f"{context}\nUser: {message_content}" if context else message_content

    # Store user message in database
    add_message(session, conversation.id, "user", message_content)

    # Create MCP tools for the agent
    tools = create_mcp_tools(str(user.id))

    # Create the Agent
    agent = Agent(
        name="todo-assistant",
        instructions=AGENT_INSTRUCTIONS,
        tools=tools
    )

    # Run the agent using Runner.run (async)
    result = await Runner.run(
        agent,
        input=full_input
    )

    # Extract response
    assistant_content = result.final_output

    # Track tool calls using new_items
    tool_calls = []
    for item in result.new_items:
        item_type = type(item).__name__
        # Check if this is a tool call item
        if 'ToolCall' in item_type or 'tool' in item_type.lower():
            tool_calls.append(f"Tool called: {item_type}")
        # Try to get more details if available
        if hasattr(item, 'function_name'):
            tool_calls.append(f"{item.function_name}: {getattr(item, 'arguments', {})}")

    # Store assistant response in database
    assistant_message_obj = add_message(session, conversation.id, "assistant", assistant_content)

    return ChatResponse(
        response=assistant_content,
        conversation_id=conversation.id,
        message_id=assistant_message_obj.id,
        tool_calls=tool_calls
    )
