# Phase II Spec: Backend & Frontend Chat Integration

**Phase:** II
**Status:** ✅ COMPLETE
**Objective:** Implement chat interface on frontend with backend API integration for AI-powered todo management
**Date Completed:** 2025

---

## 📋 Overview

Phase II focuses on implementing the chat interface on the frontend and integrating it with the FastAPI backend. This phase enables users to interact with an AI assistant to manage their todos through natural language.

---

## 🎯 Objectives

1. Implement chat UI components on frontend
2. Integrate frontend chat with backend API endpoints
3. Enable real-time message streaming
4. Implement user authentication flow
5. Deploy backend and frontend separately

---

## 📊 Requirements

### Functional Requirements

#### FR1: Chat Interface
- [x] Chat message display area
- [x] Text input field for user messages
- [x] Send button functionality
- [x] Message history display
- [x] Visual distinction between user and AI messages
- [x] Auto-scroll to latest message

#### FR2: Backend Integration
- [x] Connect to `/api/{user_id}/chat` endpoint
- [x] Handle POST requests for sending messages
- [x] Handle GET requests for chat history
- [x] Implement real-time message streaming
- [x] Error handling for failed requests

#### FR3: Authentication
- [x] User registration endpoint
- [x] User login endpoint
- [x] JWT token management
- [x] Protected routes
- [x] User profile retrieval

#### FR4: State Management
- [x] Chat history state
- [x] User authentication state
- [x] Loading states
- [x] Error states

### Non-Functional Requirements

#### NFR1: Performance
- [x] Chat response time < 2 seconds
- [x] Smooth UI transitions
- [x] Efficient state updates

#### NFR2: Usability
- [x] Intuitive chat interface
- [x] Clear visual feedback
- [x] Responsive design
- [x] Mobile-friendly

#### NFR3: Security
- [x] JWT-based authentication
- [x] Protected API endpoints
- [x] CORS configuration
- [x] Environment variable management

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js 16 with App Router
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4
- **State Management:** React Context API + Hooks
- **Type Safety:** TypeScript
- **HTTP Client:** Fetch API

### Backend
- **Framework:** FastAPI
- **Language:** Python 3.11
- **Authentication:** JWT (python-jose)
- **Database:** PostgreSQL with SQLModel
- **AI Integration:** OpenAI API
- **CORS:** python-cors

---

## 🏗️ Architecture

### Frontend Architecture

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login page
│   │   └── register/page.tsx       # Registration page
│   ├── chat/
│   │   └── page.tsx                # Main chat interface
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Home page
├── components/
│   ├── chat/
│   │   ├── ChatContainer.tsx       # Main chat container
│   │   ├── ChatMessage.tsx         # Individual message
│   │   ├── ChatInput.tsx           # Input field
│   │   └── ChatHeader.tsx          # Chat header
│   ├── ui/
│   │   ├── Button.tsx              # Button component
│   │   ├── Input.tsx               # Input component
│   │   └── Card.tsx                # Card component
│   └── layout/
│       ├── Header.tsx              # App header
│       └── Footer.tsx              # App footer
├── contexts/
│   ├── AuthContext.tsx             # Authentication context
│   └── ChatContext.tsx             # Chat state context
├── hooks/
│   ├── useAuth.ts                  # Auth hook
│   ├── useChat.ts                  # Chat hook
│   └── useLocalStorage.ts          # Local storage hook
├── lib/
│   ├── api.ts                      # API client
│   ├── types.ts                    # TypeScript types
│   └── utils.ts                    # Utility functions
└── middleware.ts                   # Auth middleware
```

### Backend Architecture

```
backend/
├── main.py                         # FastAPI app entry point
├── routes/
│   ├── auth.py                     # Authentication routes
│   ├── chat.py                     # Chat routes
│   └── tasks.py                    # Task routes
├── services/
│   ├── auth_service.py             # Auth business logic
│   ├── chat_service.py             # Chat business logic
│   └── task_service.py             # Task business logic
├── models.py                       # Database models
├── schemas.py                      # Pydantic schemas
├── db.py                           # Database connection
└── requirements.txt                # Dependencies
```

---

## 🔄 Data Flow

### Chat Flow

```
User Input
    ↓
Chat Input Component
    ↓
useChat Hook
    ↓
API Client (POST /api/{user_id}/chat)
    ↓
Backend (FastAPI)
    ↓
OpenAI API
    ↓
Stream Response
    ↓
Update Chat State
    ↓
Render Messages
```

### Authentication Flow

```
Register/Login
    ↓
API Request (POST /api/auth/register or /login)
    ↓
Backend Validation
    ↓
Generate JWT Token
    ↓
Store Token (Local Storage)
    ↓
Update Auth Context
    ↓
Redirect to Chat
```

---

## 📝 API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

#### POST /api/auth/login
Login existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

#### GET /api/auth/me
Get current user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe"
}
```

### Chat Endpoints

#### POST /api/{user_id}/chat
Send a message to the AI assistant.

**Request:**
```json
{
  "message": "Create a task to buy groceries"
}
```

**Response:**
```json
{
  "response": "I've created a task 'Buy groceries' for you.",
  "message_id": "msg_123",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

#### GET /api/{user_id}/chat/history
Get chat history for user.

**Response:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Create a task to buy groceries",
      "timestamp": "2025-01-15T10:30:00Z"
    },
    {
      "role": "assistant",
      "content": "I've created a task 'Buy groceries' for you.",
      "timestamp": "2025-01-15T10:30:01Z"
    }
  ]
}
```

#### DELETE /api/{user_id}/chat/clear
Clear chat history.

**Response:**
```json
{
  "message": "Chat history cleared successfully"
}
```

---

## 🎨 UI/UX Specifications

### Chat Interface

**Layout:**
- Header: User info, logout button
- Message area: Scrollable, 80% height
- Input area: Fixed at bottom, 20% height

**Message Styling:**
- User messages: Right-aligned, blue background
- AI messages: Left-aligned, gray background
- Timestamp: Small, gray text below each message
- Auto-scroll: Newest messages visible

**Input Area:**
- Text input: Full width, multi-line support
- Send button: Right-aligned, disabled when empty
- Loading indicator: Shown during API requests

---

## 🔐 Security Considerations

### Authentication
- Password hashing with bcrypt
- JWT token expiration (24 hours)
- Secure token storage (httpOnly cookies recommended)

### API Security
- CORS configuration for allowed origins
- Rate limiting on endpoints
- Input validation and sanitization
- SQL injection prevention (SQLModel)

### Data Protection
- Environment variables for sensitive data
- No hardcoded credentials
- HTTPS in production
- Secure headers (CSP, X-Frame-Options)

---

## 📦 Deployment

### Frontend Deployment (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel deploy
```

**Deployed URL:** (To be added)

### Backend Deployment (Hugging Face Spaces)
- Deployed on Hugging Face Spaces
- URL: https://nauman-19-todo-app-backend.hf.space

---

## ✅ Acceptance Criteria

### Must Have (P0)
- [x] Chat interface functional
- [x] Backend API endpoints working
- [x] User authentication implemented
- [x] Real-time message streaming
- [x] Responsive design
- [x] Error handling

### Should Have (P1)
- [x] Message history persistence
- [x] Auto-save chat state
- [x] Loading states
- [x] Input validation

### Could Have (P2)
- [x] Message timestamps
- [x] User profile management
- [x] Logout functionality

---

## 🧪 Testing

### Manual Testing Checklist
- [x] User registration works
- [x] User login works
- [x] Chat messages send/receive
- [x] Chat history loads
- [x] Chat history clears
- [x] Logout works
- [x] Mobile responsive
- [x] Error handling works

---

## 📈 Success Metrics

### Performance
- Average response time: < 2 seconds
- UI render time: < 100ms
- Page load time: < 3 seconds

### User Experience
- Successful authentication rate: > 95%
- Chat success rate: > 90%
- Zero critical bugs

---

## 🚀 Next Phase (Phase III)

Phase III will focus on:
- Enhanced AI chatbot capabilities
- Better natural language understanding
- Todo CRUD operations through chat
- Improved error handling
- Better user experience

---

**Phase Status:** ✅ **COMPLETE**
**Completion Date:** 2025
**Next Phase:** Phase III - AI Chatbot Enhancement
