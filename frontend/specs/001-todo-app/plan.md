# Implementation Plan: TodoApp - Professional Task Manager with AI Assistant

**Branch**: `001-todo-app`
**Date**: 2026-01-21
**Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/sp.specify`

---

## Summary

Build a professional, web-based task management application with user authentication, CRUD operations for todos, and a tabbed interface including an AI chat placeholder. The frontend is designed for integration with an existing FastAPI backend.

**Primary Requirements**:
- User authentication (signup/login/logout)
- Task CRUD operations (create, read, update, delete, toggle status)
- Task filtering and search
- Statistics dashboard
- AI chat interface (placeholder)
- Responsive design (mobile, tablet, desktop)
- Light theme with slate color palette

**Technical Approach**: Next.js 16.1 with App Router, React 19, TypeScript 5, Tailwind CSS v4, using React hooks for state management and mock data for standalone development.

---

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)

**Primary Dependencies**:
- Next.js 16.1.4 (App Router, Server/Client Components)
- React 19.2.3 (UI library)
- Tailwind CSS v4 (styling with CSS variables)

**Storage**:
- Development: In-memory state with mock data (lib/mock-data.ts)
- Production: FastAPI backend at `http://localhost:8000` (user-provided)
- Session: localStorage for auth tokens

**Testing**:
- Phase 1: Manual testing (current)
- Phase 2: React Testing Library + Jest (planned)
- Phase 3: Playwright E2E (planned)

**Target Platform**: Web application (browsers: Chrome 120+, Firefox 120+, Safari 16+, Edge 120+)

**Project Type**: Single web application (frontend) with backend API integration

**Performance Goals**:
- Initial JS bundle: < 200 KB gzipped
- First Contentful Paint: < 1.5s (4G mobile)
- Time to Interactive: < 3s (4G mobile)
- Interaction response: < 200ms

**Constraints**:
- Must integrate with existing FastAPI backend
- Backend uses simple Task model (title, description, status)
- Frontend extends with priority, category, due_date (client-side)
- No external state management library (React hooks only)

**Scale/Scope**:
- Single-user sessions per account
- ~26 React components
- 4 custom hooks
- 5 core entities (User, Todo, Category, ChatMessage, ChatSession)
- 6 user stories (3 P1, 2 P2, 1 P3)
- 69 functional requirements

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ⚠️ No active constitution file

The project constitution at `.specify/memory/constitution.md` is a template placeholder. No constitutional constraints to validate against.

**Recommendation**: Establish project principles before future features.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-app/
├── spec.md              # Feature specification
├── plan.md              # This file (implementation plan)
├── research.md          # Technology research & decisions
├── data-model.md        # Entity definitions & relationships
├── quickstart.md        # Developer setup guide
├── contracts/           # API specifications
│   ├── auth-api.yaml    # Authentication endpoints (OpenAPI)
│   ├── todos-api.yaml   # Task CRUD endpoints (OpenAPI)
│   └── chat-api.yaml    # Chat endpoints (OpenAPI - placeholder)
└── checklists/
    └── requirements.md  # Spec validation checklist
```

### Source Code (repository root)

```text
frontend/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with AuthProvider
│   ├── page.tsx             # Main app page (auth check + tab routing)
│   └── globals.css          # Global styles, CSS variables, theme
│
├── components/              # React components
│   ├── layout/              # Layout components
│   │   ├── TabNavigation.tsx   # Tab switcher (Todos | AI Chat)
│   │   ├── AppHeader.tsx       # Header with user info, logout
│   │   └── Footer.tsx          # App footer
│   │
│   ├── auth/                # Authentication components
│   │   ├── AuthProvider.tsx   # Auth context wrapper
│   │   ├── LoginForm.tsx      # Login form
│   │   ├── SignupForm.tsx     # Registration form
│   │   └── AuthPage.tsx       # Auth page (login/signup toggle)
│   │
│   ├── todos/               # Todo feature components
│   │   ├── TodoDashboard.tsx  # Main container (stats + list)
│   │   ├── TodoList.tsx       # Grid of todo cards
│   │   ├── TodoCard.tsx       # Individual todo item
│   │   ├── TodoForm.tsx       # Add/Edit modal form
│   │   ├── TodoFilters.tsx    # Search, filter controls
│   │   ├── CategoryBadge.tsx  # Colored category tag
│   │   ├── PriorityBadge.tsx  # Priority indicator
│   │   └── TodoStats.tsx      # Progress statistics
│   │
│   ├── chat/                # AI chat components
│   │   ├── ChatInterface.tsx  # Main chat container
│   │   ├── ChatMessageList.tsx # Message history
│   │   ├── ChatMessage.tsx    # Individual message
│   │   ├── ChatInput.tsx      # Input field + send button
│   │   └── ChatHeader.tsx     # Chat session header
│   │
│   └── ui/                  # Reusable UI components
│       ├── Button.tsx       # Primary, secondary, ghost variants
│       ├── Input.tsx        # Text input with validation
│       ├── TextArea.tsx     # Multi-line input
│       ├── Select.tsx       # Dropdown select
│       ├── Modal.tsx        # Dialog/overlay
│       ├── Badge.tsx        # Generic badge
│       └── Card.tsx         # Card container with content
│
├── hooks/                   # Custom React hooks
│   ├── useAuth.tsx          # Auth state & operations
│   ├── useTodos.ts          # Todo CRUD & filtering
│   ├── useChat.ts           # Chat state & mock responses
│   └── useTabs.ts           # Tab navigation state
│
├── lib/                     # Utilities & libraries
│   ├── types.ts             # TypeScript interfaces
│   ├── mock-data.ts         # Sample todos, categories, messages
│   ├── mock-auth.ts         # Mock auth service (1s delay)
│   ├── api-client.ts        # API client structure (placeholder)
│   └── utils.ts             # Helper functions (cn, dates, filters)
│
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript configuration
└── next.config.js           # Next.js configuration
```

**Structure Decision**: Single web application structure selected. The project is a frontend-only implementation designed to integrate with an existing FastAPI backend. All components, hooks, and utilities are organized under the `frontend/` directory with clear separation of concerns (layout, features, UI, state, utilities).

---

## Complexity Tracking

> **No violations to report**

This implementation follows standard Next.js patterns with no architectural violations. All design decisions align with the technology stack:

- Standard React hooks (no external state management)
- Native Next.js routing (App Router)
- Built-in CSS variables (Tailwind v4)
- TypeScript strict mode
- Component composition over inheritance

**No complexity justification required.**

---

## Implementation Phases

### Phase 0: Research & Technology Selection ✅

**Status**: Complete

**Deliverables**:
- [x] [research.md](./research.md) - Technology decisions and rationale
- [x] Technology stack finalized: Next.js 16.1, React 19, TypeScript 5, Tailwind CSS v4

**Key Decisions**:
- Next.js 16.1 for App Router and Server Components
- React 19 for latest features and performance
- Tailwind CSS v4 for zero-config styling
- React hooks for state management (no Redux/Zustand needed yet)
- Mock data for development, API client structure ready for backend integration

---

### Phase 1: Design & Architecture ✅

**Status**: Complete

**Deliverables**:
- [x] [data-model.md](./data-model.md) - Entity definitions, relationships, validation
- [x] [contracts/](./contracts/) - OpenAPI specifications for all endpoints
- [x] [quickstart.md](./quickstart.md) - Developer setup guide

**Data Model**:
- 5 entities: User, Todo, Category, ChatMessage, ChatSession
- Relationships: 1:N (User→Todo, User→ChatSession), N:1 (Todo→Category), 1:N (ChatSession→ChatMessage)
- State transitions: Todo (pending ↔ done via toggle)

**API Contracts**:
- Auth API: POST /register, POST /login, GET /me
- Todos API: GET /tasks, POST /tasks, GET /tasks/{id}, PUT /tasks/{id}, DELETE /tasks/{id}, PATCH /tasks/{id}/toggle
- Chat API: POST /chat, GET /chat/history, DELETE /chat/clear (placeholder for future integration)

---

### Phase 2: Implementation ✅

**Status**: Complete (frontend implementation)

**Deliverables**:
- [x] 26 React components
- [x] 4 custom hooks
- [x] TypeScript types and interfaces
- [x] Mock data and auth services
- [x] Responsive layout (mobile, tablet, desktop)
- [x] Light theme with slate color palette

**Components Implemented**:
- Authentication: AuthProvider, LoginForm, SignupForm, AuthPage
- Layout: TabNavigation, AppHeader, Footer
- Todos: TodoDashboard, TodoList, TodoCard, TodoForm, TodoFilters, CategoryBadge, PriorityBadge, TodoStats
- Chat: ChatInterface, ChatMessageList, ChatMessage, ChatInput, ChatHeader
- UI: Button, Input, TextArea, Select, Modal, Badge, Card

**State Management**:
- `useAuth`: User authentication, login, signup, logout
- `useTodos`: Todo CRUD, filtering, sorting, statistics
- `useChat`: Chat messages, mock responses
- `useTabs`: Tab navigation state

---

### Phase 3: Backend Integration (Pending)

**Status**: Pending - Requires user's FastAPI backend

**Deliverables**:
- [ ] Replace mock auth with real API calls
- [ ] Replace mock todos with real API calls
- [ ] Implement error handling for API failures
- [ ] Add loading states during API calls
- [ ] Test all CRUD operations with real backend

**Migration Steps**:
1. Set `NEXT_PUBLIC_API_URL` environment variable
2. Update `useAuth` to call `/api/auth/login` and `/api/auth/register`
3. Update `useTodos` to call `/api/tasks` endpoints
4. Update `useChat` to call `/api/chat` endpoints (when available)
5. Handle authentication errors (401, 403, 404, 422)
6. Add refresh token logic (if backend supports it)

---

### Phase 4: Testing (Pending)

**Status**: Not started

**Deliverables**:
- [ ] Unit tests with React Testing Library
- [ ] Integration tests for API calls
- [ ] E2E tests with Playwright
- [ ] Manual testing checklist completed

**Test Coverage Goals**:
- Components: 80%+ coverage
- Hooks: 90%+ coverage
- Critical user flows: 100% coverage
- Edge cases: Validated

---

### Phase 5: Documentation (In Progress)

**Status**: In progress

**Deliverables**:
- [x] Feature specification (spec.md)
- [x] Implementation plan (this file)
- [x] Technology research (research.md)
- [x] Data model documentation (data-model.md)
- [x] API contracts (contracts/)
- [x] Developer quick start (quickstart.md)
- [ ] Reverse engineering documentation (docs/reverse-engineered/)

---

## Dependencies and Integration Points

### External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| next | 16.1.4 | React framework |
| react | 19.2.3 | UI library |
| typescript | 5 | Type safety |
| tailwindcss | v4 | Styling |

### Backend Integration

**API Base URL**: `http://localhost:8000` (configurable via `NEXT_PUBLIC_API_URL`)

**Authentication Flow**:
1. User registers/logs in via frontend
2. Frontend calls `/api/auth/register` or `/api/auth/login`
3. Backend returns JWT token
4. Frontend stores token in localStorage
5. Frontend includes token in `Authorization: Bearer ${token}` header

**Data Sync**:
- Frontend maintains optimistic UI updates
- API calls happen in background
- Rollback on failure
- Refresh on page load from API

---

## Risk Analysis

### Top 3 Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Backend API incompatibility | Medium | High | Frontend designed with mock data; type definitions allow smooth integration |
| CORS configuration issues | Medium | Medium | Documented CORS setup in quickstart.md |
| Token expiration handling | Low | Medium | Implement 401 handling with auto-logout |

### Blast Radius

- **Authentication Failure**: Users redirected to login page, no data loss
- **API Failure**: Mock data fallback for development
- **State Corruption**: Clear localStorage, re-authenticate

---

## Success Criteria

From [spec.md](./spec.md#success-criteria):

### Measurable Outcomes

- **SC-001**: Users can complete registration in under 90 seconds
- **SC-002**: Users can log in in under 15 seconds
- **SC-003**: Users can create a task in under 30 seconds
- **SC-004**: Users can find any task from 100+ in under 10 seconds
- **SC-005**: Task completion status changes reflect within 100ms
- **SC-006**: Application loads within 2 seconds on 4G mobile
- **SC-007**: Primary workflow (create → complete → delete) works on first attempt
- **SC-008**: 95% of users create first task within 5 minutes
- **SC-009**: Filter operations update within 200ms
- **SC-010**: Interface works on screens 375px to 1920px
- **SC-011**: Chat messages appear within 100ms
- **SC-012**: Tab state persists when switching

---

## Next Steps

1. ✅ Complete frontend implementation
2. ✅ Create planning documentation
3. ⏳ Connect to real FastAPI backend (Phase 3)
4. ⏳ Add automated tests (Phase 4)
5. ⏳ Deploy to production

**Immediate Action**: Review [quickstart.md](./quickstart.md) for development setup instructions.

---

## References

- [Feature Specification](./spec.md)
- [Technology Research](./research.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/)
- [Developer Quick Start](./quickstart.md)
- [Reverse Engineered Docs](../../docs/reverse-engineered/)
