# Frontend Integration Guide

Complete guide for integrating the Todo API with your frontend application.

## Table of Contents

1. [API Base URL](#api-base-url)
2. [Authentication Flow](#authentication-flow)
3. [API Endpoints](#api-endpoints)
4. [TypeScript Types](#typescript-types)
5. [Code Examples](#code-examples)
6. [Error Handling](#error-handling)
7. [AI Chatbot Integration](#ai-chatbot-integration)

---

## API Base URL

**Deployed API:**
```
https://nauman-19-todo-app-backend.hf.space
```

**Local Development:**
```
http://localhost:8000
```

---

## Authentication Flow

The API uses JWT (JSON Web Tokens) for authentication.

### Step 1: Register a New User

```typescript
interface RegisterData {
  email: string;
  password: string; // min 8 characters
  name?: string;
}

interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

async function register(data: RegisterData): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail?.error || 'Registration failed');
  }

  return response.json();
}
```

### Step 2: Login

```typescript
interface LoginData {
  email: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

async function login(data: LoginData): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail?.error || 'Login failed');
  }

  const result = await response.json();

  // Store token for future requests
  localStorage.setItem('access_token', result.access_token);
  localStorage.setItem('user', JSON.stringify(result.user));

  return result;
}
```

### Step 3: Make Authenticated Requests

```typescript
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// Example: Get current user
async function getCurrentUser(): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Invalid token');
  }

  return response.json();
}
```

---

## API Endpoints

### Authentication

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | No | Create new user account |
| `/api/auth/login` | POST | No | Login and get JWT token |
| `/api/auth/me` | GET | Yes | Get current user info |

### Tasks

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/tasks` | GET | Yes | List all tasks for current user |
| `/api/tasks` | POST | Yes | Create a new task |
| `/api/tasks/{id}` | GET | Yes | Get specific task details |
| `/api/tasks/{id}` | PUT | Yes | Update task (title, description, status) |
| `/api/tasks/{id}` | DELETE | Yes | Delete a task |
| `/api/tasks/{id}/toggle` | PATCH | Yes | Toggle task status (pending↔done) |

### Chatbot

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/{user_id}/chat` | POST | Yes | Send message to AI assistant |

---

## TypeScript Types

```typescript
// ==================== User Types ====================
interface User {
  id: string; // UUID
  email: string;
  name?: string;
  created_at: string; // ISO datetime
}

// ==================== Task Types ====================
type TaskStatus = 'pending' | 'in_progress' | 'done' | 'cancelled';

interface Task {
  id: string; // UUID
  user_id: string; // UUID
  title: string;
  description?: string;
  status: TaskStatus;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

interface TaskCreate {
  title: string; // 1-200 characters
  description?: string; // max 1000 characters
}

interface TaskUpdate {
  title?: string; // 1-200 characters
  description?: string; // max 1000 characters
  status?: TaskStatus;
}

// ==================== Auth Types ====================
interface RegisterData {
  email: string;
  password: string; // min 8 characters
  name?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string; // "bearer"
  user: User;
}

// ==================== Chat Types ====================
interface ChatRequest {
  message: string; // 1-2000 characters
  conversation_id?: string; // UUID - for conversation context
}

interface ChatResponse {
  response: string;
  conversation_id: string; // UUID
  message_id: string; // UUID
  tool_calls: string[]; // List of tools called by AI
}

interface Conversation {
  id: string;
  user_id: string;
  title?: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

// ==================== Error Types ====================
interface ErrorResponse {
  detail: string | { error: string; detail?: string };
}
```

---

## Code Examples

### Task Management

```typescript
class TaskAPI {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // List all tasks
  async listTasks(): Promise<Task[]> {
    const response = await fetch(`${this.baseUrl}/api/tasks`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  }

  // Create a task
  async createTask(data: TaskCreate): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/api/tasks`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  }

  // Get specific task
  async getTask(id: string): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/api/tasks/${id}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) throw new Error('Failed to fetch task');
    return response.json();
  }

  // Update task
  async updateTask(id: string, data: TaskUpdate): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/api/tasks/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  }

  // Delete task
  async deleteTask(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/tasks/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) throw new Error('Failed to delete task');
  }

  // Toggle task status (quick shortcut)
  async toggleTask(id: string): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/api/tasks/${id}/toggle`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });

    if (!response.ok) throw new Error('Failed to toggle task');
    return response.json();
  }
}
```

### React Example

```typescript
import { useState, useEffect } from 'react';

const API_BASE_URL = 'https://nauman-19-todo-app-backend.hf.space';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      fetchTasks();
    }
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const taskAPI = new TaskAPI(API_BASE_URL);
      const data = await taskAPI.listTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (title: string, description?: string) => {
    try {
      const taskAPI = new TaskAPI(API_BASE_URL);
      await taskAPI.createTask({ title, description });
      fetchTasks(); // Refresh list
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const toggleTask = async (id: string) => {
    try {
      const taskAPI = new TaskAPI(API_BASE_URL);
      await taskAPI.toggleTask(id);
      fetchTasks(); // Refresh list
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  return (
    <div>
      {/* Your UI code here */}
    </div>
  );
}
```

---

## Error Handling

### Error Response Format

```typescript
// Error responses follow this format:
interface ErrorResponse {
  detail: string | { error: string; detail?: string };
}
```

### Common HTTP Status Codes

| Status | Description |
|--------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (access denied) |
| 404 | Not Found |
| 409 | Conflict (duplicate email, etc.) |
| 500 | Internal Server Error |

### Error Handling Utility

```typescript
async function handleAPIResponse<T>(
  response: Response
): Promise<T> {
  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    const message = typeof error.detail === 'string'
      ? error.detail
      : error.detail?.error || 'An error occurred';

    throw new Error(message);
  }
  return response.json();
}

// Usage
async function safeLogin(data: LoginData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    return await handleAPIResponse<TokenResponse>(response);
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
    }
    throw error;
  }
}
```

---

## AI Chatbot Integration

The chatbot allows natural language task management. Users can:
- Add tasks ("Add a task to buy groceries")
- List tasks ("Show me all my tasks")
- Complete tasks ("Mark task 1 as done")
- Update tasks ("Change task 2 to high priority")
- Delete tasks ("Delete task 3")

### Chat API

```typescript
class ChatAPI {
  private baseUrl: string;
  private userId: string;

  constructor(baseUrl: string, userId: string) {
    this.baseUrl = baseUrl;
    this.userId = userId;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Send message to AI assistant
  async sendMessage(
    message: string,
    conversationId?: string
  ): Promise<ChatResponse> {
    const response = await fetch(
      `${this.baseUrl}/api/${this.userId}/chat`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          message,
          conversation_id: conversationId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  }
}
```

### React Chat Component

```typescript
import { useState } from 'react';

function ChatComponent({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string>();
  const [loading, setLoading] = useState(false);

  const chatAPI = new ChatAPI(API_BASE_URL, userId);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage(
        userMessage,
        conversationId
      );

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.response },
      ]);

      // Save conversation ID for context
      setConversationId(response.conversationId);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {loading && <div className="message assistant">Typing...</div>}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask me to manage your tasks..."
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
```

### Chat Example Messages

```typescript
// Examples of what users can say:
const EXAMPLE_PROMPTS = [
  "Add a task to buy groceries",
  "Create a task: Finish the project report",
  "Show me all my tasks",
  "What tasks do I have?",
  "List my pending tasks",
  "Mark task 1 as done",
  "Complete the groceries task",
  "Delete task 2",
  "Remove the completed task",
  "Update task 3 to in progress",
  "Change task 1 title to 'Buy milk and eggs'",
];
```

---

## Complete Integration Example

```typescript
// api.ts - Complete API client
const API_BASE_URL = 'https://nauman-19-todo-app-backend.hf.space';

class TodoAPIClient {
  constructor(private baseUrl: string) {}

  // ==================== Auth ====================
  async register(data: RegisterData): Promise<TokenResponse> {
    return this.post('/api/auth/register', data, false);
  }

  async login(data: LoginData): Promise<TokenResponse> {
    const result = await this.post('/api/auth/login', data, false);

    // Store credentials
    localStorage.setItem('access_token', result.access_token);
    localStorage.setItem('user', JSON.stringify(result.user));

    return result;
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  get currentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // ==================== Tasks ====================
  async listTasks(): Promise<Task[]> {
    return this.get('/api/tasks');
  }

  async createTask(data: TaskCreate): Promise<Task> {
    return this.post('/api/tasks', data);
  }

  async getTask(id: string): Promise<Task> {
    return this.get(`/api/tasks/${id}`);
  }

  async updateTask(id: string, data: TaskUpdate): Promise<Task> {
    return this.put(`/api/tasks/${id}`, data);
  }

  async deleteTask(id: string): Promise<void> {
    return this.delete(`/api/tasks/${id}`);
  }

  async toggleTask(id: string): Promise<Task> {
    return this.patch(`/api/tasks/${id}/toggle`);
  }

  // ==================== Chat ====================
  async chat(
    userId: string,
    message: string,
    conversationId?: string
  ): Promise<ChatResponse> {
    return this.post(`/api/${userId}/chat`, {
      message,
      conversation_id: conversationId,
    });
  }

  // ==================== HTTP Helpers ====================
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  private async post<T>(path: string, data: any, auth = true): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.getHeaders(auth),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  private async put<T>(path: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  private async patch<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  private async delete(path: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    await this.handleResponse(response);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      const message = typeof error.detail === 'string'
        ? error.detail
        : error.detail?.error || 'Request failed';
      throw new Error(message);
    }
    return response.json();
  }
}

// Export singleton instance
export const api = new TodoAPIClient(API_BASE_URL);
```

---

## Quick Start Checklist

- [ ] Set `API_BASE_URL` to deployed URL or localhost
- [ ] Implement registration form
- [ ] Implement login form
- [ ] Store JWT token in localStorage/on successful login
- [ ] Add Authorization header to all protected requests
- [ ] Handle 401 errors (redirect to login)
- [ ] Implement task list view
- [ ] Implement task creation form
- [ ] Implement task editing
- [ ] Implement task deletion
- [ ] Add chatbot interface (optional)
- [ ] Test all endpoints with your frontend

---

## Support

For API documentation, visit: `/docs` (Swagger UI) on your API base URL.

Deployed API: https://nauman-19-todo-app-backend.hf.space/docs
