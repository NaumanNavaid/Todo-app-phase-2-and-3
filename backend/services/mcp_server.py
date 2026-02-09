"""
MCP Server - Exposes task operations as tools for AI agents
Stateless: All state stored in database via task_service
"""

from typing import Optional, List, Dict, Any
from sqlmodel import Session, select
from uuid import UUID

from models import Task, User
from services.task_service import (
    create_task,
    list_tasks,
    get_task_by_id,
    update_task,
    delete_task
)
from exceptions import NotFoundError


def resolve_user_id(session: Session, user_id_str: str) -> User:
    """
    Resolve user_id from string (email or UUID) to User object

    Args:
        session: Database session
        user_id_str: User email or UUID string

    Returns:
        User object

    Raises:
        NotFoundError: If user not found
    """
    # Try to parse as UUID first
    try:
        user_uuid = UUID(user_id_str)
        user = session.get(User, user_uuid)
        if user:
            return user
    except ValueError:
        pass

    # Try to find by email
    user = session.exec(select(User).where(User.email == user_id_str)).first()
    if not user:
        raise NotFoundError("User")
    return user


def resolve_task_id(session: Session, user: User, task_id_str: str) -> UUID:
    """
    Resolve task_id from string or integer to UUID

    Args:
        session: Database session
        user: User object
        task_id_str: Task ID as string (UUID or integer)

    Returns:
        Task UUID

    Raises:
        NotFoundError: If task not found
    """
    # Try to parse as UUID
    try:
        task_uuid = UUID(task_id_str)
        task = session.get(Task, task_uuid)
        if task and task.user_id == user.id:
            return task_uuid
    except ValueError:
        pass

    # Try to parse as integer index
    try:
        index = int(task_id_str) - 1  # Convert 1-based to 0-based
        tasks = list_tasks(session, user)
        if 0 <= index < len(tasks):
            return tasks[index].id
    except ValueError:
        pass

    raise NotFoundError("Task")


# ==================== MCP Tools ====================

def add_task_tool(session: Session, user_id_str: str, title: str, description: Optional[str] = None, tag_ids: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    MCP Tool: Create a new task

    Args:
        session: Database session
        user_id_str: User email or UUID string
        title: Task title
        description: Optional task description
        tag_ids: Optional list of tag IDs to assign

    Returns:
        Dict with task_id, status, title
    """
    user = resolve_user_id(session, user_id_str)

    # Convert tag_ids to UUID list if provided
    tag_uuids = None
    if tag_ids:
        tag_uuids = [UUID(tid) for tid in tag_ids]

    task = create_task(session, user, title, description, tag_ids=tag_uuids)

    return {
        "task_id": str(task.id),
        "status": "created",
        "title": task.title,
        "description": task.description
    }


def list_tasks_tool(session: Session, user_id_str: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    MCP Tool: Retrieve tasks from the list

    Args:
        session: Database session
        user_id_str: User email or UUID string
        status: Optional filter ("all", "pending", "in_progress", "done", "cancelled")

    Returns:
        List of task objects
    """
    user = resolve_user_id(session, user_id_str)

    # Map "all" to None, "completed" to "done" for compatibility
    status_filter = None if status == "all" else status
    if status == "completed":
        status_filter = "done"

    tasks = list_tasks(session, user, status_filter)

    return [
        {
            "id": str(task.id),
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "created_at": task.created_at.isoformat()
        }
        for task in tasks
    ]


def complete_task_tool(session: Session, user_id_str: str, task_id_str: str) -> Dict[str, Any]:
    """
    MCP Tool: Mark a task as complete (status = "done")

    Args:
        session: Database session
        user_id_str: User email or UUID string
        task_id_str: Task ID as string (UUID or integer)

    Returns:
        Dict with task_id, status, title
    """
    user = resolve_user_id(session, user_id_str)
    task_uuid = resolve_task_id(session, user, task_id_str)

    task = update_task(session, task_uuid, user, status="done")

    return {
        "task_id": str(task.id),
        "status": "completed",
        "title": task.title
    }


def delete_task_tool(session: Session, user_id_str: str, task_id_str: str) -> Dict[str, Any]:
    """
    MCP Tool: Remove a task from the list

    Args:
        session: Database session
        user_id_str: User email or UUID string
        task_id_str: Task ID as string (UUID or integer)

    Returns:
        Dict with task_id, status, title
    """
    user = resolve_user_id(session, user_id_str)
    task_uuid = resolve_task_id(session, user, task_id_str)

    task = get_task_by_id(session, task_uuid, user)
    title = task.title
    task_id = task.id

    delete_task(session, task_uuid, user)

    return {
        "task_id": str(task_id),
        "status": "deleted",
        "title": title
    }


def update_task_tool(session: Session, user_id_str: str, task_id_str: str,
                    title: Optional[str] = None,
                    description: Optional[str] = None,
                    status: Optional[str] = None,
                    tag_ids: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    MCP Tool: Modify task title, description, status, or tags

    Args:
        session: Database session
        user_id_str: User email or UUID string
        task_id_str: Task ID as string (UUID or integer)
        title: Optional new title
        description: Optional new description
        status: Optional new status
        tag_ids: Optional new list of tag IDs to assign

    Returns:
        Dict with task_id, status, title
    """
    user = resolve_user_id(session, user_id_str)
    task_uuid = resolve_task_id(session, user, task_id_str)

    # Convert tag_ids to UUID list if provided
    tag_uuids = None
    if tag_ids:
        tag_uuids = [UUID(tid) for tid in tag_ids]

    task = update_task(session, task_uuid, user, title, description, status, tag_ids=tag_uuids)

    return {
        "task_id": str(task.id),
        "status": "updated",
        "title": task.title,
        "description": task.description,
        "task_status": task.status
    }


def list_tags_tool(session: Session, user_id_str: str) -> List[Dict[str, Any]]:
    """
    MCP Tool: List all tags for the user

    Args:
        session: Database session
        user_id_str: User email or UUID string

    Returns:
        List of tag objects with id, name, and color
    """
    from services.tag_service import list_tags

    user = resolve_user_id(session, user_id_str)
    tags = list_tags(session, user)

    return [
        {
            "id": str(tag.id),
            "name": tag.name,
            "color": tag.color
        }
        for tag in tags
    ]


# ==================== MCP Tool Registry ====================

MCP_TOOLS = {
    "add_task": {
        "name": "add_task",
        "description": "Create a new task with a title, optional description, and optional tag IDs",
        "parameters": {
            "user_id": {"type": "string", "required": True},
            "title": {"type": "string", "required": True},
            "description": {"type": "string", "required": False},
            "tag_ids": {"type": "array", "items": {"type": "string"}, "required": False}
        },
        "function": add_task_tool
    },
    "list_tasks": {
        "name": "list_tasks",
        "description": "List all tasks, optionally filtered by status (all, pending, in_progress, done, cancelled)",
        "parameters": {
            "user_id": {"type": "string", "required": True},
            "status": {"type": "string", "required": False, "enum": ["all", "pending", "in_progress", "done", "cancelled"]}
        },
        "function": list_tasks_tool
    },
    "complete_task": {
        "name": "complete_task",
        "description": "Mark a task as complete (sets status to 'done')",
        "parameters": {
            "user_id": {"type": "string", "required": True},
            "task_id": {"type": "string", "required": True}
        },
        "function": complete_task_tool
    },
    "delete_task": {
        "name": "delete_task",
        "description": "Delete a task from the list",
        "parameters": {
            "user_id": {"type": "string", "required": True},
            "task_id": {"type": "string", "required": True}
        },
        "function": delete_task_tool
    },
    "update_task": {
        "name": "update_task",
        "description": "Update a task's title, description, status, or tags",
        "parameters": {
            "user_id": {"type": "string", "required": True},
            "task_id": {"type": "string", "required": True},
            "title": {"type": "string", "required": False},
            "description": {"type": "string", "required": False},
            "status": {"type": "string", "required": False, "enum": ["pending", "in_progress", "done", "cancelled"]},
            "tag_ids": {"type": "array", "items": {"type": "string"}, "required": False}
        },
        "function": update_task_tool
    },
    "list_tags": {
        "name": "list_tags",
        "description": "List all tags for the user (returns id, name, and color for each tag)",
        "parameters": {
            "user_id": {"type": "string", "required": True}
        },
        "function": list_tags_tool
    }
}


def get_mcp_tools_schema() -> List[Dict[str, Any]]:
    """
    Get MCP tools schema for OpenAI function calling

    Returns:
        List of tool schemas in OpenAI format
    """
    return [
        {
            "type": "function",
            "function": {
                "name": tool["name"],
                "description": tool["description"],
                "parameters": {
                    "type": "object",
                    "properties": {
                        k: {"type": v["type"], **({"enum": v["enum"]} if "enum" in v else {})}
                        for k, v in tool["parameters"].items()
                    },
                    "required": [k for k, v in tool["parameters"].items() if v.get("required", False)]
                }
            }
        }
        for tool in MCP_TOOLS.values()
    ]


def execute_mcp_tool(session: Session, tool_name: str, arguments: Dict[str, Any]) -> Any:
    """
    Execute an MCP tool by name with arguments

    Args:
        session: Database session
        tool_name: Name of the tool to execute
        arguments: Tool arguments

    Returns:
        Tool result
    """
    if tool_name not in MCP_TOOLS:
        raise ValueError(f"Unknown tool: {tool_name}")

    tool = MCP_TOOLS[tool_name]
    return tool["function"](session, **arguments)
