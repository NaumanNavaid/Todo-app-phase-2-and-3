# Quick Start Prompt (Short Version)

**Paste this when starting in this repo:**

---

## Context

Working on **AI-Powered Todo App** - FastAPI backend + Next.js frontend.

**Repository:** https://github.com/NaumanNavaid/Todo-app-phase-2-and-3

**Status:** Phase IV (Kubernetes) complete. Phase V (advanced features) in progress.

**Deployed:**
- Backend: https://nauman-19-todo-app-backend.hf.space
- Frontend: https://todo-app-phase-2-and-3.vercel.app

---

## Critical Issue

**Frontend has priority/category/dueDate working but backend doesn't save these fields!**

- Frontend filters by: priority, category, dueDate, search ✅
- Backend only has: title, description, status ❌
- Result: Data resets on refresh (uses defaults: priority='medium', category='Other')

---

## What Needs to Be Done

Add to backend `Task` model:
```python
priority: str = "medium"  # "low", "medium", "high", "urgent"
due_date: Optional[datetime] = None
reminder_sent: bool = False
recurring_type: str = "none"
recurring_end_date: Optional[datetime] = None
```

Add new tables:
```python
class Tag(SQLModel, table=True):
    id: UUID
    user_id: UUID
    name: str
    color: str

class TaskTag(SQLModel, table=True):
    task_id: UUID
    tag_id: UUID
```

---

## Key Files

- **[CLAUDE.md](../CLAUDE.md)** - Complete instructions
- **[backend/models.py](../backend/models.py)** - Database models
- **[backend/schemas.py](../backend/schemas.py)** - API schemas
- **[specs/](../specs/)** - Phase specifications
- **[infrastructure/docs/PHASE_V_DATABASE_SCHEMA_CHANGES.md](../infrastructure/docs/PHASE_V_DATABASE_SCHEMA_CHANGES.md)** - Detailed schema guide

---

## Stack

- Backend: FastAPI + SQLModel + PostgreSQL
- Frontend: Next.js 16 + React 19 + TypeScript
- Infra: Docker + Kubernetes + Helm

---

**Start by reading [CLAUDE.md](../CLAUDE.md) and the relevant spec files!**