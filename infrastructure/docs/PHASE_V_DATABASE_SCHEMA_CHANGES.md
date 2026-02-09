# Phase V Database Schema Changes

**Purpose:** Add support for advanced todo features (priorities, tags, due dates, recurring tasks)
**Estimated Time:** 2 hours
**Complexity:** Medium

---

## 📊 Current Database Structure

### Existing Tables

```sql
┌─────────────────────┐
│ users               │
├─────────────────────┤
│ id (UUID, PK)       │
│ email (string)      │
│ name (string)       │
│ password_hash       │
│ created_at          │
└─────────────────────┘
         │
         │ 1:N
         ↓
┌─────────────────────┐
│ tasks               │
├─────────────────────┤
│ id (UUID, PK)       │
│ user_id (UUID, FK)  │
│ title (string)      │
│ description (text)  │
│ status (string)     │ ← "pending", "in_progress", "done", "cancelled"
│ created_at          │
│ updated_at          │
└─────────────────────┘

┌─────────────────────┐
│ conversations       │
│ messages            │
└─────────────────────┘
```

---

## 🆕 What Needs to Change

### Overview of Changes

| Feature | Change Type | Tables Affected |
|---------|-------------|-----------------|
| **Priority Levels** | Add column | tasks |
| **Due Dates** | Add column | tasks |
| **Reminders** | Add column | tasks |
| **Recurring Tasks** | Add columns | tasks |
| **Tags** | Add tables | tags, task_tags (junction) |

---

## 📝 Detailed Schema Changes

### 1. Priority Levels (NEW COLUMN)

**Feature:** Allow users to mark tasks with priority levels

**Table:** `tasks`

**New Column:**
```sql
priority VARCHAR(20) DEFAULT 'medium'
```

**Values:**
- `low` - Low priority tasks
- `medium` - Default priority
- `high` - Important tasks
- `urgent` - Critical/urgent tasks

**Example:**
```python
# Before
task = Task(title="Buy groceries", description="Milk, eggs")

# After
task = Task(
    title="Buy groceries",
    description="Milk, eggs",
    priority="high"  # ← NEW
)
```

---

### 2. Due Dates (NEW COLUMN)

**Feature:** Set deadlines for tasks

**Table:** `tasks`

**New Column:**
```sql
due_date TIMESTAMP NULL
```

**Type:** `datetime` (nullable)

**Example:**
```python
from datetime import datetime, timedelta

task = Task(
    title="Submit report",
    due_date=datetime.now() + timedelta(days=7)  # Due in 7 days
)
```

---

### 3. Reminders (NEW COLUMN)

**Feature:** Track if reminder notification was sent

**Table:** `tasks`

**New Column:**
```sql
reminder_sent BOOLEAN DEFAULT FALSE
```

**Purpose:** Background worker checks tasks with `due_date` and sends reminders, then marks as sent

**Example:**
```python
# Background task logic
if task.due_date and not task.reminder_sent:
    if task.due_date <= datetime.now() + timedelta(hours=24):
        send_reminder_email(task)
        task.reminder_sent = True
```

---

### 4. Recurring Tasks (NEW COLUMNS)

**Feature:** Support repeating tasks (daily, weekly, monthly)

**Table:** `tasks`

**New Columns:**
```sql
recurring_type VARCHAR(20) DEFAULT 'none'
recurring_end_date TIMESTAMP NULL
```

**Values for `recurring_type`:**
- `none` - Not a recurring task (default)
- `daily` - Repeats every day
- `weekly` - Repeats every week
- `monthly` - Repeats every month

**Logic:**
When a recurring task is completed, automatically create a new task:

```python
# When task is marked complete:
if task.recurring_type != "none":
    # Calculate next due date
    next_date = calculate_next_date(task.due_date, task.recurring_type)

    # Check if still within recurring end date
    if not task.recurring_end_date or next_date <= task.recurring_end_date:
        # Create new task
        new_task = Task(
            title=task.title,
            description=task.description,
            priority=task.priority,
            due_date=next_date,
            recurring_type=task.recurring_type,
            recurring_end_date=task.recurring_end_date,
            user_id=task.user_id
        )
```

**Example:**
```python
# Create daily task for 30 days
task = Task(
    title="Take medication",
    recurring_type="daily",
    due_date=datetime.now(),
    recurring_end_date=datetime.now() + timedelta(days=30)
)
```

---

### 5. Tags System (NEW TABLES)

**Feature:** Organize tasks with tags/labels

#### New Table: `tags`

```sql
┌─────────────────────┐
│ tags                │
├─────────────────────┤
│ id (UUID, PK)       │
│ user_id (UUID, FK)  │
│ name (string)       │ ← "work", "personal", "shopping"
│ color (string)      │ ← "#FF5733", "#00C9A7"
│ created_at          │
└─────────────────────┘
```

**Purpose:** Store tags created by users

**Example:**
```python
tag = Tag(
    user_id=user.id,
    name="work",
    color="#FF5733"  # Red for work tasks
)
```

#### New Table: `task_tags` (Junction Table)

```sql
┌─────────────────────┐
│ task_tags           │ ← Many-to-Many relationship
├─────────────────────┤
│ task_id (UUID, FK)  │
│ tag_id (UUID, FK)   │
└─────────────────────┘
```

**Purpose:** Link tasks to tags (many-to-many relationship)

**Primary Key:** `(task_id, tag_id)` - Composite key

**Example:**
```python
# Task has multiple tags
task.tags = [work_tag, urgent_tag]

# Query: Find all tasks with "work" tag
tasks = session.query(Task).join(TaskTag).join(Tag).filter(Tag.name == "work").all()
```

---

## 🔄 Complete Updated Schema

### Visual Diagram

```
┌──────────────────────────┐
│ users                    │
├──────────────────────────┤
│ id (UUID, PK)            │
│ email (string)           │
│ name (string)            │
│ password_hash            │
│ created_at               │
└──────────────────────────┘
         │
         │ 1:N
         ↓
┌──────────────────────────┐
│ tasks                    │
├──────────────────────────┤
│ id (UUID, PK)            │
│ user_id (UUID, FK)       │
│ title (string)           │
│ description (text)       │
│ status (string)          │ ← "pending", "done", etc.
│ priority (string)        │ ← NEW: "low", "medium", "high", "urgent"
│ due_date (timestamp)     │ ← NEW: nullable
│ reminder_sent (boolean)  │ ← NEW: default FALSE
│ recurring_type (string)  │ ← NEW: "none", "daily", "weekly", "monthly"
│ recurring_end_date       │ ← NEW: nullable
│ created_at               │
│ updated_at               │
└──────────────────────────┘
         │
         │ N:M (through task_tags)
         ↓
┌──────────────────────────┐
│ tags                     │ ← NEW TABLE
├──────────────────────────┤
│ id (UUID, PK)            │
│ user_id (UUID, FK)       │
│ name (string)            │ ← "work", "shopping", etc.
│ color (string)           │ ← "#FF5733", etc.
│ created_at               │
└──────────────────────────┘

┌──────────────────────────┐
│ task_tags                │ ← NEW JUNCTION TABLE
├──────────────────────────┤
│ task_id (UUID, FK)       │
│ tag_id (UUID, FK)        │
└──────────────────────────┘
```

---

## 💻 Implementation: Updated Models

### Complete Updated `models.py`

```python
"""
Database models using SQLModel - Phase V Updated
"""

from typing import Optional, List
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship, Column, String
from uuid import UUID, uuid4
from enum import Enum


# ───────────────────────────────────────────────────────────
# ENUMS
# ───────────────────────────────────────────────────────────

class PriorityType(str, Enum):
    """Priority levels for tasks"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class RecurringType(str, Enum):
    """Recurring task patterns"""
    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


# ───────────────────────────────────────────────────────────
# USER MODEL (UNCHANGED)
# ───────────────────────────────────────────────────────────

class User(SQLModel, table=True):
    """User model representing an authenticated user"""

    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    name: Optional[str] = Field(default=None, max_length=100)
    password_hash: str = Field(max_length=255)

    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    tasks: List["Task"] = Relationship(back_populates="user")
    tags: List["Tag"] = Relationship(back_populates="user")


# ───────────────────────────────────────────────────────────
# TAG MODEL (NEW)
# ───────────────────────────────────────────────────────────

class Tag(SQLModel, table=True):
    """Tag model for categorizing tasks"""

    __tablename__ = "tags"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True, ondelete="CASCADE")

    name: str = Field(max_length=50)  # e.g., "work", "personal", "shopping"
    color: str = Field(default="#00C9A7", max_length=7)  # Hex color code

    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: Optional["User"] = Relationship(back_populates="tags")
    tasks: List["Task"] = Relationship(back_populates="tags", link_model="TaskTag")


# ───────────────────────────────────────────────────────────
# TASK TAG JUNCTION MODEL (NEW)
# ───────────────────────────────────────────────────────────

class TaskTag(SQLModel, table=True):
    """Junction table for Task ↔ Tag many-to-many relationship"""

    __tablename__ = "task_tags"

    task_id: UUID = Field(foreign_key="tasks.id", primary_key=True, ondelete="CASCADE")
    tag_id: UUID = Field(foreign_key="tags.id", primary_key=True, ondelete="CASCADE")

    # Relationships (optional, for query convenience)
    task: Optional["Task"] = Relationship(back_populates="task_tags")
    tag: Optional["Tag"] = Relationship(back_populates="tasks")


# ───────────────────────────────────────────────────────────
# TASK MODEL (UPDATED)
# ───────────────────────────────────────────────────────────

class Task(SQLModel, table=True):
    """Task model representing a todo item - Updated for Phase V"""

    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True, ondelete="CASCADE")

    # Existing fields
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    status: str = Field(default="pending", max_length=20)  # pending, in_progress, done, cancelled

    # ─── NEW FIELDS (Phase V) ───

    # Priority levels
    priority: str = Field(
        default="medium",
        max_length=20,
        description="Task priority: low, medium, high, urgent"
    )

    # Due dates
    due_date: Optional[datetime] = Field(
        default=None,
        description="Task deadline (nullable)"
    )

    # Reminders
    reminder_sent: bool = Field(
        default=False,
        description="Whether reminder notification was sent for this task"
    )

    # Recurring tasks
    recurring_type: str = Field(
        default="none",
        max_length=20,
        description="Recurrence pattern: none, daily, weekly, monthly"
    )

    recurring_end_date: Optional[datetime] = Field(
        default=None,
        description="End date for recurring tasks (nullable)"
    )

    # ─── END NEW FIELDS ───

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})

    # Relationships
    user: Optional["User"] = Relationship(back_populates="tasks")
    tags: List["Tag"] = Relationship(back_populates="tasks", link_model="TaskTag")
    task_tags: List["TaskTag"] = Relationship(back_populates="task")


# ───────────────────────────────────────────────────────────
# PUBLIC MODELS (API Responses)
# ───────────────────────────────────────────────────────────

class UserPublic(SQLModel):
    """Public user model without sensitive data"""
    id: UUID
    email: str
    name: Optional[str] = None
    created_at: datetime


class TagPublic(SQLModel):
    """Public tag model"""
    id: UUID
    name: str
    color: str


class TaskPublic(SQLModel):
    """Public task model - Updated for Phase V"""
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str] = None
    status: str
    priority: str  # ← NEW
    due_date: Optional[datetime] = None  # ← NEW
    reminder_sent: bool  # ← NEW
    recurring_type: str  # ← NEW
    recurring_end_date: Optional[datetime] = None  # ← NEW
    created_at: datetime
    updated_at: datetime
    tags: List[TagPublic] = []  # ← NEW


class TaskCreate(SQLModel):
    """Schema for creating a task - Updated for Phase V"""
    title: str
    description: Optional[str] = None
    priority: str = "medium"  # ← NEW
    due_date: Optional[datetime] = None  # ← NEW
    recurring_type: str = "none"  # ← NEW
    recurring_end_date: Optional[datetime] = None  # ← NEW
    tag_ids: List[UUID] = []  # ← NEW (list of tag IDs to attach)


class TaskUpdate(SQLModel):
    """Schema for updating a task - Updated for Phase V"""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None  # ← NEW
    due_date: Optional[datetime] = None  # ← NEW
    reminder_sent: Optional[bool] = None  # ← NEW
    recurring_type: Optional[str] = None  # ← NEW
    recurring_end_date: Optional[datetime] = None  # ← NEW
    tag_ids: Optional[List[UUID]] = None  # ← NEW


# ───────────────────────────────────────────────────────────
# CONVERSATION & MESSAGE MODELS (UNCHANGED)
# ───────────────────────────────────────────────────────────

class Conversation(SQLModel, table=True):
    """Conversation model representing a chat session"""

    __tablename__ = "conversations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True, ondelete="CASCADE")
    title: Optional[str] = Field(default=None, max_length=200)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})

    # Relationship to messages
    messages: List["Message"] = Relationship(back_populates="conversation")


class Message(SQLModel, table=True):
    """Message model representing a single chat message"""

    __tablename__ = "messages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="conversations.id", index=True, ondelete="CASCADE")
    role: str = Field(max_length=20)  # user, assistant, system
    content: str = Field(max_length=5000)

    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to conversation
    conversation: Optional["Conversation"] = Relationship(back_populates="messages")
```

---

## 🗃️ Migration Script

### SQL Migration (PostgreSQL)

```sql
-- Phase V Migration: Add Advanced Features
-- Run this migration to update the database schema

-- 1. Add priority column to tasks
ALTER TABLE tasks
ADD COLUMN priority VARCHAR(20) DEFAULT 'medium'
CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- 2. Add due_date column to tasks
ALTER TABLE tasks
ADD COLUMN due_date TIMESTAMP NULL;

-- 3. Add reminder_sent column to tasks
ALTER TABLE tasks
ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE;

-- 4. Add recurring_type column to tasks
ALTER TABLE tasks
ADD COLUMN recurring_type VARCHAR(20) DEFAULT 'none'
CHECK (recurring_type IN ('none', 'daily', 'weekly', 'monthly'));

-- 5. Add recurring_end_date column to tasks
ALTER TABLE tasks
ADD COLUMN recurring_end_date TIMESTAMP NULL;

-- 6. Create tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#00C9A7',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)  -- User can't have duplicate tag names
);

CREATE INDEX idx_tags_user_id ON tags(user_id);

-- 7. Create task_tags junction table
CREATE TABLE task_tags (
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

CREATE INDEX idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX idx_task_tags_tag_id ON task_tags(tag_id);

-- Migration complete
```

### Alembic Migration (Python)

If using Alembic for migrations:

```python
"""Phase V: Add advanced features

Revision ID: phase_v_advanced_features
Revises: <previous_revision>
Create Date: 2025-02-05

"""
from alembic import op
import sqlalchemy as sa
from sqlmodel import SQLModel


# revision identifiers
revision = 'phase_v_advanced_features'
down_revision = '<previous_revision_id>'
branch_labels = None
depends_on = None


def upgrade():
    # Add priority column
    op.add_column('tasks',
        sa.Column('priority', sa.String(20), server_default='medium', nullable=False)
    )

    # Add due_date column
    op.add_column('tasks',
        sa.Column('due_date', sa.TIMESTAMP(), nullable=True)
    )

    # Add reminder_sent column
    op.add_column('tasks',
        sa.Column('reminder_sent', sa.Boolean(), server_default='false', nullable=False)
    )

    # Add recurring_type column
    op.add_column('tasks',
        sa.Column('recurring_type', sa.String(20), server_default='none', nullable=False)
    )

    # Add recurring_end_date column
    op.add_column('tasks',
        sa.Column('recurring_end_date', sa.TIMESTAMP(), nullable=True)
    )

    # Create tags table
    op.create_table(
        'tags',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('color', sa.String(length=7), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'name', name='uq_user_tag_name')
    )
    op.create_index('idx_tags_user_id', 'tags', ['user_id'])

    # Create task_tags junction table
    op.create_table(
        'task_tags',
        sa.Column('task_id', sa.UUID(), nullable=False),
        sa.Column('tag_id', sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('task_id', 'tag_id')
    )
    op.create_index('idx_task_tags_task_id', 'task_tags', ['task_id'])
    op.create_index('idx_task_tags_tag_id', 'task_tags', ['tag_id'])


def downgrade():
    # Drop task_tags table
    op.drop_index('idx_task_tags_tag_id', table_name='task_tags')
    op.drop_index('idx_task_tags_task_id', table_name='task_tags')
    op.drop_table('task_tags')

    # Drop tags table
    op.drop_index('idx_tags_user_id', table_name='tags')
    op.drop_table('tags')

    # Remove columns from tasks
    op.drop_column('tasks', 'recurring_end_date')
    op.drop_column('tasks', 'recurring_type')
    op.drop_column('tasks', 'reminder_sent')
    op.drop_column('tasks', 'due_date')
    op.drop_column('tasks', 'priority')
```

---

## 📋 Summary of Changes

### By Feature

| Feature | Tables Changed | Columns Added | Tables Created |
|---------|----------------|---------------|----------------|
| **Priority** | tasks | 1 (priority) | 0 |
| **Due Dates** | tasks | 1 (due_date) | 0 |
| **Reminders** | tasks | 1 (reminder_sent) | 0 |
| **Recurring** | tasks | 2 (recurring_type, recurring_end_date) | 0 |
| **Tags** | - | - | 2 (tags, task_tags) |

### Total Impact

- **Columns Added:** 5 new columns to `tasks` table
- **Tables Created:** 2 new tables (`tags`, `task_tags`)
- **Relationships Added:** 2 new many-to-many relationships
- **Migration Complexity:** Medium (requires data validation for production)

---

## ✅ Checklist

### Before Migration
- [ ] Backup existing database
- [ ] Test migration on development database first
- [ ] Ensure no existing data conflicts
- [ ] Plan for minimal downtime

### During Migration
- [ ] Run migration script
- [ ] Verify all columns created
- [ ] Verify all tables created
- [ ] Check indexes and constraints

### After Migration
- [ ] Update application code (models.py)
- [ ] Update API schemas (schemas.py)
- [ ] Test all CRUD operations
- [ ] Test tag creation and assignment
- [ ] Test priority filtering
- [ ] Test due date queries
- [ ] Test recurring task logic

---

**Next Steps:**
1. Review this schema design
2. Approve changes
3. Create migration file
4. Run migration on dev database
5. Update backend code
6. Test thoroughly

Ready to proceed?
