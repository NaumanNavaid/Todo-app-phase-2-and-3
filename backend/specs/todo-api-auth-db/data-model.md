# Data Model: Todo API

**Feature**: todo-api-auth-db
**Created**: 2026-01-20
**Database**: Neon PostgreSQL
**ORM**: SQLModel

---

## Entities

### User

Represents an authenticated user who owns tasks.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, auto-gen | Unique user identifier |
| `email` | varchar(255) | UNIQUE, NOT NULL | User's email address |
| `name` | varchar(100) | NULLABLE | Display name |
| `password_hash` | varchar(255) | NOT NULL | Bcrypt hashed password |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW | Account creation time |

**Indexes**:
- `idx_users_email` on `email` (for login lookups)

**Relationships**:
- `User.id` → `Task.user_id` (one-to-many)

---

### Task

Represents a todo item owned by a user.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, auto-gen | Unique task identifier |
| `user_id` | UUID | FK(users.id), NOT NULL | Owner of the task |
| `title` | varchar(200) | NOT NULL | Task title |
| `description` | text | NULLABLE | Detailed description |
| `status` | enum | NOT NULL, DEFAULT 'pending' | Task status: pending/done |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW | Creation time |
| `updated_at` | timestamp | NOT NULL, DEFAULT NOW | Last update time |

**Indexes**:
- `idx_tasks_user_id` on `user_id` (for user task queries)
- `idx_tasks_status` on `status` (for filtering)
- `idx_tasks_user_status` on `(user_id, status)` (composite for filtered queries)

**Relationships**:
- `Task.user_id` → `User.id` (many-to-one)

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────┐
│              User                   │
├─────────────────────────────────────┤
│ ▲ id (PK)              UUID         │
│   email               varchar(255)  │
│   name                varchar(100)  │
│   password_hash       varchar(255)  │
│   created_at          timestamp     │
└──────────────┬──────────────────────┘
               │ 1
               │
               │ N
┌──────────────▼──────────────────────┐
│              Task                   │
├─────────────────────────────────────┤
│ ▲ id (PK)              UUID         │
│ ▲ user_id (FK)         UUID         │
│   title               varchar(200)  │
│   description         text          │
│   status              enum          │
│   created_at          timestamp     │
│   updated_at          timestamp     │
└─────────────────────────────────────┘
```

---

## State Transitions

### Task Status

```
┌──────────┐  toggle  ┌──────────┐
│ pending  │ ────────► │   done   │
└──────────┘          └──────────┘
     ▲                    │
     └────────────────────┘
           toggle
```

---

## Validation Rules

### User

| Rule | Field | Validation |
|------|-------|------------|
| EMAIL_FORMAT | email | RFC 5322 email pattern |
| EMAIL_UNIQUE | email | Must not exist in database |
| PASSWORD_MIN | password | Min 8 characters |
| PASSWORD_HASHED | password_hash | Bcrypt hash, not plain text |

### Task

| Rule | Field | Validation |
|------|-------|------------|
| TITLE_REQUIRED | title | Must not be empty |
| TITLE_MIN | title | Min 1 character |
| TITLE_MAX | title | Max 200 characters |
| DESCRIPTION_MAX | description | Max 1000 characters |
| STATUS_ENUM | status | Must be 'pending' or 'done' |
| USER_REQUIRED | user_id | Must reference valid user |

---

## SQL Schema (DDL)

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
```

---

## Migration Strategy

**Initial Setup**:
1. Create database in Neon
2. Run DDL statements above
3. Verify indexes created

**Schema Evolution**:
- Use versioned migration files
- Backward compatible changes preferred
- `ON DELETE CASCADE` for data integrity

---

## Data Access Patterns

### User Operations

```python
# Create user
user = User(email="user@example.com", password_hash=hash, name="User")

# Find by email (for login)
user = session.exec(select(User).where(User.email == email)).first()

# Get by ID (from JWT)
user = session.get(User, user_id)
```

### Task Operations

```python
# Create task
task = Task(user_id=user_id, title="Task", status="pending")

# List user's tasks (with filter)
tasks = session.exec(
    select(Task)
    .where(Task.user_id == user_id)
    .where(Task.status == status if status else True)
    .order_by(desc(Task.created_at))
).all()

# Get single task (verify ownership)
task = session.exec(
    select(Task)
    .where(Task.id == task_id)
    .where(Task.user_id == user_id)
).first()
```

---

**Next**: See [contracts/](./contracts/) for API specifications.
