// Todo Types
export type Priority = 'high' | 'medium' | 'low';
export type TodoStatus = 'all' | 'pending' | 'in_progress' | 'done' | 'cancelled';
export type ApiTaskStatus = 'pending' | 'in_progress' | 'done' | 'cancelled';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean; // true for 'done', false for others
  status: ApiTaskStatus; // New: exact API status
  priority: Priority;
  category: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

// Filter Types
export interface TodoFilter {
  status: TodoStatus;
  category: string;
  priority: Priority | 'all';
  searchQuery: string;
}

// Chat Types
export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
}

// Tab Types
export type TabId = 'todos' | 'chat';

export interface Tab {
  id: TabId;
  label: string;
  icon: string;
}
