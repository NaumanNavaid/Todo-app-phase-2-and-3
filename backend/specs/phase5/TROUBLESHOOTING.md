# Phase V Troubleshooting Guide

**Date:** 2026-02-08
**Scope:** Common issues and solutions for Phase V deployment

---

## Quick Reference Commands

```bash
# Get pod status
kubectl get pods -n kafka
kubectl get pods -n todo-app

# Get pod logs
kubectl logs -n todo-app deployment/backend -c backend
kubectl logs -n todo-app deployment/backend -c daprd

# Describe pod for events
kubectl describe pod -n todo-app -l app=backend

# Port forward to local debugging
kubectl port-forward -n todo-app deployment/backend 8000:8000

# Exec into pod
kubectl exec -it -n todo-app deployment/backend -c backend -- /bin/bash

# Restart deployment
kubectl rollout restart deployment/backend -n todo-app

# Check Dapr status
dapr status -k
dapr logs -k -n todo-app --app-id todo-backend
```

---

## Issue Category: Infrastructure

### Problem: Redpanda Pod Pending/CrashLoopBackOff
**Symptoms:**
```
kubectl get pods -n kafka
# NAME        READY   STATUS             RESTARTS   AGE
# redpanda-0   0/1     CrashLoopBackOff   5          10m
```

**Diagnosis:**
```bash
kubectl describe pod -n kafka statefulset/redpanda-0
kubectl logs -n kafka statefulset/redpanda-0
```

**Common Causes:**
1. Insufficient memory (needs 1Gi)
2. Volume claim not binding
3. Port conflicts

**Solutions:**
```bash
# Check resources
kubectl describe pod -n kafka statefulset/redpanda-0 | grep -A 5 "Resources"

# Check PVC
kubectl get pvc -n kafka

# Delete and recreate
kubectl delete statefulset -n kafka redpanda
kubectl delete pvc -n kafka data-redpanda-0
kubectl apply -f k8s/redpanda-deployment.yaml
```

---

### Problem: Dapr Sidecar Not Injected
**Symptoms:**
```
kubectl get pod -n todo-app -l app=backend -o jsonpath='{.items[0].spec.containers[*].name}'
# Output: backend (missing daprd)
```

**Diagnosis:**
```bash
kubectl get deployment backend -n todo-app -o yaml | grep dapr.io
```

**Solutions:**
```bash
# Verify Dapr installation
dapr status -k

# Uninstall and reinstall Dapr
dapr uninstall -k
dapr init -k

# Reapply deployment
kubectl delete -n todo-app deployment/backend
kubectl apply -f k8s/backend-deployment.yaml
```

---

### Problem: Backend Pod Not Ready
**Symptoms:**
```
kubectl get pods -n todo-app
# NAME                      READY   STATUS    RESTARTS   AGE
# backend-8d458497-abc12   0/1     Running   5          5m
```

**Diagnosis:**
```bash
kubectl describe pod -n todo-app -l app=backend

# Check readiness probe
kubectl get pod -n todo-app -l app=backend -o yaml | grep -A 10 readinessProbe
```

**Common Causes:**
1. Database connection failing
2. Health endpoint timeout
3. Missing environment variables

**Solutions:**
```bash
# Check backend logs
kubectl logs -n todo-app deployment/backend -c backend --tail=50

# Check environment variables
kubectl exec -n todo-app deployment/backend -c backend -- env | grep -E "DATABASE_URL|SECRET_KEY|OPENAI_API_KEY"

# Manual health check
kubectl exec -n todo-app deployment/backend -c backend -- curl localhost:8000/health

# If database issue:
kubectl exec -n todo-app deployment/backend -c backend -- ls -la /data
```

---

## Issue Category: Events

### Problem: Events Not Being Published
**Symptoms:**
```
kubectl logs -n todo-app deployment/backend -c backend | grep -i "publishing event"
# No output
```

**Diagnosis:**
```bash
# Check if task status changed to "done"
curl -X GET "$BACKEND_URL/api/tasks" \
  -H "Authorization: Bearer $TOKEN" | jq '.[].status'

# Check event producer code
kubectl logs -n todo-app deployment/backend -c backend | grep -i "Task completed"
```

**Solutions:**
```bash
# Manually test Dapr publish
kubectl exec -n todo-app deployment/backend -c backend -- \
  curl -X POST http://localhost:3500/v1.0/publish/kafka-pubsub/task-events \
  -H "Content-Type: application/json" \
  -d '{"test":"message"}'

# Check Dapr sidecar logs
kubectl logs -n todo-app deployment/backend -c daprd | grep -i "publish"

# Verify Dapr component
kubectl get component kafka-pubsub -n todo-app -o yaml
```

---

### Problem: Events Not Being Consumed
**Symptoms:**
```
# Task marked as done but no new task created
kubectl logs -n todo-app deployment/backend -c backend | grep -i "Created recurring task"
# No output
```

**Diagnosis:**
```bash
# Check if subscription exists
kubectl get subscription -n todo-app -o yaml

# Check Dapr logs for subscription
kubectl logs -n todo-app deployment/backend -c daprd | grep -i "subscribe"

# Check if events endpoint exists
curl $BACKEND_URL/ | jq '.endpoints.events'
```

**Solutions:**
```bash
# Verify subscription is correct
kubectl get subscription task-completed-subscription -n todo-app -o yaml

# Check route matches
kubectl logs -n todo-app deployment/backend -c daprd | grep -i "route"

# Verify events router is included
curl $BACKEND_URL/docs | grep -i "task-completed"

# Resync Dapr subscription
kubectl delete subscription task-completed-subscription -n todo-app
kubectl apply -f k8s/subscriptions.yaml
```

---

### Problem: Recurring Task Date Calculation Wrong
**Symptoms:**
```
# Task completed on 2026-02-08, new task due on wrong date
# Expected: 2026-02-09 (daily)
# Actual: Wrong date
```

**Diagnosis:**
```bash
# Check event payload
kubectl logs -n todo-app deployment/backend -c backend | grep -i "completed_at"

# Check calculation logic
kubectl logs -n todo-app deployment/backend -c backend | grep -i "next_due_date"
```

**Solutions:**
```bash
# Verify python-dateutil is installed
kubectl exec -n todo-app deployment/backend -c backend -- \
  python -c "import dateutil; print(dateutil.__version__)"

# Check calculation function
# File: routes/events.py, function: calculate_next_due_date()

# Test manually
kubectl exec -n todo-app deployment/backend -c backend -- python -c "
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
completed = datetime(2026, 2, 8, 10, 0)
print('Daily:', completed + timedelta(days=1))
print('Weekly:', completed + timedelta(weeks=1))
print('Monthly:', completed + relativedelta(months=1))
"
```

---

## Issue Category: Database

### Problem: Database Migration Failed
**Symptoms:**
```
alembic upgrade head
# ERROR: [alembic.util.exc] Error: No such table: tasks
```

**Diagnosis:**
```bash
# Check current migration
alembic current

# Check migration file exists
ls -la alembic/versions/

# Check database exists
ls -la /data/todo.db
```

**Solutions:**
```bash
# Option 1: Reinitialize database
kubectl exec -n todo-app deployment/backend -c backend -- \
  python -c "
from db import init_db
init_db()
"

# Option 2: Manually create table
kubectl exec -n todo-app deployment/backend -c backend -- \
  sqlite3 /data/todo.db "ALTER TABLE tasks ADD COLUMN parent_task_id TEXT;"

# Option 3: Stamp migration as applied
alembic stamp head
```

---

### Problem: Database Permission Denied
**Symptoms:**
```
sqlite3.OperationalError: unable to open database file
```

**Diagnosis:**
```bash
# Check directory permissions
kubectl exec -n todo-app deployment/backend -c backend -- ls -la /data

# Check database file
kubectl exec -n todo-app deployment/backend -c backend -- ls -la /data/todo.db
```

**Solutions:**
```bash
# Fix: Directory should be created by db.py already
# If not, create manually
kubectl exec -n todo-app deployment/backend -c backend -- \
  mkdir -p /data

# Check security context
kubectl exec -n todo-app deployment/backend -c backend -- \
  chmod 777 /data/todo.db
```

---

## Issue Category: Hugging Face Spaces

### Problem: Database Wipes on Restart
**Status:** FIXED ✅
**Solution:** Changed database URL from `sqlite:///./todo.db` to `sqlite:////data/todo.db`

### Problem: 500 Errors on All Endpoints
**Status:** FIXED ✅
**Root Cause:** Database file being deleted on container restart
**Solution:** Persistent `/data` directory now used

---

## Issue Category: Logging

### Problem: Logs Not in JSON Format
**Symptoms:**
```
kubectl logs -n todo-app deployment/backend -c backend
# Output: Plain text, not JSON
```

**Diagnosis:**
```bash
# Check environment variable
kubectl exec -n todo-app deployment/backend -c backend -- env | grep ENVIRONMENT
```

**Solutions:**
```bash
# Set environment to production
kubectl set env deployment/backend ENVIRONMENT=production -n todo-app
kubectl rollout restart deployment/backend -n todo-app

# Verify JSON logs
kubectl logs -n todo-app deployment/backend -c backend --tail=5
# Should see: {"timestamp":"...","level":"info",...}
```

---

### Problem: Missing Context in Logs
**Symptoms:**
```
# Logs show: {"message":"Task completed"}
# Missing: task_id, user_id, recurring_type
```

**Diagnosis:**
```bash
# Check logger usage in code
grep -n "logger.info" routes/tasks.py
```

**Solutions:**
```bash
# Verify logger calls include context
# Example: logger.info("Task completed", task_id=str(task.id), recurring_type=task.recurring_type)

# Check core/logger.py configuration
kubectl exec -n todo-app deployment/backend -c backend -- \
  python -c "from core.logger import get_logger; logger = get_logger('test'); logger.info('Test', key='value')"
```

---

## Debugging Tools

### Port Forwarding for Local Debugging
```bash
# Forward backend to localhost
kubectl port-forward -n todo-app deployment/backend 8000:8000

# Forward Redpanda (if needed)
kubectl port-forward -n kafka statefulset/redpanda-0 9092:9092

# Now can use:
# - http://localhost:8000/docs for Swagger UI
# - http://localhost:8000/health for health check
# - sqlite3 /data/todo.db for database inspection
```

### Interactive Debugging
```bash
# Open shell in backend pod
kubectl exec -it -n todo-app deployment/backend -c backend -- /bin/bash

# Inside pod, test event publishing
curl -X POST http://localhost:3500/v1.0/publish/kafka-pubsub/task-events \
  -H "Content-Type: application/json" \
  -d '{"test":"message"}'

# Check database
sqlite3 /data/todo.db ".tables" ".quit"

# Check Python environment
python -c "import structlog; print(structlog.__version__)"
python -c "import httpx; print(httpx.__version__)"
```

### Event Tracing
```bash
# Enable Dapr tracing
kubectl edit deployment backend -n todo-app
# Add: dapr.io/enable-api-logging: "true"

# Restart pod
kubectl rollout restart deployment/backend -n todo-app

# Check traces
dapr logs -k -n todo-app --app-id todo-backend
```

---

## Performance Issues

### Problem: Slow Event Processing
**Symptoms:**
```
# Task marked as done at 10:00
# New task created at 10:05 (5 second delay)
```

**Diagnosis:**
```bash
# Check event publishing time
kubectl logs -n todo-app deployment/backend -c backend --tail=50 | \
  grep -i "publishing event"

# Check event consumption time
kubectl logs -n todo-app deployment/backend -c backend --tail=50 | \
  grep -i "Created recurring task"

# Check database query time
kubectl logs -n todo-app deployment/backend -c backend --tail=50 | \
  grep -i "sql"
```

**Solutions:**
```bash
# Add database indexing
kubectl exec -n todo-app deployment/backend -c backend -- \
  sqlite3 /data/todo.db "CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);"

# Increase Dapr resource limits
kubectl set resources deployment/backend -n todo-app --limits=cpu=1000m,memory=1Gi
```

### Problem: High Memory Usage
**Symptoms:**
```
kubectl top pods -n todo-app
# NAME      CPU    MEMORY
# backend   500m   800Mi  (exceeds 512Mi limit)
```

**Diagnosis:**
```bash
# Check memory usage
kubectl exec -n todo-app deployment/backend -c backend -- ps aux

# Check for memory leaks
kubectl logs -n todo-app deployment/backend -c backend | grep -i "memory"
```

**Solutions:**
```bash
# Restart pod to free memory
kubectl rollout restart deployment/backend -n todo-app

# Increase memory limit
kubectl set resources deployment/backend -n todo-app --limits=memory=1Gi

# Check connection pool size in db.py
# Should be: pool_size=5, max_overflow=10
```

---

## Emergency Rollback Procedures

### Full System Rollback
```bash
# 1. Rollback backend to previous version
kubectl rollout undo deployment/backend -n todo-app

# 2. Remove Dapr components
kubectl delete component kafka-pubsub -n todo-app
kubectl delete subscription task-completed-subscription -n todo-app

# 3. Remove Redpanda
kubectl delete statefulset -n kafka redpanda
kubectl delete pvc -n kafka data-redpanda-0
kubectl delete namespace kafka

# 4. Rollback database migration
alembic downgrade -1

# 5. Rebuild backend without Phase V changes
# (Requires git revert and redeploy)
```

### Partial Rollback (Keep Event System)
```bash
# 1. Disable event publishing
# Comment out publish_task_completed_event() calls in routes/tasks.py

# 2. Redeploy backend
kubectl rollout restart deployment/backend -n todo-app

# 3. Keep infrastructure running
# Redpanda, Dapr components remain
```

---

## Contact & Support

### Log Collection
```bash
# Collect all relevant logs
kubectl logs -n todo-app deployment/backend > backend-logs.txt
kubectl logs -n todo-app deployment/backend -c daprd > daprd-logs.txt
kubectl logs -n kafka statefulset/redpanda-0 > redpanda-logs.txt

# Collect pod descriptions
kubectl describe pod -n todo-app -l app=backend > pod-describe.txt
kubectl describe pod -n kafka -l app=redpanda > redpanda-describe.txt

# Collect events
kubectl get events -n todo-app --sort-by='.lastTimestamp' > events.txt
kubectl get events -n kafka --sort-by='.lastTimestamp' > kafka-events.txt
```

### Useful Commands for Issue Reporting
```bash
# System info
dapr status -k
kubectl version --client
kubectl cluster-info

# Resource status
kubectl get all -n kafka
kubectl get all -n todo-app

# Component status
kubectl get component,subscription -n todo-app

# Recent logs
kubectl logs -n todo-app deployment/backend --tail=100 --since=1h
```

---

## Prevention Checklist

To prevent issues:
- [ ] Always check resource limits before deployment
- [ ] Verify Dapr is installed and ready
- [ ] Test database migration in isolation
- [ ] Use port-forwarding for initial testing
- [ ] Enable Dapr API logging during development
- [ ] Monitor pod resource usage
- [ ] Set up log aggregation for production
- [ ] Create backup before major changes
- [ ] Document any custom configurations

---

**Troubleshooting Guide: COMPLETE** ✅
