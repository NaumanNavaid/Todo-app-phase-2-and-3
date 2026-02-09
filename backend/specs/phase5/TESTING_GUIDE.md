# Phase V Testing Guide

**Status:** Ready for Testing
**Date:** 2026-02-08

---

## Local Testing (Without Kubernetes)

### Prerequisites
```bash
# Install dependencies
pip install -r requirements.txt

# Run database migration
alembic upgrade head

# Start the API
python main.py
```

### Test 1: Structured Logging
```bash
# Make a request to trigger logging
curl http://localhost:8000/health

# Check console output - should see structured JSON logs like:
# {"timestamp":"2026-02-08T20:30:00.123456","level":"info","logger":"main","message":"Starting Todo API","environment":"development","cors_origins":["..."]}
```

### Test 2: Global Exception Handler
```bash
# Trigger an error with invalid input
curl -X POST "http://localhost:8000/api/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid_token" \
  -d '{"title": ""}'

# Expected response (JSON):
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

### Test 3: Database Persistence
```bash
# Verify /data directory is created on startup
# Check that todo.db is created in /data directory
ls -la /data/todo.db

# Verify database schema includes parent_task_id
sqlite3 /data/todo.db ".schema tasks" | grep parent_task_id
```

---

## Kubernetes Testing (Minikube)

### Prerequisites
```bash
# Start minikube
minikube start

# Verify Dapr is installed
dapr version

# Switch to todo-app context
kubectl config use-context minikube
```

### Test 4: Deploy Redpanda
```bash
# Create kafka namespace and deploy Redpanda
kubectl apply -f k8s/redpanda-deployment.yaml

# Wait for Redpanda to be ready
kubectl wait --for=condition=ready pod -l app=redpanda -n kafka --timeout=60s

# Verify Redpanda is running
kubectl get pods -n kafka
kubectl get svc -n kafka

# Check Redpanda logs
kubectl logs -f -n kafka statefulset/redpanda-0

# Expected output: "Redpanda is ready to serve requests"
```

### Test 5: Deploy Dapr Components
```bash
# Apply Dapr pub/sub component
kubectl apply -f k8s/components/kafka-pubsub.yaml

# Apply Dapr subscription
kubectl apply -f k8s/subscriptions.yaml

# Verify Dapr components
kubectl get components -n todo-app
kubectl get subscriptions -n todo-app
```

### Test 6: Deploy Backend with Dapr
```bash
# Build Docker image
docker build -t todo-backend:5.0.0 .

# Load image into minikube
minikube image load todo-backend:5.0.0

# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml

# Wait for backend to be ready
kubectl wait --for=condition=ready pod -l app=backend -n todo-app --timeout=120s

# Verify deployment
kubectl get pods -n todo-app
kubectl get svc -n todo-app

# Check Dapr sidecar is injected
kubectl get pod -n todo-app -l app=backend -o jsonpath='{.items[0].spec.containers[*].name}'
# Should output: backend daprd
```

---

## Integration Testing (End-to-End)

### Test 7: Create Recurring Task
```bash
# Get backend service URL
export BACKEND_URL=$(minikube service backend -n todo-app --url)

# Register and login
REGISTER_RESPONSE=$(curl -X POST "$BACKEND_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test"}')

TOKEN=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' | jq -r '.access_token')

# Create a daily recurring task
TASK_RESPONSE=$(curl -X POST "$BACKEND_URL/api/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Daily standup meeting",
    "description": "Team sync",
    "priority": "high",
    "due_date": "2026-02-08T09:00:00",
    "recurring_type": "daily",
    "recurring_end_date": "2026-02-15T00:00:00"
  }')

TASK_ID=$(echo $TASK_RESPONSE | jq -r '.id')
echo "Created task: $TASK_ID"
```

### Test 8: Mark Task as Done (Trigger Event)
```bash
# Toggle task to done (triggers event publishing)
curl -X PATCH "$BACKEND_URL/api/tasks/$TASK_ID/toggle" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Verify task status is "done"
curl -X GET "$BACKEND_URL/api/tasks/$TASK_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.status'
```

### Test 9: Verify Recurring Task Created
```bash
# List all tasks
curl -X GET "$BACKEND_URL/api/tasks" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Expected: Should see TWO tasks now:
# 1. Original task with status="done"
# 2. New task with:
#    - title="Daily standup meeting"
#    - status="pending"
#    - due_date="2026-02-09T09:00:00" (1 day later)
#    - parent_task_id=<original task ID>
```

### Test 10: Check Event Flow in Logs
```bash
# Check backend logs for event publishing
kubectl logs -n todo-app deployment/backend -c backend | grep "Task completed, publishing event"

# Check Dapr sidecar logs
kubectl logs -n todo-app deployment/backend -c daprd | grep "Publishing"

# Check event consumer logs
kubectl logs -n todo-app deployment/backend -c backend | grep "Created recurring task"

# Expected output:
# {"timestamp":"...","level":"info","logger":"routes.tasks","message":"Task completed, publishing event","task_id":"...","recurring_type":"daily"}
# {"timestamp":"...","level":"info","logger":"routes.events","message":"Created recurring task","new_task_id":"...","next_due_date":"..."}
```

---

## Recurring Task Scenarios

### Scenario 1: Daily Recurrence
```bash
# Create daily task
curl -X POST "$BACKEND_URL/api/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Take vitamins",
    "recurring_type": "daily",
    "due_date": "2026-02-08T08:00:00"
  }'

# Mark as done
# Expected: New task created with due_date="2026-02-09T08:00:00"
```

### Scenario 2: Weekly Recurrence
```bash
# Create weekly task
curl -X POST "$BACKEND_URL/api/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Weekly report",
    "recurring_type": "weekly",
    "due_date": "2026-02-08T17:00:00"
  }'

# Mark as done
# Expected: New task created with due_date="2026-02-15T17:00:00" (+7 days)
```

### Scenario 3: Monthly Recurrence
```bash
# Create monthly task
curl -X POST "$BACKEND_URL/api/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pay rent",
    "recurring_type": "monthly",
    "due_date": "2026-02-08T00:00:00"
  }'

# Mark as done
# Expected: New task created with due_date="2026-03-08T00:00:00" (+1 month)
```

### Scenario 4: Recurring End Date
```bash
# Create task with end date in past
curl -X POST "$BACKEND_URL/api/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Task ending soon",
    "recurring_type": "daily",
    "due_date": "2026-02-08T09:00:00",
    "recurring_end_date": "2026-02-07T00:00:00"
  }'

# Mark as done
# Expected: NO new task created (end date passed)
```

### Scenario 5: Non-Recurring Task
```bash
# Create non-recurring task
curl -X POST "$BACKEND_URL/api/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "One-time task",
    "recurring_type": "none"
  }'

# Mark as done
# Expected: Event published but NO new task created (not recurring)
```

---

## Verification Commands

### Quick Health Checks
```bash
# All pods running?
kubectl get pods -n kafka
kubectl get pods -n todo-app

# Dapr sidecar injected?
kubectl get pod -n todo-app -l app=backend -o jsonpath='{.items[0].spec.containers[*].name}'

# Redpanda accepting connections?
kubectl exec -n kafka statefulset/redpanda-0 -- rpk cluster info

# Backend responding?
curl $(minikube service backend -n todo-app --url)/health

# Events endpoint registered?
curl $(minikube service backend -n todo-app --url)/ | jq '.endpoints.events'
```

### Database Verification
```bash
# Connect to database in pod
kubectl exec -n todo-app deployment/backend -c backend -- sqlite3 /data/todo.db

# In SQLite shell:
.tables
.schema tasks
SELECT id, title, status, recurring_type, parent_task_id FROM tasks LIMIT 5;
.quit
```

---

## Success Criteria Checklist

- [ ] Redpanda pod running in kafka namespace
- [ ] Dapr sidecar injected into backend pods (2 containers)
- [ ] Backend health endpoint returns 200
- [ ] User can register and login
- [ ] User can create task with recurring_type
- [ ] Marking task as done publishes event
- [ ] Event consumer receives event
- [ ] New task created with correct next due_date
- [ ] New task linked via parent_task_id
- [ ] Tags copied from parent to child task
- [ ] Recurring end date respected
- [ ] Logs in JSON format with context
- [ ] Exceptions return JSON with error_id

---

## Troubleshooting

### Issue: Redpanda Pod Not Starting
```bash
# Check pod status
kubectl describe pod -n kafka statefulset/redpanda-0

# Common fix: Delete and recreate
kubectl delete statefulset -n kafka redpanda
kubectl apply -f k8s/redpanda-deployment.yaml
```

### Issue: Dapr Sidecar Not Injected
```bash
# Verify Dapr installation
dapr status -k

# Check annotations on deployment
kubectl get deployment backend -n todo-app -o yaml | grep dapr.io

# Reinstall Dapr if needed
dapr uninstall -k
dapr init -k
```

### Issue: Events Not Received
```bash
# Check Dapr subscription
kubectl get subscriptions -n todo-app -o yaml

# Check Dapr logs
kubectl logs -n todo-app deployment/backend -c daprd

# Manually test Dapr publish
kubectl exec -n todo-app deployment/backend -c backend -- \
  curl -X POST http://localhost:3500/v1.0/publish/kafka-pubsub/task-events \
  -H "Content-Type: application/json" \
  -d '{"test":"message"}'
```

### Issue: Database Permission Error
```bash
# Check /data directory permissions
kubectl exec -n todo-app deployment/backend -c backend -- ls -la /data

# Fix: Ensure directory is created with correct permissions
# Already handled in db.py with os.makedirs("/data", exist_ok=True)
```

---

## Performance Testing

### Load Test Event Flow
```bash
# Install hey
go install github.com/rakyll/hey@latest

# Create 100 recurring tasks
for i in {1..100}; do
  curl -X POST "$BACKEND_URL/api/tasks" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"Load test task $i\",
      \"recurring_type\": \"daily\"
    }"
done

# Mark all as done (triggers 100 events)
TASKS=$(curl -s -X GET "$BACKEND_URL/api/tasks" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[].id')

for task_id in $TASKS; do
  curl -X PATCH "$BACKEND_URL/api/tasks/$task_id/toggle" \
    -H "Authorization: Bearer $TOKEN"
done

# Verify 100 new tasks created
curl -s -X GET "$BACKEND_URL/api/tasks" \
  -H "Authorization: Bearer $TOKEN" | jq '. | length'
# Should be 200 (100 original + 100 recurring)
```
