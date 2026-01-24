# TodoApp - Implementation Plan

**Version:** 1.0.0
**Status:** Reverse Engineered
**Date:** 2026-01-21
**Architect:** Claude (Reverse Engineering Analysis)

---

## Executive Summary

This document outlines the architecture and implementation strategy for TodoApp, a Next.js 16.1 + React 19 task management application. The application follows a client-side rendering pattern with mock data, designed for eventual integration with a FastAPI backend.

**Architecture Pattern:** Component-Based Architecture with Custom Hooks for State Management

**Key Architectural Decisions:**
1. **Next.js App Router** for routing and layout
2. **Client Components** with 'use client' directive for interactivity
3. **React Context API** for authentication state
4. **Custom Hooks** for domain-specific state (todos, chat, tabs)
5. **Tailwind CSS v4** for styling with CSS custom properties
6. **TypeScript** with strict mode for type safety

---

## 1. Scope and Dependencies

### 1.1 In Scope
- User authentication (login/signup) with mock backend
- Todo CRUD operations with client-side state
- Filtering, sorting, and searching todos
- Statistics dashboard
- AI chat interface (placeholder)
- Responsive design (mobile/tablet/desktop)
- Modal forms for todo creation/editing

### 1.2 Out of Scope
- Real backend integration (planned)
- Database persistence
- Real-time collaboration
- File attachments
- Calendar views
- Email notifications
- Offline mode
- Multi-language support

### 1.3 External Dependencies
- **Next.js 16.1.4:** React framework with App Router
- **React 19.2.3:** UI library
- **TypeScript 5:** Type safety
- **Tailwind CSS v4:** Utility-first CSS
- **clsx 2.1.1:** Conditional class names

### 1.4 Planned Backend (Future)
- **FastAPI:** Python REST API
- **PostgreSQL:** Database
- **OpenAI/Anthropic:** AI chat integration

---

## 2. Architecture Decisions and Rationale

### 2.1 Next.js App Router

**Decision:** Use Next.js 16 App Router over Pages Router

**Rationale:**
- Improved file-based routing with layouts
- Built-in loading and error states
- Server and client component separation
- Streaming and Suspense support
- Better TypeScript integration

**Trade-offs:**
- More learning curve than Pages Router
- Requires 'use client' directive for interactive components
- Newer ecosystem (fewer examples)

**Alternatives Considered:**
- **Pages Router:** Rejected due to inferior DX and features
- **Vite + React Router:** Rejected due to lack of SSR support
- **Remix:** Rejected due to team familiarity with Next.js

**File Structure:**
```
app/
├── layout.tsx          # Root layout with fonts and AuthProvider
├── page.tsx            # Main app page with auth check and tab routing
└── globals.css         # Global styles with CSS custom properties
```

### 2.2 Client-Side Rendering

**Decision:** All interactive components are Client Components

**Rationale:**
- Real-time user interactions (forms, filters, chat)
- Immediate feedback without server round-trips
- Simplified state management with React hooks
- Progressive enhancement from server components

**Implementation:**
```typescript
'use client'; // Required for all interactive components

import { useState } from 'react';
export function MyComponent() {
  const [state, setState] = useState();
  // Interactive logic
}
```

**Trade-offs:**
- No SEO benefit for dynamic content
- Initial JavaScript bundle size
- Requires client-side hydration

### 2.3 State Management Strategy

**Decision:** Custom React Hooks + Context API (no external state library)

**Rationale:**
- Simplicity for application size
- No additional dependencies
- Co-located state with business logic
- TypeScript-first approach

**Alternatives Considered:**
- **Redux Toolkit:** Rejected (overkill for this scope)
- **Zustand:** Rejected (adds dependency)
- **Jotai:** Rejected (team less familiar)
- **React Query:** Rejected (no real backend yet)

**State Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                        Application State                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Context    │  │   Hooks      │  │   Local      │     │
│  │              │  │              │  │   State      │     │
│  │  useAuth     │  │  useTodos    │  │  Component   │     │
│  │  (Auth       │  │  (Todos      │  │  useState    │     │
│  │   Provider)  │  │   CRUD)      │  │              │     │
│  └──────────────┘  │  useChat     │  └──────────────┘     │
│                    │  (Chat)       │                       │
│                    │  useTabs     │                       │
│                    │  (Navigation)│                       │
│                    └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

### 2.4 Authentication Flow

**Decision:** Context API with localStorage persistence

**Rationale:**
- Simple implementation for demo purposes
- Session persistence across refreshes
- Easy to replace with real auth later

**Implementation Details:**

**File:** `hooks/useAuth.tsx`
```typescript
interface AuthContextType {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  login: (credentials) => Promise<void>;
  signup: (credentials) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}
```

**Flow:**
1. Check localStorage for token on mount
2. If token exists, validate and set user
3. Provide auth methods to all children
4. Store token and user in localStorage on login
5. Clear localStorage on logout

**Security Note:** This is demo-only. Production should use:
- httpOnly cookies
- CSRF tokens
- Secure backend validation
- JWT with short expiration

### 2.5 Styling System

**Decision:** Tailwind CSS v4 with CSS custom properties

**Rationale:**
- Utility-first approach for rapid development
- Consistent design system
- CSS custom properties for theming
- No runtime CSS-in-JS overhead
- Excellent TypeScript support

**Theme Architecture:**

**File:** `app/globals.css:3-53`
```css
:root {
  /* Semantic color tokens */
  --background: #f8fafc;
  --foreground: #0f172a;
  --card-bg: #ffffff;
  --text-primary: #0f172a;
  --text-secondary: #64748b;

  /* Priority colors */
  --priority-high: #ef4444;
  --priority-medium: #f59e0b;
  --priority-low: #22c55e;

  /* Category colors */
  --category-work: #3b82f6;
  --category-personal: #8b5cf6;
  /* ... etc */
}
```

**Design System:**
- **Primary Color:** Indigo (#6366f1)
- **Font:** Geist Sans (variable font)
- **Border Radius:** 0.5rem (lg), 0.75rem (xl), 1rem (2xl)
- **Spacing:** Tailwind's 4px base unit
- **Shadows:** Tailwind's shadow-sm, shadow-md, shadow-xl

**Component Styling Pattern:**
```typescript
className={cn(
  'base-styles',
  variant && 'variant-styles',
  condition && 'conditional-styles',
  className
)}
```

### 2.6 Type System

**Decision:** Centralized type definitions with TypeScript strict mode

**Rationale:**
- Single source of truth for types
- Reusable across components and hooks
- Better IDE support and autocomplete
- Catch errors at compile time

**File Structure:**
```
lib/
├── auth-types.ts    # Auth-related types
└── types.ts         # Domain types (Todo, Category, Chat)
```

**Key Types:**
```typescript
// Todo domain
interface Todo {
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

// Filter system
interface TodoFilter {
  status: TodoStatus;
  category: string;
  priority: Priority | 'all';
  searchQuery: string;
}
```

---

## 3. Component Architecture

### 3.1 Component Hierarchy

```
app/
└── page.tsx (Root)
    │
    ├── AuthProvider (Context)
    │
    ├── AppHeader (Conditional: authenticated)
    │
    ├── TabNavigation
    │   ├── Tab: Todos
    │   └── Tab: AI Assistant
    │
    └── Main Content (Switch)
        ├── TodoDashboard
        │   ├── Header
        │   ├── Button (New Todo)
        │   ├── TodoStats
        │   │   └── StatCard × 6
        │   ├── TodoFilters
        │   │   ├── Input (Search)
        │   │   ├── Select × 3 (Filters)
        │   │   └── Button (Clear)
        │   ├── TodoList
        │   │   └── TodoCard × N
        │   │       ├── Checkbox
        │   │       ├── Content
        │   │       ├── PriorityBadge
        │   │       ├── CategoryBadge
        │   │       └── Actions (Edit/Delete)
        │   └── TodoForm (Modal)
        │
        └── ChatInterface
            ├── Header
            ├── ChatHeader
            ├── ChatMessageList
            │   └── ChatMessage × N
            └── ChatInput
```

### 3.2 Component Patterns

**Pattern 1: Compound Components**

Used for Card, Modal, and form components:

```typescript
// Card compound component
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Body</CardContent>
  <CardFooter>Actions</CardFooter>
</Card>
```

**Pattern 2: Controller Components**

Components that manage their own state:

```typescript
export function TodoForm({ isOpen, onClose, onSubmit, editTodo }) {
  const [title, setTitle] = useState(editTodo?.title || '');
  const [description, setDescription] = useState(/* ... */);
  // Local state management
  // Form validation
  // Submit handling
}
```

**Pattern 3: Presentational Components**

Pure UI components with no logic:

```typescript
export function PriorityBadge({ priority, className }) {
  const config = priorityConfig[priority];
  return (
    <span className={cn(config.className, className)}>
      {config.label}
    </span>
  );
}
```

**Pattern 4: Container/Presenter**

Dashboard components orchestrate hooks and pass to presenters:

```typescript
export function TodoDashboard() {
  const {
    filteredTodos,
    filter,
    stats,
    addTodo,
    // ... from useTodos hook
  } = useTodos();

  return (
    <>
      <TodoStats stats={stats} />
      <TodoList todos={filteredTodos} />
    </>
  );
}
```

### 3.3 Custom Hooks Architecture

**Hook: useAuth** (`hooks/useAuth.tsx`)

**Responsibility:** Authentication state and operations

**State:**
- user: User | null
- status: 'loading' | 'authenticated' | 'unauthenticated'
- error: string | null

**Operations:**
- login(credentials)
- signup(credentials)
- logout()
- clearError()

**Lifecycle:**
1. On mount: Check localStorage for token
2. Validate token and restore session
3. Provide auth context to children

**Hook: useTodos** (`hooks/useTodos.ts`)

**Responsibility:** Todo CRUD and filtering

**State:**
- todos: Todo[]
- filter: TodoFilter

**Computed:**
- filteredTodos (useMemo)
- stats (useMemo)

**Operations:**
- addTodo(data)
- updateTodo(id, updates)
- deleteTodo(id)
- toggleComplete(id)
- setStatusFilter(status)
- setCategoryFilter(category)
- setPriorityFilter(priority)
- setSearchQuery(query)
- clearFilters()

**Hook: useChat** (`hooks/useChat.ts`)

**Responsibility:** Chat interface state

**State:**
- messages: ChatMessage[]
- isLoading: boolean

**Operations:**
- sendMessage(content)
- clearChat()

**Hook: useTabs** (`hooks/useTabs.ts`)

**Responsibility:** Tab navigation state

**State:**
- activeTab: TabId

**Operations:**
- setTab(tab)

---

## 4. Data Flow

### 4.1 Authentication Flow

```
User Action → LoginForm.handleSubmit()
    ↓
useAuth.login(credentials)
    ↓
authApi.login(credentials) [Mock]
    ↓
Set state: user, status = 'authenticated'
    ↓
localStorage.setItem('auth_token', token)
    ↓
Re-render with authenticated UI
```

### 4.2 Todo Creation Flow

```
User clicks "New Todo"
    ↓
TodoForm opens (isOpen = true)
    ↓
User fills form → handleSubmit()
    ↓
TodoDashboard.handleSubmit()
    ↓
useTodos.addTodo(data)
    ↓
Create new Todo with generateId()
    ↓
setTodos([...prev, newTodo])
    ↓
useMemo recomputes filteredTodos, stats
    ↓
TodoList re-renders with new todo
```

### 4.3 Filtering Flow

```
User changes filter in TodoFilters
    ↓
onStatusChange('active')
    ↓
useTodos.setStatusFilter('active')
    ↓
setFilter({ ...prev, status: 'active' })
    ↓
useMemo recomputes filteredTodos
    ↓
filterTodos(todos, filter)
    ↓
TodoList re-renders with filtered results
```

### 4.4 Chat Flow

```
User types message → handleSubmit()
    ↓
useChat.sendMessage(content)
    ↓
Add user message to state
    ↓
setIsLoading(true)
    ↓
setTimeout(1000ms) [Mock API delay]
    ↓
Add assistant response to state
    ↓
setIsLoading(false)
    ↓
ChatMessageList auto-scrolls to bottom
```

---

## 5. Non-Functional Requirements

### 5.1 Performance

**Bundles:**
- Main bundle: React + Next.js runtime
- Component chunking: Automatic with App Router
- Font optimization: next/font with variable fonts

**Optimizations:**
- useMemo for expensive computations (filtering, stats)
- useCallback for stable function references
- Lazy loading not implemented (all client components)

**Metrics:**
- Target: First Contentful Paint < 1.5s
- Target: Time to Interactive < 3s
- Target: Cumulative Layout Shift < 0.1

### 5.2 Accessibility

**Implementations:**
- Semantic HTML (button, nav, main, header, footer)
- ARIA labels on interactive elements
- Keyboard navigation (Tab, Enter, Escape)
- Focus management in modals
- Color contrast (WCAG AA compliance)

**Gaps:**
- Skip links not implemented
- Screen reader testing not done
- Focus indicators could be stronger

### 5.3 Security

**Current (Demo):**
- Password stored in localStorage (insecure)
- No token validation
- No CSRF protection
- No input sanitization against XSS

**Required for Production:**
- httpOnly cookies for tokens
- CSRF tokens on forms
- Input sanitization (DOMPurify)
- Content Security Policy
- HTTPS enforcement
- Proper password hashing (bcrypt)

### 5.4 Reliability

**Error Handling:**
- Try-catch in async operations
- Error display in forms
- Fallback UI for loading states

**Gaps:**
- No error boundary components
- No retry logic for API calls
- No offline handling

---

## 6. API Integration Strategy

### 6.1 Current (Mock)

**File:** `lib/api-client.ts`

**Structure:**
```typescript
export const todoApi = {
  async getAll() { /* returns Promise.resolve([]) */ },
  async create(todo) { /* returns Promise.resolve({}) */ },
  async update(id, updates) { /* returns Promise.resolve({}) */ },
  async delete(id) { /* returns Promise.resolve({}) */ },
};

export const chatApi = {
  async sendMessage(request) {
    return Promise.resolve({
      response: 'Placeholder...',
      session_id: 'mock-session'
    });
  },
};
```

### 6.2 Planned (FastAPI)

**Expected Endpoints:**

**Authentication:**
```
POST   /api/auth/login
POST   /api/auth/signup
POST   /api/auth/logout
GET    /api/auth/me
```

**Todos:**
```
GET    /api/todos          # List all todos
POST   /api/todos          # Create todo
GET    /api/todos/{id}     # Get single todo
PATCH  /api/todos/{id}     # Update todo
DELETE /api/todos/{id}     # Delete todo
```

**Chat:**
```
POST   /api/chat           # Send message
GET    /api/chat/history/{session_id}  # Get history
DELETE /api/chat/history/{session_id}  # Clear history
```

**Integration Plan:**
1. Replace mock implementations with fetch calls
2. Add error handling and retry logic
3. Implement loading states
4. Add request/response interceptors
5. Implement token refresh logic

---

## 7. Testing Strategy

### 7.1 Current State
**No tests implemented**

### 7.2 Recommended Testing

**Unit Tests:**
- Utility functions (`lib/utils.ts`)
- Custom hooks (useAuth, useTodos, useChat, useTabs)
- Individual components (Button, Input, Badge, etc.)

**Integration Tests:**
- Authentication flow
- Todo CRUD operations
- Filtering and search
- Chat interface

**E2E Tests:**
- User registration and login
- Create, edit, delete todo
- Filter todos
- Send chat message

**Tools:**
- **Jest + React Testing Library** (unit/integration)
- **Playwright** (E2E)
- **MSW** (API mocking)

---

## 8. Deployment

### 8.1 Build Process

**Commands:**
```bash
npm run build    # Next.js production build
npm start        # Start production server
```

**Output:**
- `.next/` directory with optimized bundles
- Static assets optimized
- Server-side rendering bundle
- Client-side JavaScript chunks

### 8.2 Hosting Options

**Recommended:**
1. **Vercel** (Native Next.js support)
2. **Netlify** (Next.js support)
3. **AWS Amplify** (Next.js support)

**Docker (Self-hosted):**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 8.3 Environment Variables

**Required:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Future:**
```env
NEXT_PUBLIC_API_URL=https://api.todoapp.com
NEXT_PUBLIC_AUTH_URL=https://auth.todoapp.com
```

---

## 9. Risk Analysis

### 9.1 Top Risks

**Risk 1: No Data Persistence**
- **Impact:** High - All data lost on refresh
- **Mitigation:** Implement backend integration
- **Timeline:** Phase 2

**Risk 2: Insecure Authentication**
- **Impact:** Critical - Security vulnerability
- **Mitigation:** Implement proper JWT/OAuth
- **Timeline:** Before production

**Risk 3: No Backend Connectivity**
- **Impact:** High - Limited functionality
- **Mitigation:** Complete FastAPI integration
- **Timeline:** Phase 2

**Risk 4: No Testing**
- **Impact:** Medium - Regression risk
- **Mitigation:** Add test coverage
- **Timeline:** Continuous

**Risk 5: Mobile Responsiveness**
- **Impact:** Low - Mostly responsive
- **Mitigation:** Test on real devices
- **Timeline:** Before production

### 9.2 Mitigation Strategies

1. **Feature Flags:** Roll out backend integration gradually
2. **Data Migration:** Export/import for local data
3. **Error Boundaries:** Prevent app crashes
4. **Monitoring:** Add error tracking (Sentry)
5. **Analytics:** Track user behavior

---

## 10. Development Roadmap

### Phase 1: Foundation (Complete)
- [x] Next.js setup
- [x] Component library
- [x] Authentication flow (mock)
- [x] Todo CRUD (mock)
- [x] Filtering and search
- [x] Statistics dashboard
- [x] Chat interface (placeholder)

### Phase 2: Backend Integration (Planned)
- [ ] FastAPI project setup
- [ ] PostgreSQL schema design
- [ ] Auth endpoints (JWT)
- [ ] Todo CRUD endpoints
- [ ] Chat AI integration
- [ ] Replace mock APIs with real calls
- [ ] Error handling and retry logic

### Phase 3: Enhancement (Considered)
- [ ] Add test coverage
- [ ] Implement undo/redo
- [ ] Add drag-and-drop reordering
- [ ] Implement file attachments
- [ ] Add calendar view
- [ ] Email notifications
- [ ] Dark mode toggle
- [ ] PWA support

### Phase 4: Scale (Future)
- [ ] Real-time collaboration
- [ ] Team workspaces
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)

---

## 11. Evaluation and Validation

### 11.1 Definition of Done

**Feature is Done When:**
- [ ] Code review completed
- [ ] TypeScript strict mode passes
- [ ] ESLint passes with no warnings
- [ ] Component renders without errors
- [ ] Responsive on mobile, tablet, desktop
- [ ] Accessibility requirements met
- [ ] Loading states implemented
- [ ] Error handling implemented
- [ ] Documentation updated

**Phase is Done When:**
- [ ] All features in phase complete
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Documentation complete

### 11.2 Success Metrics

**User Engagement:**
- Daily Active Users (DAU)
- Todo creation rate
- Completion rate
- Feature usage distribution

**Technical:**
- Page load time < 2s
- Time to Interactive < 3s
- Error rate < 1%
- Uptime > 99.9%

**Quality:**
- Test coverage > 80%
- TypeScript strict mode 100%
- Zero critical security vulnerabilities
- Accessibility score > 90

---

## 12. Architectural Decision Records

### ADR-001: Next.js App Router
**Status:** Accepted
**Context:** Need modern React framework with SSR
**Decision:** Use Next.js 16 App Router
**Consequences:** Better DX, improved features, learning curve

### ADR-002: Client-Side State Management
**Status:** Accepted
**Context:** Need state management without heavy libraries
**Decision:** Custom hooks + Context API
**Consequences:** Simpler code, no Redux, good for current scale

### ADR-003: Tailwind CSS v4
**Status:** Accepted
**Context:** Need utility-first CSS framework
**Decision:** Use Tailwind CSS v4 with CSS custom properties
**Consequences:** Faster development, consistent design, larger HTML

### ADR-004: Mock Authentication
**Status:** Accepted (Temporary)
**Context:** Need auth flow before backend is ready
**Decision:** Implement mock auth with localStorage
**Consequences:** Insecure, must replace before production

### ADR-005: TypeScript Strict Mode
**Status:** Accepted
**Context:** Need type safety and better DX
**Decision:** Enable TypeScript strict mode
**Consequences:** More boilerplate, fewer runtime errors

---

**End of Implementation Plan**
