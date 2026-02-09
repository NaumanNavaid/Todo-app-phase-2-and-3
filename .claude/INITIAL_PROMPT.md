# 🚀 Initial Prompt for Claude - When Starting in This Repository

**Copy and paste this prompt when starting a new Claude session in this repository:**

---

## 📋 Project Context

You are working in the **AI-Powered Todo Application** repository, a full-stack application with FastAPI backend, Next.js frontend, and Kubernetes infrastructure.

**Repository:** https://github.com/NaumanNavaid/Todo-app-phase-2-and-3

**Current Phase:** Phase IV Complete, Phase V In Progress

---

## 🎯 What This Project Does

This is an AI-powered todo application with:
- **Backend:** FastAPI with OpenAI integration for chatbot
- **Frontend:** Next.js 16 with React 19
- **Infrastructure:** Docker, Kubernetes (Minikube), Helm Charts
- **Key Feature:** Natural language todo management via AI chat

---

## ✅ Current Status

### Completed Phases (II, III, IV):
- ✅ Phase II: Backend & Frontend chat integration
- ✅ Phase III: AI chatbot with todo CRUD operations
- ✅ Phase IV: Kubernetes deployment with Helm charts
- ✅ Complete Docker multi-stage builds
- ✅ Deployed backend to Hugging Face Spaces
- ✅ Deployed frontend to Vercel

### In Progress:
- 🚧 Phase V: Advanced features (priority, tags, due dates, recurring tasks, Dapr, cloud deployment)

### Critical Discovery:
**Frontend has ALL Phase V features implemented but backend does NOT support them!**

- Frontend: Priority, category, due date filtering works (client-side)
- Backend: Only basic CRUD (title, description, status)
- Problem: Priority/category/dueDate are NOT persisted to database
- Frontend uses hardcoded defaults: `priority='medium'`, `category='Other'`

---

## 📁 Repository Structure

```
Todo-app-phase-2-and-3/
├── backend/                    # FastAPI backend
│   ├── models.py              # Database models (SQLModel)
│   ├── schemas.py             # Pydantic schemas
│   ├── routes/                # API endpoints
│   ├── services/              # Business logic
│   └── main.py                # FastAPI app entry
│
├── frontend/                   # Next.js frontend
│   ├── app/                   # App Router pages
│   ├── components/            # React components
│   ├── hooks/                 # Custom hooks (useTodos.ts)
│   ├── lib/types.ts           # TypeScript types
│   └── lib/api-client.ts      # API client
│
├── infrastructure/             # Phase IV & V
│   ├── docker/                # Dockerfiles
│   ├── k8s/                   # Kubernetes manifests
│   ├── helm/todo-app/         # Helm charts (13 templates)
│   ├── scripts/               # Deployment scripts
│   └── docs/                  # Documentation (7 guides)
│
├── specs/                      # Phase specifications
│   ├── PHASE_II_SPEC.md       # Backend & frontend integration
│   ├── PHASE_III_SPEC.md      # AI chatbot
│   ├── PHASE_IV_SPEC.md       # Kubernetes deployment
│   └── PHASE_V_SPEC.md        # Cloud deployment roadmap
│
├── CLAUDE.md                   # Claude Code instructions
├── README.md                   # Project documentation
└── docker-compose.yml          # Local development
```

---

## 🛠️ Technology Stack

### Backend
- **Framework:** FastAPI (Python 3.11)
- **Database:** PostgreSQL with SQLModel
- **AI:** OpenAI API (openai>=1.93.1), openai-agents (0.2.0)
- **Auth:** JWT (python-jose)
- **Validation:** Pydantic 2.10+

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, TypeScript 5
- **Styling:** Tailwind CSS 4
- **State:** React Context + Hooks

### Infrastructure
- **Container:** Docker (multi-stage builds)
- **Orchestration:** Kubernetes (Minikube)
- **Package Manager:** Helm 3
- **CI/CD:** GitHub Actions (planned)

---

## 🚀 Deployed URLs

- **Backend API:** https://nauman-19-todo-app-backend.hf.space
- **Frontend:** https://todo-app-phase-2-and-3.vercel.app
- **API Docs:** https://nauman-19-todo-app-backend.hf.space/docs

---

## 🎯 Current Priority: Phase V Backend Implementation

### What's Needed:

The frontend has filtering by priority, category, and dueDate WORKING, but the backend doesn't save these fields.

### Database Schema Changes Needed:

```python
# Current Task model (backend/models.py):
class Task(SQLModel, table=True):
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    status: str  # "pending", "in_progress", "done", "cancelled"
    created_at: datetime
    updated_at: datetime

# NEEDS TO ADD:
class Task(SQLModel, table=True):
    # ... existing fields ...
    priority: str = Field(default="medium")  # "low", "medium", "high", "urgent"
    due_date: Optional[datetime] = None
    reminder_sent: bool = Field(default=False)
    recurring_type: str = Field(default="none")  # "none", "daily", "weekly", "monthly"
    recurring_end_date: Optional[datetime] = None
```

### Tags System Needed:

```python
# New tables needed:
class Tag(SQLModel, table=True):
    id: UUID
    user_id: UUID
    name: str  # "Work", "Shopping", etc.
    color: str  # "#FF5733", etc.

class TaskTag(SQLModel, table=True):
    task_id: UUID  # Junction table
    tag_id: UUID
```

---

## 📚 Key Documentation Files

1. **[CLAUDE.md](CLAUDE.md)** - Complete Claude Code instructions
2. **[specs/](specs/)** - All phase specifications
3. **[infrastructure/docs/PHASE_V_DATABASE_SCHEMA_CHANGES.md](infrastructure/docs/PHASE_V_DATABASE_SCHEMA_CHANGES.md)** - Detailed schema changes
4. **[infrastructure/docs/PHASE_V_BACKEND_ANALYSIS.md](infrastructure/docs/PHASE_V_BACKEND_ANALYSIS.md)** - Backend analysis
5. **[infrastructure/docs/PHASE_V_FRONTEND_VS_BACKEND_ANALYSIS.md](infrastructure/docs/PHASE_V_FRONTEND_VS_BACKEND_ANALYSIS.md)** - Frontend vs backend comparison
6. **[infrastructure/docs/PHASE_V_DETAILED_ROADMAP.md](infrastructure/docs/PHASE_V_DETAILED_ROADMAP.md)** - Complete Phase V roadmap

---

## 🎯 When Working on This Project:

1. **ALWAYS read the relevant spec file first** from `/specs/` folder
2. **Check existing code** before making changes
3. **Follow the established patterns** in routes, services, schemas
4. **Update both models AND schemas** when adding fields
5. **Test with deployed backend** at https://nauman-19-todo-app-backend.hf.space/docs
6. **Frontend already has UI** - just needs backend support for data persistence

---

## 🔧 Common Commands

### Backend Development:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend Development:
```bash
cd frontend
npm install
npm run dev
```

### Kubernetes Deployment:
```bash
cd infrastructure
./scripts/build.sh
./scripts/deploy-helm.sh
```

---

## 🚨 Important Notes

- **Frontend expects** priority, category, dueDate fields
- **Backend only has** title, description, status currently
- **This is why** data doesn't persist across page refreshes
- **Solution:** Add missing fields to backend database and API

---

## 📖 How to Use This Prompt

1. **Copy this entire prompt**
2. **Paste it when starting a new Claude session**
3. **Claude will have full context** about the project
4. **Refer to documentation files** for detailed specs

---

## 🎓 Quick Reference

### Current Database Fields (backend/models.py):
- `tasks` table: id, user_id, title, description, status, created_at, updated_at
- `users` table: id, email, name, password_hash, created_at
- `conversations` table: id, user_id, title, created_at, updated_at
- `messages` table: id, conversation_id, role, content, created_at

### Frontend Types (frontend/lib/types.ts):
```typescript
interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  status: 'pending' | 'in_progress' | 'done' | 'cancelled';
  priority: 'high' | 'medium' | 'low';  // ← Backend missing
  category: string;                      // ← Backend missing
  dueDate?: Date;                        // ← Backend missing
  createdAt: Date;
  updatedAt: Date;
  order: number;
}
```

### API Endpoints:
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/tasks` - List tasks (filter by status)
- `POST /api/tasks` - Create task
- `GET /api/tasks/{id}` - Get task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `PATCH /api/tasks/{id}/toggle` - Toggle status
- `POST /api/{user_id}/chat` - Chat with AI

---

**You are now ready to work on this project! Start by reading the relevant spec files and documentation.**