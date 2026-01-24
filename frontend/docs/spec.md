# TodoApp - Technical Specification

**Version:** 1.0.0
**Date:** January 21, 2026
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Features](#features)
5. [Data Models](#data-models)
6. [API Integration](#api-integration)
7. [Component Structure](#component-structure)
8. [State Management](#state-management)
9. [Styling & Theming](#styling--theming)
10. [Authentication](#authentication)
11. [Deployment](#deployment)

---

## Overview

TodoApp is a professional, full-featured task management application with an integrated AI assistant. Built as a modern Single Page Application (SPA) using Next.js 16.1 with the App Router, it provides a clean, intuitive interface for managing personal and professional tasks.

### Key Highlights

- **Modern Stack**: Built with Next.js 16.1, React 19, and Tailwind CSS v4
- **Type-Safe**: Full TypeScript implementation
- **Authentication**: Complete user authentication system (login/signup)
- **Productivity Focused**: Priority levels, categories, due dates, filtering, and search
- **AI Integration**: Chat interface ready for AI assistant integration
- **Responsive Design**: Mobile-first approach with breakpoints for tablet and desktop
- **Light Theme**: Clean, professional light theme with slate color palette

---

## Technology Stack

### Frontend Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.4 | React framework with App Router |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | v4 | Utility-first styling |

### Development Tools

- **Package Manager**: npm
- **Build Tool**: Turbopack (Next.js built-in)
- **Fonts**: Geist Sans, Geist Mono (Google Fonts)

### Backend (To Be Integrated)

- **API**: FastAPI (Python) - User-hosted
- **Authentication**: JWT tokens
- **Database**: To be determined by user

---

## Architecture

### Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with AuthProvider
│   ├── page.tsx                 # Main application page
│   └── globals.css              # Global styles and animations
│
├── components/                   # React components
│   ├── auth/                    # Authentication components
│   │   ├── AuthPage.tsx         # Login/Signup container
│   │   ├── LoginForm.tsx        # Login form
│   │   ├── SignupForm.tsx       # Registration form
│   │   └── AuthProvider.tsx     # Auth context wrapper
│   │
│   ├── chat/                    # AI Chat components
│   │   ├── ChatInterface.tsx    # Main chat container
│   │   ├── ChatHeader.tsx       # Chat session header
│   │   ├── ChatMessageList.tsx  # Message history
│   │   ├── ChatMessage.tsx      # Individual message
│   │   └── ChatInput.tsx        # Message input
│   │
│   ├── layout/                  # Layout components
│   │   ├── TabNavigation.tsx    # Tab switcher
│   │   ├── AppHeader.tsx        # App header with user info
│   │   └── Header.tsx           # Generic section header
│   │
│   ├── todos/                   # Todo components
│   │   ├── TodoDashboard.tsx    # Main todo container
│   │   ├── TodoList.tsx         # Grid of todo cards
│   │   ├── TodoCard.tsx         # Individual todo item
│   │   ├── TodoForm.tsx         # Add/Edit modal
│   │   ├── TodoFilters.tsx      # Search & filter controls
│   │   ├── TodoStats.tsx        # Statistics dashboard
│   │   ├── PriorityBadge.tsx    # Priority indicator
│   │   └── CategoryBadge.tsx    # Category tag
│   │
│   └── ui/                      # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── TextArea.tsx
│       ├── Select.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       └── Modal.tsx
│
├── hooks/                       # Custom React hooks
│   ├── useAuth.tsx              # Authentication state & methods
│   ├── useTodos.ts              # Todo CRUD & filtering
│   ├── useChat.ts               # Chat functionality
│   └── useTabs.ts               # Tab navigation
│
└── lib/                         # Utilities & types
    ├── auth-types.ts            # Auth TypeScript types
    ├── types.ts                 # App TypeScript types
    ├── mock-data.ts             # Sample data
    ├── mock-auth.ts             # Mock auth API
    ├── api-client.ts            # FastAPI integration placeholder
    └── utils.ts                 # Helper functions
```

### Component Hierarchy

```
RootLayout (app/layout.tsx)
└── AuthProvider
    └── Home (app/page.tsx)
        ├── Loading State
        ├── AuthPage (unauthenticated)
        │   └── [LoginForm | SignupForm]
        └── Main App (authenticated)
            ├── AppHeader
            ├── TabNavigation
            ├── [Todo Dashboard]
            │   ├── Header
            │   ├── TodoStats
            │   ├── TodoFilters
            │   ├── TodoList
            │   │   └── TodoCard[]
            │   └── TodoForm (Modal)
            └── [AI Chat]
                ├── ChatHeader
                ├── ChatMessageList
                │   └── ChatMessage[]
                └── ChatInput
```

---

## Features

### 1. Authentication

#### Login
- Email/password authentication
- Form validation
- Error handling
- Loading states
- "Remember me" option
- Forgot password link (placeholder)

#### Signup
- Full name, email, password fields
- Password confirmation validation
- Terms acceptance checkbox
- Real-time validation feedback

#### Session Management
- JWT token storage (localStorage)
- Auto-login on app load
- Session persistence
- Logout functionality

### 2. Todo Management

#### Core Features
- **Create**: Add new todos with title, description, priority, category, due date
- **Read**: View all todos in responsive grid layout
- **Update**: Edit existing todo details
- **Delete**: Remove todos with confirmation

#### Organization
- **Priority Levels**: High, Medium, Low (color-coded badges)
- **Categories**: Work, Personal, Shopping, Health, Finance, Other
- **Due Dates**: Optional date picker with relative date display
- **Completion Status**: Toggle todo completion with visual feedback

#### Filtering & Search
- **Search**: Full-text search across title and description
- **Status Filter**: All, Active, Completed
- **Category Filter**: Filter by category
- **Priority Filter**: Filter by priority level
- **Clear Filters**: Reset all filters at once

#### Statistics Dashboard
- Total todos count
- Completed todos count
- Active todos count
- High priority count
- Overdue count
- Completion rate percentage

### 3. AI Chat Assistant

#### Features
- **Chat Interface**: Message history display with user/assistant distinction
- **Message Input**: Text input with send button
- **Typing Indicator**: Animated loading dots
- **Clear Chat**: Reset conversation history
- **Auto-scroll**: Auto-scroll to latest message

#### Placeholder Functionality
- Mock responses for demonstration
- Ready for FastAPI backend integration
- Message timestamp display
- User avatar/assistant avatar distinction

### 4. User Interface

#### Navigation
- **Tabbed Interface**: Switch between Todos and AI Assistant
- **Active Tab Indicator**: Visual feedback for current tab
- **Persistent State**: Tab state preserved during session

#### Responsive Design
| Breakpoint | Columns | Layout Adjustments |
|------------|---------|-------------------|
| Mobile (< 640px) | 1 column | Full-width cards, stacked filters |
| Tablet (640-1024px) | 2 columns | Grid layout for todos |
| Desktop (> 1024px) | 3 columns | Full grid with expanded header info |

#### Design System
- **Primary Color**: Indigo-500 (#6366f1)
- **Success Color**: Green-500 (#22c55e)
- **Warning Color**: Amber-500 (#f59e0b)
- **Error Color**: Red-500 (#ef4444)
- **Background**: Slate-50 (#f8fafc)
- **Card Background**: White (#ffffff)
- **Text Primary**: Slate-900 (#0f172a)
- **Text Secondary**: Slate-600 (#475569)
- **Border**: Slate-200 (#e2e8f0)

---

## Data Models

### User

```typescript
interface User {
  id: string;           // Unique user identifier
  email: string;        // User email (unique)
  name: string;         // Display name
  avatar?: string;      // Optional avatar URL
  createdAt: Date;      // Account creation date
}
```

### Todo

```typescript
interface Todo {
  id: string;           // Unique todo identifier
  title: string;        // Todo title (required)
  description?: string; // Optional detailed description
  completed: boolean;   // Completion status
  priority: Priority;   // 'high' | 'medium' | 'low'
  category: string;     // Category name
  dueDate?: Date;       // Optional due date
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last update timestamp
  order: number;        // Display order
}
```

### Category

```typescript
interface Category {
  id: string;           // Category identifier
  name: string;         // Display name
  color: string;        // Hex color code
}
```

### Chat Message

```typescript
interface ChatMessage {
  id: string;           // Message identifier
  role: 'user' | 'assistant';
  content: string;      // Message text
  timestamp: Date;      // Message time
}
```

### Chat Session

```typescript
interface ChatSession {
  id: string;           // Session identifier
  messages: ChatMessage[];
  createdAt: Date;
}
```

---

## API Integration

### Current State

The application currently uses **mock data and mock authentication**. All data operations are handled client-side with localStorage persistence for auth tokens.

### FastAPI Backend Integration

The following API endpoints are expected from the FastAPI backend:

#### Authentication Endpoints

```
POST   /api/auth/login          - User login
POST   /api/auth/signup         - User registration
POST   /api/auth/logout         - User logout
GET    /api/auth/me             - Get current user
```

#### Todo Endpoints

```
GET    /api/todos               - Get all user todos
POST   /api/todos               - Create new todo
GET    /api/todos/{id}          - Get single todo
PATCH  /api/todos/{id}          - Update todo
DELETE /api/todos/{id}          - Delete todo
PATCH  /api/todos/{id}/toggle   - Toggle completion
```

#### Chat Endpoints

```
POST   /api/chat                - Send message to AI
GET    /api/chat/history        - Get chat history
DELETE /api/chat/history        - Clear chat history
```

### Implementation Guide

To connect the frontend to your FastAPI backend:

1. **Update API Base URL**
   ```typescript
   // lib/api-client.ts
   const API_BASE_URL = 'https://your-fastapi-app.com/api';
   ```

2. **Replace Mock Functions**
   Uncomment the fetch calls in `lib/api-client.ts` and `lib/mock-auth.ts`

3. **Add Request Headers**
   ```typescript
   headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${token}`
   }
   ```

4. **Handle Errors**
   Implement proper error handling for network failures, auth errors, etc.

---

## Component Structure

### Authentication Components

#### AuthPage
Container for login/signup forms with background gradient pattern.

**Props:** None

**State:**
- `isLogin: boolean` - Toggle between login/signup

#### LoginForm
Login form with email, password, remember me, and forgot password.

**Props:**
- `onSuccess: () => void` - Callback on successful login
- `onSwitchToSignup: () => void` - Switch to signup form

**State:**
- `isLoading: boolean`
- `credentials: LoginCredentials`

#### SignupForm
Registration form with validation.

**Props:**
- `onSuccess: () => void`
- `onSwitchToLogin: () => void`

**State:**
- `isLoading: boolean`
- `credentials: SignupCredentials`

### Todo Components

#### TodoDashboard
Main container for todo features with stats, filters, and list.

**Props:** None (uses useTodos hook)

**Features:**
- Statistics display
- Add todo button
- Filter controls
- Todo grid

#### TodoCard
Individual todo item card.

**Props:**
- `todo: Todo`
- `onToggleComplete: (id: string) => void`
- `onEdit: (todo: Todo) => void`
- `onDelete: (id: string) => void`

**Features:**
- Checkbox for completion
- Title and description
- Priority badge
- Category badge
- Due date display
- Edit and delete buttons

#### TodoForm
Modal form for creating/editing todos.

**Props:**
- `isOpen: boolean`
- `onClose: () => void`
- `onSubmit: (todo) => void`
- `editTodo?: Todo | null`

**Fields:**
- Title (required)
- Description (optional)
- Category (select)
- Priority (select)
- Due date (date picker)

#### TodoStats
Statistics cards showing todo metrics.

**Props:**
- `stats: TodoStats`

**Displays:**
- Total, Completed, Active
- High Priority, Overdue
- Completion Rate

### Chat Components

#### ChatInterface
Main chat container with header, messages, and input.

**Props:** None (uses useChat hook)

**Features:**
- Chat header with clear button
- Message list with auto-scroll
- Message input

#### ChatMessage
Individual message bubble.

**Props:**
- `message: ChatMessage`

**Style:**
- User messages: Right-aligned, indigo background
- Assistant messages: Left-aligned, gray background

---

## State Management

### useAuth Hook

Manages authentication state and operations.

**Returns:**
```typescript
{
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}
```

**Storage:**
- Token: `localStorage.getItem('auth_token')`
- User: `localStorage.getItem('user')`

### useTodos Hook

Manages todo data and filtering.

**Returns:**
```typescript
{
  todos: Todo[];              // All todos
  filteredTodos: Todo[];      // Filtered todos
  filter: TodoFilter;         // Current filter state
  stats: TodoStats;           // Computed statistics
  addTodo: (todo) => void;
  updateTodo: (id, updates) => void;
  deleteTodo: (id) => void;
  toggleComplete: (id) => void;
  setStatusFilter: (status) => void;
  setCategoryFilter: (category) => void;
  setPriorityFilter: (priority) => void;
  setSearchQuery: (query) => void;
  clearFilters: () => void;
}
```

### useChat Hook

Manages chat messages and operations.

**Returns:**
```typescript
{
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
}
```

### useTabs Hook

Manages tab navigation state.

**Returns:**
```typescript
{
  activeTab: 'todos' | 'chat';
  setTab: (tab) => void;
}
```

---

## Styling & Theming

### Color Palette

```css
/* Backgrounds */
--background: #f8fafc;      /* slate-50 */
--card-bg: #ffffff;         /* white */

/* Text */
--text-primary: #0f172a;    /* slate-900 */
--text-secondary: #475569;  /* slate-600 */
--text-muted: #94a3b8;      /* slate-500 */

/* Borders */
--border-color: #e2e8f0;    /* slate-200 */

/* Primary (Indigo) */
--primary: #6366f1;         /* indigo-500 */
--primary-hover: #4f46e5;   /* indigo-600 */

/* Semantic Colors */
--success: #22c55e;         /* green-500 */
--warning: #f59e0b;         /* amber-500 */
--error: #ef4444;           /* red-500 */

/* Priority Colors */
--priority-high: #ef4444;
--priority-medium: #f59e0b;
--priority-low: #22c55e;

/* Category Colors */
--category-work: #3b82f6;
--category-personal: #8b5cf6;
--category-shopping: #ec4899;
--category-health: #10b981;
--category-finance: #f97316;
```

### Typography

| Element | Size | Weight |
|---------|------|--------|
| H1 (Title) | text-xl | font-bold |
| H2 (Section) | text-2xl | font-semibold |
| Body | text-sm to text-base | normal |
| Small | text-xs | normal |

### Spacing

- Cards: `p-4` to `p-6`
- Gap: `gap-4` (cards), `gap-6` (sections)
| Element | Spacing |
|---------|----------|
| Section padding | py-8 |
| Container padding | px-4 sm:px-6 lg:px-8 |

### Border Radius

- Cards: `rounded-xl`
- Buttons: `rounded-lg`
| Element | Radius |
|---------|--------|
| Badges | rounded-full |
| Inputs | rounded-lg |
| Full buttons | rounded-full |

### Shadows

- Cards: `shadow-sm hover:shadow-md`
- Modals: `shadow-xl`

---

## Authentication

### Authentication Flow

```
User loads app
    ↓
Check for stored token
    ↓
    ├─ Token exists → Validate with API
    │   ├─ Valid → Show main app
    │   └─ Invalid → Show login
    │
    └─ No token → Show login
```

### Login Flow

```
User enters credentials
    ↓
Call login API
    ↓
    ├─ Success → Store token & user, redirect to app
    │
    └─ Error → Display error message
```

### Protected Routes

All main app features are protected by authentication status check in `app/page.tsx`:

```typescript
if (status === 'loading') return <LoadingSpinner />;
if (status === 'unauthenticated') return <AuthPage />;
// Otherwise, render main app
```

---

## Deployment

### Build Command

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-fastapi-backend.com/api
```

### Hosting Platforms

The app can be deployed to:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker containers**

---

## Future Enhancements

### Planned Features

1. **Drag and Drop**: Reorder todos using @dnd-kit
2. **Real-time Sync**: WebSocket integration for live updates
3. **File Attachments**: Attach files to todos
4. **Collaboration**: Share todos with other users
5. **Reminders**: Push notifications for due dates
6. **Tags**: Additional tagging system
7. **Subtasks**: Nested todo items
8. **Recurring Todos**: Automatically create repeating tasks
9. **Calendar View**: Visual calendar display
10. **Export**: Export todos to CSV, JSON

### AI Chat Enhancements

1. **Streaming Responses**: Real-time message streaming
2. **Context Awareness**: Chat remembers todo context
3. **Voice Input**: Speech-to-text for messages
4. **Quick Actions**: AI can create/edit todos via chat
5. **Smart Suggestions**: AI suggests todo prioritization

---

## Maintenance

### Dependencies

Check for updates regularly:

```bash
npm outdated
npm update
```

### Code Quality

- TypeScript strict mode enabled
- ESLint configured for Next.js
- Prettier for code formatting (optional)

### Browser Support

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Android

---

## License

Proprietary - All rights reserved

---

## Support

For issues or questions, contact the development team.

---

**Document Version:** 1.0.0
**Last Updated:** January 21, 2026
