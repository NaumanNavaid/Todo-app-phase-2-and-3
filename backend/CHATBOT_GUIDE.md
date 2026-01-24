# AI Chatbot Integration Guide

## Overview

The Todo API includes an AI-powered chatbot that allows users to manage their tasks using natural language. The chatbot is built using the **OpenAI Agents SDK** and **MCP (Model Context Protocol)** to provide a conversational interface for task management.

## Features

- **Natural Language Task Management**: Add, list, update, complete, and delete tasks using conversational language
- **Context-Aware Conversations**: The chatbot maintains conversation history for contextual interactions
- **Stateless Architecture**: All conversation state is stored in the database - no in-memory session state
- **Four Status Options**: Tasks can be `pending`, `in_progress`, `done`, or `cancelled`

## API Endpoint

### POST `/api/{user_id}/chat`

Send a message to the AI assistant and get a response.

**Authentication**: Requires valid JWT token in `Authorization: Bearer <token>` header.

**Request Body**:
```json
{
  "message": "Add a task to buy groceries",
  "conversation_id": "uuid-or-null"  // Optional: Continue existing conversation
}
```

**Response**:
```json
{
  "response": "I've added the task 'Buy groceries'",
  "conversation_id": "uuid",
  "message_id": "uuid",
  "tool_calls": ["Tool called: ToolCallItem", "Tool called: ToolCallOutputItem"]
}
```

## Available Operations

The chatbot can perform the following operations through MCP tools:

### 1. Add Task
**Natural language examples**:
- "Add a task: Pay bills"
- "Create a new task called Buy groceries"
- "I need to remember to call mom"

### 2. List Tasks
**Natural language examples**:
- "List all my tasks"
- "Show me my pending tasks"
- "What tasks do I have?"

### 3. Complete Task
**Natural language examples**:
- "Mark task 1 as complete"
- "I finished task 2"
- "Complete the first task"

### 4. Update Task
**Natural language examples**:
- "Update task 1 title to Buy groceries"
- "Change task 2 description to Call mom tomorrow"
- "Set task 1 status to in_progress"

### 5. Delete Task
**Natural language examples**:
- "Delete task 1"
- "Remove the second task"
- "Delete task 2 now"

## Usage Examples

### Example 1: Creating and Managing Tasks

```bash
# 1. Login to get token
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# 2. Add a task
curl -X POST "http://localhost:8000/api/{user_id}/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"message": "Add a task: Pay electricity bill"}'

# Response: {"response": "I've added the task 'Pay electricity bill'", ...}

# 3. List tasks
curl -X POST "http://localhost:8000/api/{user_id}/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"message": "List my tasks"}'

# Response: Shows tasks with numbers

# 4. Complete a task
curl -X POST "http://localhost:8000/api/{user_id}/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"message": "Complete task 1"}'
```

### Example 2: Continuing a Conversation

```bash
# Start a new conversation
curl -X POST "http://localhost:8000/api/{user_id}/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"message": "Add a task: Buy milk"}'

# Save the conversation_id from response
# Continue the same conversation
curl -X POST "http://localhost:8000/api/{user_id}/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"message": "Mark it as done", "conversation_id": "<saved_conversation_id>"}'
```

## Task Statuses

The chatbot supports four task statuses:

| Status | Description |
|--------|-------------|
| `pending` | Task not yet started |
| `in_progress` | Task currently being worked on |
| `done` | Task completed |
| `cancelled` | Task cancelled |

## Conversation History

Conversations and messages are persisted in the database:

- **Conversations**: Each chat session has a unique ID and title
- **Messages**: All user and assistant messages are stored with timestamps
- **Context**: The agent uses conversation history to maintain context across messages

## Technical Implementation

### OpenAI Agents SDK

The chatbot uses the `openai-agents` Python package with the Agent + Runner pattern:

```python
from agents import Agent, Runner, function_tool

@function_tool
async def add_task(title: str, description: str = "") -> str:
    """Create a new task"""
    # Tool implementation
    return f"Task created: {title}"

agent = Agent(
    name="todo-assistant",
    instructions=AGENT_INSTRUCTIONS,
    tools=[add_task, list_tasks, complete_task, delete_task, update_task]
)

result = Runner.run_sync(agent, input=user_message)
response = result.final_output
```

### MCP Tools

Task operations are exposed as MCP (Model Context Protocol) tools:

- **add_task**: Create new tasks
- **list_tasks**: List all or filtered tasks
- **complete_task**: Mark task as done
- **delete_task**: Remove a task
- **update_task**: Modify task details

### Database Schema

```sql
-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    title VARCHAR(200),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id),
    role VARCHAR(20),  -- user, assistant, system
    content TEXT,
    created_at TIMESTAMP
);
```

## Environment Configuration

Required environment variable:

```bash
# In .env file
OPENAI_API_KEY=sk-...
```

## Dependencies

```
openai==1.57.0
openai-agents==0.2.0
mcp==0.1.0
```

## Error Handling

The chatbot provides user-friendly error messages:

- **Invalid task numbers**: "Task not found. Please check the task number."
- **Missing parameters**: "I need more information. Could you provide the task title?"
- **Tool execution failures**: "Something went wrong. Please try again."

## Best Practices

1. **Use specific language**: Be clear about which task you're referring to (e.g., "task 1" instead of "the task")
2. **One operation at a time**: The chatbot works best with single, clear requests
3. **Refer to task numbers**: When updating/completing/deleting, use the task numbers from the list
4. **Provide confirmation**: The chatbot may ask for confirmation before destructive operations (like deleting completed tasks)

## Troubleshooting

### Issue: "Something went wrong" response

**Possible causes**:
- Invalid task reference (e.g., referring to task 5 when you only have 3 tasks)
- Missing OpenAI API key
- Database connection issues

**Solution**: Check the server logs for detailed error messages.

### Issue: Tool calls but no changes

**Possible causes**:
- The agent is being cautious and asking for confirmation
- Conversation context confusion

**Solution**: Use fresh, explicit language or start a new conversation.

## Testing

Test the chatbot using the provided test user or create your own:

```bash
# Register a test user
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test12345", "name": "Test User"}'

# Login to get token
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test12345"}'

# Use the token to chat
curl -X POST "http://localhost:8000/api/{user_id}/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"message": "Hello! What can you do?"}'
```

## Resources

- [OpenAI Agents SDK Documentation](https://openai.github.io/openai-agents-python/)
- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
