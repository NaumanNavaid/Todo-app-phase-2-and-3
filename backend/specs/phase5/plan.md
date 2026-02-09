# Phase V Implementation Plan: Event-Driven Architecture

**Status:** In Progress
**Created:** 2026-02-08
**Goal:** Transition to event-driven architecture with Dapr + Kafka (Redpanda) and fix backend technical debt

---

## Architecture Overview

### Current State
- Monolithic FastAPI backend
- Direct database operations
- Synchronous request/response
- No event-driven patterns
- Print-based logging
- Basic error handling

### Target State
- Event-driven microservices with Dapr sidecars
- Redpanda (Kafka) message broker
- Async task processing
- Structured JSON logging
- Global exception handling
- Recurring task engine via events

---

## Phase V Components

### 1. Infrastructure Layer

#### 1.1 Redpanda (Kafka) Deployment
**File:** `k8s/redpanda-deployment.yaml`
- StatefulSet for single-node Redpanda
- Service for cluster access
- Persistent volume for data storage
- Namespace: `kafka`

#### 1.2 Dapr Pub/Sub Component
**File:** `k8s/components/kafka-pubsub.yaml`
- Dapr component configuration
- Connects to Redpanda service
- Topic: `task-events`
- Consumer: `todo-backend`

#### 1.3 Backend Dapr Sidecar
**File:** `k8s/backend-deployment.yaml` (update)
- Annotations:
  - `dapr.io/enabled: "true"`
  - `dapr.io/app-id: "todo-backend"`
  - `dapr.io/app-port: "8000"`
- Sidecar injection for pub/sub

---

### 2. Backend Core Fixes

#### 2.1 Database Schema Fix
**Issue:** Missing `parent_task_id` field for recurring task chain
**Model:** `Task` in `models.py`
**Change:** Add `parent_task_id: Optional[UUID] = Field(default=None, foreign_key="tasks.id")`

#### 2.2 Database Migrations
**Tool:** Alembic
**Setup:**
- Initialize Alembic: `alembic init alembic`
- Configure `alembic.ini` for database URL
- Create migration: `alembic revision --autogenerate -m "add parent_task_id"`
- Apply migration: `alembic upgrade head`

#### 2.3 Structured Logging
**File:** `core/logger.py` (new)
- Library: `structlog`
- Format: JSON
- Fields: timestamp, level, logger, message, context
- Configuration: dev (pretty) vs prod (JSON)

**Usage:** Replace all `print()` statements with `logger.info()`, `logger.error()`

#### 2.4 Global Exception Handler
**File:** `middleware/error_handler.py` (new)
- Catch all exceptions
- Return JSON error responses
- Log full error details
- Status code mapping

---

### 3. Event Producer (Task Completion)

#### 3.1 Event Publication
**File:** `routes/tasks.py` (modify)
**Trigger:** Task status updates to `done`
**Action:** Publish `task-completed` event
**Payload:**
```json
{
  "event_type": "task-completed",
  "task_id": "uuid",
  "user_id": "uuid",
  "title": "string",
  "recurring_type": "none|daily|weekly|monthly",
  "recurring_end_date": "ISO8601|null",
  "completed_at": "ISO8601"
}
```

**Implementation:**
- HTTP POST to `http://localhost:3500/v1.0/publish/kafka-pubsub/task-events`
- Use `httpx` async client
- Error handling for Dapr sidecar unavailability

---

### 4. Event Consumer (Recurring Engine)

#### 4.1 Event Subscription Endpoint
**File:** `routes/events.py` (new)
**Route:** `POST /api/events/task-completed`
**Purpose:** Receive task completion events from Dapr

#### 4.2 Recurring Logic
**Logic Flow:**
1. Receive event from Dapr
2. Validate event payload
3. Check if `recurring_type != "none"`
4. Check if `recurring_end_date` not exceeded
5. Calculate next `due_date`:
   - Daily: `completed_at + 1 day`
   - Weekly: `completed_at + 7 days`
   - Monthly: `completed_at + 1 month`
6. Create new task with:
   - Same title, description, priority, tags
   - `parent_task_id` = original task ID
   - New `due_date` = calculated date
   - `status` = "pending"
7. Publish `task-created` event (optional)

#### 4.3 Dapr Subscription
**File:** `k8s/subscriptions.yaml` (new)
- Subscribe to `task-events` topic
- Route to `/api/events/task-completed`
- Filter: `event_type == "task-completed"`

---

### 5. API Changes

#### 5.1 Task Creation Update
**File:** `routes/tasks.py`
- Accept `parent_task_id` in TaskCreate schema
- Validate parent task exists
- Link recurring task chain

#### 5.2 Task Response Update
**File:** `schemas.py`
- Add `parent_task_id` to TaskPublic schema
- Include in API responses

---

## Implementation Order

### Phase 5.1: Database & Logging Fixes (Priority: HIGH)
1. ✅ Add `parent_task_id` to Task model
2. ✅ Setup Alembic migrations
3. ✅ Create initial migration
4. ✅ Implement structured logging (structlog)
5. ✅ Replace print statements with logger calls
6. ✅ Add global exception handler

### Phase 5.2: Infrastructure Setup (Priority: HIGH)
1. ✅ Deploy Redpanda to minikube
2. ✅ Create Dapr pub/sub component
3. ✅ Update backend deployment with Dapr annotations
4. ✅ Verify Dapr sidecar injection

### Phase 5.3: Event Producer (Priority: MEDIUM)
1. ✅ Add event publishing to task completion
2. ✅ Test Dapr sidecar communication
3. ✅ Verify event flow to Redpanda

### Phase 5.4: Event Consumer (Priority: MEDIUM)
1. ✅ Create events route with subscription endpoint
2. ✅ Implement recurring date calculation logic
3. ✅ Test event consumption
4. ✅ Verify new task creation
5. ✅ Test recurring task chains

---

## Testing Strategy

### Unit Tests
- Date calculation logic (daily, weekly, monthly)
- Event payload validation
- Recurring end date boundary conditions

### Integration Tests
- End-to-end event flow
- Task completion → Event → New task creation
- Dapr sidecar communication
- Redpanda message persistence

### Manual Tests
- Create recurring task
- Complete task
- Verify new task created with correct due date
- Complete recurring task past end date
- Verify no new task created

---

## Rollback Plan

If Phase V fails:
1. Remove Dapr annotations from backend deployment
2. Redeploy backend without sidecar
3. Disable event publishing in code (feature flag)
4. System reverts to Phase IV (K8s deployed, no events)

---

## Success Criteria

- [ ] Redpanda running in minikube
- [ ] Dapr sidecar injected into backend pods
- [ ] Task completion publishes event to Kafka
- [ ] Event consumer creates recurring tasks
- [ ] All logs in JSON format
- [ ] All errors return JSON responses
- [ ] Database migrations tested
- [ ] Parent-child task relationships working
- [ ] No print statements in code
- [ ] Recurring tasks created correctly

---

## Open Questions

1. Should we keep old completed tasks or archive them?
2. How to handle recurring task failures (e.g., database down)?
3. Should we implement a dead letter queue for failed events?
4. Maximum depth of recurring task chains?

---

## Estimated Effort

- Database fixes: 2 hours
- Logging improvements: 1 hour
- Infrastructure setup: 2 hours
- Event producer: 1 hour
- Event consumer: 2 hours
- Testing: 2 hours

**Total: ~10 hours**
