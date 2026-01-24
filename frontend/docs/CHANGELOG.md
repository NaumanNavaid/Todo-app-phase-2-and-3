# TodoApp Changelog

All notable changes to TodoApp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Changed

#### Design System Improvements (2026-01-21)
- **Professional UI Design**: Removed all gradient colors and vibrant neon colors
  - Replaced `bg-linear-to-br from-indigo-500 to-purple-600` with `bg-slate-700`
  - Updated AppHeader logo and avatar to use neutral slate colors
  - Updated LoginForm and SignupForm logo containers to use `bg-slate-700`
- **CSS Variables for Colors**: Migrated hardcoded colors to design tokens
  - CategoryBadge.tsx: Now uses `var(--category-work)` etc.
  - TodoCard.tsx: Status dropdown uses `var(--status-pending-text)` etc.
- **Standardized Spacing System**: Applied consistent spacing scale
  - CategoryBadge.tsx: Changed `w-1.5 h-1.5 mr-1.5` to `w-2 h-2 mr-2`
  - TodoCard.tsx: Changed `w-3.5 h-3.5` icons to `w-4 h-4`
- **Standardized Border Radius**: Applied consistent border radius scale
  - LoginForm.tsx: Changed `rounded-2xl` to `rounded-xl`
  - SignupForm.tsx: Changed `rounded-2xl` to `rounded-xl`
- **Enhanced User Safety**: Added delete confirmation dialog
  - TodoCard.tsx: Now prompts "Are you sure?" before deletion
- **Improved Button Hierarchy**: Made primary action more prominent
  - TodoDashboard.tsx: Changed "New Todo" button to `variant="primary"`

#### 4-Status Workflow System (2026-01-21)
- **New Status Options**: Extended from binary (pending/done) to 4-status workflow
  - `pending` - Task not started (gray badge)
  - `in_progress` - Task actively worked on (blue badge)
  - `done` - Task completed (green badge)
  - `cancelled` - Task cancelled (red badge)
- **Status Selection UI**: Changed from auto-cycling checkbox to dropdown menu
  - Click status button to open menu with all 4 status options
  - Each option shows colored dot for visual identification
  - Click outside to close menu
- **New Components**:
  - StatusBadge.tsx - Display status with color coding
- **Updated Components**:
  - TodoFilters.tsx - New status filter options
  - TodoCard.tsx - Status dropdown menu with visual indicators
  - TodoList.tsx - Added `onSetStatus` handler
  - TodoDashboard.tsx - Added `setStatus` method
  - lib/types.ts - Added `ApiTaskStatus` and `TodoStatus` types
  - lib/utils.ts - Added `getStatusColor()`, `getStatusLabel()` functions
  - hooks/useTodos.ts - Added `setStatus()` for direct status updates

### Planned
- AI Chat backend integration
- Automated testing suite
- Drag and drop task reordering

---

## [1.0.0] - 2026-01-21

### Added

#### Authentication
- User registration with email, name, password
- User login with email/password
- JWT token storage in localStorage
- Session persistence across page reloads
- Auto-logout on token expiration
- "Remember me" functionality
- Password confirmation on signup
- Real-time password matching validation

#### Task Management
- Create tasks with title, description, priority, category, due date
- Read/display tasks in card-based grid layout
- Update/edit all task fields
- Delete tasks (one-click, no confirmation)
- Toggle task completion status via checkbox
- Task filtering by status (All, Active, Completed)
- Task filtering by category (6 categories)
- Task filtering by priority (High, Medium, Low)
- Text search across task titles and descriptions
- Clear all filters button

#### Task Display Features
- Priority badges with color coding (Red/Amber/Green)
- Category badges with colored dots
- Due date display with human-readable format
- Overdue indicator (red badge) for past-due incomplete tasks
- Strikethrough styling for completed tasks
- Opacity reduction for completed tasks

#### Statistics Dashboard
- Total task count
- Completed task count
- Active (incomplete) task count
- High priority task count (incomplete only)
- Overdue task count
- Completion rate percentage

#### User Interface
- Tabbed navigation (Todos | AI Assistant)
- User avatar with initials (first 2 characters of name)
- User name and email display in header
- Responsive grid layout (1/2/3 columns based on screen size)
- Floating "New Todo" button
- Modal forms for create/edit
- Loading states during API calls
- Error messages for API failures

#### AI Chat Interface
- Chat message display with user/assistant roles
- User messages (right-aligned, blue background)
- Assistant messages (left-aligned, gray background)
- Timestamp display on messages
- Typing indicator during response generation
- Auto-scroll to latest message
- Clear chat button
- Text input with send button

#### Design System
- Light theme with slate color palette
- Indigo/purple gradient for branding
- Consistent spacing and typography
- Shadow effects for depth
- Hover transitions for interactivity
- Responsive breakpoints for mobile/tablet/desktop

#### Backend Integration
- FastAPI client implementation (`lib/api-client.ts`)
- Auth API: POST /register, POST /login, GET /me
- Tasks API: GET /tasks, POST /tasks, PUT /tasks/{id}, DELETE /tasks/{id}, PATCH /tasks/{id}/toggle
- Status mapping (pending/done ↔ completed boolean)
- JWT bearer token authentication
- Error handling for 401, 404, 409, 422 responses
- Environment variable configuration (.env.local)
- CORS configuration documentation

#### Documentation
- Feature specification (specs/001-todo-app/spec.md)
- Implementation plan (specs/001-todo-app/plan.md)
- Technology research (specs/001-todo-app/research.md)
- Data model documentation (specs/001-todo-app/data-model.md)
- API contracts (specs/001-todo-app/contracts/*.yaml)
- Developer quick start (specs/001-todo-app/quickstart.md)
- Application documentation (docs/APPLICATION_DOCUMENTATION.md)
- Reverse engineering documentation (docs/reverse-engineered/)

#### Components Created (26 total)

**Layout** (3):
- TabNavigation.tsx
- AppHeader.tsx
- Footer.tsx

**Authentication** (4):
- AuthProvider.tsx
- LoginForm.tsx
- SignupForm.tsx
- AuthPage.tsx

**Todos** (8):
- TodoDashboard.tsx
- TodoList.tsx
- TodoCard.tsx
- TodoForm.tsx
- TodoFilters.tsx
- CategoryBadge.tsx
- PriorityBadge.tsx
- TodoStats.tsx

**Chat** (4):
- ChatInterface.tsx
- ChatMessageList.tsx
- ChatMessage.tsx
- ChatInput.tsx

**UI** (7):
- Button.tsx
- Input.tsx
- TextArea.tsx
- Select.tsx
- Modal.tsx
- Badge.tsx
- Card.tsx

#### Custom Hooks Created (4)
- useAuth.tsx - Authentication state and operations
- useTodos.ts - Task CRUD and filtering
- useChat.ts - Chat state and messages
- useTabs.ts - Tab navigation state

### Changed
- Updated AppHeader to show user initials instead of generic avatar
- Changed user avatar from emoji (👤) to initials with gradient background
- Increased avatar size from w-8 h-8 to w-9 h-9

### Technical Decisions
- Selected Next.js 16.1 with App Router for routing
- Selected React 19 for latest features and performance
- Selected Tailwind CSS v4 for zero-config styling
- Used React hooks (Context API) for state management
- Implemented client-side priority/category fields (not in backend yet)
- Used localStorage for session persistence
- Implemented optimistic UI updates with API sync

### Security Considerations
- JWT tokens stored in localStorage (acceptable for this scope)
- Auto-logout on 401 responses
- Email validation on frontend and backend
- Password minimum length enforced
- XSS protection through React auto-escaping
- CORS configuration required for backend

### Performance Notes
- Initial JS bundle target: < 200 KB gzipped
- First Contentful Paint target: < 1.5s (4G)
- Time to Interactive target: < 3s (4G)
- Interaction response target: < 200ms

### Browser Support
- Chrome 120+
- Firefox 120+
- Safari 16+
- Edge 120+

---

## [0.1.0] - 2026-01-21 (Initial Development)

### Added
- Project scaffold with Next.js 16.1
- TypeScript configuration
- Tailwind CSS v4 setup
- Basic folder structure
- Package dependencies

---

## Format

### Types of changes
- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` for vulnerability fixes

---

## Links

- [Documentation](docs/APPLICATION_DOCUMENTATION.md)
- [API Reference](specs/001-todo-app/contracts/)
- [Developer Guide](specs/001-todo-app/quickstart.md)
- [Feature Specification](specs/001-todo-app/spec.md)
