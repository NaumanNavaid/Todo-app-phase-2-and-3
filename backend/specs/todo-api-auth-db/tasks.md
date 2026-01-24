# Implementation Tasks: Todo API with Authentication and Database

**Feature**: todo-api-auth-db
**Created**: 2026-01-20
**Status**: Ready for Implementation
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Task Summary

| Category | Task Count |
|----------|------------|
| **Setup & Foundation** | 10 tasks |
| **User Story 1: Registration & Login** | 14 tasks |
| **User Story 2: Task Management** | 14 tasks |
| **User Story 3: Token Management** | 4 tasks |
| **User Story 4: Filtering & Organization** | 3 tasks |
| **Polish & Cross-Cutting** | 6 tasks |
| **TOTAL** | **51 tasks** |

**Parallel Opportunities**: 18 tasks can run in parallel (marked with [P])

**Suggested MVP Scope**: User Story 1 + User Story 2 (24 tasks) - delivers complete authentication and task CRUD

---

## Dependency Graph

```
Setup (T001-T010) → Foundational (T011-T014) → US1 Auth (T015-T028)
                                                         ↓
                                                    US2 Tasks (T029-T042)
                                                         ↓
                                                 US3 Token (T043-T046)
                                                         ↓
                                              US4 Filter (T047-T049)
                                                         ↓
                                                  Polish (T050-T055)
```

**Independent User Stories**: US2 can be developed in parallel with US3 after US1 is complete.

---

## Phase 1: Setup & Foundation

**Goal**: Project initialization, dependencies, database connection

- [ ] T001 Create project directory structure (routes/, services/, middleware/, scripts/, tests/)
- [ ] T002 Update requirements.txt with all dependencies (FastAPI, SQLModel, JWT, bcrypt, etc.)
- [ ] T003 Create .env.example template with DATABASE_URL, SECRET_KEY, CORS_ORIGINS
- [ ] T004 Create config.py in project root for environment-based configuration
- [ ] T005 [P] Create db.py with database connection and session management
- [ ] T006 [P] Create auth.py with JWT utilities (encode, decode, verify functions)
- [ ] T007 [P] Create exceptions.py with custom exception classes (AuthError, NotFoundError, ValidationError)
- [ ] T008 [P] Create scripts/init_db.py for database table creation
- [ ] T009 [P] Create scripts/test_db.py for database connection verification
- [ ] T010 Install all dependencies from requirements.txt

**Independent Test**: Run `python scripts/test_db.py` and verify database connection succeeds

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Data models, schemas, authentication middleware - required before any user stories

- [ ] T011 Create models.py with User and Task SQLModel classes (per data-model.md)
- [ ] T012 [P] Create schemas.py with Pydantic request/response models (UserCreate, UserLogin, TaskCreate, TaskUpdate, etc.)
- [ ] T013 [P] Create middleware/auth.py with JWT validation decorator get_current_user
- [ ] T014 Initialize database tables by running scripts/init_db.py

**Independent Test**: Verify database tables exist with correct schema

---

## Phase 3: User Story 1 - Registration & Login (Priority: P1)

**Goal**: Users can register accounts and log in to receive JWT tokens

**Story Goal**: A new user wants to create an account and securely log in to manage their personal tasks.

**Independent Test**: Register a new user, log in, receive a valid JWT token, and verify the token grants access to protected endpoint.

### Service Layer

- [ ] T015 [US1] Create services/auth_service.py with hash_password function using bcrypt
- [ ] T016 [US1] [P] Create services/auth_service.py with verify_password function
- [ ] T017 [US1] [P] Create services/auth_service.py with create_user function (validates email uniqueness)
- [ ] T018 [US1] [P] Create services/auth_service.py with get_user_by_email function
- [ ] T019 [US1] [P] Create services/auth_service.py with authenticate_user function

### API Endpoints

- [ ] T020 [US1] Create routes/auth.py with POST /api/auth/register endpoint
- [ ] T021 [US1] [P] Create routes/auth.py with POST /api/auth/login endpoint
- [ ] T022 [US1] [P] Create routes/auth.py with GET /api/auth/me endpoint (protected)
- [ ] T023 [US1] Update main.py to include auth routes

### Integration & Validation

- [ ] T024 [US1] Test user registration with valid email and password
- [ ] T025 [US1] [P] Test registration fails with duplicate email
- [ ] T026 [US1] [P] Test registration fails with invalid email format
- [ ] T027 [US1] [P] Test registration fails with weak password (<8 chars)
- [ ] T028 [US1] Test login returns valid JWT token for correct credentials

---

## Phase 4: User Story 2 - Task Management (Priority: P1)

**Goal**: Authenticated users can create, view, update, and delete their tasks

**Story Goal**: An authenticated user wants to create, view, update, and delete their personal tasks.

**Independent Test**: Create multiple tasks, list them with filters, update task details, delete tasks - all while verifying only the authenticated user's tasks are accessible.

### Service Layer

- [ ] T029 [US2] Create services/task_service.py with create_task function
- [ ] T030 [US2] [P] Create services/task_service.py with list_tasks function (with optional status filter)
- [ ] T031 [US2] [P] Create services/task_service.py with get_task_by_id function (verifies user ownership)
- [ ] T032 [US2] [P] Create services/task_service.py with update_task function
- [ ] T033 [US2] [P] Create services/task_service.py with delete_task function
- [ ] T034 [US2] [P] Create services/task_service.py with toggle_task_status function

### API Endpoints

- [ ] T035 [US2] Create routes/tasks.py with GET /api/tasks endpoint (protected, with status filter)
- [ ] T036 [US2] [P] Create routes/tasks.py with POST /api/tasks endpoint (protected)
- [ ] T037 [US2] [P] Create routes/tasks.py with GET /api/tasks/{id} endpoint (protected, ownership check)
- [ ] T038 [US2] [P] Create routes/tasks.py with PUT /api/tasks/{id} endpoint (protected, ownership check)
- [ ] T039 [US2] [P] Create routes/tasks.py with DELETE /api/tasks/{id} endpoint (protected, ownership check)
- [ ] T040 [US2] [P] Create routes/tasks.py with PATCH /api/tasks/{id}/toggle endpoint (protected)
- [ ] T041 [US2] Update main.py to include task routes
- [ ] T042 [US2] [P] Configure CORS in main.py for frontend integration

### Integration & Validation

- [ ] T043 [US2] Test task creation stores task with correct user_id
- [ ] T044 [US2] [P] Test task list only returns authenticated user's tasks
- [ ] T045 [US2] [P] Test task filtering by status (pending/completed)
- [ ] T046 [US2] [P] Test user cannot access another user's tasks (404 response)
- [ ] T047 [US2] Test task update and delete operations maintain data isolation
- [ ] T048 [US2] [P] Test task status toggle flips between pending and done

---

## Phase 5: User Story 3 - Token-Based Session Management (Priority: P2)

**Goal**: JWT tokens are properly validated and managed across requests

**Story Goal**: An authenticated user wants to remain logged in across sessions without repeatedly entering credentials.

**Independent Test**: Log in, receive JWT token, use token to access multiple protected endpoints, verify token remains valid until expiration.

### Token Validation

- [ ] T049 [US3] Add token expiration validation in middleware/auth.py
- [ ] T050 [US3] [P] Test expired token returns 401 Unauthorized
- [ ] T051 [US3] [P] Test malformed token returns 401 Unauthorized
- [ ] T052 [US3] Test missing token returns 401 Unauthorized

---

## Phase 6: User Story 4 - Task Organization & Filtering (Priority: P3)

**Goal**: Users can filter tasks by status and toggle status

**Story Goal**: An authenticated user wants to filter and sort their tasks to focus on what matters most.

**Independent Test**: Create tasks with various statuses, filter by status, toggle task status.

### Filtering Features

- [ ] T053 [US4] Add default sorting by created_at DESC in task_service.py
- [ ] T054 [US4] [P] Test status filter returns only matching tasks
- [ ] T055 [US4] [P] Test toggle endpoint properly flips status between pending and done

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Error handling, documentation, health checks

### Error Handling

- [ ] T056 Create middleware/errors.py with global exception handler
- [ ] T057 [P] Add HTTPException handling for 400, 401, 403, 404, 409, 500 errors
- [ ] T058 [P] Test all error paths return structured JSON responses

### API Documentation

- [ ] T059 Add comprehensive docstrings to all endpoints
- [ ] T060 [P] Verify Swagger UI at http://localhost:8000/docs displays all endpoints correctly

### Health & Monitoring

- [ ] T061 Add GET /health endpoint for health checks
- [ ] T062 [P] Add GET / endpoint returning API info and available endpoints

---

## Parallel Execution Examples

### Within Phase 1 (Setup):
```bash
# Terminal 1
- T005 Create db.py

# Terminal 2 (parallel)
- T006 Create auth.py
- T007 Create exceptions.py
```

### Within User Story 1 (Auth):
```bash
# Terminal 1
- T015 Create hash_password

# Terminal 2 (parallel)
- T016 Create verify_password
- T017 Create create_user
```

### Within User Story 2 (Tasks):
```bash
# Terminal 1
- T029 Create create_task

# Terminal 2 (parallel)
- T030 Create list_tasks
- T031 Create get_task_by_id
```

---

## Implementation Strategy

### MVP First (Recommended)
1. **Complete Phase 1 & 2** (Foundation) - Tasks T001-T014
2. **Implement User Story 1** (Auth) - Tasks T015-T028
3. **Implement User Story 2** (Tasks) - Tasks T029-T048
4. **Test end-to-end** flow: Register → Login → Create Task → List Tasks → Update Task → Delete Task
5. **Deploy MVP** to production

### Incremental Delivery
- **Sprint 1**: Foundation + Auth (T001-T028) - Users can register and login
- **Sprint 2**: Task CRUD (T029-T048) - Core todo functionality
- **Sprint 3**: Token Management (T049-T052) - Enhanced security
- **Sprint 4**: Filtering (T053-T055) - UX improvements
- **Sprint 5**: Polish (T056-T062) - Production readiness

---

## Acceptance Criteria by Story

### US1: Registration & Login
- [x] User can register with valid email, password (8+ chars), optional name
- [x] Registration fails with duplicate email (409)
- [x] Registration fails with invalid email (400)
- [x] Registration fails with weak password (400)
- [x] User can login with correct credentials
- [x] Login fails with wrong password (401)
- [x] Login fails with non-existent email (401)
- [x] Successful login returns JWT token
- [x] GET /api/auth/me returns current user with valid token

### US2: Task Management
- [x] Authenticated user can create task with title (required) and description (optional)
- [x] Task is associated with authenticated user (user_id)
- [x] Task status defaults to "pending"
- [x] User can list all their tasks (sorted newest first)
- [x] User can filter tasks by status (pending/completed)
- [x] User can get specific task by ID
- [x] User gets 404 for non-existent or unauthorized tasks
- [x] User can update task title, description, status
- [x] User can delete their tasks
- [x] User can toggle task status between pending/done
- [x] Users cannot access other users' tasks

### US3: Token Management
- [x] Valid JWT token grants access to protected endpoints
- [x] Expired JWT token returns 401
- [x] Invalid JWT token returns 401
- [x] Missing JWT token returns 401

### US4: Filtering & Organization
- [x] Tasks are sorted by created_at DESC by default
- [x] Status filter returns only matching tasks
- [x] Toggle endpoint flips between pending and done

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Registration time | < 5 seconds | curl POST /register with timing |
| Login time | < 500ms | curl POST /login with timing |
| Task CRUD time | < 500ms p95 | curl task operations with timing |
| Data isolation | 100% | Attempt cross-user access (should fail) |
| Password security | bcrypt | Inspect database for hashed passwords |

---

## Notes

- All file paths are relative to project root
- [P] marks tasks that can run in parallel with other [P] tasks in the same phase
- US1, US2, US3, US4 labels map to user stories in spec.md
- Tests are manual (via curl/Postman) - automated tests can be added in Phase 3

---

**Ready to implement!** Start with T001 and work through each phase sequentially.
