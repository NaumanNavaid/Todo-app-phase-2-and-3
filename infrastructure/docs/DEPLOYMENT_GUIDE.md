# Phase IV: Local Kubernetes Deployment Guide

## Overview

This guide walks you through deploying the AI-powered Todo application to a local Minikube cluster using the infrastructure provided in Phase IV.

## Prerequisites

### Required Software

| Tool | Version | Purpose | Install Link |
|------|---------|---------|--------------|
| Docker | Latest | Container runtime | https://docs.docker.com/get-docker/ |
| Minikube | v1.28+ | Local Kubernetes cluster | https://minikube.sigs.k8s.io/docs/start/ |
| kubectl | Matches K8s version | Kubernetes CLI | https://kubernetes.io/docs/tasks/tools/ |
| Bash | Any | Run deployment scripts | Usually pre-installed |

### Verify Prerequisites

```bash
# Check Docker
docker --version

# Check Minikube
minikube version

# Check kubectl
kubectl version --client

# Check Bash
bash --version
```

## Quick Start

### 1. Clone and Navigate

```bash
cd Todo-app-phase-2-and-3/infrastructure
```

### 2. Start Minikube (Optional)

```bash
# Start Minikube with recommended settings
minikube start --driver=docker --cpus=2 --memory=4096

# Verify status
minikube status
```

### 3. Build Docker Images

```bash
# Make scripts executable (Linux/Mac)
chmod +x scripts/*.sh

# Build all images
./scripts/build.sh
```

This will:
- Build the backend image (`todo-backend:latest`)
- Build the frontend image (`todo-frontend:latest`)
- Load images into Minikube's Docker registry

### 4. Deploy to Minikube

```bash
./scripts/deploy-minikube.sh
```

This will:
- Apply all Kubernetes manifests
- Deploy PostgreSQL, Backend, and Frontend
- Wait for all services to be ready
- Display access URLs

### 5. Access the Application

**Option A: Via NodePort (Direct)**

```
Frontend: http://<MINIKUBE_IP>:30000
Backend:  http://<MINIKUBE_IP>:30001
```

Get your Minikube IP:
```bash
minikube ip
```

**Option B: Via Port Forwarding**

```bash
./scripts/port-forward.sh
```

Then access:
```
Frontend: http://localhost:3000
Backend:  http://localhost:8000
```

### 6. Validate Deployment

```bash
./scripts/validate.sh
```

## Detailed Steps

### Understanding the Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Minikube Cluster                     │
│                                                         │
│  ┌──────────────┐      ┌──────────────┐               │
│  │   Frontend   │──────│   Backend    │               │
│  │  (NodePort)  │      │  (NodePort)  │               │
│  │   Port 30000 │      │   Port 30001 │               │
│  └──────────────┘      └──────┬───────┘               │
│                                │                        │
│                                ▼                        │
│                        ┌──────────────┐               │
│                        │  PostgreSQL  │               │
│                        │  (StatefulSet)│               │
│                        └──────────────┘               │
└─────────────────────────────────────────────────────────┘
```

### Secrets Configuration

Before deploying, you may want to update the secrets in [`k8s/base/postgres/secret.yaml`](../k8s/base/postgres/secret.yaml):

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
  namespace: todo-app
type: Opaque
stringData:
  postgres-password: "CHANGE_ME_SECURE_PASSWORD"
  database-url: "postgresql://todo_user:CHANGE_ME_SECURE_PASSWORD@postgres:5432/todoapp"
---
apiVersion: v1
kind: Secret
metadata:
  name: backend-secret
  namespace: todo-app
type: Opaque
stringData:
  secret-key: "CHANGE_ME_GENERATE_WITH_OPENSSL"
  openai-api-key: "your-openai-api-key-here"
```

**Generate secure values:**
```bash
# Generate secret key
openssl rand -hex 32

# Generate password
openssl rand -base64 16
```

## Commands Reference

### Build Commands

```bash
# Build all images
./scripts/build.sh

# Build only backend
cd ../backend
docker build -f ../infrastructure/docker/backend/Dockerfile -t todo-backend:latest .

# Build only frontend
cd ../frontend
docker build -f ../infrastructure/docker/frontend/Dockerfile -t todo-frontend:latest .
```

### Deployment Commands

```bash
# Full deployment
./scripts/deploy-minikube.sh

# Apply manifests manually
kubectl apply -k k8s/minikube

# Check deployment status
kubectl get all -n todo-app

# Get pod logs
kubectl logs -n todo-app -l app=backend --tail=-1
kubectl logs -n todo-app -l app=frontend --tail=-1

# Get pod logs (follow)
kubectl logs -n todo-app -l app=backend -f
```

### Troubleshooting Commands

```bash
# Check pod status
kubectl get pods -n todo-app

# Describe pod for events
kubectl describe pod -n todo-app <pod-name>

# Check services
kubectl get svc -n todo-app

# Check endpoints
kubectl get endpoints -n todo-app

# Port forward to local
kubectl port-forward -n todo-app svc/frontend 3000:3000
kubectl port-forward -n todo-app svc/backend 8000:8000

# Exec into pod
kubectl exec -it -n todo-app <pod-name> -- /bin/sh

# Delete everything
./scripts/delete-minikube.sh
```

## Kubernetes Resources

### Namespace
- **Name:** `todo-app`
- **Purpose:** Logical isolation of application resources

### Deployments

#### Backend
- **Replicas:** 2
- **Image:** `todo-backend:latest`
- **Port:** 8000
- **Resources:** 256Mi-512Mi RAM, 250m-500m CPU

#### Frontend
- **Replicas:** 2
- **Image:** `todo-frontend:latest`
- **Port:** 3000
- **Resources:** 128Mi-256Mi RAM, 100m-200m CPU

#### PostgreSQL
- **Replicas:** 1 (StatefulSet)
- **Image:** `postgres:16-alpine`
- **Port:** 5432
- **Storage:** 1Gi PersistentVolume
- **Resources:** 128Mi-256Mi RAM, 100m-200m CPU

### Services

| Service | Type | Cluster Port | NodePort | Purpose |
|---------|------|--------------|----------|---------|
| frontend | NodePort | 3000 | 30000 | Frontend access |
| backend | NodePort | 8000 | 30001 | Backend API access |
| postgres | ClusterIP | 5432 | - | Internal DB access |

## Environment Variables

### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT signing key
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `ENVIRONMENT`: Set to "production"
- `CORS_ORIGINS`: Allowed frontend origins

### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NODE_ENV`: Set to "production"

## Cleanup

### Remove Deployment

```bash
./scripts/delete-minikube.sh
```

### Remove Everything (Including Volumes)

```bash
# Delete namespace
kubectl delete namespace todo-app

# Delete persistent volumes
kubectl delete pv -l app=postgres

# Stop Minikube
minikube stop

# Delete Minikube cluster (optional)
minikube delete
```

## Next Steps

After successful deployment:

1. **Test the Application**
   - Create an account
   - Create todos
   - Test the AI chat feature

2. **Monitor Resources**
   ```bash
   kubectl top pods -n todo-app
   kubectl top nodes
   ```

3. **Review Logs**
   ```bash
   kubectl logs -n todo-app -l app=backend --tail=50 -f
   ```

4. **Prepare for Phase V** (Helm + Cloud K8s)
   - Review base manifests
   - Test scalability
   - Plan for cloud provider migration

## Tips and Best Practices

### Development Workflow

1. Make code changes
2. Rebuild affected image(s): `./scripts/build.sh`
3. Restart deployments:
   ```bash
   kubectl rollout restart deployment backend -n todo-app
   kubectl rollout restart deployment frontend -n todo-app
   ```

### Scaling

```bash
# Scale backend
kubectl scale deployment backend -n todo-app --replicas=3

# Scale frontend
kubectl scale deployment frontend -n todo-app --replicas=3
```

### Resource Optimization

Adjust resource limits in manifests based on your needs:
- Edit `k8s/base/backend/deployment.yaml`
- Edit `k8s/base/frontend/deployment.yaml`
- Reapply: `kubectl apply -k k8s/minikube`

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.
