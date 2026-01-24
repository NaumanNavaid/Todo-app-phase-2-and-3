# Implementation Plan: Todo API with Authentication and Database

**Feature**: todo-api-auth-db
**Created**: 2026-01-20
**Status**: Draft
**Spec**: [spec.md](./spec.md)

---

## Technical Context

### Stack Decisions

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **API Framework** | FastAPI | Async support, automatic OpenAPI docs, type validation with Pydantic |
| **ORM** | SQLModel | Built on Pydantic, type-safe, compatible with FastAPI |
| **Database** | Neon PostgreSQL | Serverless Postgres, easy scaling, connection pooling |
| **Authentication** | JWT (python-jose) | Stateless, scalable, standard for REST APIs |
| **Password Hashing** | bcrypt | Industry standard, adaptive work factor |
| **CORS** | fastapi.middleware.cors | Built-in FastAPI middleware |

### Architecture Pattern

**Layered Architecture**:
```
┌─────────────────────────────────────┐
│      API Layer (FastAPI Routes)     │
├─────────────────────────────────────┤
│   Service Layer (Business Logic)    │
├─────────────────────────────────────┤
│   Data Layer (SQLModel/Database)    │
├─────────────────────────────────────┤
│   Database (Neon PostgreSQL)         │
└─────────────────────────────────────┘
```

### Key Design Decisions

1. **JWT over Sessions**: Stateless tokens scale better for API-first architecture
2. **SQLModel over SQLAlchemy**: Pydantic integration eliminates model duplication
3. **Environment-based Configuration**: Secrets via `.env` for security
4. **User-scoped Queries**: All task queries filtered by `user_id` from JWT token

---

## Constitution Check

### Principle Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Minimalism First** | ⚠️ AMENDED | Originally CLI-only, now API-first. Justified: Required for Next.js integration. |
| **II. Speed & Performance** | ✅ COMPLIANT | 500ms target for API calls (vs 100ms CLI). Database adds latency. |
| **III. Local Data Persistence** | ❌ VIOLATED | Replaced with Neon PostgreSQL. **Justified**: Multi-user auth requires shared database. |
| **IV. Color-Coded UI** | ⚠️ N/A | No CLI output in API mode. |
| **V. Error Handling** | ✅ COMPLIANT | HTTP status codes + structured JSON errors. |

**Violations Summary**:
- **Local Data Persistence → Remote Database**: Required for user authentication and multi-user data isolation. Acceptable trade-off for security and scalability.

### Complexity Tracking

| Complexity | Justification |
|------------|---------------|
| Added authentication layer | Required for multi-user data isolation |
| Switched from JSON file to PostgreSQL | Required for concurrent user support and data integrity |
| Added JWT token management | Standard pattern for API authentication |

---

## Phase 0: Research & Decisions

### Research Findings

#### R1: JWT Token Expiration Strategy
**Decision**: 24-hour expiration with refresh tokens out of scope (Phase 3)
**Rationale**: Balance security with UX. 24 hours is standard for session tokens.
**Alternatives Considered**:
- 1-hour expiration: Too frequent re-auth
- 7-day expiration: Security risk for leaked tokens
- Refresh tokens: Adds complexity (deferred to Phase 3)

#### R2: Password Hashing Algorithm
**Decision**: bcrypt with 12 rounds
**Rationale**: Industry standard, adaptive work factor, built-in salt
**Alternatives Considered**:
- Argon2: Better but less library support
- PBKDF2: NIST standard but slower
- scrypt: Memory-hard but complex implementation

#### R3: Database Connection Management
**Decision**: Connection pooling via `databases` library
**Rationale**: Async-compatible, automatic pool management
**Alternatives Considered**:
- Direct psycopg2: Not async-friendly
- SQLAlchemy async: More complex than needed

#### R4: Task Isolation Strategy
**Decision**: User-scoped queries at service layer (filter by `user_id` from JWT)
**Rationale**: Single source of truth for authorization, prevents data leakage
**Alternatives Considered**:
- Row-Level Security (RLS) in Postgres: More complex, harder to debug
- Application-level filtering: Simpler, sufficient for this scale

---

## Phase 1: Data Model & Contracts

### Data Model

See [data-model.md](./data-model.md) for complete schema definitions.

**Key Relationships**:
```
User (1) ────────< (N) Task
  │                    │
  │ user_id            │ user_id (FK)
  │                    │
  └────────────────────┘
```

### API Contracts

See [contracts/](./contracts/) for OpenAPI specifications.

**Endpoint Summary**:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create new user |
| POST | `/api/auth/login` | No | Get JWT token |
| GET | `/api/tasks` | Yes | List user's tasks |
| POST | `/api/tasks` | Yes | Create task |
| GET | `/api/tasks/{id}` | Yes | Get task by ID |
| PUT | `/api/tasks/{id}` | Yes | Update task |
| DELETE | `/api/tasks/{id}` | Yes | Delete task |
| PATCH | `/api/tasks/{id}/toggle` | Yes | Toggle status |
| GET | `/api/auth/me` | Yes | Get current user |

### Quickstart

See [quickstart.md](./quickstart.md) for setup instructions.

---

## Implementation Phases

### Phase 1: Foundation (P1 - Must Have)

**Goal**: Basic auth + task CRUD

| Task | File | Priority |
|------|------|----------|
| Database setup | `db.py` | P1 |
| User/Task models | `models.py` | P1 |
| Auth service | `services/auth.py` | P1 |
| Task service | `services/task.py` | P1 |
| Auth endpoints | `routes/auth.py` | P1 |
| Task endpoints | `routes/tasks.py` | P1 |
| JWT middleware | `middleware/auth.py` | P1 |
| CORS configuration | `main.py` | P1 |

### Phase 2: Robustness (P2 - Should Have)

**Goal**: Error handling + validation

| Task | File | Priority |
|------|------|----------|
| Custom exception classes | `exceptions.py` | P2 |
| Request validation schemas | `schemas.py` | P2 |
| Error handler middleware | `middleware/errors.py` | P2 |
| Input sanitization | `services/validators.py` | P2 |

### Phase 3: Enhancement (P3 - Nice to Have)

**Goal**: UX improvements

| Task | File | Priority |
|------|------|----------|
| Token refresh mechanism | `routes/auth.py` | P3 |
| Password reset flow | `routes/auth.py` | P3 |
| Advanced filtering | `routes/tasks.py` | P3 |

---

## Non-Functional Requirements

### Performance

| Metric | Target | Strategy |
|--------|--------|----------|
| API response time | < 500ms p95 | Database indexing, connection pooling |
| Auth validation | < 50ms | Cached JWT verification |
| Concurrent users | 1000 | Connection pool sizing |

### Security

| Requirement | Implementation |
|-------------|----------------|
| Password storage | bcrypt with 12 rounds |
| Token transmission | Authorization header only |
| SQL injection prevention | Parameterized queries (SQLModel) |
| XSS prevention | JSON API, no HTML rendering |
| CORS | Configured origins only |

### Reliability

| Requirement | Implementation |
|-------------|----------------|
| Database retries | Exponential backoff on connection failure |
| Transaction integrity | Atomic multi-step operations |
| Data backup | Neon automated backups |

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| JWT secret compromised | High | Low | Environment variable, rotation policy |
| Database connection exhausted | High | Medium | Connection pooling, retry logic |
| SQL injection | Critical | Low | ORM parameterized queries |
| Password hash exposure | High | Low | bcrypt, no plain text storage |
| Token replay attack | Medium | Low | Short expiration (24h) |

---

## Open Questions / Needs Clarification

None - all research completed in Phase 0.

---

## Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Registration flow | End-to-end time | < 5 seconds |
| Login flow | Token generation | < 500ms |
| Task CRUD | All operations | < 500ms p95 |
| Data isolation | Cross-user access attempts | 0% success |
| Password security | Hash verification | bcrypt verified |

---

## Dependencies

| Component | Version | Purpose |
|-----------|---------|---------|
| FastAPI | ^0.115.0 | Web framework |
| SQLModel | ^0.0.22 | ORM |
| psycopg2-binary | ^2.9.9 | Postgres driver |
| python-jose | ^3.3.0 | JWT handling |
| passlib | ^1.7.4 | Password hashing |
| python-multipart | ^0.0.9 | Form data parsing |
| uvicorn | ^0.32.0 | ASGI server |
| pydantic | ^2.9.2 | Validation |
| pydantic-settings | ^2.6.0 | Config management |
| python-dotenv | ^1.0.1 | Environment variables |

---

## Architecture Decision Records

See [ADR section](./adr/) for detailed decision records.

**Key ADRs**:
- [ADR-001]: Chose PostgreSQL over JSON file for multi-user support
- [ADR-002]: JWT over session-based authentication
- [ADR-003]: SQLModel over raw SQLAlchemy for Pydantic integration

---

**Next Step**: Run `/sp.tasks` to generate implementation task list.
