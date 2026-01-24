# TodoApp - Implementation Tasks

**Version:** 1.0.0
**Status:** Reverse Engineered
**Date:** 2026-01-21

---

## Task Breakdown for Rebuilding from Scratch

This document provides a dependency-ordered task breakdown for rebuilding TodoApp from an empty Next.js project. Tasks are organized by phase and include acceptance criteria.

---

## Phase 1: Project Foundation

### T-1.1: Initialize Next.js Project
**Priority:** P0
**Effort:** 5 minutes
**Dependencies:** None

**Steps:**
```bash
npx create-next-app@latest todoapp --typescript --tailwind --eslint
cd todoapp
npm install clsx
```

**Acceptance Criteria:**
- [ ] Next.js 16.1 project created
- [ ] TypeScript configured
- [ ] Tailwind CSS configured
- [ ] ESLint configured
- [ ] Development server runs on `localhost:3000`

**File Changes:**
- `package.json` - Dependencies installed
- `tsconfig.json` - Strict mode enabled
- `next.config.ts` - Next.js config

---

### T-1.2: Configure Tailwind CSS v4
**Priority:** P0
**Effort:** 10 minutes
**Dependencies:** T-1.1

**Steps:**
1. Update `postcss.config.mjs` to use `@tailwindcss/postcss`
2. Create CSS custom properties in `app/globals.css`
3. Configure theme colors

**File:** `postcss.config.mjs`
```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

**File:** `app/globals.css`
```css
@import "tailwindcss";

:root {
  --background: #f8fafc;
  --foreground: #0f172a;
  --priority-high: #ef4444;
  --priority-medium: #f59e0b;
  --priority-low: #22c55e;
  /* ... etc */
}
```

**Acceptance Criteria:**
- [ ] Tailwind v4 configured
- [ ] CSS custom properties defined
- [ ] App builds without CSS errors
- [ ] Can use custom colors in components

---

### T-1.3: Setup TypeScript Configuration
**Priority:** P0
**Effort:** 5 minutes
**Dependencies:** T-1.1

**File:** `tsconfig.json`
```json
{
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Strict mode enabled
- [ ] Path aliases configured (@/*)
- [ ] No TypeScript errors in build

---

### T-1.4: Create Type Definitions
**Priority:** P0
**Effort:** 15 minutes
**Dependencies:** T-1.3

**Files to Create:**

**`lib/types.ts`**
```typescript
export type Priority = 'high' | 'medium' | 'low';
export type TodoStatus = 'all' | 'active' | 'completed';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
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

export interface TodoFilter {
  status: TodoStatus;
  category: string;
  priority: Priority | 'all';
  searchQuery: string;
}

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export type TabId = 'todos' | 'chat';
```

**`lib/auth-types.ts`**
```typescript
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  status: AuthStatus;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
```

**Acceptance Criteria:**
- [ ] All domain types defined
- [ ] No TypeScript errors
- [ ] Types export correctly
- [ ] Can import types in components

---

### T-1.5: Create Utility Functions
**Priority:** P0
**Effort:** 20 minutes
**Dependencies:** T-1.4

**File:** `lib/utils.ts`
```typescript
import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | undefined): string {
  if (!date) return '';
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  if (diffDays <= 7) return `In ${diffDays} days`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function isOverdue(dueDate: Date | undefined, completed: boolean): boolean {
  if (!dueDate || completed) return false;
  return dueDate < new Date();
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function sortTodos<T extends { priority: string; order: number }>(todos: T[]): T[] {
  const priorityWeight = { high: 3, medium: 2, low: 1 };
  return [...todos].sort((a, b) => {
    if (priorityWeight[b.priority as keyof typeof priorityWeight] !==
        priorityWeight[a.priority as keyof typeof priorityWeight]) {
      return priorityWeight[b.priority as keyof typeof priorityWeight] -
             priorityWeight[a.priority as keyof typeof priorityWeight];
    }
    return a.order - b.order;
  });
}

export function filterTodos(todos: any[], filter: any): any[] {
  return todos.filter((todo) => {
    if (filter.status === 'active' && todo.completed) return false;
    if (filter.status === 'completed' && !todo.completed) return false;
    if (filter.category && filter.category !== 'all' && todo.category !== filter.category) {
      return false;
    }
    if (filter.priority !== 'all' && todo.priority !== filter.priority) {
      return false;
    }
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      const matchesTitle = todo.title.toLowerCase().includes(query);
      const matchesDescription = todo.description?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesDescription) return false;
    }
    return true;
  });
}
```

**Acceptance Criteria:**
- [ ] `cn()` function works for conditional classes
- [ ] `formatDate()` returns human-readable dates
- [ ] `isOverdue()` correctly identifies overdue tasks
- [ ] `generateId()` creates unique IDs
- [ ] `sortTodos()` sorts by priority then order
- [ ] `filterTodos()` applies all filters correctly

---

### T-1.6: Create Mock Data
**Priority:** P0
**Effort:** 15 minutes
**Dependencies:** T-1.4

**File:** `lib/mock-data.ts`
```typescript
import { Todo, Category, ChatMessage } from './types';

export const mockCategories: Category[] = [
  { id: '1', name: 'Work', color: '#3b82f6' },
  { id: '2', name: 'Personal', color: '#8b5cf6' },
  { id: '3', name: 'Shopping', color: '#ec4899' },
  { id: '4', name: 'Health', color: '#10b981' },
  { id: '5', name: 'Finance', color: '#f97316' },
  { id: '6', name: 'Other', color: '#6b7280' },
];

export const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Complete project proposal',
    description: 'Write and submit the Q1 project proposal document.',
    completed: false,
    priority: 'high',
    category: 'Work',
    dueDate: new Date('2026-01-25'),
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-01-20'),
    order: 0,
  },
  // ... more todos
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hello! I\'m your AI assistant. How can I help you today?',
    timestamp: new Date(),
  },
];
```

**Acceptance Criteria:**
- [ ] 6 categories defined with colors
- [ ] 10 sample todos with variety
- [ ] 1 initial chat message
- [ ] Data matches TypeScript types

---

### T-1.7: Create Mock Auth Service
**Priority:** P0
**Effort:** 20 minutes
**Dependencies:** T-1.4

**File:** `lib/mock-auth.ts`
```typescript
import type { User, LoginCredentials, SignupCredentials, AuthResponse } from './auth-types';

const mockUsers: User[] = [
  {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User',
    createdAt: new Date('2026-01-01'),
  },
];

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (credentials.password.length < 6) {
    throw new Error('Invalid credentials');
  }

  const user = mockUsers.find(u => u.email === credentials.email) || {
    id: Math.random().toString(36),
    email: credentials.email,
    name: credentials.email.split('@')[0],
    createdAt: new Date(),
  };

  const token = `mock-token-${Date.now()}`;

  return { user, token };
}

export async function signup(credentials: SignupCredentials): Promise<AuthResponse> {
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (credentials.password !== credentials.confirmPassword) {
    throw new Error('Passwords do not match');
  }

  if (credentials.password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const existingUser = mockUsers.find(u => u.email === credentials.email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  const newUser: User = {
    id: Math.random().toString(36),
    email: credentials.email,
    name: credentials.name,
    createdAt: new Date(),
  };

  mockUsers.push(newUser);

  const token = `mock-token-${Date.now()}`;

  return { user: newUser, token };
}

export async function logout(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
}

export async function getCurrentUser(token: string): Promise<User | null> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockUsers[0] || null;
}
```

**Acceptance Criteria:**
- [ ] Login accepts any email with password >= 6 chars
- [ ] Signup validates password match
- [ ] Signup validates password length
- [ ] Signup checks for existing users
- [ ] All functions have simulated delay

---

### T-1.8: Create API Client Structure
**Priority:** P1
**Effort:** 15 minutes
**Dependencies:** T-1.4

**File:** `lib/api-client.ts`
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const todoApi = {
  async getAll() {
    return Promise.resolve([]);
  },
  async create(todo: any) {
    return Promise.resolve({});
  },
  async update(id: string, updates: any) {
    return Promise.resolve({});
  },
  async delete(id: string) {
    return Promise.resolve({});
  },
  async toggleComplete(id: string, completed: boolean) {
    return this.update(id, { completed });
  },
};

export const chatApi = {
  async sendMessage(request: any) {
    return Promise.resolve({
      response: 'This is a placeholder response.',
      session_id: 'mock-session',
    });
  },
  async getHistory(sessionId: string) {
    return Promise.resolve([]);
  },
  async clearHistory(sessionId: string) {
    return Promise.resolve({});
  },
};

export async function healthCheck(): Promise<boolean> {
  return false;
}
```

**Acceptance Criteria:**
- [ ] API structure ready for backend integration
- [ ] All methods return promises
- [ ] Environment variable support

---

## Phase 2: UI Component Library

### T-2.1: Create Button Component
**Priority:** P0
**Effort:** 10 minutes
**Dependencies:** T-1.5

**File:** `components/ui/Button.tsx`
```typescript
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-indigo-500 text-white hover:bg-indigo-600',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
    ghost: 'text-slate-700 hover:bg-slate-100',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
```

**Acceptance Criteria:**
- [ ] 4 variants: primary, secondary, ghost, danger
- [ ] 3 sizes: sm, md, lg
- [ ] Disabled state styled
- [ ] Focus ring visible
- [ ] Hover transitions smooth

---

### T-2.2: Create Input Component
**Priority:** P0
**Effort:** 10 minutes
**Dependencies:** T-1.5

**File:** `components/ui/Input.tsx`
```typescript
import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Optional label
- [ ] Error state with red border
- [ ] Error message display
- [ ] Focus ring (indigo)
- [ ] Disabled state

---

### T-2.3: Create Select Component
**Priority:** P0
**Effort:** 10 minutes
**Dependencies:** T-1.5

**File:** `components/ui/Select.tsx`
```typescript
import React from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Options rendered from array
- [ ] Label and error support
- [ ] Error state styling
- [ ] Consistent with Input component

---

### T-2.4: Create TextArea Component
**Priority:** P0
**Effort:** 5 minutes
**Dependencies:** T-1.5

**File:** `components/ui/TextArea.tsx`
```typescript
import React from 'react';
import { cn } from '@/lib/utils';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({ label, error, className, ...props }: TextAreaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'resize-none',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] No resize (fixed height)
- [ ] Consistent with Input component
- [ ] Error state support

---

### T-2.5: Create Card Components
**Priority:** P0
**Effort:** 15 minutes
**Dependencies:** T-1.5

**File:** `components/ui/Card.tsx`
```typescript
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-4 sm:p-6 border-b border-slate-200', className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-4 sm:p-6', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-4 sm:p-6 border-t border-slate-200', className)}>
      {children}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Compound component pattern
- [ ] Hover shadow effect
- [ ] Optional click handler
- [ ] Responsive padding

---

### T-2.6: Create Modal Component
**Priority:** P0
**Effort:** 20 minutes
**Dependencies:** T-1.5

**File:** `components/ui/Modal.tsx`
```typescript
'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        className={cn(
          'relative w-full max-w-lg bg-white rounded-xl shadow-xl',
          'max-h-[90vh] overflow-y-auto',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Backdrop closes modal
- [ ] Escape key closes modal
- [ ] Body scroll locked when open
- [ ] Max height with scroll
- [ ] Close button in header

---

### T-2.7: Create Badge Component
**Priority:** P1
**Effort:** 5 minutes
**Dependencies:** T-1.5

**File:** `components/ui/Badge.tsx`
```typescript
import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export function Badge({ children, className, color }: BadgeProps) {
  const inlineStyle = color ? { backgroundColor: color } : undefined;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        !color && 'bg-zinc-100 text-zinc-800',
        className
      )}
      style={inlineStyle}
    >
      {children}
    </span>
  );
}
```

**Acceptance Criteria:**
- [ ] Pill shape
- [ ] Optional custom color
- [ ] Default gray style

---

### T-2.8: Create Header Component
**Priority:** P0
**Effort:** 5 minutes
**Dependencies:** None

**File:** `components/layout/Header.tsx`
```typescript
'use client';

import React from 'react';

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Title displayed
- [ ] Optional description
- [ ] Responsive text size

---

## Phase 3: Custom Hooks

### T-3.1: Create useAuth Hook
**Priority:** P0
**Effort:** 30 minutes
**Dependencies:** T-1.4, T-1.7

**File:** `hooks/useAuth.tsx`
```typescript
'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User, AuthState, LoginCredentials, SignupCredentials } from '@/lib/auth-types';
import * as authApi from '@/lib/mock-auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const currentUser = await authApi.getCurrentUser(token);
          if (currentUser) {
            setUser(currentUser);
            setStatus('authenticated');
          } else {
            setStatus('unauthenticated');
          }
        } catch {
          setStatus('unauthenticated');
        }
      } else {
        setStatus('unauthenticated');
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setError(null);
    try {
      const response = await authApi.login(credentials);
      setUser(response.user);
      setStatus('authenticated');
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    }
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    setError(null);
    try {
      const response = await authApi.signup(credentials);
      setUser(response.user);
      setStatus('authenticated');
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setStatus('unauthenticated');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    status,
    login,
    signup,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

**Acceptance Criteria:**
- [ ] Context created with all auth state
- [ ] useAuth hook throws error outside provider
- [ ] Session restored from localStorage on mount
- [ ] Login stores token and user
- [ ] Signup validates and creates user
- [ ] Logout clears localStorage
- [ ] Error state managed

---

### T-3.2: Create useTodos Hook
**Priority:** P0
**Effort:** 40 minutes
**Dependencies:** T-1.4, T-1.5, T-1.6

**File:** `hooks/useTodos.ts`
```typescript
'use client';

import { useState, useMemo, useCallback } from 'react';
import { Todo, TodoFilter, Priority, TodoStatus } from '@/lib/types';
import { mockTodos } from '@/lib/mock-data';
import { filterTodos, sortTodos, generateId } from '@/lib/utils';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(mockTodos);
  const [filter, setFilter] = useState<TodoFilter>({
    status: 'all',
    category: 'all',
    priority: 'all',
    searchQuery: '',
  });

  const filteredTodos = useMemo(() => {
    const filtered = filterTodos(todos, filter);
    return sortTodos(filtered);
  }, [todos, filter]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const active = total - completed;
    const highPriority = todos.filter((t) => t.priority === 'high' && !t.completed).length;
    const overdue = todos.filter((t) => {
      if (!t.dueDate || t.completed) return false;
      return t.dueDate < new Date();
    }).length;

    return {
      total,
      completed,
      active,
      highPriority,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [todos]);

  const addTodo = useCallback((todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => {
    const newTodo: Todo = {
      ...todoData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      order: todos.length,
    };
    setTodos((prev) => [...prev, newTodo]);
  }, [todos.length]);

  const updateTodo = useCallback((id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt' | 'order'>>) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, ...updates, updatedAt: new Date() }
          : todo
      )
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
          : todo
      )
    );
  }, []);

  const setStatusFilter = useCallback((status: TodoStatus) => {
    setFilter((prev) => ({ ...prev, status }));
  }, []);

  const setCategoryFilter = useCallback((category: string) => {
    setFilter((prev) => ({ ...prev, category }));
  }, []);

  const setPriorityFilter = useCallback((priority: Priority | 'all') => {
    setFilter((prev) => ({ ...prev, priority }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setFilter((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilter({
      status: 'all',
      category: 'all',
      priority: 'all',
      searchQuery: '',
    });
  }, []);

  return {
    todos,
    filteredTodos,
    filter,
    stats,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    setStatusFilter,
    setCategoryFilter,
    setPriorityFilter,
    setSearchQuery,
    clearFilters,
  };
}
```

**Acceptance Criteria:**
- [ ] Initializes with mock todos
- [ ] filteredTodos computed with useMemo
- [ ] stats computed with useMemo
- [ ] All CRUD operations implemented
- [ ] All filter operations implemented
- [ ] useCallback for stable references

---

### T-3.3: Create useChat Hook
**Priority:** P0
**Effort:** 20 minutes
**Dependencies:** T-1.4, T-1.6

**File:** `hooks/useChat.ts`
```typescript
'use client';

import { useState, useCallback } from 'react';
import { ChatMessage, MessageRole } from '@/lib/types';
import { mockChatMessages } from '@/lib/mock-data';
import { generateId } from '@/lib/utils';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user' as MessageRole,
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant' as MessageRole,
        content: 'This is a placeholder response. Connect to your FastAPI backend to enable AI chat functionality.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: generateId(),
        role: 'assistant' as MessageRole,
        content: 'Hello! I\'m your AI assistant. How can I help you today?',
        timestamp: new Date(),
      },
    ]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
  };
}
```

**Acceptance Criteria:**
- [ ] Initializes with mock messages
- [ ] sendMessage adds user message
- [ ] Simulates 1-second API delay
- [ ] Adds placeholder assistant response
- [ ] clearChat resets to greeting

---

### T-3.4: Create useTabs Hook
**Priority:** P0
**Effort:** 10 minutes
**Dependencies:** T-1.4

**File:** `hooks/useTabs.ts`
```typescript
'use client';

import { useState, useCallback } from 'react';
import { TabId } from '@/lib/types';

export function useTabs(initialTab: TabId = 'todos') {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  const setTab = useCallback((tab: TabId) => {
    setActiveTab(tab);
  }, []);

  return {
    activeTab,
    setTab,
  };
}
```

**Acceptance Criteria:**
- [ ] Initializes with 'todos' tab
- [ ] setTab updates activeTab
- [ ] Returns current state

---

## Phase 4: Authentication Components

### T-4.1: Create AuthProvider Wrapper
**Priority:** P0
**Effort:** 5 minutes
**Dependencies:** T-3.1

**File:** `components/auth/AuthProvider.tsx`
```typescript
'use client';

import { ReactNode } from 'react';
import { AuthProvider as AuthContextProvider } from '@/hooks/useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <AuthContextProvider>{children}</AuthContextProvider>;
}
```

---

### T-4.2: Create LoginForm Component
**Priority:** P0
**Effort:** 30 minutes
**Dependencies:** T-2.1, T-2.2, T-2.5, T-3.1

**File:** `components/auth/LoginForm.tsx` (see full code in plan.md)

**Acceptance Criteria:**
- [ ] Email and password inputs
- [ ] Login button with loading state
- [ ] Error display
- [ ] "Remember me" checkbox
- [ ] "Forgot password" link (placeholder)
- [ ] Switch to signup link
- [ ] Demo account hint

---

### T-4.3: Create SignupForm Component
**Priority:** P0
**Effort:** 30 minutes
**Dependencies:** T-2.1, T-2.2, T-2.5, T-3.1

**File:** `components/auth/SignupForm.tsx` (see full code in plan.md)

**Acceptance Criteria:**
- [ ] Name, email, password, confirm password inputs
- [ ] Real-time password match validation
- [ ] Submit button disabled when invalid
- [ ] Error display
- [ ] Switch to login link
- [ ] Terms agreement text

---

### T-4.4: Create AuthPage Component
**Priority:** P0
**Effort:** 15 minutes
**Dependencies:** T-4.2, T-4.3

**File:** `components/auth/AuthPage.tsx` (see full code in plan.md)

**Acceptance Criteria:**
- [ ] Login/signup toggle
- [ ] Background gradient effects
- [ ] Centered card layout
- [ ] Returns null when authenticated

---

## Phase 5: Todo Components

### T-5.1: Create PriorityBadge Component
**Priority:** P0
**Effort:** 10 minutes
**Dependencies:** T-1.4

**File:** `components/todos/PriorityBadge.tsx`
```typescript
'use client';

import React from 'react';
import { Priority } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const priorityConfig = {
  high: { label: 'High', className: 'bg-red-100 text-red-700' },
  medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700' },
  low: { label: 'Low', className: 'bg-green-100 text-green-700' },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', config.className, className)}>
      {config.label}
    </span>
  );
}
```

---

### T-5.2: Create CategoryBadge Component
**Priority:** P0
**Effort:** 15 minutes
**Dependencies:** T-1.4

**File:** `components/todos/CategoryBadge.tsx` (see full code in plan.md)

---

### T-5.3: Create TodoCard Component
**Priority:** P0
**Effort:** 30 minutes
**Dependencies:** T-2.1, T-2.5, T-5.1, T-5.2

**File:** `components/todos/TodoCard.tsx` (see full code in plan.md)

**Acceptance Criteria:**
- [ ] Checkbox with visual feedback
- [ ] Title with strikethrough when complete
- [ ] Description truncation
- [ ] Priority and category badges
- [ ] Due date with overdue indicator
- [ ] Edit and delete buttons

---

### T-5.4: Create TodoList Component
**Priority:** P0
**Effort:** 15 minutes
**Dependencies:** T-5.3

**File:** `components/todos/TodoList.tsx` (see full code in plan.md)

**Acceptance Criteria:**
- [ ] Grid layout (1/2/3 columns)
- [ ] Empty state message
- [ ] Maps todos to TodoCards
- [ ] Passes callbacks to cards

---

### T-5.5: Create TodoFilters Component
**Priority:** P0
**Effort:** 30 minutes
**Dependencies:** T-2.1, T-2.2, T-2.3

**File:** `components/todos/TodoFilters.tsx` (see full code in plan.md)

**Acceptance Criteria:**
- [ ] Search input
- [ ] Status, category, priority selects
- [ ] Clear filters button (conditional)
- [ ] Responsive layout (stacks on mobile)

---

### T-5.6: Create TodoStats Component
**Priority:** P0
**Effort:** 20 minutes
**Dependencies:** T-2.5

**File:** `components/todos/TodoStats.tsx` (see full code in plan.md)

**Acceptance Criteria:**
- [ ] 6 stat cards in grid
- [ ] Color-coded values
- [ ] Labels under values
- [ ] Responsive grid

---

### T-5.7: Create TodoForm Component
**Priority:** P0
**Effort:** 40 minutes
**Dependencies:** T-2.2, T-2.3, T-2.4, T-2.6

**File:** `components/todos/TodoForm.tsx` (see full code in plan.md)

**Acceptance Criteria:**
- [ ] Modal wrapper
- [ ] Title (required)
- [ ] Description (optional)
- [ ] Category and priority selects
- [ ] Due date picker
- [ ] Create/Update button
- [ ] Cancel button
- [ ] Form validation
- [ ] Edit mode support

---

### T-5.8: Create TodoDashboard Component
**Priority:** P0
**Effort:** 30 minutes
**Dependencies:** T-2.1, T-2.8, T-3.2, T-5.4, T-5.5, T-5.6, T-5.7

**File:** `components/todos/TodoDashboard.tsx` (see full code in plan.md)

**Acceptance Criteria:**
- [ ] Header with dynamic description
- [ ] "New Todo" button
- [ ] Stats display
- [ ] Filters display
- [ ] TodoList display
- [ ] TodoForm modal
- [ ] Edit flow integration

---

## Phase 6: Chat Components

### T-6.1: Create ChatMessage Component
**Priority:** P0
**Effort:** 20 minutes
**Dependencies:** T-1.4

**File:** `components/chat/ChatMessage.tsx` (see full code in plan.md)

**Acceptance Criteria:**
- [ ] User messages on right (indigo)
- [ ] Assistant messages on left (gray)
- [ ] Avatar for each role
- [ ] Timestamp display
- [ ] Whitespace preservation

---

### T-6.2: Create ChatMessageList Component
**Priority:** P0
**Effort:** 15 minutes
**Dependencies:** T-6.1

**File:** `components/chat/ChatMessageList.tsx` (see full code in plan.md)

**Acceptance Criteria:**
- [ ] Scrollable container
- [ ] Auto-scroll to bottom
- [ ] Loading indicator with dots
- [ ] Maps messages to components

---

### T-6.3: Create ChatInput Component
**Priority:** P0
**Effort:** 15 minutes
**Dependencies:** T-2.1

**File:** `components/chat/ChatInput.tsx` (see full code in plan.md)

**Acceptance Criteria:**
- [ ] Text input
- [ ] Send button (disabled when empty)
- [ ] Submit on form submit
- [ ] Placeholder message about backend

---

### T-6.4: Create ChatHeader Component
**Priority:** P0
**Effort:** 10 minutes
**Dependencies:** T-2.1

**File:** `components/chat/ChatHeader.tsx` (see full code in plan.md)

**Acceptance Criteria:**
- [ ] Avatar and title
- [ ] Clear button
- [ ] Border separator

---

### T-6.5: Create ChatInterface Component
**Priority:** P0
**Effort:** 20 minutes
**Dependencies:** T-2.5, T-2.8, T-3.3, T-6.2, T-6.3, T-6.4

**File:** `components/chat/ChatInterface.tsx` (see full code in plan.md)

**Acceptance Criteria:**
- [ ] Full-height layout
- [ ] Header component
- [ ] Card wrapper
- [ ] ChatHeader, ChatMessageList, ChatInput
- [ ] Passes callbacks to children

---

## Phase 7: Layout Components

### T-7.1: Create TabNavigation Component
**Priority:** P0
**Effort:** 15 minutes
**Dependencies:** T-1.4

**File:** `components/layout/TabNavigation.tsx` (see full code in plan.md)

**Acceptance Criteria:**
- [ ] Two tabs: Todos, AI Assistant
- [ ] Icons and labels
- [ ] Active state styling
- [ ] Hover states
- [ ] Callback prop

---

### T-7.2: Create AppHeader Component
**Priority:** P0
**Effort:** 20 minutes
**Dependencies:** T-2.1, T-3.1

**File:** `components/layout/AppHeader.tsx` (see full code in plan.md)

**Acceptance Criteria:**
- [ ] Logo and branding
- [ ] User info display
- [ ] Logout button
- [ ] Responsive (email hidden on mobile)
- [ ] Conditional render (authenticated only)

---

## Phase 8: App Integration

### T-8.1: Update Root Layout
**Priority:** P0
**Effort:** 10 minutes
**Dependencies:** T-4.1

**File:** `app/layout.tsx`
```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TodoApp - Professional Task Manager",
  description: "A professional todo application with AI assistant integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

---

### T-8.2: Create Main Page
**Priority:** P0
**Effort:** 30 minutes
**Dependencies:** T-3.1, T-3.4, T-4.4, T-5.8, T-6.5, T-7.1, T-7.2

**File:** `app/page.tsx` (see full code in plan.md)

**Acceptance Criteria:**
- [ ] 'use client' directive
- [ ] Loading state display
- [ ] Auth page when unauthenticated
- [ ] App layout when authenticated
- [ ] Tab switching works
- [ ] Footer included

---

### T-8.3: Update Global Styles
**Priority:** P0
**Effort:** 20 minutes
**Dependencies:** T-1.2

**File:** `app/globals.css` (see full code in plan.md)

**Acceptance Criteria:**
- [ ] Tailwind import
- [ ] CSS custom properties
- [ ] Custom scrollbar
- [ ] Animations (bounce, spin)
- [ ] Body styles

---

## Phase 9: Testing & Polish

### T-9.1: Responsive Testing
**Priority:** P0
**Effort:** 30 minutes
**Dependencies:** All components

**Checklist:**
- [ ] Mobile (< 640px)
  - [ ] Auth page centered
  - [ ] Todo cards stack (1 column)
  - [ ] Filters stack vertically
  - [ ] Stats grid (2 columns)
  - [ ] User email hidden in header
  - [ ] Chat works
- [ ] Tablet (640px - 1024px)
  - [ ] Todo cards (2 columns)
  - [ ] Filters horizontal
  - [ ] Stats grid (3 columns)
- [ ] Desktop (> 1024px)
  - [ ] Todo cards (3 columns)
  - [ ] Stats grid (6 columns)
  - [ ] Max-width containers

---

### T-9.2: Accessibility Testing
**Priority:** P1
**Effort:** 30 minutes
**Dependencies:** All components

**Checklist:**
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Focus indicators visible
- [ ] ARIA labels on interactive elements
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader friendly
- [ ] Form error associations

---

### T-9.3: Cross-Browser Testing
**Priority:** P1
**Effort:** 30 minutes
**Dependencies:** All components

**Checklist:**
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

### T-9.4: Performance Check
**Priority:** P1
**Effort:** 20 minutes
**Dependencies:** All components

**Checklist:**
- [ ] Build succeeds without errors
- [ ] Bundle size reasonable
- [ ] No console errors
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s

---

### T-9.5: Documentation
**Priority:** P2
**Effort:** 30 minutes
**Dependencies:** All components

**Deliverables:**
- [ ] Update README.md with setup instructions
- [ ] Add component documentation
- [ ] Document API integration points
- [ ] Add contribution guidelines

---

## Task Summary

**Total Tasks:** 47
**Estimated Effort:** ~20 hours

**Phase Breakdown:**
- Phase 1 (Foundation): 8 tasks, ~1.5 hours
- Phase 2 (UI Components): 8 tasks, ~1.5 hours
- Phase 3 (Hooks): 4 tasks, ~2 hours
- Phase 4 (Auth): 4 tasks, ~1.5 hours
- Phase 5 (Todos): 8 tasks, ~3.5 hours
- Phase 6 (Chat): 5 tasks, ~1.5 hours
- Phase 7 (Layout): 2 tasks, ~0.5 hours
- Phase 8 (Integration): 3 tasks, ~1 hour
- Phase 9 (Testing): 5 tasks, ~2 hours

---

**End of Implementation Tasks**
