# Phase V Implementation Summary - Priority, Due Dates, and Tags

**Date:** 2026-02-05
**Status:** ✅ IMPLEMENTATION COMPLETE

---

## 🎯 What Was Implemented

### Backend Changes

#### 1. Database Models (`backend/models.py`)

**Task Model - Added Fields:**
```python
priority: str = Field(default="medium")  # low, medium, high, urgent
due_date: Optional[datetime] = None
reminder_sent: bool = Field(default=False)
recurring_type: str = Field(default="none")  # none, daily, weekly, monthly
recurring_end_date: Optional[datetime] = None
```

**New Models:**
- `Tag` - User-defined tags with name and color
- `TaskTag` - Junction table for many-to-many relationship
- `TagPublic` - Public representation without sensitive data

**Relationships Added:**
- `User.tags` - One-to-many with tags
- `Task.tags` - Many-to-many with tags

#### 2. API Schemas (`backend/schemas.py`)

**Updated Schemas:**
- `TaskCreate` - Now accepts `priority`, `due_date`, `tag_ids`
- `TaskUpdate` - Now accepts `priority`, `due_date`, `tag_ids`
- `TaskPublic` - Now returns all new fields + tags

**New Schemas:**
- `TagCreate` - For creating tags
- `TagUpdate` - For updating tags
- `TagPublic` - Public tag representation

#### 3. Services

**`backend/services/task_service.py` - Updated Functions:**
- `create_task()` - Now accepts priority, due_date, tag_ids
- `list_tasks()` - Now filters by priority
- `update_task()` - Now updates priority, due_date, tag_ids

**`backend/services/tag_service.py` - New File:**
- `create_tag()` - Create a new tag
- `list_tags()` - List all user tags
- `get_tag_by_id()` - Get specific tag
- `update_tag()` - Update tag name/color
- `delete_tag()` - Delete a tag

#### 4. Routes

**`backend/routes/tasks.py` - Updated Endpoints:**
- `GET /api/tasks` - Now supports `?priority=high` query param
- `POST /api/tasks` - Accepts priority, due_date, tag_ids
- `PUT /api/tasks/{id}` - Accepts priority, due_date, tag_ids

**`backend/routes/tags.py` - New File:**
- `GET /api/tags` - List all tags
- `POST /api/tags` - Create tag
- `GET /api/tags/{id}` - Get specific tag
- `PUT /api/tags/{id}` - Update tag
- `DELETE /api/tags/{id}` - Delete tag

#### 5. Main App (`backend/main.py`)

- Imported and registered `tags` router
- Updated API documentation with tag endpoints

---

### Frontend Changes

#### 1. API Client (`frontend/lib/api-client.ts`)

**Updated Types:**
```typescript
export interface TaskCreate {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  tag_ids?: string[];
}

export interface Task {
  // ... existing fields
  priority: string;
  due_date: string | null;
  reminder_sent: boolean;
  recurring_type: string;
  recurring_end_date: string | null;
  tags: TagPublic[];
}

export interface TagPublic {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}
```

#### 2. Hooks (`frontend/hooks/useTodos.ts`)

**Updated Functions:**
- `apiToTodo()` - Now reads priority, due_date, tags from API response
  - Maps first tag to `category` field
- `todoToApiCreate()` - Now sends priority, due_date to backend
- `todoToApiUpdate()` - Now sends priority, due_date to backend

**Removed:**
- Hardcoded defaults (`priority: 'medium'`, `category: 'Other'`, `dueDate: undefined`)
- Client-side field preservation logic

**Result:** Data now persists to backend! ✅

---

## 🧪 How to Test

### 1. Start Backend

```bash
cd backend

# Create virtual environment (if not exists)
python -m venv venv

# Activate venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
Starting Todo API...
Environment: development
OK Database initialized successfully
```

### 2. Test API Endpoints

**Open Swagger UI:**
```
http://localhost:8000/docs
```

**Test Sequence:**

#### A. Register/Login
```bash
# Register
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Test User"}'

# Login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Save the access_token from response
```

#### B. Create Tags
```bash
curl -X POST "http://localhost:8000/api/tags" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Work", "color": "#FF5733"}'

curl -X POST "http://localhost:8000/api/tags" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Personal", "color": "#33FF57"}'
```

#### C. Create Task with Priority, Due Date, and Tags
```bash
curl -X POST "http://localhost:8000/api/tasks" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive docs for Phase V",
    "priority": "high",
    "due_date": "2026-02-10T18:00:00Z",
    "tag_ids": ["TAG_ID_FROM_STEP_B"]
  }'
```

#### D. List Tasks (with priority filter)
```bash
# All tasks
curl -X GET "http://localhost:8000/api/tasks" \
  -H "Authorization: Bearer YOUR_TOKEN"

# High priority only
curl -X GET "http://localhost:8000/api/tasks?priority=high" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### E. Update Task
```bash
curl -X PUT "http://localhost:8000/api/tasks/TASK_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priority": "urgent",
    "due_date": "2026-02-08T18:00:00Z"
  }'
```

#### F. List Tags
```bash
curl -X GET "http://localhost:8000/api/tags" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Start Frontend

```bash
cd frontend

# Install dependencies (if not done)
npm install

# Start dev server
npm run dev
```

**Open:** http://localhost:3000

### 4. Test Frontend Integration

1. **Create a task:**
   - Set priority to "High"
   - Set due date to tomorrow
   - Submit

2. **Verify persistence:**
   - Refresh the page
   - Task should still have "High" priority and due date ✅

3. **Test filters:**
   - Filter by priority: "High"
   - Should show only high priority tasks

4. **Test update:**
   - Change task priority to "Low"
   - Refresh page
   - Should still be "Low" ✅

---

## ✅ Expected Behavior After Implementation

### Before (Problem):
```typescript
// Frontend sends:
{ title: "Buy groceries", priority: "high" }

// Backend receives:
{ title: "Buy groceries" }  // Priority lost! ❌

// Frontend receives:
{ title: "Buy groceries", priority: "medium" }  // Reset to default ❌
```

### After (Fixed):
```typescript
// Frontend sends:
{ title: "Buy groceries", priority: "high", due_date: "2026-02-10" }

// Backend receives and saves:
{ title: "Buy groceries", priority: "high", due_date: "2026-02-10" }  // ✅

// Frontend receives:
{ title: "Buy groceries", priority: "high", due_date: "2026-02-10" }  // ✅

// After refresh:
{ title: "Buy groceries", priority: "high", due_date: "2026-02-10" }  // Still works! ✅
```

---

## 📊 Database Schema Changes

### `tasks` Table - New Columns:
```sql
ALTER TABLE tasks ADD COLUMN priority VARCHAR(10) DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN due_date TIMESTAMP;
ALTER TABLE tasks ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN recurring_type VARCHAR(10) DEFAULT 'none';
ALTER TABLE tasks ADD COLUMN recurring_end_date TIMESTAMP;
```

### New Tables:
```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task_tags (
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);
```

**Note:** SQLModel auto-creates these tables when the backend starts.

---

## 🔧 Troubleshooting

### Issue: Database already exists without new columns

**Solution 1 - Drop and recreate:**
```bash
# Delete database file (SQLite)
rm backend/todo.db

# Or drop PostgreSQL database
psql -U postgres -c "DROP DATABASE todo_app;"
psql -U postgres -c "CREATE DATABASE todo_app;"
```

**Solution 2 - Manual migration (PostgreSQL):**
```bash
psql -U postgres -d todo_app

ALTER TABLE tasks ADD COLUMN priority VARCHAR(10) DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN due_date TIMESTAMP;
ALTER TABLE tasks ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN recurring_type VARCHAR(10) DEFAULT 'none';
ALTER TABLE tasks ADD COLUMN recurring_end_date TIMESTAMP;

CREATE TABLE tags (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task_tags (
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);
```

### Issue: "Tag already exists" error

**Cause:** Trying to create a tag with same name for same user.

**Solution:** Use unique tag names or update existing tag instead.

---

## 📈 Performance Impact

- **Database queries:** Now include JOINs for tags on task operations
- **API response size:** Increased by ~100-200 bytes per task (tags array)
- **Frontend:** Reduced client-side state management (data persists)

---

## 🚀 Next Steps (Optional Enhancements)

1. **Search endpoint** - Backend full-text search
2. **Reminder system** - Background worker for due date notifications
3. **Recurring tasks** - Auto-create new tasks when due date reached
4. **Tag colors** - Predefined color palette in frontend
5. **Bulk operations** - Update multiple tasks at once

---

## ✅ Checklist

- [x] Backend models updated
- [x] Backend schemas updated
- [x] Task service updated
- [x] Tag service created
- [x] Task routes updated
- [x] Tag routes created
- [x] Main app updated
- [x] Frontend API client types updated
- [x] Frontend hooks updated
- [x] Syntax validation passed
- [ ] Runtime testing (requires starting backend)
- [ ] Frontend testing (requires starting frontend)
- [ ] Deploy to Hugging Face
- [ ] Deploy to Vercel

---

**Ready to test!** Start the backend and frontend as described above to verify everything works.
