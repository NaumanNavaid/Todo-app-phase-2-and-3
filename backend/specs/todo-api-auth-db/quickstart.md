# Quickstart: Todo API Development

**Feature**: todo-api-auth-db
**Last Updated**: 2026-01-20

---

## Prerequisites

- Python 3.11+
- Neon PostgreSQL account (free tier works)
- Git

---

## 1. Environment Setup

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Environment Variables

Create `.env` file:

```bash
# Database
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# JWT Secret (generate with: python -c "import secrets; print(secrets.token_urlsafe(32))")
SECRET_KEY=your-secret-key-here

# CORS (for local development)
CORS_ORIGINS=["http://localhost:3000"]

# Environment
ENVIRONMENT=development
```

### Get Neon Database URL

1. Go to [neon.tech](https://neon.tech)
2. Create free account
3. Create new project
4. Copy connection string
5. Add `?sslmode=require` to the URL

---

## 2. Database Setup

### Run Migrations

```bash
python scripts/init_db.py
```

This will:
- Create `users` table
- Create `tasks` table
- Create indexes

### Verify Database

```bash
python scripts/test_db.py
```

---

## 3. Run Development Server

```bash
uvicorn main:app --reload --port 8000
```

Server starts at `http://localhost:8000`

### API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

---

## 4. Test the API

### Register User

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"Test User"}'
```

Response:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Test User",
  "created_at": "2026-01-20T..."
}
```

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

Response:
```json
{
  "access_token": "eyJ0...",
  "token_type": "bearer",
  "user": {...}
}
```

### Create Task (authenticated)

```bash
TOKEN="your-access-token"

curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn FastAPI"}'
```

### List Tasks

```bash
curl http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN"
```

### Toggle Task Status

```bash
curl -X PATCH http://localhost:8000/api/tasks/{task_id}/toggle \
  -H "Authorization: Bearer $TOKEN"
```

---

## 5. Project Structure

```
backend/
├── main.py                 # FastAPI app entry
├── db.py                   # Database connection
├── models.py               # SQLModel models
├── schemas.py              # Pydantic schemas
├── auth.py                 # JWT utilities
├── exceptions.py           # Custom exceptions
├── config.py               # Configuration
├── routes/
│   ├── auth.py            # Auth endpoints
│   └── tasks.py           # Task endpoints
├── services/
│   ├── auth_service.py    # Auth business logic
│   └── task_service.py    # Task business logic
├── middleware/
│   └── auth.py            # JWT validation
├── scripts/
│   ├── init_db.py         # Database setup
│   └── test_db.py         # DB connection test
├── tests/
│   ├── test_auth.py
│   ├── test_tasks.py
│   └── conftest.py
├── .env                    # Environment variables (create this)
├── requirements.txt        # Dependencies
└── README.md
```

---

## 6. Development Workflow

### Make Changes

1. Edit source files
2. Server auto-reloads (uvicorn --reload)
3. Test via Swagger UI or curl

### Run Tests

```bash
pytest tests/ -v --cov=.
```

### Linting

```bash
black .
flake8 .
mypy .
```

---

## 7. Common Issues

### Database Connection Error

**Problem**: `connection to server at "..." failed`

**Solution**:
- Verify `DATABASE_URL` in `.env`
- Check Neon console - database might be sleeping (wake it up)
- Ensure `?sslmode=require` is in URL

### JWT Validation Error

**Problem**: `Could not validate credentials`

**Solution**:
- Verify `SECRET_KEY` in `.env`
- Check token hasn't expired (24 hour lifetime)
- Ensure `Authorization: Bearer <token>` header format

### CORS Error in Frontend

**Problem**: `No 'Access-Control-Allow-Origin' header`

**Solution**:
- Add frontend URL to `CORS_ORIGINS` in `.env`
- Use exact match (no trailing slash)

---

## 8. Production Deployment

### Environment Variables

```bash
ENVIRONMENT=production
SECRET_KEY=<strong-random-key>
DATABASE_URL=<production-neon-url>
CORS_ORIGINS=["https://your-frontend.com"]
```

### Run with Gunicorn

```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Health Check

```bash
curl http://your-api.com/health
```

---

## 9. Next Steps

- ✅ Phase 1: Basic auth + task CRUD
- ⏳ Phase 2: Enhanced error handling
- ⏳ Phase 3: Token refresh, password reset

---

**Need help?** Check the [spec](./spec.md) or [plan](./plan.md) for details.
