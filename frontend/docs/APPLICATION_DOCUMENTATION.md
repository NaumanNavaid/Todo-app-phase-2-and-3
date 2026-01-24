# TodoApp - Complete Documentation

**Version**: 1.0.0
**Last Updated**: 2026-01-21
**Tech Stack**: Next.js 16.1 + React 19 + TypeScript 5 + Tailwind CSS v4
**Backend**: FastAPI (Python)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Design System](#design-system)
4. [Features](#features)
5. [Components](#components)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Authentication](#authentication)
9. [Changelog](#changelog)

---

## Overview

TodoApp is a professional, web-based task management application with user authentication, AI chat assistant integration, and real-time CRUD operations. It features a modern, responsive design with a card-based layout and slate color palette.

### Key Features

- ✅ User authentication (signup, login, logout)
- ✅ Task CRUD operations (create, read, update, delete)
- ✅ Task filtering and search
- ✅ Statistics dashboard
- ✅ Priority levels (High, Medium, Low)
- ✅ Categories (Work, Personal, Shopping, Health, Finance, Other)
- ✅ Due date tracking with overdue indicators
- ✅ AI Chat interface (placeholder for backend integration)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Light theme with slate color palette

---

## Architecture

### Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Main application page
│   └── globals.css          # Global styles & CSS variables
│
├── components/              # React components
│   ├── layout/              # Layout components
│   ├── auth/                # Authentication components
│   ├── todos/               # Todo feature components
│   ├── chat/                # AI chat components
│   └── ui/                  # Reusable UI components
│
├── hooks/                   # Custom React hooks
│   ├── useAuth.tsx          # Authentication state
│   ├── useTodos.ts          # Todo CRUD & filtering
│   ├── useChat.ts           # Chat state
│   └── useTabs.ts           # Tab navigation
│
├── lib/                     # Utilities & types
│   ├── types.ts             # TypeScript interfaces
│   ├── api-client.ts        # FastAPI backend client
│   ├── utils.ts             # Helper functions
│   ├── mock-data.ts         # Sample data for development
│   └── mock-auth.ts         # Mock auth service
│
├── .env.local               # Environment variables
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript configuration
```

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.4 | React framework with App Router |
| React | 19.2.3 | UI library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | v4 | Styling (CSS variables, no config) |
| FastAPI | - | Backend API (user-provided) |

---

## Design System

### Color Palette

**Primary Colors**
```css
--primary: #6366f1 (indigo-500)
--primary-hover: #4f46e5 (indigo-600)
```

**Priority Colors**
```css
--priority-high: #ef4444 (red-500)
--priority-medium: #f59e0b (amber-500)
--priority-low: #22c55e (green-500)
```

**Category Colors**
```css
--category-work: #3b82f6 (blue-500)
--category-personal: #8b5cf6 (violet-500)
--category-shopping: #ec4899 (pink-500)
--category-health: #10b981 (emerald-500)
--category-finance: #f97316 (orange-500)
--category-other: #6b7280 (gray-500)
```

**UI Colors**
```css
--background: #f8fafc (slate-50)
--foreground: #0f172a (slate-900)
--card-bg: #ffffff
--border: #e2e8f0 (slate-200)
--text-primary: #0f172a (slate-900)
--text-secondary: #64748b (slate-500)
```

### Typography

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| H1 (Logo) | xl (20px) | bold | App title |
| H2 (Section) | lg (18px) | semibold | Page headings |
| Body | sm (14px) | normal | Content |
| Small | xs (12px) | normal | Meta info |

### Spacing

- Card padding: `p-4` to `p-6`
- Gap between cards: `gap-4`
- Section spacing: `gap-6`
- Header padding: `py-4`

### Border Radius

- Cards: `rounded-xl` (12px)
- Buttons: `rounded-lg` (8px)
- Badges: `rounded-full`
- Avatar: `rounded-full`

### Shadows

- Cards: `shadow-sm hover:shadow-md`
- Modals: `shadow-xl`

---

## Features

### 1. Authentication

**Components**: `LoginForm.tsx`, `SignupForm.tsx`, `AuthPage.tsx`, `AuthProvider.tsx`

**Flow**:
1. User lands on app → redirected to login if not authenticated
2. User can login OR sign up
3. On success, token stored in localStorage
4. User redirected to main app
5. Session persists across page reloads

**Features**:
- Email validation
- Password minimum 6 characters
- Password confirmation on signup
- Remember me option (localStorage persistence)
- Auto-login after registration
- Error handling (401, 409, 422)

### 2. Task Management

**Components**: `TodoDashboard.tsx`, `TodoList.tsx`, `TodoCard.tsx`, `TodoForm.tsx`

**CRUD Operations**:
- **Create**: Modal form with title, description, priority, category, due date
- **Read**: Grid display with filtering and search
- **Update**: Edit modal to modify any field
- **Delete**: One-click delete (no confirmation)
- **Toggle**: Checkbox to mark complete/incomplete

**Display**:
- Card-based grid layout
- Priority badges (High=Red, Medium=Amber, Low=Green)
- Category badges with colored dots
- Overdue indicator for past-due tasks
- Strikethrough styling for completed tasks
- Checkbox for quick status toggle

### 3. Filtering & Search

**Component**: `TodoFilters.tsx`

**Filters**:
- **Status**: All, Active, Completed
- **Category**: All, Work, Personal, Shopping, Health, Finance, Other
- **Priority**: All, High, Medium, Low
- **Search**: Text search across title and description
- **Clear Filters**: Reset all filters

**Behavior**:
- Real-time filtering (no page reload)
- Multiple filters can be applied simultaneously
- Results update instantly as user types/selects

### 4. Statistics Dashboard

**Component**: `TodoStats.tsx`

**Metrics**:
- Total tasks
- Completed tasks
- Active tasks
- High priority (incomplete)
- Overdue tasks
- Completion rate (%)

**Display**:
- Compact grid layout
- Color-coded metrics
- Real-time updates

### 5. AI Chat Interface

**Components**: `ChatInterface.tsx`, `ChatMessageList.tsx`, `ChatMessage.tsx`, `ChatInput.tsx`

**Features**:
- Tabbed interface (separate from Todos)
- Message history
- User messages (right-aligned, blue background)
- AI messages (left-aligned, gray background)
- Timestamp on each message
- Typing indicator during response
- Clear chat button
- Auto-scroll to latest message

**Current Status**: Placeholder with mock responses
**Planned**: Integration with FastAPI backend

### 6. Responsive Design

**Breakpoints**:
| Screen | Columns | Layout |
|--------|---------|--------|
| Mobile (<640px) | 1 | Full-width cards |
| Tablet (640-1024px) | 2 | 2-column grid |
| Desktop (>1024px) | 3 | 3-column grid |

**Responsive Elements**:
- Header: User email hidden on mobile
- Filters: Stack vertically on mobile
- Cards: Adjust grid columns
- Buttons: Full width on mobile

---

## Components

### Layout Components

#### TabNavigation
**Location**: `components/layout/TabNavigation.tsx`

**Purpose**: Switch between Todos and AI Assistant tabs

**Props**: None (uses `useTabs` hook)

**Features**:
- Two tabs: Todos, AI Assistant
- Active tab highlighting
- Smooth transitions
- Icon + label display

---

#### AppHeader
**Location**: `components/layout/AppHeader.tsx`

**Purpose**: Display app branding and user info

**Features**:
- App logo with checkmark icon
- App title and subtitle
- User avatar with initials
- User name and email
- Logout button

**Avatar Logic**:
```typescript
// Single name: first 2 chars
"Alice" → "AL"

// Multiple names: first letter of first 2 names
"John Doe" → "JD"
"Mary Jane Smith" → "MJ"
```

---

### Authentication Components

#### LoginForm
**Location**: `components/auth/LoginForm.tsx`

**Purpose**: User login

**Fields**:
- Email (required, validated)
- Password (required, min 6 chars)
- Remember me (checkbox)

**Actions**:
- Submit: Call login API
- Switch to Signup: Toggle form

---

#### SignupForm
**Location**: `components/auth/SignupForm.tsx`

**Purpose**: New user registration

**Fields**:
- Name (required, min 2 chars)
- Email (required, validated)
- Password (required, min 8 chars per backend)
- Confirm Password (must match)
- Accept Terms (checkbox)

**Validation**:
- Real-time password matching
- Password strength indicator
- Terms acceptance required

---

#### AuthPage
**Location**: `components/auth/AuthPage.tsx`

**Purpose**: Container for login/signup forms

**Features**:
- Background gradient decoration
- Form toggle (login ↔ signup)
- Centered card layout

---

### Todo Components

#### TodoDashboard
**Location**: `components/todos/TodoDashboard.tsx`

**Purpose**: Main container for todo features

**Sections**:
1. Header (stats summary)
2. Filters (search, category, priority, status)
3. TodoList (grid of cards)
4. Floating "New Todo" button

---

#### TodoList
**Location**: `components/todos/TodoList.tsx`

**Purpose**: Grid container for todo cards

**Props**:
- `todos`: Todo[]
- `onToggle`: (id: string) => void
- `onEdit`: (todo: Todo) => void
- `onDelete`: (id: string) => void

**Layout**: Responsive grid (1/2/3 columns)

---

#### TodoCard
**Location**: `components/todos/TodoCard.tsx`

**Purpose**: Individual todo item display

**Display**:
- Checkbox (left)
- Title & description
- Priority badge (top right)
- Category badge (below title)
- Due date (if set)
- Overdue indicator (if applicable)
- Edit button (pencil icon)
- Delete button (trash icon)

**States**:
- Active: Normal styling
- Completed: Opacity reduced, strikethrough title
- Overdue: Red "Overdue" badge

---

#### TodoForm
**Location**: `components/todos/TodoForm.tsx`

**Purpose**: Create/edit todo modal

**Fields**:
- Title (required, max 200 chars)
- Description (optional, max 1000 chars)
- Priority (dropdown: High, Medium, Low)
- Category (dropdown: 6 options)
- Due Date (date picker)

**Modes**:
- Create: Empty form
- Edit: Pre-filled with existing data

---

#### TodoFilters
**Location**: `components/todos/TodoFilters.tsx`

**Purpose**: Search and filter controls

**Controls**:
- Search input (text)
- Status dropdown (All, Active, Completed)
- Category dropdown (All + 6 categories)
- Priority dropdown (All, High, Medium, Low)
- Clear button (shown when filters active)

---

#### CategoryBadge
**Location**: `components/todos/CategoryBadge.tsx`

**Purpose**: Display category with colored dot

**Display**:
- Colored circle indicator
- Category name
- Hover effect

**Colors**:
- Work: Blue
- Personal: Violet
- Shopping: Pink
- Health: Emerald
- Finance: Orange
- Other: Gray

---

#### PriorityBadge
**Location**: `components/todos/PriorityBadge.tsx`

**Purpose**: Display priority level

**Display**:
- High: Red background
- Medium: Amber background
- Low: Green background

---

#### TodoStats
**Location**: `components/todos/TodoStats.tsx`

**Purpose**: Display task statistics

**Metrics**:
- Total (count)
- Completed (count)
- Active (count)
- High Priority (count, incomplete only)
- Overdue (count)
- Completion Rate (percentage)

---

### Chat Components

#### ChatInterface
**Location**: `components/chat/ChatInterface.tsx`

**Purpose**: Main chat container

**Sections**:
1. ChatHeader (session info)
2. ChatMessageList (scrollable message area)
3. ChatInput (text field + send button)

---

#### ChatMessageList
**Location**: `components/chat/ChatMessageList.tsx`

**Purpose**: Scrollable message history

**Features**:
- Auto-scroll to bottom on new messages
- Separate styling for user/assistant messages

---

#### ChatMessage
**Location**: `components/chat/ChatMessage.tsx`

**Purpose**: Individual message display

**User Message**:
- Right-aligned
- Blue background
- White text

**Assistant Message**:
- Left-aligned
- Gray background
- Dark text

**Both**:
- Rounded corners
- Timestamp below
- Avatar/role indicator

---

#### ChatInput
**Location**: `components/chat/ChatInput.tsx`

**Purpose**: Message input field

**Features**:
- Text input (placeholder "Type a message...")
- Send button (disabled when empty)
- Enter key to send
- Auto-clear after send

---

### UI Components

#### Button
**Location**: `components/ui/Button.tsx`

**Variants**:
- `primary`: Indigo background, white text
- `secondary`: Gray background, dark text
- `ghost`: Transparent, dark text

**Sizes**:
- `sm`: Small (padding compact)
- `md`: Medium (default)
- `lg`: Large (more padding)

---

#### Input
**Location**: `components/ui/Input.tsx`

**Features**:
- Border styling
- Focus ring (indigo)
- Error state (red border)
- Disabled state (grayed out)

---

#### TextArea
**Location**: `components/ui/TextArea.tsx`

**Features**:
- Multi-line input
- Resizable (vertical)
- Same styling as Input

---

#### Select
**Location**: `components/ui/Select.tsx`

**Features**:
- Native dropdown
- Options array prop
- Change handler

---

#### Modal
**Location**: `components/ui/Modal.tsx`

**Features**:
- Overlay backdrop
- Centered content
- Close button
- Click outside to close

---

#### Card
**Location**: `components/ui/Card.tsx`

**Variants**:
- `Card`: Container with shadow
- `CardContent`: Padding wrapper
- `CardHeader`, `CardTitle`, `CardFooter`: Optional sections

---

#### Badge
**Location**: `components/ui/Badge.tsx`

**Variants**:
- `default`: Gray background
- `success`: Green background
- `warning`: Amber background
- `danger`: Red background
- `info`: Blue background

---

## State Management

### useAuth Hook

**Location**: `hooks/useAuth.tsx`

**State**:
```typescript
{
  user: User | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  error: string | null
}
```

**Methods**:
- `login(credentials)`: Authenticate user
- `signup(credentials)`: Register new user
- `logout()`: Clear session
- `clearError()`: Reset error state

**Storage**: localStorage (`auth_token`, `user`)

---

### useTodos Hook

**Location**: `hooks/useTodos.ts`

**State**:
```typescript
{
  todos: Todo[]
  filteredTodos: Todo[]
  filter: TodoFilter
  stats: TodoStats
  loading: boolean
  error: string | null
}
```

**Methods**:
- `addTodo(data)`: Create new task
- `updateTodo(id, updates)`: Modify task
- `deleteTodo(id)`: Remove task
- `toggleComplete(id)`: Flip completed status
- `setStatusFilter(status)`: Filter by status
- `setCategoryFilter(category)`: Filter by category
- `setPriorityFilter(priority)`: Filter by priority
- `setSearchQuery(query)`: Search text
- `clearFilters()`: Reset all filters

**API Integration**: Calls `taskApi.*` methods from `api-client.ts`

---

### useChat Hook

**Location**: `hooks/useChat.ts`

**State**:
```typescript
{
  messages: ChatMessage[]
  isTyping: boolean
}
```

**Methods**:
- `sendMessage(content)`: Add user message, get AI response
- `clearChat()`: Remove all messages

**Current**: Mock responses with 1-second delay
**Planned**: Real API integration

---

### useTabs Hook

**Location**: `hooks/useTabs.ts`

**State**:
```typescript
{
  activeTab: 'todos' | 'chat'
}
```

**Methods**:
- `setTab(tabId)`: Switch active tab

---

## API Integration

### API Client

**Location**: `lib/api-client.ts`

**Base URL**: `NEXT_PUBLIC_API_URL` (default: `http://localhost:8000`)

**Auth Methods**:
- `authApi.register(credentials)`: POST /api/auth/register
- `authApi.login(credentials)`: POST /api/auth/login
- `authApi.getCurrentUser()`: GET /api/auth/me
- `authApi.logout()`: Clear localStorage

**Task Methods**:
- `taskApi.getAll(status?)`: GET /api/tasks
- `taskApi.getById(id)`: GET /api/tasks/{id}
- `taskApi.create(data)`: POST /api/tasks
- `taskApi.update(id, data)`: PUT /api/tasks/{id}
- `taskApi.toggle(id)`: PATCH /api/tasks/{id}/toggle
- `taskApi.delete(id)`: DELETE /api/tasks/{id}

**Chat Methods** (placeholder):
- `chatApi.sendMessage(request)`: POST /api/chat
- `chatApi.getHistory()`: GET /api/chat/history
- `chatApi.clearHistory()`: DELETE /api/chat/clear

### Status Mapping

**Backend → Frontend**:
| Backend | Frontend |
|---------|----------|
| `status: "pending"` | `completed: false` |
| `status: "done"` | `completed: true` |

**Frontend → Backend**:
| Frontend | Backend |
|----------|---------|
| `completed: true` | `status: "done"` |
| `completed: false` | `status: "pending"` |

### Error Handling

**Status Codes**:
- `401`: Unauthorized → Clear token, redirect to login
- `404`: Not found → Show error message
- `409`: Conflict (email exists) → Show specific error
- `422`: Validation error → Show field errors

---

## Authentication

### Flow Diagram

```
┌─────────────┐
│  Land on    │
│    App      │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Check localStorage│
│ for token?       │
└────┬────────┬────┘
     │ Yes    │ No
     ▼        ▼
┌─────────┐ ┌──────────┐
│ Verify  │ │ Show     │
│ Token   │ │ Login/   │
│ /api/me │ │ Signup   │
└────┬────┘ └──────────┘
     │
     ▼
┌─────────┐
│ Valid?  │
└────┬────┘
     │ Yes    │ No
     ▼        ▼
┌─────────┐ ┌──────────┐
│ Show App│ │ Show     │
│         │ │ Login    │
└─────────┘ └──────────┘
```

### Token Storage

**localStorage Keys**:
- `auth_token`: JWT bearer token
- `user`: JSON string of user object

**Token Usage**:
```
Authorization: Bearer <token>
```

### Password Requirements

| Field | Requirement |
|-------|-------------|
| Email | Valid email format |
| Password | Min 8 characters (backend enforces) |
| Confirm | Must match password |

---

## Changelog

### Version 1.0.0 (2026-01-21)

**Initial Release**

#### Features Added
- ✅ User authentication system (signup, login, logout)
- ✅ Task CRUD operations (create, read, update, delete, toggle)
- ✅ Task filtering by status, category, priority
- ✅ Task search functionality
- ✅ Statistics dashboard
- ✅ Priority levels (High, Medium, Low) with color coding
- ✅ Categories (Work, Personal, Shopping, Health, Finance, Other)
- ✅ Due date tracking with overdue indicators
- ✅ AI Chat interface (placeholder)
- ✅ Tabbed navigation (Todos / AI Assistant)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Light theme with slate color palette
- ✅ User avatar with initials display

#### Backend Integration
- ✅ FastAPI client implementation
- ✅ Auth API integration (register, login, get current user)
- ✅ Tasks API integration (CRUD + toggle)
- ✅ Status mapping (pending/done ↔ completed boolean)
- ✅ Error handling (401, 404, 409, 422)
- ✅ JWT token management
- ✅ Environment configuration (.env.local)

#### Documentation
- ✅ Feature specification (specs/001-todo-app/spec.md)
- ✅ Implementation plan (specs/001-todo-app/plan.md)
- ✅ Technology research (specs/001-todo-app/research.md)
- ✅ Data model documentation (specs/001-todo-app/data-model.md)
- ✅ API contracts (specs/001-todo-app/contracts/)
- ✅ Developer quick start (specs/001-todo-app/quickstart.md)

---

## Future Enhancements

### Phase 3: Backend Integration (Pending)
- [ ] Replace mock chat with real AI responses
- [ ] Add streaming responses for chat
- [ ] Implement chat history persistence
- [ ] Add loading states for all API calls

### Phase 4: Testing (Pending)
- [ ] Unit tests with React Testing Library
- [ ] Integration tests for API calls
- [ ] E2E tests with Playwright
- [ ] 80%+ code coverage goal

### Phase 5: Advanced Features (Planned)
- [ ] Drag and drop task reordering
- [ ] Task templates
- [ ] Recurring tasks
- [ ] File attachments to tasks
- [ ] Task comments/collaboration
- [ ] Email notifications
- [ ] Calendar view
- [ ] Export to CSV/JSON
- [ ] Dark mode toggle

---

## Environment Variables

### Required

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Production

```bash
# Production deployment
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

---

## CORS Configuration

**Backend** (FastAPI) `.env`:
```bash
CORS_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

---

## Quick Start

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Visit: http://localhost:3000

### Build

```bash
npm run build
npm start
```

---

## Support

For issues or questions:
- Check the [Quick Start Guide](specs/001-todo-app/quickstart.md)
- Review [API Contracts](specs/001-todo-app/contracts/)
- See [Reverse Engineered Docs](docs/reverse-engineered/)

---

**Document Version**: 1.0.0
**Last Modified**: 2026-01-21
**Maintained By**: Development Team
