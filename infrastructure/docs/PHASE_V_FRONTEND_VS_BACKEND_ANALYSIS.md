# Frontend vs Backend Analysis - Phase V Features

**Date:** 2026-02-05
**Key Finding:** Frontend has ALL Phase V features implemented, but backend does NOT support them!

---

## 🔍 The Situation

### You're RIGHT! The Frontend HAS Filters!

**What the Frontend Can Do:**
- ✅ Filter by **priority** (high, medium, low)
- ✅ Filter by **category** (work, personal, shopping, etc.)
- ✅ Filter by **status** (pending, in_progress, done, cancelled)
- ✅ **Search** todos by title/description
- ✅ Filter by **due dates** (overdue detection)
- ✅ Statistics (completion rate, high priority count, overdue count)

**What the Backend Can Do:**
- ✅ Filter by **status** only (`GET /api/tasks?status=pending`)
- ❌ NO priority field
- ❌ NO category/tag field
- ❌ NO due_date field
- ❌ NO search endpoint

---

## 💡 How It Works (The Trick)

### Frontend Uses **Client-Side Filtering**

Looking at `frontend/hooks/useTodos.ts` (lines 16-18):

```typescript
function apiToTodo(apiTask: Task): Todo {
  return {
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description || undefined,
    completed: apiTask.status === 'done',
    status: apiTask.status,

    // ⚠️ THESE ARE DEFAULT VALUES - Backend doesn't send them!
    priority: 'medium',      // ← Hardcoded default!
    category: 'Other',       // ← Hardcoded default!
    dueDate: undefined,      // ← Always undefined!
    order: 0,
  };
}
```

### What This Means:

1. **Frontend fetches** all todos from backend
2. **Frontend adds** priority='medium' to EVERY task
3. **Frontend adds** category='Other' to EVERY task
4. **Frontend filters** the todos in the browser (client-side)
5. **User sees** filtered results
6. **BUT** - Changes to priority/category/dueDate are **NOT SAVED** to backend!

---

## 📊 Complete Comparison

### Feature Matrix

| Feature | Frontend UI | Frontend Filter | Backend Field | Backend API | Data Saved? |
|---------|-------------|-----------------|---------------|-------------|-------------|
| **Priority** | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ **NO** |
| **Category/Tags** | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ **NO** |
| **Due Dates** | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ **NO** |
| **Status** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ **YES** |
| **Search** | ✅ Yes | ✅ Yes (client) | ❌ No | ❌ No | N/A |
| **Reminders** | ✅ Shows overdue | ✅ Yes | ❌ No | ❌ No | ❌ **NO** |
| **Recurring** | ❌ No | ❌ No | ❌ No | ❌ No | ❌ **NO** |

---

## 🎯 The Problem

### Current Behavior:

**User creates a todo:**
```typescript
{
  title: "Buy groceries",
  priority: "high",        // ← Set by user
  category: "Shopping",     // ← Set by user
  dueDate: "2025-02-10"     // ← Set by user
}
```

**What frontend sends to backend:**
```json
{
  "title": "Buy groceries",
  "description": ""
}
```
❌ Priority, category, dueDate are **LOST**!

**What backend saves:**
```sql
INSERT INTO tasks (title, description, status)
VALUES ('Buy groceries', '', 'pending')
```
❌ Only title, description, status saved!

**When frontend loads tasks:**
```typescript
{
  title: "Buy groceries",
  priority: "medium",       // ← Reset to default!
  category: "Other",        // ← Reset to default!
  dueDate: undefined        // ← Lost forever!
}
```

### User Experience:
- ✅ User CAN set priority/category/dueDate in UI
- ✅ User CAN filter by priority/category/dueDate
- ❌ Data is **NOT persisted** across page refresh
- ❌ Data is **NOT synchronized** across devices
- ❌ Data is **LOST** on reload

---

## 🔧 What Needs to Be Done

### Backend Changes Required:

#### 1. Add Database Fields (models.py)

```python
class Task(SQLModel, table=True):
    # Existing fields
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime

    # NEW FIELDS NEEDED:
    priority: str = Field(default="medium")  # ← ADD THIS
    due_date: Optional[datetime] = None      # ← ADD THIS
    reminder_sent: bool = False              # ← ADD THIS (for reminders)
    recurring_type: str = "none"             # ← ADD THIS (for recurring)
    recurring_end_date: Optional[datetime]   # ← ADD THIS (for recurring)

    # Tags relationship (many-to-many)
    tags: List["Tag"] = Relationship(link_model="TaskTag")  # ← ADD THIS
```

#### 2. Add Tag Model (models.py)

```python
class Tag(SQLModel, table=True):
    id: UUID
    user_id: UUID
    name: str          # "Work", "Shopping", etc.
    color: str         # "#FF5733", etc.
    tasks: List[Task]  # Relationship

class TaskTag(SQLModel, table=True):
    task_id: UUID
    tag_id: UUID
```

#### 3. Update API Schemas (schemas.py)

```python
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"          # ← ADD
    due_date: Optional[datetime] = None  # ← ADD
    tag_ids: List[UUID] = []          # ← ADD

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None     # ← ADD
    due_date: Optional[datetime] = None  # ← ADD
    tag_ids: Optional[List[UUID]] = None  # ← ADD

class TaskPublic(BaseModel):
    # ... existing fields ...
    priority: str                     # ← ADD
    due_date: Optional[datetime] = None  # ← ADD
    tags: List[TagPublic] = []        # ← ADD
```

#### 4. Update Service Layer (task_service.py)

```python
def create_task(session, user, title, description, priority, due_date, tag_ids):
    task = Task(
        user_id=user.id,
        title=title,
        description=description,
        priority=priority,        # ← ADD
        due_date=due_date,        # ← ADD
        status="pending"
    )
    # Handle tags...
    session.add(task)
    session.commit()
    return task
```

#### 5. Add Endpoints (routes/tasks.py)

```python
# Already exists - just need to accept new params:
POST /api/tasks
PUT /api/tasks/{id}

# Could add dedicated endpoints:
PUT /api/tasks/{id}/priority
PUT /api/tasks/{id}/due-date
PUT /api/tasks/{id}/tags
GET /api/tasks?priority=high&category=work
GET /api/tasks/search?q=groceries
```

---

## 🚀 Implementation Priority

### Critical (Data Persistence)
**Priority 1 - Must Have for data to persist:**

1. **Add priority field** (30 min)
   - Database column
   - Model update
   - Schema update
   - Service accepts priority
   - ✅ Frontend already works!

2. **Add due_date field** (30 min)
   - Database column
   - Model update
   - Schema update
   - Service accepts due_date
   - ✅ Frontend already works!

3. **Add tags system** (2 hours)
   - New tables (tags, task_tags)
   - Tag model
   - Tag CRUD endpoints
   - Assign tags to tasks
   - ✅ Frontend already works!

**Total: ~3 hours**

### Nice to Have (Advanced Features)
**Priority 2 - Enhanced functionality:**

4. **Search endpoint** (45 min)
   - Backend full-text search
   - Currently works client-side only
   - Better performance for large datasets

5. **Reminders** (1 hour)
   - Background worker
   - Email notifications
   - Frontend already shows overdue

**Total: ~2 hours**

### Advanced (Complex Features)
**Priority 3 - Future work:**

6. **Recurring tasks** (2 hours)
   - Backend logic
   - Auto-create new tasks
   - Frontend doesn't have UI yet

---

## 📝 Summary

### Current State:
- **Frontend:** ✅ 100% Complete (UI, filtering, stats)
- **Backend:** ❌ 0% Phase V features (only basic CRUD)
- **Data Persistence:** ❌ **NOT WORKING** - Priority/category/dueDate are lost on refresh

### Why It Works (Sort Of):
1. Frontend uses **client-side filtering**
2. Frontend adds **default values** when data loads
3. User sees filtered results in current session
4. **BUT** - Changes are lost on page refresh

### What Users Experience:
- ✅ Can set priority/category/dueDate
- ✅ Can filter by these fields
- ❌ **Data doesn't persist** across sessions
- ❌ **Data doesn't sync** across devices
- ❌ **All custom values reset** to defaults on reload

---

## ⏱️ Time Estimates

### Minimal Working Version (Data Persistence)
- Add priority field: 30 min
- Add due_date field: 30 min
- Add tags system: 2 hours
- Testing: 30 min

**Total: ~3.5 hours**

### Complete Phase V Backend
- All above + search + reminders + recurring: ~9 hours

---

## 🎯 Recommendation

**Start with Priority 1 (Data Persistence) - 3.5 hours:**

This will make the existing frontend features actually work and persist data. Frontend is already complete, we just need to add backend support!

**Quick Win: Start with priority + due_date (1 hour)**
- Simple database changes
- Frontend already works
- Immediate impact

---

**Next Step: Implement backend support for priority and due_date?**
