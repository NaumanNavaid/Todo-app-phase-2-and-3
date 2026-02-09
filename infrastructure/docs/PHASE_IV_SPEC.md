# Phase IV: Local Kubernetes Deployment - Specification

## Document Information

| Field | Value |
|-------|-------|
| **Phase** | IV: Local Kubernetes Deployment |
| **Status** | Implemented |
| **Target Environment** | Minikube (Local Kubernetes) |
| **Architecture Style** | Cloud-native, API-first, Stateless |
| **Future Phase** | V: Helm Charts + Cloud Kubernetes |

---

## 1. Objectives

### Primary Goals

1. **Containerize Applications**: Production-grade Docker images for frontend and backend
2. **Kubernetes Deployment**: Complete manifests for local Minikube deployment
3. **Infrastructure as Code**: All infrastructure defined in YAML, no manual configuration
4. **Reproducible Builds**: Same artifacts across deployments
5. **Cloud-Native Architecture**: Stateless, scalable, API-first design
6. **Future-Proof**: Ready for Helm and cloud migration in Phase V

### Non-Goals

- Production cloud deployment (Phase V)
- High availability (multi-node)
- Advanced networking (Ingress, Service Mesh)
- External database integration
- Monitoring and observability stack
- CI/CD pipeline integration

---

## 2. Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Minikube Cluster                         │
│                                                                  │
│  ┌──────────────────┐         ┌──────────────────┐              │
│  │   Frontend       │         │    Backend       │              │
│  │   Deployment     │────────>│    Deployment    │              │
│  │   Replicas: 2    │         │    Replicas: 2   │              │
│  │   Port: 3000     │         │    Port: 8000    │              │
│  └──────────────────┘         └────────┬─────────┘              │
│                                        │                         │
│                                        ▼                         │
│                         ┌──────────────────────┐                │
│                         │  PostgreSQL          │                │
│                         │  StatefulSet: 1      │                │
│                         │  Port: 5432          │                │
│                         │  Storage: 1Gi PVC    │                │
│                         └──────────────────────┘                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
         ▲                                          ▲
         │ NodePort 30000                           │ NodePort 30001
         │                                          │
    ┌────┴──────┐                            ┌─────┴─────┐
    │ Frontend  │                            │  Backend  │
    │  Service  │                            │  Service  │
    └───────────┘                            └───────────┘
         │                                          │
    ┌────┴──────────────────────────────────────────┴────┐
    │                 Host Machine                        │
    │            Access via localhost:30000              │
    └─────────────────────────────────────────────────────┘
```

### Network Flow

1. **User → Frontend**: NodePort 30000 → Frontend Pod
2. **Frontend → Backend**: Internal DNS `backend:8000` → Backend Pod
3. **Backend → Database**: Internal DNS `postgres:5432` → PostgreSQL Pod

---

## 3. Container Specifications

### Backend Container

| Attribute | Value |
|-----------|-------|
| **Base Image** | `python:3.11-slim` |
| **Build Type** | Multi-stage |
| **Runtime Port** | 8000 |
| **User** | Non-root (`appuser`) |
| **Health Check** | `/health` endpoint |
| **Image Size** | ~150MB (optimized) |

**Environment Variables:**
- `DATABASE_URL`: From Secret
- `SECRET_KEY`: From Secret
- `OPENAI_API_KEY`: From Secret
- `ENVIRONMENT`: `production`
- `CORS_ORIGINS`: Comma-separated list

### Frontend Container

| Attribute | Value |
|-----------|-------|
| **Base Image** | `node:20-alpine` |
| **Build Type** | Multi-stage |
| **Runtime Port** | 3000 |
| **User** | Non-root (`nextjs`) |
| **Health Check** | HTTP GET `/` |
| **Output Mode** | Next.js Standalone |

**Environment Variables:**
- `NEXT_PUBLIC_API_URL`: `http://backend:8000`
- `NODE_ENV`: `production`
- `PORT`: `3000`

---

## 4. Kubernetes Resources

### 4.1 Namespace

```yaml
Name: todo-app
Labels:
  - name: todo-app
  - environment: development
```

### 4.2 Deployments

#### Backend Deployment

```yaml
Kind: Deployment
Replicas: 2
Strategy: RollingUpdate
Containers:
  - name: backend
    image: todo-backend:latest
    port: 8000
    resources:
      requests: 256Mi, 250m CPU
      limits: 512Mi, 500m CPU
    probes:
      liveness: /health, 15s initial, 20s period
      readiness: /health, 5s initial, 10s period
```

#### Frontend Deployment

```yaml
Kind: Deployment
Replicas: 2
Strategy: RollingUpdate
Containers:
  - name: frontend
    image: todo-frontend:latest
    port: 3000
    resources:
      requests: 128Mi, 100m CPU
      limits: 256Mi, 200m CPU
    probes:
      liveness: /, 20s initial, 20s period
      readiness: /, 5s initial, 10s period
```

### 4.3 StatefulSet

#### PostgreSQL

```yaml
Kind: StatefulSet
Replicas: 1
ServiceName: postgres
Containers:
  - name: postgres
    image: postgres:16-alpine
    port: 5432
    resources:
      requests: 128Mi, 100m CPU
      limits: 256Mi, 200m CPU
    volumeMounts:
      - name: postgres-storage
        mountPath: /var/lib/postgresql/data
volumeClaimTemplates:
  - name: postgres-storage
    accessModes: ReadWriteOnce
    storage: 1Gi
```

### 4.4 Services

| Name | Type | Cluster Port | NodePort | Selector |
|------|------|--------------|----------|----------|
| frontend | NodePort | 3000 | 30000 | app=frontend |
| backend | NodePort | 8000 | 30001 | app=backend |
| postgres | ClusterIP | 5432 | - | app=postgres |

### 4.5 Secrets

#### postgres-secret

```yaml
Data:
  - postgres-password
  - database-url (formatted connection string)
```

#### backend-secret

```yaml
Data:
  - secret-key (JWT signing)
  - openai-api-key
```

---

## 5. Infrastructure Folder Structure

```
infrastructure/
├── docker/
│   ├── backend/
│   │   └── Dockerfile
│   └── frontend/
│       ├── Dockerfile
│       └── .dockerignore
├── k8s/
│   ├── base/
│   │   ├── namespace.yaml
│   │   ├── backend/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   ├── frontend/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   └── postgres/
│   │       ├── deployment.yaml
│   │       ├── service.yaml
│   │       ├── persistentvolumeclaim.yaml
│   │       └── secret.yaml
│   └── minikube/
│       ├── kustomization.yaml
│       └── patches/
│           └── nodeport-services.yaml
├── scripts/
│   ├── build.sh
│   ├── deploy-minikube.sh
│   ├── delete-minikube.sh
│   ├── validate.sh
│   └── port-forward.sh
└── docs/
    ├── PHASE_IV_SPEC.md (this file)
    ├── DEPLOYMENT_GUIDE.md
    └── TROUBLESHOOTING.md
```

---

## 6. Deployment Process

### 6.1 Build Phase

```bash
./scripts/build.sh
```

**Steps:**
1. Verify Minikube is running
2. Set Docker environment to Minikube
3. Build backend image (multi-stage)
4. Build frontend image (multi-stage)
5. Verify images in local registry

### 6.2 Deploy Phase

```bash
./scripts/deploy-minikube.sh
```

**Steps:**
1. Verify prerequisites (Minikube, kubectl)
2. Start Minikube if needed
3. Apply Kustomize manifests
4. Wait for PostgreSQL readiness
5. Wait for Backend readiness
6. Wait for Frontend readiness
7. Display access information

### 6.3 Validation Phase

```bash
./scripts/validate.sh
```

**Checks:**
1. Namespace exists
2. All pods running
3. All pods ready
4. Services have endpoints
5. Backend health endpoint responds
6. Generate pass/warn/fail report

---

## 7. Resource Requirements

### Minikube Cluster

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPUs | 2 | 4 |
| Memory | 4GB | 8GB |
| Disk | 20GB | 30GB |
| Driver | docker / hyperkit | docker |

### Per-Pod Resources

| Pod | Memory Request | Memory Limit | CPU Request | CPU Limit |
|-----|----------------|--------------|-------------|-----------|
| Backend (x2) | 256Mi | 512Mi | 250m | 500m |
| Frontend (x2) | 128Mi | 256Mi | 100m | 200m |
| PostgreSQL (x1) | 128Mi | 256Mi | 100m | 200m |
| **Total** | ~896Mi | ~1.75Gi | ~800m | ~1.6GHz |

---

## 8. Security Considerations

### Implemented

- Non-root users in containers
- Readiness and liveness probes
- Resource limits (prevents DoS)
- Secrets for sensitive data
- Network policies (implicit via namespace)

### NOT Implemented (Future Phases)

- Pod Security Policies / Pod Security Standards
- Network policies (explicit deny/allow)
- Secrets encryption at rest
- RBAC authorization
- Image signing/verification
- Security scanning

---

## 9. Design Decisions

### Why NodePort for Services?

**Decision:** Use NodePort instead of Ingress or LoadBalancer

**Rationale:**
- Works out-of-box with Minikube
- No additional infrastructure required
- Simple for local development
- Easy to understand and debug

**Trade-off:** Requires manual port management

### Why StatefulSet for PostgreSQL?

**Decision:** Use StatefulSet instead of Deployment

**Rationale:**
- Stable network identity
- Ordered deployment and scaling
- Persistent storage binding
- Designed for stateful workloads

**Trade-off:** Single replica (no HA)

### Why Kustomize?

**Decision:** Use Kustomize for overlay management

**Rationale:**
- Native to kubectl
- No additional tools required
- Simple patching mechanism
- Easy to understand

**Trade-off:** Less powerful than Helm (sufficient for Phase IV)

### Why Multi-stage Dockerfiles?

**Decision:** Multi-stage builds for both containers

**Rationale:**
- Smaller final image size
- Separates build from runtime
- Doesn't include build tools in production
- Better security (smaller attack surface)

**Trade-off:** Slightly more complex build files

---

## 10. Success Criteria

### Functional Requirements

- [x] Frontend accessible via NodePort
- [x] Backend API accessible via NodePort
- [x] Frontend can communicate with Backend
- [x] Backend can communicate with Database
- [x] All pods pass readiness probes
- [x] Health checks return 200 OK
- [x] Data persists across pod restarts

### Non-Functional Requirements

- [x] Stateless application tier
- [x] Replicas for high availability
- [x] Resource limits defined
- [x] No manual configuration required
- [x] Reproducible builds
- [x] Infrastructure as code

### Developer Experience

- [x] Single-command build
- [x] Single-command deploy
- [x] Validation script
- [x] Clear documentation
- [x] Troubleshooting guide

---

## 11. Migration Path to Phase V

### Phase IV → Phase V Changes

| Area | Phase IV | Phase V |
|------|----------|---------|
| **Package Format** | Kustomize | Helm Chart |
| **Ingress** | NodePort | Ingress Controller |
| **Database** | Embedded StatefulSet | External (RDS/Cloud SQL) |
| **Scaling** | Manual | HPA (Horizontal Pod Autoscaler) |
| **Environment** | Single (Minikube) | Multiple (dev/stage/prod) |
| **Cloud** | Local (Minikube) | AWS EKS / GCP GKE / Azure AKS |
| **Monitoring** | None | Prometheus + Grafana |
| **Logging** | kubectl logs | EFK/ELK Stack |
| **Secrets** | K8s Secrets | External Secret Manager |
| **CI/CD** | Manual | GitHub Actions / GitLab CI |

### Seamless Migration

All base manifests in `k8s/base/` are environment-agnostic and can be directly converted to Helm templates.

---

## 12. Appendix

### A. Port Reference

| Context | Frontend | Backend | Database |
|---------|----------|---------|----------|
| Container | 3000 | 8000 | 5432 |
| Service (Cluster) | 3000 | 8000 | 5432 |
| Service (NodePort) | 30000 | 30001 | N/A |
| Local (port-forward) | 3000 | 8000 | 5432 |

### B. DNS Names (Internal)

- Frontend: `frontend.todo-app.svc.cluster.local`
- Backend: `backend.todo-app.svc.cluster.local`
- Database: `postgres.todo-app.svc.cluster.local`

### C. Quick Reference Commands

```bash
# Build everything
./scripts/build.sh

# Deploy everything
./scripts/deploy-minikube.sh

# Check status
kubectl get all -n todo-app

# View logs
kubectl logs -n todo-app -l app=backend -f

# Validate
./scripts/validate.sh

# Port forward
./scripts/port-forward.sh

# Cleanup
./scripts/delete-minikube.sh
```

---

**Document Version:** 1.0
**Last Updated:** 2025
**Maintained By:** DevOps Team
