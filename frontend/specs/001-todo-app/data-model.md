# Data Model: TodoApp - Professional Task Manager with AI Assistant

**Feature**: 001-todo-app
**Date**: 2026-01-21
**Purpose**: Define data entities, relationships, validation rules, and state management

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │───1:N─│    Todo     │───N:1─│  Category   │
│             │       │             │       │             │
│ - id        │       │ - id        │       │ - id        │
│ - email     │       │ - title     │       │ - name      │
│ - name      │       │ - desc      │       │ - color     │
│ - created   │       │ - status    │       └─────────────┘
└─────────────┘       │ - priority  │
                      │ - dueDate   │       ┌─────────────┐
                      │ - userId    │───N:1─│ChatSession  │
                      │ - catId     │       │             │
                      └─────────────┘       │ - id        │
                                              │ - userId    │
┌─────────────┐                              │ - created   │
│ ChatMessage │                               └─────────────┘
│             │                                    │ 1
│ - id        │                                    │
│ - sessionId │───N:1──────────────────────────────┘
│ - role      │
│ - content   │
│ - timestamp │
└─────────────┘
```

---

## Entity Definitions

### 1. User

**Purpose**: Represents a registered user of the application

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID (string) | Primary key, auto-generated | Unique identifier |
| `email` | string | Unique, required, valid email format | User's email address (login credential) |
| `name` | string | Required, min 2 chars | Display name for the user |
| `created_at` | DateTime | Auto-generated | Account creation timestamp |
| `avatar_url` | string | Optional | URL to user's profile image |

**Backend Schema (FastAPI)**:
```python
class UserCreate(BaseModel):
    email: EmailStr
    password: str  # min 8 chars
    name: str

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    name: str
    created_at: datetime
```

**Frontend Interface (TypeScript)**:
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;  // ISO 8601
  avatar_url?: string;
}
```

**Validation Rules**:
- Email must be valid format (regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$`)
- Password minimum 8 characters (backend requirement)
- Name minimum 2 characters, max 100 characters

---

### 2. Todo

**Purpose**: Represents a task or action item to be tracked and completed

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID (string) | Primary key, auto-generated | Unique identifier |
| `user_id` | UUID (string) | Foreign key → User.id, required | Owner of this task |
| `title` | string | Required, min 1 char, max 200 | Task title/name |
| `description` | string | Optional, max 1000 | Detailed task description |
| `status` | enum | Required, default: "pending" | "pending" or "done" |
| `priority` | enum | Optional, default: "medium" | "high", "medium", or "low" |
| `category_id` | UUID (string) | Foreign key → Category.id | Task category assignment |
| `due_date` | DateTime | Optional | When task is due |
| `created_at` | DateTime | Auto-generated | Task creation timestamp |
| `updated_at` | DateTime | Auto-updated | Last modification timestamp |
| `order` | number | Optional, default: 0 | Display order for sorting |

**Backend Schema (FastAPI)**:
```python
class TaskCreate(BaseModel):
    title: str  # min 1 char
    description: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[Literal["pending", "done"]] = None

class TaskResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    status: Literal["pending", "done"]
    created_at: datetime
    updated_at: datetime
```

**Frontend Interface (TypeScript)**:
```typescript
type TodoStatus = 'pending' | 'done';
type Priority = 'high' | 'medium' | 'low';

interface Todo {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority?: Priority;
  category_id?: string;
  due_date?: string;  // ISO 8601
  created_at: string;
  updated_at: string;
  order?: number;
}
```

**State Transitions**:
```
┌──────────┐     toggle()     ┌──────────┐
│ pending  │ ───────────────> │   done   │
│          │ <─────────────── │          │
└──────────┘     toggle()     └──────────┘
```

**Validation Rules**:
- Title: 1-200 characters
- Description: max 1000 characters
- Status: must be "pending" or "done"
- Due date: must be valid ISO 8601 date if provided
- Priority: if set, must be "high", "medium", or "low"

**Derived Fields** (computed on frontend):
- `isOverdue`: boolean = `status === 'pending' && due_date < now`
- `isCompleted`: boolean = `status === 'done'`

---

### 3. Category

**Purpose**: Classification labels for organizing related tasks

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID (string) | Primary key | Unique identifier |
| `name` | string | Required, unique | Display name |
| `color` | string (hex) | Required | Hex color code (e.g., "#3b82f6") |

**Frontend Interface (TypeScript)**:
```typescript
interface Category {
  id: string;
  name: string;
  color: string;  // Hex color
}
```

**Predefined Categories** (frontend only):

| Name | Color | Use Case |
|------|-------|----------|
| Work | #3b82f6 (Blue-500) | Professional tasks |
| Personal | #8b5cf6 (Violet-500) | Personal life tasks |
| Shopping | #ec4899 (Pink-500) | Shopping lists |
| Health | #10b981 (Emerald-500) | Health & fitness |
| Finance | #f97316 (Orange-500) | Money-related tasks |
| Other | #6b7280 (Gray-500) | Uncategorized tasks |

**Note**: Categories are currently frontend-only. Backend does not have a categories table. The frontend stores category assignment as a string field on todos.

---

### 4. ChatMessage

**Purpose**: A single message in the AI assistant conversation

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | string | Auto-generated | Unique identifier (use `Date.now()` or UUID) |
| `session_id` | string | Foreign key → ChatSession.id | Which conversation this belongs to |
| `role` | enum | Required | "user" or "assistant" |
| `content` | string | Required, max 5000 | Message text content |
| `timestamp` | DateTime | Auto-generated | When message was sent |

**Frontend Interface (TypeScript)**:
```typescript
type MessageRole = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  timestamp: string;  // ISO 8601
}
```

**Validation Rules**:
- Role: must be "user" or "assistant"
- Content: 1-5000 characters
- Timestamp: must be valid ISO 8601 date

**Message Flow**:
```
User sends message → Create ChatMessage(role='user')
                    ↓
            Call backend API (future)
                    ↓
    AI responds → Create ChatMessage(role='assistant')
```

---

### 5. ChatSession

**Purpose**: A conversation between a user and the AI assistant

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | string | Auto-generated | Unique identifier |
| `user_id` | string | Foreign key → User.id | Who owns this session |
| `created_at` | DateTime | Auto-generated | Session start time |
| `messages` | ChatMessage[] | Computed | Array of messages in this session |

**Frontend Interface (TypeScript)**:
```typescript
interface ChatSession {
  id: string;
  user_id: string;
  created_at: string;
  messages: ChatMessage[];  // Computed from stored messages
}
```

**Note**: Chat sessions are currently frontend-only using in-memory state. Backend integration will require session persistence.

---

## Relationships Summary

| From | To | Relationship | Description |
|------|-----|--------------|-------------|
| User | Todo | 1:N | One user has many tasks |
| User | ChatSession | 1:N | One user has many chat sessions |
| Todo | Category | N:1 | Many tasks belong to one category |
| ChatSession | ChatMessage | 1:N | One session has many messages |

---

## State Management Strategy

### Frontend State (React Hooks)

```typescript
// hooks/useAuth.tsx
interface AuthState {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  token: string | null;
}

// hooks/useTodos.ts
interface TodosState {
  todos: Todo[];
  filter: FilterState;
  stats: StatsState;
}

interface FilterState {
  search: string;
  status: 'all' | 'pending' | 'done';
  category: string | null;
  priority: string | null;
}

// hooks/useChat.ts
interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
}

// hooks/useTabs.ts
interface TabsState {
  activeTab: 'todos' | 'chat';
}
```

### Data Flow Diagram

```
┌─────────────────┐
│   User Action   │
│  (click, type)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Event Handler  │
│  (component)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Custom Hook     │
│ (useTodos, etc) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ State Update    │
│ (setState)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Re-render       │
│ (React)         │
└─────────────────┘
```

---

## Backend API Alignment

**Current Backend** (FastAPI):
```python
# Simple task model
class Task(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    status: Literal["pending", "done"]
    created_at: datetime
    updated_at: datetime
```

**Frontend Enhancement**:
The frontend extends the backend model with:
- `priority` field (client-side only, stored as metadata or separate field)
- `category` string (client-side only)
- `due_date` (client-side only)
- `order` for sorting (client-side only)

**Migration Path**:
When backend adds these fields, the frontend types already support them:
```typescript
interface Todo {
  // ... existing fields
  priority?: Priority;      // Will sync when backend supports
  category_id?: string;     // Will sync when backend supports
  due_date?: string;        // Will sync when backend supports
}
```

---

## Validation Summary

### Input Validation

| Entity | Field | Validation |
|--------|-------|------------|
| User | email | Valid email format, unique |
| User | password | Min 8 characters |
| User | name | Min 2 characters, max 100 |
| Todo | title | Min 1 character, max 200 |
| Todo | description | Max 1000 characters |
| Todo | status | "pending" or "done" |
| Todo | due_date | Valid ISO 8601 date |
| ChatMessage | content | Min 1 character, max 5000 |

### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 401 | Unauthorized | Invalid or expired token |
| 404 | Not Found | Task doesn't exist |
| 409 | Conflict | Email already registered |
| 422 | Validation Error | Invalid input data |

---

## Data Persistence

### Client-Side Storage

```typescript
// Auth tokens (localStorage)
localStorage.setItem('auth_token', token);
localStorage.setItem('user', JSON.stringify(user));

// Chat history (sessionStorage - cleared on close)
sessionStorage.setItem('chat_messages', JSON.stringify(messages));
```

### Backend Integration (Future)

```typescript
// Replace mock data with API calls
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = {
  // Auth
  login: (email, password) => fetch(`${API_BASE}/api/auth/login`, { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email, password, name) => fetch(`${API_BASE}/api/auth/register`, { method: 'POST', body: JSON.stringify({ email, password, name }) }),

  // Tasks
  getTasks: () => fetch(`${API_BASE}/api/tasks`, { headers: { 'Authorization': `Bearer ${token}` } }),
  createTask: (task) => fetch(`${API_BASE}/api/tasks`, { method: 'POST', body: JSON.stringify(task) }),
  updateTask: (id, updates) => fetch(`${API_BASE}/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  toggleTask: (id) => fetch(`${API_BASE}/api/tasks/${id}/toggle`, { method: 'PATCH' }),
  deleteTask: (id) => fetch(`${API_BASE}/api/tasks/${id}`, { method: 'DELETE' }),

  // Chat (future)
  sendMessage: (message) => fetch(`${API_BASE}/api/chat`, { method: 'POST', body: JSON.stringify({ message }) }),
};
```

---

## Data Migration Notes

### Mock Data → Real API

1. **Remove mock imports**:
   ```typescript
   - import { mockTodos } from '@/lib/mock-data';
   + const { todos } = await apiClient.getTasks();
   ```

2. **Update types if needed**:
   - Backend uses UUID strings (compatible)
   - Backend uses ISO 8601 dates (compatible)
   - Backend uses simpler Task model (extend frontend-only fields)

3. **Add loading states**:
   ```typescript
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   ```

4. **Handle authentication**:
   ```typescript
   const token = localStorage.getItem('auth_token');
   headers: { 'Authorization': `Bearer ${token}` }
   ```

---

## Glossary

| Term | Definition |
|------|------------|
| UUID | Universally Unique Identifier - 128-bit identifier used as primary keys |
| ISO 8601 | Standard date format: `2026-01-21T10:30:00Z` |
| Foreign Key | Field that references another entity's primary key |
| State Transition | Change from one valid state to another (e.g., pending → done) |
| Computed Field | Value derived from other fields (not stored in database) |

---

## References

- [FastAPI Pydantic Models](https://fastapi.tiangolo.com/tutorial/body/)
- [TypeScript Interfaces](https://www.typescriptlang.org/docs/handbook/2/objects-from-types.html)
- [React State Management](https://react.dev/learn/managing-state)
- [UUID RFC 4122](https://datatracker.ietf.org/doc/html/rfc4122)
