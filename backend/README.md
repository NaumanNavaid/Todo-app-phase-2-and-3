---
title: Todo API with AI Chatbot
emoji: 📝
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
---

# Todo API with AI Chatbot - Phase V+

A RESTful API for task management with an AI-powered chatbot interface. Built with FastAPI, PostgreSQL, and OpenAI Agents SDK.

## Version
**v5.1.0** - Includes Email Notifications & Background Scheduler

## Features

- ✅ **Full CRUD Operations** for tasks
- ✅ **JWT Authentication** for secure access
- ✅ **AI Chatbot** for natural language task management
- ✅ **4 Task Statuses**: pending, in_progress, done, cancelled (with cycling toggle)
- ✅ **Conversation Memory** for contextual chat interactions
- ✅ **Tag System** - Organize tasks with colored tags (many-to-many)
- ✅ **Priority Levels** - urgent, high, medium, low
- ✅ **Due Dates** - Track deadlines with overdue detection
- ✅ **Recurring Tasks** - Support for recurring task patterns (daily/weekly/monthly)
- ✅ **Email Notifications** - Automatic reminders for tasks due soon
- ✅ **Background Scheduler** - APScheduler for periodic reminder checks
- ✅ **User Preferences** - Customizable notification settings

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task (with tags, priority, due_date)
- `GET /api/tasks/{id}` - Get specific task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `PATCH /api/tasks/{id}/toggle` - Cycle status: pending → in_progress → done → pending

### Tags
- `GET /api/tags` - List all user tags
- `POST /api/tags` - Create new tag
- `PUT /api/tags/{id}` - Update tag
- `DELETE /api/tags/{id}` - Delete tag

### Chatbot
- `POST /api/{user_id}/chat` - Send message to AI assistant
- `GET /api/{user_id}/chat/history` - Get conversation history
- `DELETE /api/{user_id}/chat/clear` - Clear conversation

### Notifications
- `GET /api/notifications/preferences` - Get notification preferences
- `PUT /api/notifications/preferences` - Update notification preferences
- `POST /api/notifications/test-email` - Send test email
- `GET /api/notifications/scheduler/status` - Get scheduler status
- `POST /api/notifications/scheduler/start` - Start reminder scheduler
- `POST /api/notifications/scheduler/stop` - Stop reminder scheduler

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

**Required:**
- `DATABASE_URL` - PostgreSQL connection string (provided by HF)
- `SECRET_KEY` - JWT secret key for authentication

**Optional:**
- `OPENAI_API_KEY` - Your OpenAI API key for the chatbot
- `SMTP_SERVER` - SMTP server for email notifications (e.g., smtp.gmail.com)
- `SMTP_PORT` - SMTP port (e.g., 587)
- `SMTP_USERNAME` - SMTP username (your email)
- `SMTP_PASSWORD` - SMTP password or app password
- `FROM_EMAIL` - From email address for notifications
- `FROM_NAME` - From name for notifications

## Tech Stack

- **FastAPI** - Modern Python web framework
- **SQLModel** - SQL toolkit and ORM
- **PostgreSQL** - Database
- **OpenAI Agents SDK** - AI agent framework
- **APScheduler** - Background job scheduler
- **JWT** - Authentication
- **Gmail SMTP** - Email notifications

## Documentation

See [CHATBOT_GUIDE.md](CHATBOT_GUIDE.md) for detailed chatbot integration guide.

## License

MIT License
