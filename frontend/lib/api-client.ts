/**
 * API Client for FastAPI Backend Integration
 *
 * Connects to the FastAPI backend at http://localhost:8000
 *
 * API Endpoints:
 * Auth:
 * - POST   /api/auth/register  - Register new user
 * - POST   /api/auth/login     - Login user
 * - GET    /api/auth/me        - Get current user
 *
 * Tasks:
 * - GET    /api/tasks          - Get all tasks (optional ?status=pending|done)
 * - POST   /api/tasks          - Create new task
 * - GET    /api/tasks/{id}     - Get single task
 * - PUT    /api/tasks/{id}     - Update task
 * - PATCH  /api/tasks/{id}/toggle - Toggle task status
 * - DELETE /api/tasks/{id}     - Delete task
 *
 * Chat (future):
 * - POST   /api/chat           - Send message to AI
 * - GET    /api/chat/history   - Get chat history
 * - DELETE /api/chat/clear     - Clear chat history
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ==================== HELPER FUNCTIONS ====================

/**
 * Get auth headers for authenticated requests
 */
const authHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

/**
 * Handle API errors and throw appropriate errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Handle 401 - Unauthorized (token expired or invalid)
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        // Optionally redirect to login
        // window.location.href = '/login';
      }
      throw new Error('Authentication failed. Please login again.');
    }

    // Handle 404 - Not found
    if (response.status === 404) {
      const error = await response.json().catch(() => ({ detail: 'Resource not found' }));
      throw new Error(error.detail?.error || 'Resource not found');
    }

    // Handle 409 - Conflict (e.g., email already exists)
    if (response.status === 409) {
      const error = await response.json().catch(() => ({ detail: { error: 'Conflict' } }));
      throw new Error(error.detail?.error || 'Conflict occurred');
    }

    // Handle 422 - Validation error
    if (response.status === 422) {
      const error = await response.json().catch(() => ({ detail: [] }));
      // Extract validation error messages
      if (Array.isArray(error.detail)) {
        const messages = error.detail.map((e: any) => e.msg || 'Validation error').join(', ');
        throw new Error(messages);
      }
      throw new Error('Validation error');
    }

    // Generic error
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  // Handle 204 No Content (e.g., DELETE)
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ==================== TYPES ====================

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    name: string;
    created_at: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

// Task types
export type ApiTaskStatus = 'pending' | 'in_progress' | 'done' | 'cancelled';

export interface TaskCreate {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  tag_ids?: string[];
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: ApiTaskStatus;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string | null;
  tag_ids?: string[];
}

export interface TagPublic {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: ApiTaskStatus;
  priority: string;
  due_date: string | null;
  reminder_sent: boolean;
  recurring_type: string;
  recurring_end_date: string | null;
  created_at: string;
  updated_at: string;
  tags: TagPublic[];
}

// Tag types
export interface TagCreate {
  name: string;
  color?: string;
}

export interface TagUpdate {
  name?: string;
  color?: string;
}

// Chat types
export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
  timestamp?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ==================== AUTH API ====================

export const authApi = {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(credentials: RegisterCredentials): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse<User>(response);
  },

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse<LoginResponse>(response);

    // Store token and user in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  },

  /**
   * Get current user
   * GET /api/auth/me
   */
  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: authHeaders(),
    });
    return handleResponse<User>(response);
  },

  /**
   * Logout (client-side only - just clear storage)
   */
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },
};

// ==================== TASKS API ====================

export const taskApi = {
  /**
   * Get all tasks
   * GET /api/tasks
   * @param status - Optional filter: 'pending' or 'done'
   */
  async getAll(status?: 'pending' | 'done'): Promise<Task[]> {
    const url = status
      ? `${API_BASE_URL}/api/tasks?status=${status}`
      : `${API_BASE_URL}/api/tasks`;

    const response = await fetch(url, {
      headers: authHeaders(),
    });
    return handleResponse<Task[]>(response);
  },

  /**
   * Get a single task
   * GET /api/tasks/{id}
   */
  async getById(id: string): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      headers: authHeaders(),
    });
    return handleResponse<Task>(response);
  },

  /**
   * Create a new task
   * POST /api/tasks
   */
  async create(task: TaskCreate): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(task),
    });
    return handleResponse<Task>(response);
  },

  /**
   * Update a task
   * PUT /api/tasks/{id}
   */
  async update(id: string, updates: TaskUpdate): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse<Task>(response);
  },

  /**
   * Toggle task status (pending <-> done)
   * PATCH /api/tasks/{id}/toggle
   */
  async toggle(id: string): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/toggle`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    return handleResponse<Task>(response);
  },

  /**
   * Delete a task
   * DELETE /api/tasks/{id}
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse<void>(response);
  },
};

// ==================== TAGS API ====================

export const tagApi = {
  /**
   * Get all tags
   * GET /api/tags
   */
  async getAll(): Promise<TagPublic[]> {
    const response = await fetch(`${API_BASE_URL}/api/tags`, {
      headers: authHeaders(),
    });
    return handleResponse<TagPublic[]>(response);
  },

  /**
   * Get a single tag
   * GET /api/tags/{id}
   */
  async getById(id: string): Promise<TagPublic> {
    const response = await fetch(`${API_BASE_URL}/api/tags/${id}`, {
      headers: authHeaders(),
    });
    return handleResponse<TagPublic>(response);
  },

  /**
   * Create a new tag
   * POST /api/tags
   */
  async create(tag: TagCreate): Promise<TagPublic> {
    const response = await fetch(`${API_BASE_URL}/api/tags`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(tag),
    });
    return handleResponse<TagPublic>(response);
  },

  /**
   * Update a tag
   * PUT /api/tags/{id}
   */
  async update(id: string, updates: TagUpdate): Promise<TagPublic> {
    const response = await fetch(`${API_BASE_URL}/api/tags/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse<TagPublic>(response);
  },

  /**
   * Delete a tag
   * DELETE /api/tags/{id}
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/tags/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse<void>(response);
  },
};

// ==================== CHAT API ====================

export interface ChatRequest {
  message: string;
  conversation_id?: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  message_id: string;
  tool_calls?: any[];
}

export const chatApi = {
  /**
   * Send message to AI assistant
   * POST /api/{user_id}/chat
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    // Get user from localStorage to build user_id
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/api/${user.id}/chat`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(request),
    });

    return handleResponse<ChatResponse>(response);
  },

  /**
   * Get chat history
   * GET /api/{user_id}/chat/history
   */
  async getHistory(): Promise<{ messages: ChatMessage[]; session_id: string }> {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/api/${user.id}/chat/history`, {
      headers: authHeaders(),
    });

    return handleResponse<{ messages: ChatMessage[]; session_id: string }>(response);
  },

  /**
   * Clear chat history
   * DELETE /api/{user_id}/chat/clear
   */
  async clearHistory(): Promise<void> {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/api/${user.id}/chat/clear`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    return handleResponse<void>(response);
  },
};

// ==================== HEALTH CHECK ====================

/**
 * Check if the API is accessible
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    // API is up if we get a response (even 401 means it's working)
    return response.status >= 200 && response.status < 500;
  } catch {
    return false;
  }
}

// ==================== EXPORT DEFAULT ====================

export default {
  auth: authApi,
  task: taskApi,
  tag: tagApi,
  chat: chatApi,
  healthCheck,
};
