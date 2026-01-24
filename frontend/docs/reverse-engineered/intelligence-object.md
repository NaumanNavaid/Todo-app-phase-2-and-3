# TodoApp - Reusable Patterns and Intelligence

**Version:** 1.0.0
**Status:** Reverse Engineered
**Date:** 2026-01-21

---

## Executive Summary

This document extracts reusable patterns, architectural decisions, and implementation intelligence from the TodoApp codebase. These patterns can be applied to similar React/Next.js applications to accelerate development and maintain consistency.

---

## 1. Architectural Patterns

### Pattern 1: Component-Based Architecture with Hooks

**Description:** Separate business logic into custom hooks, use components purely for presentation.

**Benefits:**
- Clear separation of concerns
- Testable business logic
- Reusable hooks across components
- Easier to refactor

**Implementation Template:**

```typescript
// 1. Define types
interface Todo {
  id: string;
  title: string;
  completed: boolean;
  // ...
}

// 2. Create custom hook
'use client';
import { useState, useMemo, useCallback } from 'react';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);

  // Memoized computed values
  const stats = useMemo(() => ({
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
  }), [todos]);

  // Stable function references
  const addTodo = useCallback((todo: Todo) => {
    setTodos(prev => [...prev, todo]);
  }, []);

  return { todos, stats, addTodo };
}

// 3. Use in component
'use client';
import { useTodos } from '@/hooks/useTodos';

export function TodoDashboard() {
  const { todos, stats, addTodo } = useTodos();

  return (
    <div>
      <StatsDisplay data={stats} />
      <TodoList items={todos} onAdd={addTodo} />
    </div>
  );
}
```

**Files Using This Pattern:**
- `hooks/useAuth.tsx` - Authentication logic
- `hooks/useTodos.ts` - Todo CRUD logic
- `hooks/useChat.ts` - Chat state management
- `hooks/useTabs.ts` - Tab navigation state

---

### Pattern 2: React Context for Global State

**Description:** Use Context API for state that needs to be accessed by multiple components.

**Benefits:**
- No prop drilling
- Centralized state management
- Easy to add providers

**Implementation Template:**

```typescript
// 1. Create context with types
interface AuthContextType {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  login: (credentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Create hook with validation
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// 3. Create provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState('loading');

  const login = useCallback(async (credentials) => {
    // Login logic
  }, []);

  const value: AuthContextType = {
    user,
    status,
    login,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 4. Wrap app in provider
// app/layout.tsx
<AuthProvider>{children}</AuthProvider>
```

**Files Using This Pattern:**
- `hooks/useAuth.tsx` - Authentication context
- `components/auth/AuthProvider.tsx` - Provider wrapper

---

### Pattern 3: Compound Components

**Description:** Build complex UI from multiple related components that share state implicitly.

**Benefits:**
- Flexible composition
- Shared state without props
- Intuitive API

**Implementation Template:**

```typescript
// Define components
export function Card({ children, className, onClick }: CardProps) {
  return (
    <div className={cn('bg-white rounded-xl border shadow-sm', className)} onClick={onClick}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-4 sm:p-6 border-b', className)}>{children}</div>;
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-4 sm:p-6', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-4 sm:p-6 border-t', className)}>{children}</div>;
}

// Usage
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Body content</CardContent>
  <CardFooter>Action buttons</CardFooter>
</Card>
```

**Files Using This Pattern:**
- `components/ui/Card.tsx` - Card compound components

---

## 2. State Management Patterns

### Pattern 4: Optimized Re-renders with useMemo

**Description:** Use useMemo for expensive computations and derived state.

**Benefits:**
- Prevents unnecessary recalculations
- Improves performance
- Clear data flow

**Implementation Template:**

```typescript
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>({ status: 'all', category: 'all' });

  // Only recompute when todos or filter change
  const filteredTodos = useMemo(() => {
    return filterTodos(todos, filter);
  }, [todos, filter]);

  // Only recompute when todos change
  const stats = useMemo(() => {
    return {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      completionRate: todos.length > 0
        ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100)
        : 0,
    };
  }, [todos]);

  return { todos, filteredTodos, filter, stats };
}
```

**Files Using This Pattern:**
- `hooks/useTodos.ts:18-35` - Filtered todos and stats

---

### Pattern 5: Stable Callbacks with useCallback

**Description:** Use useCallback to maintain stable function references across re-renders.

**Benefits:**
- Prevents unnecessary child re-renders
- Stable references for useEffect dependencies
- Better performance

**Implementation Template:**

```typescript
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);

  // Stable reference - only recreated if todos.length changes
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

  // Stable reference - never recreated
  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  return { todos, addTodo, deleteTodo };
}
```

**Files Using This Pattern:**
- `hooks/useAuth.tsx:58-101` - login, signup, logout
- `hooks/useTodos.ts:38-97` - All CRUD operations
- `hooks/useChat.ts:12-48` - sendMessage, clearChat

---

## 3. Form Patterns

### Pattern 6: Controlled Form Components

**Description:** Build forms with controlled components and validation.

**Benefits:**
- Real-time validation
- Controlled state
- Easy error handling

**Implementation Template:**

```typescript
export function LoginForm({ onSuccess, onSwitchToSignup }: LoginFormProps) {
  const { login, error, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setIsLoading(true);

    try {
      await login(credentials);
      onSuccess?.();
    } catch {
      // Error handled by useAuth
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = credentials.email.includes('@') && credentials.password.length >= 6;

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} />}
      <Input
        label="Email"
        type="email"
        value={credentials.email}
        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
        required
      />
      <Button type="submit" disabled={isLoading || !isValid}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
```

**Files Using This Pattern:**
- `components/auth/LoginForm.tsx` - Login form
- `components/auth/SignupForm.tsx` - Signup form with password confirmation
- `components/todos/TodoForm.tsx` - Todo creation/editing form
- `components/chat/ChatInput.tsx` - Chat input form

---

### Pattern 7: Modal Form Pattern

**Description:** Wrap forms in modals with proper state management.

**Benefits:**
- Clean UX
- Focus management
- Escape to close

**Implementation Template:**

```typescript
export function TodoForm({ isOpen, onClose, onSubmit, editTodo }: TodoFormProps) {
  const [title, setTitle] = useState(editTodo?.title || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({ title: title.trim() });
    setTitle('');
    onClose();
  };

  // Reset form when isOpen changes to false
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editTodo ? 'Edit Todo' : 'New Todo'}>
      <form onSubmit={handleSubmit}>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Button type="submit">Submit</Button>
      </form>
    </Modal>
  );
}
```

**Files Using This Pattern:**
- `components/todos/TodoForm.tsx` - Todo creation/editing modal

---

## 4. UI Component Patterns

### Pattern 8: Polymorphic Component Props

**Description:** Extend native HTML element props for better TypeScript integration.

**Benefits:**
- Full HTML element support
- Better type safety
- IDE autocomplete

**Implementation Template:**

```typescript
// Extend native button props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props  // Spread remaining props
}: ButtonProps) {
  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}  // Pass through to button element
    >
      {children}
    </button>
  );
}

// Usage supports all native button attributes
<Button
  variant="primary"
  disabled={loading}
  onClick={handleClick}
  aria-label="Submit"
  type="submit"
>
  Submit
</Button>
```

**Files Using This Pattern:**
- `components/ui/Button.tsx` - Button component
- `components/ui/Input.tsx` - Input component
- `components/ui/TextArea.tsx` - TextArea component
- `components/ui/Select.tsx` - Select component

---

### Pattern 9: Variant-Based Styling

**Description:** Use configuration objects for component variants.

**Benefits:**
- Consistent styling
- Easy to add variants
- Type-safe variants

**Implementation Template:**

```typescript
// Define variant configurations
const priorityConfig = {
  high: {
    label: 'High',
    className: 'bg-red-100 text-red-700',
  },
  medium: {
    label: 'Medium',
    className: 'bg-amber-100 text-amber-700',
  },
  low: {
    label: 'Low',
    className: 'bg-green-100 text-green-700',
  },
};

// Use in component
export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = priorityConfig[priority];

  return (
    <span className={cn('px-2 py-1 rounded', config.className)}>
      {config.label}
    </span>
  );
}
```

**Files Using This Pattern:**
- `components/ui/Button.tsx` - Button variants
- `components/todos/PriorityBadge.tsx` - Priority variants

---

### Pattern 10: Conditional Class Names

**Description:** Use clsx with custom wrapper for conditional classes.

**Benefits:**
- Clean conditional logic
- No trailing spaces
- Easy to read

**Implementation Template:**

```typescript
import { type ClassValue, clsx } from 'clsx';

// Wrapper function
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Usage
<div className={cn(
  'base-styles',
  isActive && 'active-styles',
  hasError && 'error-styles',
  customClassName
)} />

// Result: "base-styles active-styles customClassName"
```

**Files Using This Pattern:**
- `lib/utils.ts:4-6` - cn utility function
- Used throughout all components

---

## 5. Data Patterns

### Pattern 11: Immutable State Updates

**Description:** Always create new objects/arrays when updating state.

**Benefits:**
- Predictable state changes
- React detects changes correctly
- Easier to debug

**Implementation Template:**

```typescript
// ❌ BAD: Mutation
const updateTodo = (id: string, updates: Partial<Todo>) => {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.title = updates.title; // Mutation!
  }
};

// ✅ GOOD: Immutable update
const updateTodo = useCallback((id: string, updates: Partial<Todo>) => {
  setTodos((prev) =>
    prev.map((todo) =>
      todo.id === id
        ? { ...todo, ...updates, updatedAt: new Date() }  // New object
        : todo
    )
  );
}, []);

// ✅ GOOD: Add to array
const addTodo = useCallback((todo: Todo) => {
  setTodos((prev) => [...prev, todo]);  // New array
}, []);

// ✅ GOOD: Remove from array
const deleteTodo = useCallback((id: string) => {
  setTodos((prev) => prev.filter((todo) => todo.id !== id));  // New array
}, []);
```

**Files Using This Pattern:**
- `hooks/useTodos.ts:49-71` - All todo state updates
- `hooks/useAuth.tsx:58-101` - Auth state updates

---

### Pattern 12: Centralized Type Definitions

**Description:** Keep all types in dedicated files, not in components.

**Benefits:**
- Single source of truth
- Reusable across app
- Better IDE support

**Implementation Template:**

```typescript
// lib/types.ts
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  // ...
}

export type Priority = 'high' | 'medium' | 'low';

export interface TodoFilter {
  status: TodoStatus;
  category: string;
  priority: Priority | 'all';
}

// Use in components
import { Todo, Priority } from '@/lib/types';

export function TodoCard({ todo }: { todo: Todo }) {
  // Full type safety
}
```

**Files Using This Pattern:**
- `lib/types.ts` - Domain types
- `lib/auth-types.ts` - Auth types

---

## 6. Utility Patterns

### Pattern 13: Date Formatting Utilities

**Description:** Create human-readable date formats.

**Implementation:**

```typescript
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

// Examples:
// Today -> "Today"
// Tomorrow -> "Tomorrow"
// Yesterday -> "Yesterday"
// 3 days ago -> "3 days ago"
// In 5 days -> "In 5 days"
// Jan 15 -> "Jan 15"
```

**Files Using This Pattern:**
- `lib/utils.ts:9-26` - formatDate function

---

### Pattern 14: ID Generation

**Description:** Generate unique IDs for entities.

**Implementation:**

```typescript
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Example output: "1737489200000-abc123xyz"
```

**Files Using This Pattern:**
- `lib/utils.ts:49-51` - generateId function

---

### Pattern 15: Safe Array Sorting

**Description:** Sort arrays with consistent comparison logic.

**Implementation:**

```typescript
export function sortTodos<T extends { priority: string; order: number }>(todos: T[]): T[] {
  const priorityWeight = { high: 3, medium: 2, low: 1 };

  return [...todos].sort((a, b) => {
    // First by priority (high first)
    if (priorityWeight[b.priority as keyof typeof priorityWeight] !==
        priorityWeight[a.priority as keyof typeof priorityWeight]) {
      return priorityWeight[b.priority as keyof typeof priorityWeight] -
             priorityWeight[a.priority as keyof typeof priorityWeight];
    }
    // Then by order (low first)
    return a.order - b.order;
  });
}
```

**Files Using This Pattern:**
- `lib/utils.ts:60-71` - sortTodos function

---

## 7. Authentication Patterns

### Pattern 16: Session Persistence

**Description:** Store auth tokens in localStorage for session persistence.

**Implementation:**

```typescript
// On login
const login = async (credentials: LoginCredentials) => {
  const response = await authApi.login(credentials);
  setUser(response.user);
  setStatus('authenticated');

  // Store session
  localStorage.setItem('auth_token', response.token);
  localStorage.setItem('user', JSON.stringify(response.user));
};

// On mount - restore session
useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const currentUser = await authApi.getCurrentUser(token);
      if (currentUser) {
        setUser(currentUser);
        setStatus('authenticated');
      }
    }
  };
  checkAuth();
}, []);

// On logout
const logout = async () => {
  await authApi.logout();
  setUser(null);
  setStatus('unauthenticated');

  // Clear session
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};
```

**Files Using This Pattern:**
- `hooks/useAuth.tsx:34-97` - Session management

---

### Pattern 17: Protected Routes

**Description:** Conditionally render based on auth status.

**Implementation:**

```typescript
export default function Home() {
  const { status } = useAuth();

  // Show loading spinner
  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  // Show auth page if not authenticated
  if (status === 'unauthenticated') {
    return <AuthPage />;
  }

  // Show main app if authenticated
  return (
    <div>
      <AppHeader />
      <MainContent />
    </div>
  );
}
```

**Files Using This Pattern:**
- `app/page.tsx:17-31` - Auth check

---

## 8. Mock Data Patterns

### Pattern 18: Realistic Mock Data

**Description:** Create realistic sample data for development.

**Implementation:**

```typescript
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
  // Include variety:
  // - Different priorities
  // - Different categories
  // - Past, present, future dates
  // - Completed and incomplete
  // - With and without descriptions
];
```

**Files Using This Pattern:**
- `lib/mock-data.ts` - Mock todos, categories, chat messages

---

## 9. Error Handling Patterns

### Pattern 19: Async Error Handling

**Description:** Consistent error handling in async operations.

**Implementation:**

```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  clearError();
  setIsLoading(true);

  try {
    await login(credentials);
    onSuccess?.();
  } catch {
    // Error handled by hook, just show loading state
  } finally {
    setIsLoading(false);
  }
};

// Display error from hook
{error && (
  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
    <p className="text-sm text-red-600">{error}</p>
  </div>
)}
```

**Files Using This Pattern:**
- `components/auth/LoginForm.tsx:23-36` - Login error handling
- `components/auth/SignupForm.tsx:25-38` - Signup error handling

---

## 10. Performance Patterns

### Pattern 20: Lazy Component Initialization

**Description:** Initialize complex state only when needed.

**Implementation:**

```typescript
// Instead of initializing with complex data
const [editTodo, setEditTodo] = useState<Todo | null>(null);

// Initialize with null, set when needed
const handleEdit = (todo: Todo) => {
  setEditTodo(todo);
  setIsFormOpen(true);
};
```

**Files Using This Pattern:**
- `components/todos/TodoDashboard.tsx:30` - Edit todo state

---

## 11. CSS Patterns

### Pattern 21: CSS Custom Properties for Theming

**Description:** Use CSS variables for design tokens.

**Implementation:**

```css
:root {
  /* Semantic colors */
  --background: #f8fafc;
  --foreground: #0f172a;
  --card-bg: #ffffff;

  /* Priority colors */
  --priority-high: #ef4444;
  --priority-medium: #f59e0b;
  --priority-low: #22c55e;

  /* Category colors */
  --category-work: #3b82f6;
  --category-personal: #8b5cf6;
}

/* Use in Tailwind */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
```

**Files Using This Pattern:**
- `app/globals.css:3-53` - CSS custom properties

---

### Pattern 22: Responsive Grid Layouts

**Description:** Use Tailwind's responsive grid classes.

**Implementation:**

```typescript
// Stats grid: 2 -> 3 -> 6 columns
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
  {stats.map(stat => <StatCard key={stat.label} {...stat} />)}
</div>

// Todo grid: 1 -> 2 -> 3 columns
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
  {todos.map(todo => <TodoCard key={todo.id} {...todo} />)}
</div>
```

**Files Using This Pattern:**
- `components/todos/TodoStats.tsx:32` - Stats responsive grid
- `components/todos/TodoList.tsx:32` - Todo responsive grid

---

## 12. Testing Patterns (To Be Implemented)

### Pattern 23: Hook Testing Template

**Description:** Test custom hooks with React Testing Library.

**Implementation Template:**

```typescript
import { renderHook, act } from '@testing-library/react';
import { useTodos } from '@/hooks/useTodos';

describe('useTodos', () => {
  it('should add todo', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo({
        title: 'Test',
        completed: false,
        priority: 'high',
        category: 'Work',
      });
    });

    expect(result.current.todos).toHaveLength(11); // 10 initial + 1 new
  });
});
```

---

## 13. File Structure Patterns

### Pattern 24: Feature-Based Organization

**Description:** Group files by feature, not by type.

**Structure:**

```
components/
├── auth/              # Authentication feature
│   ├── AuthPage.tsx
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   └── AuthProvider.tsx
├── todos/             # Todo feature
│   ├── TodoDashboard.tsx
│   ├── TodoForm.tsx
│   ├── TodoList.tsx
│   ├── TodoCard.tsx
│   ├── TodoFilters.tsx
│   ├── TodoStats.tsx
│   ├── PriorityBadge.tsx
│   └── CategoryBadge.tsx
├── chat/              # Chat feature
│   ├── ChatInterface.tsx
│   ├── ChatHeader.tsx
│   ├── ChatMessageList.tsx
│   ├── ChatMessage.tsx
│   └── ChatInput.tsx
├── layout/            # Layout components
│   ├── AppHeader.tsx
│   ├── TabNavigation.tsx
│   └── Header.tsx
└── ui/                # Reusable UI components
    ├── Button.tsx
    ├── Input.tsx
    ├── TextArea.tsx
    ├── Select.tsx
    ├── Card.tsx
    ├── Modal.tsx
    └── Badge.tsx
```

---

## 14. Code Quality Patterns

### Pattern 25: TypeScript Strict Mode

**Configuration:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

**Benefits:**
- Catch more errors at compile time
- Safer code
- Better refactoring

---

### Pattern 26: ESLint Configuration

**Configuration:**

```javascript
// eslint.config.mjs
import { FlatCompat } from '@eslint/eslintrc';

export = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
  }),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
```

---

## 15. Next.js Specific Patterns

### Pattern 27: Client Component Directive

**Description:** Use 'use client' for interactive components.

```typescript
'use client';

import { useState } from 'react';

export function InteractiveComponent() {
  const [state, setState] = useState();
  // Interactive logic
}
```

**When to Use:**
- Components with event handlers
- Components using hooks (useState, useEffect, etc.)
- Components using browser APIs

**Files Using This Pattern:**
- All components in `components/` directory
- `app/page.tsx` - Main page component

---

### Pattern 28: Font Optimization

**Description:** Use next/font for optimized font loading.

```typescript
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

**Files Using This Pattern:**
- `app/layout.tsx:6-14` - Font configuration

---

## Summary of Reusable Patterns

| Pattern | Category | Files | Complexity |
|---------|----------|-------|------------|
| Component-Based with Hooks | Architecture | 4 hooks | Medium |
| React Context | State Management | 2 files | Medium |
| Compound Components | UI | 1 file | Low |
| useMemo | Performance | 1 file | Low |
| useCallback | Performance | 4 files | Low |
| Controlled Forms | Forms | 4 files | Medium |
| Modal Forms | UX | 1 file | Medium |
| Polymorphic Props | TypeScript | 4 files | Medium |
| Variant Styling | UI | 2 files | Low |
| Conditional Classes | Styling | All files | Low |
| Immutable Updates | State | 2 files | Medium |
| Centralized Types | Types | 2 files | Low |
| Date Utilities | Utils | 1 file | Low |
| ID Generation | Utils | 1 file | Low |
| Session Persistence | Auth | 1 file | Medium |
| Protected Routes | Auth | 1 file | Low |
| Mock Data | Testing | 1 file | Low |
| Async Errors | Error Handling | 2 files | Low |
| CSS Variables | Styling | 1 file | Low |
| Feature Organization | Structure | All | Low |
| TypeScript Strict | Quality | 1 file | Low |
| Client Directive | Next.js | All files | Low |

---

## Applying These Patterns to New Projects

### Quick Start Checklist

1. **Setup Phase**
   - [ ] Initialize Next.js with TypeScript
   - [ ] Configure Tailwind CSS v4
   - [ ] Enable strict mode
   - [ ] Create folder structure
   - [ ] Setup ESLint

2. **Foundation Phase**
   - [ ] Create type definitions (`lib/types.ts`)
   - [ ] Create utility functions (`lib/utils.ts`)
   - [ ] Create mock data (`lib/mock-data.ts`)
   - [ ] Setup global styles with CSS variables

3. **Component Phase**
   - [ ] Build UI component library (Button, Input, Card, Modal)
   - [ ] Create custom hooks for state
   - [ ] Build feature components
   - [ ] Integrate with app layout

4. **Refinement Phase**
   - [ ] Add useMemo for expensive computations
   - [ ] Add useCallback for stable references
   - [ ] Optimize re-renders
   - [ ] Test responsive layouts

---

**End of Reusable Patterns and Intelligence**
