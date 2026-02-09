# Phase V Verification Steps

**Date:** 2026-02-08
**Purpose:** Complete verification checklist for Phase V deployment

---

## Quick Verification (5 Minutes)

### 1. Infrastructure Running
```bash
# Redpanda running?
kubectl get pods -n kafka -l app=redpanda
# Expected: 1/1 Running

# Backend running?
kubectl get pods -n todo-app -l app=backend
# Expected: 2/2 Running (both with 2 containers: backend + daprd)

# Services exposed?
kubectl get svc -n kafka
kubectl get svc -n todo-app
# Expected: redpanda, backend, postgres, frontend services
```

### 2. Dapr Components Active
```bash
# Dapr pub/sub component?
kubectl get component kafka-pubsub -n todo-app

# Dapr subscription?
kubectl get subscription task-completed-subscription -n todo-app

# Dapr sidecar injected?
kubectl get pod -n todo-app -l app=backend -o jsonpath='{.items[0].spec.containers[*].name}'
# Expected: backend daprd
```

### 3. API Responding
```bash
export BACKEND_URL=$(minikube service backend -n todo-app --url)

# Health check
curl $BACKEND_URL/health
# Expected: {"status":"healthy","environment":"production","version":"5.0.0"}

# Root endpoint
curl $BACKEND_URL/ | jq '.version'
# Expected: "5.0.0"
```

---

## Detailed Verification (15 Minutes)

### Database Verification
```bash
# Database file exists?
kubectl exec -n todo-app deployment/backend -c backend -- ls -la /data/todo.db
# Expected: File exists with size > 0

# Schema updated?
kubectl exec -n todo-app deployment/backend -c backend -- \
  sqlite3 /data/todo.db ".schema tasks" | grep parent_task_id
# Expected: parent_task_id INTEGER|TEXT

# Can create tables?
kubectl exec -n todo-app deployment/backend -c backend -- python -c "
from models import SQLModel
from db import engine
print(SQLModel.metadata.tables.keys())
"
# Expected: dict_keys(['users', 'tasks', 'task_tags', 'tags', 'conversations', 'messages'])
```

### Event Flow Verification
```bash
# Create test user and get token
TOKEN=$(curl -s -X POST "$BACKEND_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"verify@example.com","password":"password123","name":"Verify"}' | \
  jq -r '.access_token')

# Create recurring task
TASK=$(curl -s -X POST "$BACKEND_URL/api/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Daily verification task",
    "recurring_type": "daily",
    "due_date": "2026-02-08T10:00:00"
  }')

TASK_ID=$(echo $TASK | jq -r '.id')
echo "Task created: $TASK_ID"

# Mark as done
curl -X PATCH "$BACKEND_URL/api/tasks/$TASK_ID/toggle" \
  -H "Authorization: Bearer $TOKEN" > /dev/null

# Wait for event processing
sleep 3

# List tasks
curl -s -X GET "$BACKEND_URL/api/tasks" \
  -H "Authorization: Bearer $TOKEN" | jq '.[] | {id, title, status, parent_task_id}'

# Expected: TWO tasks
# 1. Original: status="done", parent_task_id=null
# 2. New: status="pending", parent_task_id=<original_id>, due_date="2026-02-09T10:00:00"
```

### Log Verification
```bash
# Check event publishing
kubectl logs -n todo-app deployment/backend -c backend --tail=20 | \
  grep -i "publishing event"

# Check event consumption
kubectl logs -n todo-app deployment/backend -c backend --tail=20 | \
  grep -i "Created recurring task"

# Check Dapr logs
kubectl logs -n todo-app deployment/backend -c daprd --tail=20 | \
  grep -i "task-events"
```

---

## Structured Logging Verification

### JSON Format Check (Production)
```bash
# Set environment to production
kubectl set env deployment/backend ENVIRONMENT=production -n todo-app
kubectl rollout restart deployment/backend -n todo-app

# Wait for restart
sleep 10

# Check logs are JSON
kubectl logs -n todo-app deployment/backend -c backend --tail=5

# Expected: JSON formatted logs like:
# {"timestamp":"2026-02-08T20:30:00.123456","level":"info","logger":"main","message":"Starting Todo API",...}
```

### Context Fields Check
```bash
# Make a request that triggers logging with context
curl -X POST "$BACKEND_URL/api/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Log test task"}' > /dev/null

# Check logs for context
kubectl logs -n todo-app deployment/backend -c backend --tail=10 | \
  grep -i "task_id\|user_id"

# Expected: Logs include task_id and user_id fields
```

---

## Exception Handling Verification

### Test Validation Errors
```bash
# Missing required field
curl -X POST "$BACKEND_URL/api/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":""}'

# Expected response (status 422):
{
  "detail": [
    {
      "field": "title ->  ->",
      "message": "ensure this value has at least 1 characters",
      "type": "string_too_short"
    }
  ],
  "error_id": "uuid-here"
}
```

### Test Server Errors
```bash
# Access with invalid token
curl -X GET "$BACKEND_URL/api/tasks" \
  -H "Authorization: Bearer invalid"

# Expected response (status 401):
{
  "detail": "Could not validate credentials"
}
```

---

## Hugging Face Spaces Verification

### Database Persistence
```bash
# Before: Register a user
curl -X POST "https://nauman-19-todo-app-backend.hf.space/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"persistencetest@example.com","password":"password123","name":"Persistence"}'

# Login should work
curl -X POST "https://nauman-19-todo-app-backend.hf.space/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"persistencetest@example.com","password":"password123"}'

# Trigger space restart (click "Restart" button in HF Spaces UI)

# After restart: Login should still work
curl -X POST "https://nauman-19-todo-app-backend.hf.space/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"persistencetest@example.com","password":"password123"}'

# Expected: User still exists, login succeeds (not 500 error)
```

### Feature Availability
```bash
# Check version
curl https://nauman-19-todo-app-backend.hf.space/ | jq '.version'
# Expected: "5.0.0"

# Check features listed
curl https://nauman-19-todo-app-backend.hf.space/ | jq '.features'
# Expected: Includes "Event-driven architecture", "Recurring tasks", "Structured logging"

# Check events endpoint
curl https://nauman-19-todo-app-backend.hf.space/ | jq '.endpoints.events'
# Expected: Shows POST /api/events/task-completed
```

---

## Performance Verification

### Response Time Check
```bash
# Measure health endpoint
time curl $BACKEND_URL/health
# Expected: < 100ms

# Measure task creation
time curl -X POST "$BACKEND_URL/api/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Performance test"}'
# Expected: < 200ms

# Measure task completion (including event)
time curl -X PATCH "$BACKEND_URL/api/tasks/$TASK_ID/toggle" \
  -H "Authorization: Bearer $TOKEN"
# Expected: < 500ms (includes event publishing)
```

### Resource Usage Check
```bash
# Pod resource usage
kubectl top pods -n todo-app
# Expected: Memory < 512Mi, CPU < 500m

# Resource limits
kubectl describe pod -n todo-app -l app=backend | grep -A 5 Limits
# Expected: cpu: 500m, memory: 512Mi
```

---

## Complete Verification Checklist

### Infrastructure (K8s)
- [ ] Minikube running
- [ ] Dapr installed and initialized
- [ ] kafka namespace created
- [ ] Redpanda StatefulSet running (1 replica)
- [ ] Redpanda service exposed
- [ ] todo-app namespace created
- [ ] Backend deployment running (2 replicas)
- [ ] Dapr sidecar injected into backend pods
- [ ] Backend service exposed (NodePort 30001)

### Components
- [ ] kafka-pubsub Dapr component configured
- [ ] task-completed-subscription Dapr subscription created
- [ ] Database migration applied (parent_task_id field)
- [ ] /data directory created on backend pods
- [ ] Database file exists at /data/todo.db

### API Functionality
- [ ] Health endpoint returns 200
- [ ] User registration works
- [ ] User login works and returns JWT
- [ ] Task creation works
- [ ] Task update works
- [ ] Task toggle works
- [ ] Task deletion works
- [ ] Tag CRUD works

### Event-Driven Features
- [ ] Task completion triggers event
- [ ] Event published to Dapr sidecar
- [ ] Event consumed from Kafka
- [ ] Daily recurring creates next day's task
- [ ] Weekly recurring creates next week's task
- [ ] Monthly recurring creates next month's task
- [ ] Non-recurring tasks don't create new tasks
- [ ] Recurring end date respected
- [ ] Parent-child relationship correct
- [ ] Tags copied from parent to child

### Logging & Monitoring
- [ ] Logs in JSON format (production)
- [ ] Logs include timestamp, level, logger, message
- [ ] Logs include context fields (task_id, user_id, etc.)
- [ ] Exception logs include error_id
- [ ] Event publishing logs
- [ ] Event consumption logs

### Error Handling
- [ ] Validation errors return JSON with field details
- [ ] Server errors return JSON with error_id
- [ ] Auth errors return proper 401 responses
- [ ] Not found errors return proper 404 responses

### Hugging Face Spaces
- [ ] Code pushed to GitHub
- [ ] Space rebuilt successfully
- [ ] Database persists across restarts
- [ ] API responds to requests
- [ ] No 500 errors on login/register

---

## Common Issues and Quick Fixes

### Issue: "Connection refused" to Dapr
**Fix:** Restart backend pod
```bash
kubectl rollout restart deployment/backend -n todo-app
```

### Issue: "Table has no column named parent_task_id"
**Fix:** Run migration
```bash
alembic upgrade head
```

### Issue: "No such file or directory: /data/todo.db"
**Fix:** Restart pod (triggers directory creation)
```bash
kubectl delete pod -n todo-app -l app=backend
```

### Issue: "Event not received"
**Fix:** Check Dapr subscription
```bash
kubectl get subscription -n todo-app -o yaml
# Should show task-completed-subscription
```

---

## Sign-Off Criteria

To sign off on Phase V completion, all items in these sections must be checked:
- ✅ Infrastructure (K8s) - 9 items
- ✅ Components - 6 items
- ✅ API Functionality - 9 items
- ✅ Event-Driven Features - 11 items
- ✅ Logging & Monitoring - 7 items
- ✅ Error Handling - 4 items
- ✅ Hugging Face Spaces - 5 items

**Total:** 51 verification items

---

**Verification Status:** READY FOR TESTING
