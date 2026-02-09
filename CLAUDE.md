# Claude Code Instructions - AI-Powered Todo Application

**Project:** AI-Powered Todo Application with Chat Interface
**Repository:** https://github.com/NaumanNavaid/Todo-app-phase-2-and-3
**Current Phase:** Phase IV (Complete), Phase V (In Progress)
**Last Updated:** 2026-02-05

---

## 📋 Project Overview

This is a full-stack AI-powered todo application with a chat interface built with:
- **Backend:** FastAPI (Python 3.11) with OpenAI integration
- **Frontend:** Next.js 16 with React 19 and TypeScript
- **Infrastructure:** Docker, Kubernetes (Minikube), Helm Charts
- **AI:** OpenAI GPT-4, OpenAI Agents framework

### Key Features
- JWT-based user authentication
- Natural language todo management via AI chatbot
- Real-time chat interface with streaming responses
- Todo CRUD operations through chat
- Kubernetes deployment with Helm
- Production-ready infrastructure

---

## 🎯 Project Phases

### ✅ Phase II: Backend & Frontend Chat Integration (COMPLETE)
- Implemented chat UI components
- Integrated frontend with backend API
- User authentication (JWT)
- Real-time message streaming
- Deployed backend to Hugging Face Spaces

### ✅ Phase III: AI Chatbot Enhancement (COMPLETE)
- Complete todo CRUD via natural language
- Intent recognition and entity extraction
- Enhanced AI responses
- Todo filtering and search
- Context-aware conversations

### ✅ Phase IV: Local Kubernetes Deployment (COMPLETE)
- Multi-stage Docker builds
- Kubernetes manifests (11 resources)
- Helm charts (13 templates)
- Minikube deployment automation
- Comprehensive documentation (7 guides)
- AI DevOps tools integration (Gordon, kubectl-ai, Kagent)

### 🚧 Phase V: Advanced Cloud Deployment (IN PROGRESS)
- Advanced features (priorities, tags, search, recurring tasks)
- Dapr integration (Pub/Sub, State, Secrets, Bindings)
- Event-driven architecture with Kafka
- Cloud deployment (Azure AKS / Google GKE / Oracle Cloud)
- CI/CD pipeline with GitHub Actions
- Monitoring and logging stack

---

## 📁 Repository Structure

```
Todo-app-phase-2-and-3/
├── backend/                      # FastAPI backend application
│   ├── main.py                   # Application entry point
│   ├── db.py                     # Database connection
│   ├── models.py                 # Database models (SQLModel)
│   ├── schemas.py                # Pydantic schemas
│   ├── config.py                 # Configuration management
│   ├── routes/                   # API route handlers
│   │   ├── auth.py               # Authentication endpoints
│   │   ├── chat.py               # Chat endpoints
│   │   └── tasks.py              # Task CRUD endpoints
│   ├── services/                 # Business logic
│   │   ├── auth_service.py       # Auth logic
│   │   ├── chat_service.py       # Chat logic
│   │   └── task_service.py       # Task logic
│   ├── agents/                   # AI agent implementations
│   │   └── todo_agent.py         # Todo management agent
│   ├── requirements.txt          # Python dependencies
│   └── .env                      # Environment variables (not in git)
│
├── frontend/                     # Next.js frontend application
│   ├── app/                      # Next.js app directory (App Router)
│   │   ├── (auth)/               # Auth route group
│   │   │   ├── login/            # Login page
│   │   │   └── register/         # Registration page
│   │   ├── chat/                 # Chat interface
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Home page
│   ├── components/               # React components
│   │   ├── chat/                 # Chat components
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   └── ChatInput.tsx
│   │   └── ui/                   # UI components
│   ├── contexts/                 # React contexts
│   │   ├── AuthContext.tsx       # Auth state management
│   │   └── ChatContext.tsx       # Chat state management
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts            # Auth hook
│   │   └── useChat.ts            # Chat hook
│   ├── lib/                      # Utility functions
│   │   ├── api.ts                # API client
│   │   ├── types.ts              # TypeScript types
│   │   └── utils.ts              # Utilities
│   ├── package.json              # Node dependencies
│   ├── next.config.ts            # Next.js config (standalone output)
│   └── .env.local                # Environment variables (not in git)
│
├── infrastructure/               # Phase IV & V: Deployment infrastructure
│   ├── docker/                   # Docker configurations
│   │   ├── backend/Dockerfile    # Backend multi-stage build
│   │   └── frontend/Dockerfile   # Frontend multi-stage build
│   ├── k8s/                      # Kubernetes raw manifests
│   │   └── base/                 # Base Kubernetes resources
│   ├── helm/                     # Helm charts
│   │   └── todo-app/             # Todo application Helm chart
│   │       ├── Chart.yaml        # Helm chart metadata
│   │       ├── values.yaml       # Default configuration
│   │       ├── values-minikube.yaml  # Minikube-specific values
│   │       └── templates/        # Kubernetes templates (13 files)
│   ├── scripts/                  # Deployment automation scripts
│   │   ├── build.sh              # Build Docker images
│   │   ├── deploy-helm.sh        # Deploy with Helm
│   │   ├── delete-helm.sh        # Uninstall Helm release
│   │   ├── deploy-minikube.sh    # Deploy raw manifests
│   │   └── validate.sh           # Validate deployment
│   └── docs/                     # Infrastructure documentation
│       ├── PHASE_IV_SPEC.md
│       ├── PHASE_IV_COMPLETION_REPORT.md
│       ├── PHASE_IV_ACHIEVEMENTS_AND_REUSE.md
│       ├── PHASE_IV_FINAL_SUMMARY.md
│       ├── PHASE_V_DETAILED_ROADMAP.md
│       ├── AI_DEVOPS_TOOLS_GUIDE.md
│       ├── DEPLOYMENT_GUIDE.md
│       ├── TROUBLESHOOTING.md
│       └── SUBMISSION_REQUIREMENTS_ANALYSIS.md
│
├── specs/                        # Phase specifications
│   ├── PHASE_II_SPEC.md          # Phase II specification
│   ├── PHASE_III_SPEC.md         # Phase III specification
│   ├── PHASE_IV_SPEC.md          # Phase IV specification
│   └── PHASE_V_SPEC.md           # Phase V specification
│
├── docker-compose.yml            # Local development compose file
├── README.md                     # Project documentation
├── CLAUDE.md                     # This file - Claude Code instructions
├── .gitignore                    # Git ignore rules
└── .claude/                      # Claude Code configuration
```

---

## 🛠️ Technology Stack

### Backend
- **Framework:** FastAPI 0.104+
- **Language:** Python 3.11
- **Database:** PostgreSQL 14+ with SQLModel
- **Authentication:** JWT (python-jose)
- **AI Integration:** OpenAI API (openai>=1.93.1), OpenAI Agents (openai-agents==0.2.0)
- **Validation:** Pydantic 2.10+
- **CORS:** python-cors
- **Server:** Uvicorn

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **State:** React Context API + Hooks
- **HTTP:** Fetch API

### Infrastructure
- **Containerization:** Docker (multi-stage builds)
- **Orchestration:** Kubernetes (Minikube for local)
- **Package Manager:** Helm 3
- **CI/CD:** GitHub Actions (planned for Phase V)
- **Monitoring:** Prometheus + Grafana (planned)

---

## 🔧 Development Setup

### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL 14+ (or use Docker)
- Docker & Docker Compose
- Minikube (for Kubernetes deployment)
- kubectl (Kubernetes CLI)
- Helm 3 (for Helm charts)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your configuration:
# DATABASE_URL=postgresql://user:password@localhost:5432/tododb
# SECRET_KEY=your-secret-key-here
# OPENAI_API_KEY=your-openai-api-key

# Run database migrations (if needed)
# python -c "from db import init_db; init_db()"

# Start development server
uvicorn main:app --reload --port 8000
```

Backend will be available at http://localhost:8000
API Docs: http://localhost:8000/docs (Swagger UI)

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

Frontend will be available at http://localhost:3000

---

## 🐳 Docker Development

### Backend Docker

```bash
cd backend
docker build -t todo-backend:latest .
docker run -p 8000:8000 --env-file .env todo-backend:latest
```

### Frontend Docker

```bash
# Use the Dockerfile in infrastructure/
docker build -f infrastructure/docker/frontend/Dockerfile -t todo-frontend:latest frontend
docker run -p 3000:3000 todo-frontend:latest
```

### Docker Compose

```bash
# Run entire stack with docker-compose
docker-compose up

# Stop
docker-compose down
```

---

## ☸️ Kubernetes Deployment (Phase IV)

### Deploy to Minikube

```bash
# Start Minikube
minikube start --driver=docker --cpus=2 --memory=4096

# Navigate to infrastructure
cd infrastructure

# Build images
./scripts/build.sh

# Deploy with Helm (recommended)
./scripts/deploy-helm.sh

# Or deploy raw manifests
./scripts/deploy-minikube.sh

# Get access URLs
minikube ip
# Frontend: http://<minikube-ip>:30000
# Backend: http://<minikube-ip>:30001

# Delete deployment
./scripts/delete-helm.sh
```

### Helm Commands

```bash
# Install chart
helm install todo-app helm/todo-app \
  --namespace todo-app \
  --create-namespace \
  --values helm/todo-app/values-minikube.yaml

# Upgrade chart
helm upgrade todo-app helm/todo-app \
  --namespace todo-app \
  --values helm/todo-app/values-minikube.yaml

# Check status
helm status todo-app -n todo-app

# Uninstall
helm uninstall todo-app -n todo-app
```

---

## 📝 Code Guidelines

### Backend Guidelines

1. **Use Pydantic for Validation**
   ```python
   from pydantic import BaseModel, Field
   from datetime import datetime

   class TaskCreate(BaseModel):
       title: str = Field(..., min_length=1, max_length=200)
       description: str | None = None
       priority: str = Field(default="medium", pattern="^(low|medium|high)$")
   ```

2. **Use SQLModel for Database**
   ```python
   from sqlmodel import SQLModel, Field, Relationship
   from typing import Optional

   class Task(SQLModel, table=True):
       id: Optional[int] = Field(default=None, primary_key=True)
       title: str
       completed: bool = False
       user_id: int = Field(foreign_key="user.id")
   ```

3. **Use Services for Business Logic**
   - Keep routes thin (just request/response handling)
   - Put business logic in `services/` directory
   - Use dependency injection for services

4. **Error Handling**
   ```python
   from fastapi import HTTPException, status

   @app.post("/api/tasks")
   async def create_task(task: TaskCreate, db: Session = Depends(get_db)):
       try:
           return task_service.create(task, db)
       except ValueError as e:
           raise HTTPException(status_code=400, detail=str(e))
   ```

### Frontend Guidelines

1. **Use TypeScript Strict Mode**
   - Always define types for props
   - Use TypeScript for API responses
   - Avoid `any` type

2. **Use App Router Conventions**
   - Use `app/` directory structure
   - Use server components by default
   - Use client components (`"use client"`) when needed

3. **State Management**
   - Use React Context for global state
   - Keep component state local when possible
   - Use custom hooks for reusable logic

4. **API Calls**
   - Use the centralized API client in `lib/api.ts`
   - Handle errors gracefully
   - Show loading states

5. **Styling**
   - Use Tailwind CSS utility classes
   - Follow mobile-first approach
   - Ensure responsive design

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Manual Testing Checklist

**Authentication:**
- [ ] User registration works
- [ ] User login works
- [ ] Protected routes require auth
- [ ] Logout works

**Todo Management:**
- [ ] Create todo via UI
- [ ] Create todo via chat
- [ ] List todos
- [ ] Update todo
- [ ] Delete todo
- [ ] Toggle completion

**Chat Functionality:**
- [ ] Send message
- [ ] Receive response
- [ ] View history
- [ ] Clear history

---

## 📊 API Documentation

Interactive API documentation available at:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Key Endpoints

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

**Todos:**
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get specific task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `PATCH /api/tasks/{id}/toggle` - Toggle completion

**Chat:**
- `POST /api/{user_id}/chat` - Send message to AI
- `GET /api/{user_id}/chat/history` - Get chat history
- `DELETE /api/{user_id}/chat/clear` - Clear history

---

## 🚢 Deployment URLs

### Current Deployments

**Backend:**
- URL: https://nauman-19-todo-app-backend.hf.space
- Platform: Hugging Face Spaces
- Status: ✅ Deployed

**Frontend:**
- URL: (To be added after Vercel deployment)
- Platform: Vercel
- Status: ✅ Deployed

---

## 🔐 Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tododb

# Authentication
SECRET_KEY=your-super-secret-key-change-in-production

# AI
OPENAI_API_KEY=sk-your-openai-api-key-here

# CORS
CORS_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
```

### Frontend (.env.local)
```bash
# API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
# For production: NEXT_PUBLIC_API_URL=https://nauman-19-todo-app-backend.hf.space
```

---

## 📚 Important Documentation

- [Phase II Spec](specs/PHASE_II_SPEC.md) - Backend & Frontend Integration
- [Phase III Spec](specs/PHASE_III_SPEC.md) - AI Chatbot Enhancement
- [Phase IV Spec](specs/PHASE_IV_SPEC.md) - Kubernetes Deployment
- [Phase V Spec](specs/PHASE_V_SPEC.md) - Advanced Cloud Deployment Roadmap
- [Deployment Guide](infrastructure/docs/DEPLOYMENT_GUIDE.md) - Step-by-step deployment
- [Troubleshooting](infrastructure/docs/TROUBLESHOOTING.md) - Common issues and solutions
- [AI DevOps Tools](infrastructure/docs/AI_DEVOPS_TOOLS_GUIDE.md) - Gordon, kubectl-ai, Kagent

---

## 🎯 Current Development Status

### Completed
- ✅ Phase II: Backend & Frontend Integration
- ✅ Phase III: AI Chatbot with Todo CRUD
- ✅ Phase IV: Kubernetes Deployment with Helm

### In Progress
- 🚧 Phase V: Advanced Cloud Deployment
  - Part A: Advanced Features (priorities, tags, search, recurring)
  - Part B: Dapr Integration
  - Part C: Cloud Deployment (Azure/GCP/Oracle)

---

## 🆘 Common Issues & Solutions

### Issue 1: Frontend can't connect to backend
**Solution:** Ensure `NEXT_PUBLIC_API_URL` is set correctly in `.env.local`

### Issue 2: CORS errors
**Solution:** Add frontend URL to `CORS_ORIGINS` in backend `.env`

### Issue 3: Database connection fails
**Solution:** Check PostgreSQL is running and `DATABASE_URL` is correct

### Issue 4: Minikube deployment fails
**Solution:** Check Minikube is running (`minikube status`) and has enough resources

### Issue 5: Docker build fails
**Solution:** Ensure Docker daemon is running and you have sufficient disk space

---

## 🤝 Contributing with Claude Code

When working on this project:

1. **Read the specs first** - Check `/specs` folder for phase requirements
2. **Follow code guidelines** - Adhere to backend and frontend conventions
3. **Test your changes** - Run tests and manual testing checklist
4. **Update documentation** - Keep docs in sync with code changes
5. **Use existing patterns** - Follow established patterns in the codebase

### For Phase V Work:
- Reference [Phase V Roadmap](infrastructure/docs/PHASE_V_DETAILED_ROADMAP.md)
- Focus on one part at a time (A → B → C)
- Test Dapr components locally before cloud deployment
- Document all infrastructure changes

---

## 📞 Support & Resources

- **GitHub Issues:** https://github.com/NaumanNavaid/Todo-app-phase-2-and-3/issues
- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **Next.js Docs:** https://nextjs.org/docs
- **Kubernetes Docs:** https://kubernetes.io/docs/
- **Helm Docs:** https://helm.sh/docs/
- **Dapr Docs:** https://docs.dapr.io/

---

**Happy Coding! 🚀**

For questions or issues, refer to the documentation in `/infrastructure/docs/` or check the specs in `/specs/`.
