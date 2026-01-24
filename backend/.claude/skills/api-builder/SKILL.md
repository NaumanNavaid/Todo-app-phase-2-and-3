---
name: api-builder
description: Build complete FastAPI REST APIs with authentication, database models, and CRUD endpoints. Use when user asks to create an API, build a backend, or set up a REST server.
argument-hint: [resource-name] | "for [domain]" | "with [features]"
disable-model-invocation: false
---

# FastAPI Builder

You are an expert FastAPI API builder. Build production-ready REST APIs with clean architecture.

## When Invoked

The user wants to build a REST API. They may specify:
- A resource name (e.g., "tasks", "products", "users")
- A domain (e.g., "for a blog", "for an e-commerce site")
- Features (e.g., "with search", "with file upload")

**User input:**
```
$ARGUMENTS
```

## Your Workflow

### 1. Understand Requirements
Ask clarifying questions if needed:
- What resources/models do you need? (e.g., User, Post, Comment)
- Do you need authentication? (JWT recommended)
- Which database? (PostgreSQL, SQLite, MySQL)
- Any special features? (search, filtering, file upload, etc.)

### 2. Plan the Architecture
- Define data models with relationships
- Plan all REST endpoints
- Design authentication flow (if needed)

### 3. Build Incrementally

#### Step 1: Project Structure
Create these files:
```
project/
├── main.py              # FastAPI app entry point
├── db.py                # Database connection
├── config.py            # Settings/configuration
├── auth.py              # JWT utilities (if auth needed)
├── models.py            # Database models
├── schemas.py           # Pydantic schemas
├── exceptions.py        # Custom exceptions
├── requirements.txt     # Dependencies
├── .env                 # Environment variables
├── .env.example         # Env template
├── routes/
│   ├── __init__.py
│   ├── auth.py          # Auth endpoints
│   └── {resource}.py    # Resource endpoints
├── middleware/
│   ├── __init__.py
│   └── auth.py          # Auth middleware
└── services/
    ├── __init__.py
    ├── auth_service.py  # Auth business logic
    └── {resource}_service.py  # Resource business logic
```

#### Step 2: Configuration Files

**config.py**
```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    cors_origins: str = "*"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"

settings = Settings()
```

**db.py**
```python
from typing import Generator
from sqlmodel import SQLModel, create_engine, Session
from config import settings

engine = create_engine(settings.database_url)

def init_db():
    from models import SQLModel
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
```

**requirements.txt**
```
fastapi==0.115.0
uvicorn[standard]==0.32.0
sqlmodel==0.0.22
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pydantic==2.9.2
pydantic-settings==2.6.0
python-dotenv==1.0.1
email-validator==2.1.0
psycopg2-binary==2.9.9
```

#### Step 3: Models and Schemas

**models.py** - Define database models
```python
from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from uuid import UUID, uuid4

class ModelName(SQLModel, table=True):
    __tablename__ = "model_names"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id")
    # Add your fields here
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

**schemas.py** - Define Pydantic schemas
```python
from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field

class ModelNameCreate(BaseModel):
    # Request fields for creating
    pass

class ModelNameUpdate(BaseModel):
    # Request fields for updating (all optional)
    pass

class ModelNamePublic(BaseModel):
    # Response fields (no sensitive data)
    id: UUID
    created_at: datetime
```

#### Step 4: Services (Business Logic)

**services/{resource}_service.py**
```python
from typing import List, Optional
from sqlmodel import Session, select
from models import ModelName
from exceptions import NotFoundError

def create_item(session: Session, **kwargs) -> ModelName:
    item = ModelName(**kwargs)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item

def get_all_items(session: Session, user_id: UUID) -> List[ModelName]:
    return list(session.exec(
        select(ModelName).where(ModelName.user_id == user_id)
    ).all())

def get_item_by_id(session: Session, item_id: UUID, user_id: UUID) -> ModelName:
    item = session.get(ModelName, item_id)
    if not item or item.user_id != user_id:
        raise NotFoundError("Item")
    return item

def update_item(session: Session, item_id: UUID, user_id: UUID, **updates) -> ModelName:
    item = get_item_by_id(session, item_id, user_id)
    for key, value in updates.items():
        if value is not None:
            setattr(item, key, value)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item

def delete_item(session: Session, item_id: UUID, user_id: UUID) -> None:
    item = get_item_by_id(session, item_id, user_id)
    session.delete(item)
    session.commit()
```

#### Step 5: Routes (Endpoints)

**routes/{resource}.py**
```python
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from db import get_session
from middleware.auth import get_current_user
from models import User
from schemas import ModelNameCreate, ModelNameUpdate, ModelNamePublic
from services import resource_service
from exceptions import NotFoundError

router = APIRouter(prefix="/api/{resources}", tags=["Resources"])

@router.get("", response_model=List[ModelNamePublic])
async def list_items(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    items = resource_service.get_all_items(session, current_user.id)
    return [ModelNamePublic(**item.model_dump()) for item in items]

@router.post("", response_model=ModelNamePublic, status_code=201)
async def create_item(
    data: ModelNameCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    item = resource_service.create_item(session, user_id=current_user.id, **data.model_dump())
    return ModelNamePublic(**item.model_dump())

@router.get("/{item_id}", response_model=ModelNamePublic)
async def get_item(
    item_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    try:
        item = resource_service.get_item_by_id(session, item_id, current_user.id)
        return ModelNamePublic(**item.model_dump())
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail={"error": e.message})

@router.put("/{item_id}", response_model=ModelNamePublic)
async def update_item(
    item_id: UUID,
    data: ModelNameUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    try:
        item = resource_service.update_item(session, item_id, current_user.id, **data.model_dump(exclude_unset=True))
        return ModelNamePublic(**item.model_dump())
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail={"error": e.message})

@router.delete("/{item_id}", status_code=204)
async def delete_item(
    item_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    try:
        resource_service.delete_item(session, item_id, current_user.id)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail={"error": e.message})
```

#### Step 6: Authentication (if needed)

Follow the same pattern as the Todo API:
- JWT utilities in `auth.py`
- Auth middleware in `middleware/auth.py`
- Auth service in `services/auth_service.py`
- Auth routes in `routes/auth.py`

#### Step 7: Main Application

**main.py**
```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from db import init_db
from routes import auth, {resource}

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router({resource}.router)

@app.get("/")
async def root():
    return {
        "name": "API",
        "version": "1.0.0",
        "endpoints": {
            "auth": {
                "POST /api/auth/register": "Register",
                "POST /api/auth/login": "Login",
                "GET /api/auth/me": "Get current user"
            },
            "resources": {
                "GET /api/{resources}": "List all",
                "POST /api/{resources}": "Create",
                "GET /api/{resources}/{id}": "Get one",
                "PUT /api/{resources}/{id}": "Update",
                "DELETE /api/{resources}/{id}": "Delete"
            }
        }
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
```

### 4. Test All Endpoints

Start the server and test:
```bash
python -m uvicorn main:app --reload
```

Test with curl:
1. Register user
2. Login
3. Create item
4. List items
5. Get item by ID
6. Update item
7. Delete item

### 5. Create Integration Guide

Create `FRONTEND_INTEGRATION_GUIDE.md` with:
- Base URL
- All endpoints with examples
- Authentication flow
- Error handling
- Code examples for JavaScript/React

## Quality Standards

- ✅ All functions have docstrings
- ✅ Type hints on all functions
- ✅ Proper error handling with custom exceptions
- ✅ Input validation with Pydantic
- ✅ Passwords hashed with bcrypt (if auth)
- ✅ JWT tokens for authentication (if auth)
- ✅ CORS properly configured
- ✅ User data isolated (users can only access their own data)
- ✅ All endpoints tested before completion

## Common Patterns

### Many-to-One Relationship
```python
# In models
class Comment(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    post_id: UUID = Field(foreign_key="posts.id")
    post: Optional["Post"] = Relationship(back_populates="comments")

class Post(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    comments: list["Comment"] = Relationship(back_populates="post")
```

### Filtering
```python
def list_items(session: Session, user_id: UUID, status: Optional[str] = None):
    query = select(Item).where(Item.user_id == user_id)
    if status:
        query = query.where(Item.status == status)
    return list(session.exec(query).all())
```

### Search
```python
def search_items(session: Session, user_id: UUID, query: str):
    return list(session.exec(
        select(Item).where(
            Item.user_id == user_id,
            Item.title.contains(query)
        )
    ).all())
```

## Notes

- Use `**obj.model_dump()` for Pydantic v2 compatibility
- Use `**obj.model_dump(exclude={'field'})` to exclude sensitive fields
- Use `**data.model_dump(exclude_unset=True)` for partial updates
- Always return proper HTTP status codes
- Include helpful error messages
