---
title: Todo API with AI Chatbot
emoji: 📝
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
---

# Todo API with AI Chatbot

A RESTful API for task management with an AI-powered chatbot interface. Built with FastAPI, PostgreSQL, and OpenAI Agents SDK.

## Features

- ✅ **Full CRUD Operations** for tasks
- ✅ **JWT Authentication** for secure access
- ✅ **AI Chatbot** for natural language task management
- ✅ **4 Task Statuses**: pending, in_progress, done, cancelled
- ✅ **Conversation Memory** for contextual chat interactions

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login and get JWT token

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get specific task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Chatbot
- `POST /api/{user_id}/chat` - Send message to AI assistant

## Quick Start

### Using the API

```bash
# 1. Register a user
curl -X POST "https://your-space.hf.space/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123", "name": "User"}'

# 2. Login to get token
curl -X POST "https://your-space.hf.space/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# 3. Create a task
curl -X POST "https://your-space.hf.space/api/tasks" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Get milk and eggs"}'

# 4. Chat with the AI
curl -X POST "https://your-space.hf.space/api/{user_id}/chat" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task: Pay bills"}'
```

## Environment Variables

The following secrets are required (set in Hugging Face Space settings):

- `OPENAI_API_KEY` - Your OpenAI API key for the chatbot
- `DATABASE_URL` - PostgreSQL connection string (provided by HF)

## Tech Stack

- **FastAPI** - Modern Python web framework
- **SQLModel** - SQL toolkit and ORM
- **PostgreSQL** - Database
- **OpenAI Agents SDK** - AI agent framework
- **JWT** - Authentication

## Documentation

See [CHATBOT_GUIDE.md](CHATBOT_GUIDE.md) for detailed chatbot integration guide.

## License

MIT License
