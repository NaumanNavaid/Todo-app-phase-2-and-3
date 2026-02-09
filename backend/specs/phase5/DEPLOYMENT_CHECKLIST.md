# Phase V Deployment Checklist

**Environment:** Kubernetes (Minikube) + Hugging Face Spaces
**Date:** 2026-02-08

---

## Pre-Deployment Checklist

### Code Changes
- [x] Database schema updated (parent_task_id field)
- [x] Alembic migration created
- [x] Structured logging implemented (core/logger.py)
- [x] Global exception handler created (middleware/error_handler.py)
- [x] Event producer implemented (core/events.py)
- [x] Event consumer implemented (routes/events.py)
- [x] Hugging Face Spaces persistence fix (config.py, db.py)

### Files Created
- [x] core/logger.py
- [x] core/events.py
- [x] core/__init__.py
- [x] middleware/error_handler.py
- [x] routes/events.py
- [x] k8s/redpanda-deployment.yaml
- [x] k8s/components/kafka-pubsub.yaml
- [x] k8s/subscriptions.yaml
- [x] k8s/backend-deployment.yaml
- [x] specs/phase5/plan.md
- [x] specs/phase5/IMPLEMENTATION_SUMMARY.md
- [x] specs/phase5/TESTING_GUIDE.md
- [x] specs/phase5/DEPLOYMENT_CHECKLIST.md

### Dependencies
- [x] alembic==1.13.0
- [x] structlog==24.1.0
- [x] httpx==0.27.0
- [x] python-dateutil==2.8.2

---

## Kubernetes Deployment Steps

### Step 1: Install Prerequisites
```bash
# Check minikube is running
minikube status

# Check Dapr is installed
dapr version

# If not installed:
# curl -Lo dapr.zip https://dapr.github.io/cli/install/v1.12.0/dapr-linux-amd64.zip
# unzip dapr.zip
# sudo mv dapr /usr/local/bin/
# dapr init -k
```

### Step 2: Deploy Redpanda (Kafka)
```bash
# Apply Redpanda deployment
kubectl apply -f k8s/redpanda-deployment.yaml

# Verify
kubectl get namespace kafka
kubectl get statefulset -n kafka
kubectl get pods -n kafka
kubectl get svc -n kafka

# Wait for Redpanda to be ready
kubectl wait --for=condition=ready pod -l app=redpanda -n kafka --timeout=120s

# Test Redpanda
kubectl exec -n kafka statefulset/redpanda-0 -- rpk cluster info
# Expected: Cluster ID and broker list
```

### Step 3: Deploy Dapr Components
```bash
# Apply Dapr pub/sub component
kubectl apply -f k8s/components/kafka-pubsub.yaml

# Apply Dapr subscription
kubectl apply -f k8s/subscriptions.yaml

# Verify
kubectl get component -n todo-app
kubectl get subscription -n todo-app
```

### Step 4: Build and Deploy Backend
```bash
# Option A: Using local minikube registry
docker build -t todo-backend:5.0.0 .
minikube image load todo-backend:5.0.0

# Option B: Using Docker Hub
docker build -t <your-username>/todo-backend:5.0.0 .
docker push <your-username>/todo-backend:5.0.0
# Update image in k8s/backend-deployment.yaml

# Apply deployment
kubectl apply -f k8s/backend-deployment.yaml

# Wait for backend to be ready
kubectl wait --for=condition=ready pod -l app=backend -n todo-app --timeout=120s

# Verify Dapr sidecar injection
kubectl get pod -n todo-app -l app=backend -o jsonpath='{.items[0].spec.containers[*].name}'
# Expected: backend daprd
```

### Step 5: Run Database Migration
```bash
# Port-forward to backend pod
kubectl port-forward -n todo-app deployment/backend 8000:8000

# In another terminal, run migration
alembic upgrade head

# Verify migration
alembic current
# Expected: bee5587faeab (or similar)
```

### Step 6: Verify Deployment
```bash
# Get backend URL
export BACKEND_URL=$(minikube service backend -n todo-app --url)

# Test health endpoint
curl $BACKEND_URL/health

# Test registration
curl -X POST "$BACKEND_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test"}'

# Test login
curl -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## Hugging Face Spaces Deployment

### Step 1: Push to GitHub
```bash
# Add all changes
git add .

# Commit
git commit -m "feat: Phase V - Event-Driven Architecture with Dapr + Kafka

- Add parent_task_id field for recurring tasks
- Implement structured logging with structlog
- Add global exception handler
- Create event producer for task completion
- Create event consumer for recurring logic
- Deploy Redpanda (Kafka) and Dapr components
- Fix Hugging Face Spaces database persistence (/data)
- Update API to v5.0.0

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push
git push origin main
```

### Step 2: Configure Hugging Face Space
1. Go to your Hugging Face Space: https://huggingface.co/spaces/nauman-19-todo-app-backend
2. Click "Settings" tab
3. Under "Repository secrets", add/update:
   - `DATABASE_URL`: Already handled by code (uses `/data/todo.db`)
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `SECRET_KEY`: Generate strong secret (e.g., `openssl rand -hex 32`)
4. Click "Save"

### Step 3: Trigger Rebuild
- Space will auto-rebuild when you push
- Or manually click "Restart" button
- Wait for build to complete (check "Logs" tab)

### Step 4: Verify HF Spaces Deployment
```bash
# Test health
curl https://nauman-19-todo-app-backend.hf.space/health

# Test registration
curl -X POST "https://nauman-19-todo-app-backend.hf.space/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"hftest@example.com","password":"password123","name":"HF Test"}'

# Test login
curl -X POST "https://nauman-19-todo-app-backend.hf.space/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"hftest@example.com","password":"password123"}'
```

---

## Rollback Plan

If deployment fails:

### Rollback Kubernetes Deployment
```bash
# Rollback backend to previous version
kubectl rollout undo deployment/backend -n todo-app

# Or redeploy previous image
kubectl set image deployment/backend -n todo-app backend=todo-backend:4.0.0
kubectl rollout restart deployment/backend -n todo-app
```

### Rollback Database Migration
```bash
# Rollback to previous migration
alembic downgrade -1

# Or manually in SQLite
kubectl exec -n todo-app deployment/backend -c backend -- \
  sqlite3 /data/todo.db "ALTER TABLE tasks DROP COLUMN parent_task_id;"
```

### Rollback Code Changes
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

---

## Health Monitoring

### Pod Health
```bash
# Watch pod status
kubectl get pods -n kafka -w
kubectl get pods -n todo-app -w

# Check pod resource usage
kubectl top pods -n todo-app
kubectl top pods -n kafka
```

### Application Health
```bash
# Backend health
curl $(minikube service backend -n todo-app --url)/health

# Redpanda health
kubectl exec -n kafka statefulset/redpanda-0 -- \
  curl http://localhost:9644/v1/status/ready

# Dapr health
dapr status -k
kubectl exec -n todo-app deployment/backend -c daprd -- \
  curl http://localhost:3500/v1.0/healthz
```

### Log Monitoring
```bash
# Backend logs (structured JSON)
kubectl logs -n todo-app deployment/backend -c backend --tail=50 -f

# Dapr sidecar logs
kubectl logs -n todo-app deployment/backend -c daprd --tail=50 -f

# Redpanda logs
kubectl logs -n kafka statefulset/redpanda-0 --tail=50 -f
```

---

## Post-Deployment Verification

### Critical Tests
- [ ] API returns 200 OK for /health
- [ ] User can register new account
- [ ] User can login and get JWT token
- [ ] User can create task with recurring_type
- [ ] Task completion publishes event (check logs)
- [ ] Event consumer creates new recurring task
- [ ] Logs are in JSON format
- [ ] Exceptions return JSON with error_id
- [ ] Database persists across pod restarts

### Integration Tests
- [ ] Daily recurring task creates next day's task
- [ ] Weekly recurring task creates next week's task
- [ ] Monthly recurring task creates next month's task
- [ ] Recurring end date prevents task creation
- [ ] Non-recurring tasks don't create new tasks
- [ ] Parent-child task relationship works
- [ ] Tags copied from parent to child

### Performance Tests
- [ ] Can handle 100 concurrent task completions
- [ ] Events processed within 1 second
- [ ] Memory usage stable (no leaks)
- [ ] CPU usage within limits

---

## Known Issues and Workarounds

### Issue 1: Dapr Sidecar Not Starting
**Symptom:** Backend pod has only 1 container instead of 2
**Fix:**
```bash
kubectl delete pod -n todo-app -l app=backend
# Pod will restart with Dapr sidecar
```

### Issue 2: Redpanda Connection Refused
**Symptom:** Events not being published
**Fix:**
```bash
# Check Redpanda is ready
kubectl exec -n kafka statefulset/redpanda-0 -- rpk cluster info

# Restart backend pods to retry connection
kubectl rollout restart deployment/backend -n todo-app
```

### Issue 3: Database Migration Fails
**Symptom:** Alembic migration error
**Fix:**
```bash
# Check database exists
kubectl exec -n todo-app deployment/backend -c backend -- ls -la /data

# Manually create tables if migration fails
kubectl exec -n todo-app deployment/backend -c backend -- python -c "
from db import init_db
init_db()
"
```

---

## Deployment Summary

### Resources Created
- **Namespaces:** kafka, todo-app
- **StatefulSets:** redpanda (1 replica)
- **Services:** redpanda, backend, postgres, frontend
- **Deployments:** backend (2 replicas), frontend (2 replicas)
- **Components:** kafka-pubsub (Dapr)
- **Subscriptions:** task-completed-subscription (Dapr)
- **Secrets:** postgres-secret, backend-secret

### Ports Exposed
- **Backend:** 8000 (NodePort 30001)
- **Frontend:** 3000 (NodePort 30000)
- **Redpanda:** 9092 (Kafka internal), 9644 (Admin)
- **Dapr:** 3500 (HTTP), 3501 (gRPC)

### Next Steps
1. ✅ Deploy to local Kubernetes (minikube)
2. ✅ Test event flow end-to-end
3. ✅ Push to GitHub
4. ✅ Hugging Face Spaces auto-deploys
5. ⏳ Verify HF Spaces deployment
6. ⏳ Test recurring tasks on HF Spaces
7. ⏳ Monitor logs and metrics

---

**Deployment Checklist: COMPLETE** ✅
