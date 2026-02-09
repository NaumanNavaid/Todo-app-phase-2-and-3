# Phase IV: Troubleshooting Guide

## Common Issues and Solutions

### 1. Minikube Won't Start

#### Issue
```bash
$ minikube start
Exiting due to PROVIDER_DOCKER_NOT_RUNNING: docker is not running
```

#### Solution
```bash
# Start Docker Desktop (Windows/Mac)
# Or start Docker daemon (Linux)
sudo systemctl start docker

# Verify Docker is running
docker ps

# Restart Minikube
minikube delete
minikube start
```

---

### 2. Build Script Fails - "Cannot connect to Docker daemon"

#### Issue
```bash
$ ./scripts/build.sh
Cannot connect to the Docker daemon
```

#### Solution
```bash
# Start Minikube first
minikube start

# Set Docker environment to Minikube
eval $(minikube docker-env)

# Verify
docker ps

# Re-run build script
./scripts/build.sh
```

---

### 3. Pods Not Starting - "ImagePullBackOff"

#### Issue
```bash
$ kubectl get pods -n todo-app
NAME                       READY   STATUS              RESTARTS   AGE
backend-7d9f8c5b4d-xk2qt   0/1     ImagePullBackOff    0          2m
```

#### Solution
```bash
# Images must be built in Minikube's Docker context
eval $(minikube docker-env)

# Verify images exist
docker images | grep todo-

# Rebuild images
cd infrastructure
./scripts/build.sh

# Delete old pods
kubectl delete pods -n todo-app --all

# Wait for new pods to be created
kubectl get pods -n todo-app -w
```

---

### 4. Pods in "CrashLoopBackOff"

#### Issue
Pods are repeatedly crashing.

#### Solution

**Check logs:**
```bash
kubectl logs -n todo-app -l app=backend --tail=-1
kubectl logs -n todo-app -l app=frontend --tail=-1
kubectl logs -n todo-app -l app=postgres --tail=-1
```

**Common causes:**

a. **Database connection failed**
```bash
# Check if PostgreSQL is ready
kubectl get pods -n todo-app -l app=postgres

# Wait for PostgreSQL
kubectl wait --for=condition=ready pod -l app=postgres -n todo-app --timeout=120s
```

b. **Missing environment variables**
```bash
# Check secrets exist
kubectl get secrets -n todo-app

# Describe secret
kubectl describe secret backend-secret -n todo-app
```

c. **Missing OPENAI_API_KEY** (non-fatal)
```bash
# Chat won't work but app should still run
# Update the secret:
kubectl create secret generic backend-secret \
  --from-literal=secret-key="$(openssl rand -hex 32)" \
  --from-literal=openai-api-key="sk-..." \
  --namespace=todo-app \
  --dry-run=client -o yaml | kubectl apply -f -
```

---

### 5. Services Not Accessible via NodePort

#### Issue
```bash
$ curl http://$(minikube ip):30000
curl: (7) Failed to connect
```

#### Solution

**Check NodePort is assigned:**
```bash
kubectl get svc -n todo-app

# Look for nodeports in the 30000-32767 range
```

**Check Minikube tunnel (if using):**
```bash
# In another terminal
minikube tunnel

# Access via services
kubectl get svc -n todo-app
```

**Use port-forwarding instead:**
```bash
./scripts/port-forward.sh
```

---

### 6. Frontend Can't Connect to Backend

#### Issue
Frontend loads but shows "Failed to fetch" errors.

#### Solution

**Check backend service:**
```bash
kubectl get endpoints -n todo-app backend

# Should show backend pod IPs
```

**Check backend is ready:**
```bash
kubectl get pods -n todo-app -l app=backend

# Check readiness probe
kubectl describe pod -n todo-app -l app=backend
```

**Test backend directly:**
```bash
# Port forward to backend
kubectl port-forward -n todo-app svc/backend 8000:8000

# In another terminal
curl http://localhost:8000/health
curl http://localhost:8000/docs
```

**Check frontend env var:**
```bash
kubectl describe pod -n todo-app -l app=frontend | grep NEXT_PUBLIC_API_URL
```

---

### 7. PostgreSQL Data Lost After Restart

#### Issue
Database data is not persisting.

#### Solution

**Check PVC status:**
```bash
kubectl get pvc -n todo-app
```

**Check StatefulSet:**
```bash
kubectl get statefulset -n todo-app

# Describe to see volume mounts
kubectl describe statefulset postgres -n todo-app
```

**Data persistence depends on Minikube driver:**
- `--driver=docker`: Data persists across restarts
- `--driver=hyperkit`: Data persists across restarts
- Other drivers may have different behavior

---

### 8. Resource Issues - "OOMKilled"

#### Issue
```bash
$ kubectl get pods -n todo-app
NAME                       READY   STATUS      RESTARTS   AGE
backend-7d9f8c5b4d-xk2qt   0/1     OOMKilled   6          10m
```

#### Solution

**Check pod resources:**
```bash
kubectl describe pod -n todo-app <pod-name>
```

**Increase Minikube resources:**
```bash
minikube stop
minikube start --driver=docker --cpus=4 --memory=8192
```

**Edit resource limits in manifests:**
```yaml
# In k8s/base/backend/deployment.yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

---

### 9. Validation Script Shows Failures

#### Issue
```bash
$ ./scripts/validate.sh
✗ Backend health check failed (HTTP 000)
```

#### Solution

**Wait longer and retry:**
```bash
# Sometimes services need more time
sleep 30
./scripts/validate.sh
```

**Check service is responding:**
```bash
kubectl get pods -n todo-app
kubectl get endpoints -n todo-app

# Test from within cluster
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl http://backend:8000/health -n todo-app
```

---

### 10. Secrets Not Applied After Changes

#### Issue
Changed secrets but pods still using old values.

#### Solution

**Delete pods to force restart:**
```bash
kubectl delete pods -n todo-app --all

# Or rollout restart
kubectl rollout restart deployment backend -n todo-app
kubectl rollout restart deployment frontend -n todo-app
```

**Recreate secret:**
```bash
kubectl delete secret backend-secret -n todo-app
kubectl apply -f k8s/base/postgres/secret.yaml
```

---

## Debugging Commands

### General Status

```bash
# Overview of all resources
kubectl get all -n todo-app

# Detailed pod info
kubectl describe pods -n todo-app

# Events in namespace
kubectl get events -n todo-app --sort-by='.lastTimestamp'
```

### Logs

```bash
# All pod logs
kubectl logs -n todo-app --all-containers=true -l app=backend

# Stream logs
kubectl logs -n todo-app -f -l app=backend

# Previous container logs (if crashed)
kubectl logs -n todo-app --previous -l app=backend
```

### Network Debugging

```bash
# DNS resolution
kubectl run -it --rm debug --image=busybox --restart=Never -- \
  nslookup backend.todo-app.svc.cluster.local

# Test connectivity
kubectl run -it --rm debug --image=busybox --restart=Never -- \
  wget -O- http://backend:8000/health

# Port forward
kubectl port-forward -n todo-app pod/<pod-name> 8080:8000
```

### Resource Usage

```bash
# Pod resource usage
kubectl top pods -n todo-app

# Node resource usage
kubectl top nodes

# Describe node for capacity
kubectl describe nodes
```

## Getting Help

### Collect Diagnostic Information

```bash
# Create a diagnostic dump
mkdir -p diagnostics
cd diagnostics

# Pod status
kubectl get pods -n todo-app -o yaml > pods.yaml

# Service status
kubectl get svc -n todo-app -o yaml > services.yaml

# Events
kubectl get events -n todo-app -o yaml > events.yaml

# Logs
kubectl logs -n todo-app -l app=backend > backend.log
kubectl logs -n todo-app -l app=frontend > frontend.log
kubectl logs -n todo-app -l app=postgres > postgres.log

# Describe resources
kubectl describe pod -n todo-app -l app=backend > backend-describe.txt
kubectl describe pod -n todo-app -l app=frontend > frontend-describe.txt

# Create archive
cd ..
tar -czf todo-app-diagnostics.tar.gz diagnostics/
```

### Reset Everything

```bash
# Complete cleanup
./scripts/delete-minikube.sh

# Delete Minikube cluster
minikube delete

# Start fresh
minikube start --driver=docker --cpus=2 --memory=4096
./scripts/build.sh
./scripts/deploy-minikube.sh
```

## Known Limitations

1. **Single-node PostgreSQL**: StatefulSet has 1 replica. For HA, need PostgreSQL operator or external database.

2. **No Ingress**: Using NodePort for local access. Phase V will add Ingress for production.

3. **Local-only persistence**: Minikube persistent volumes are tied to the Minikube VM.

4. **No automatic scaling**: Manual scaling only. HPA will be added in Phase V.

5. **Basic secrets**: Using Kubernetes secrets. For production, use external secret management (HashiCorp Vault, AWS Secrets Manager, etc.).
