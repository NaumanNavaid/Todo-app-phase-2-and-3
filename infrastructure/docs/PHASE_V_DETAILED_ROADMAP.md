# Phase V: Advanced Cloud Deployment - Detailed Roadmap

**Timeline:** Now until Sunday
**Objective:** Implement advanced features, Dapr, event-driven architecture, and cloud deployment
**Approach:** Spec-driven development with Agentic Dev Stack

---

## 📋 Overview

Phase V consists of **three main parts** that should be completed sequentially:

```
Part A → Part B → Part C
Features  → Local   → Cloud
         + Dapr    Deployment
```

**Estimated Total Time:** 20-30 hours (spread across multiple days)

---

## 🎯 Part A: Advanced Features Implementation

### Goal
Implement all Intermediate and Advanced level features + event-driven architecture with Dapr

### Tasks Breakdown (8-10 hours)

#### A1. Database Schema Changes (2 hours)
- [ ] Add `priority` field to todos table (enum: low, medium, high, urgent)
- [ ] Add `due_date` datetime field
- [ ] Add `reminder_sent` boolean field
- [ ] Add `recurring_type` enum field (none, daily, weekly, monthly)
- [ ] Add `recurring_end_date` datetime field
- [ ] Create `tags` table (id, name, color, user_id)
- [ ] Create `todo_tags` junction table (many-to-many relationship)
- [ ] Create migration scripts
- [ ] Update Pydantic models

**Deliverable:** Updated database models and migrations

---

#### A2. Backend API - Intermediate Features (2 hours)
- [ ] **Priority Endpoints**
  - [ ] PUT `/api/todos/{id}/priority` - Update priority
  - [ ] GET `/api/todos/priority/{level}` - Filter by priority

- [ ] **Tag Endpoints**
  - [ ] POST `/api/tags` - Create tag
  - [ ] GET `/api/tags` - List all user tags
  - [ ] PUT `/api/todos/{id}/tags` - Add tags to todo
  - [ ] DELETE `/api/todos/{id}/tags/{tag_id}` - Remove tag

- [ ] **Search & Filter Endpoints**
  - [ ] GET `/api/todos/search?q={query}` - Full-text search
  - [ ] GET `/api/todos/filter?priority={level}&status={status}` - Advanced filter
  - [ ] GET `/api/todos/sort?by={field}&order={asc/desc}` - Sort todos

**Deliverable:** New API endpoints with OpenAPI docs

---

#### A3. Backend API - Advanced Features (2 hours)
- [ ] **Due Dates & Reminders**
  - [ ] Add due date validation
  - [ ] POST `/api/todos/{id}/reminder` - Set reminder
  - [ ] Background task to check due todos every hour
  - [ ] Email notification system (SendGrid/Mailgun)

- [ ] **Recurring Tasks**
  - [ ] POST `/api/todos/{id}/recur` - Set recurrence
  - [ ] Background worker to handle recurrence logic
  - [ ] Auto-create new todo when recurring task completes
  - [ ] Handle recurring_end_date

- [ ] **Event-Driven Architecture (Kafka)**
  - [ ] Install Kafka locally (docker-compose)
  - [ ] Create Kafka topics: `todo-events`, `reminder-events`
  - [ ] Produce events on todo creation/update
  - [ ] Consumer for reminder notifications
  - [ ] Consumer for audit logging

**Deliverable:** Working advanced features with Kafka

---

#### A4. Dapr Integration (2 hours)
- [ ] Install Dapr CLI
- [ ] Initialize Dapr on local machine
- [ ] **Dapr Components Setup**
  - [ ] Pub/Sub component (Kafka/Redis)
  - [ ] State store component (Redis)
  - [ ] Secret store component (Local environment)
  - [ ] Binding component (Cron for reminders)
  - [ ] Service invocation component

- [ ] **Backend Dapr Integration**
  - [ ] Add Dapr sidecar to backend deployment
  - [ ] Update backend to publish events via Dapr
  - [ ] Create Dapr pub/sub subscribers
  - [ ] Implement state management with Dapr
  - [ ] Use Dapr secrets management

- [ ] **Frontend Dapr Integration**
  - [ ] Add Dapr sidecar to frontend
  - [ ] Use Dapr service invocation to call backend
  - [ ] Subscribe to Dapr events for real-time updates

**Deliverable:** Dapr-enabled microservices architecture

---

#### A5. Frontend - Advanced Features (2 hours)
- [ ] **Priority UI**
  - [ ] Add priority selector (4 levels with colors)
  - [ ] Filter by priority
  - [ ] Sort by priority

- [ ] **Tags UI**
  - [ ] Tag creation modal
  - [ ] Tag selection dropdown
  - [ ] Tag chips on todo items
  - [ ] Filter by tags

- [ ] **Search UI**
  - [ ] Search bar in header
  - [ ] Real-time search results
  - [ ] Search highlighting

- [ ] **Filter & Sort UI**
  - [ ] Filter panel (priority, status, tags)
  - [ ] Sort dropdown (date, priority, title)
  - [ ] Combined filter + sort

- [ ] **Due Dates UI**
  - [ ] Date picker component
  - [ ] Due date display on todos
  - [ ] Overdue highlighting

- [ ] **Recurring Tasks UI**
  - [ ] Recurrence pattern selector
  - [ ] End date picker
  - [ ] Visual indicator for recurring tasks

**Deliverable:** Full-featured frontend with all advanced capabilities

---

## 🎯 Part B: Local Deployment with Dapr

### Goal
Deploy entire stack to Minikube with Full Dapr integration

### Tasks Breakdown (6-8 hours)

#### B1. Dapr on Minikube Setup (1 hour)
- [ ] Install Dapr on Minikube cluster
  ```bash
  dapr init -k
  ```
- [ ] Verify Dapr installation
- [ ] Install Dapr dashboard
- [ ] Create Dapr namespace
- [ ] Configure Dapr components for Minikube

**Deliverable:** Dapr running on Minikube

---

#### B2. Dapr Components Configuration (2 hours)
- [ ] **Pub/Sub Component** (Redis for Minikube)
  - [ ] Deploy Redis to Minikube
  - [ ] Create `pubsub.yaml` component definition
  - [ ] Test pub/sub with sample messages

- [ ] **State Store Component** (Redis)
  - [ ] Create `statestore.yaml` component
  - [ ] Test state operations (save/get/delete)

- [ ] **Secret Store Component** (Kubernetes secrets)
  - [ ] Create `secretstore.yaml` component
  - [ ] Migrate secrets to Dapr secret store
  - [ ] Test secret retrieval

- [ ] **Bindings Component** (Cron)
  - [ ] Create `cron-binding.yaml` for reminders
  - [ ] Configure cron schedule
  - [ ] Test cron triggers

- [ ] **Service Invocation**
  - [ ] Configure service discovery
  - [ ] Test frontend → backend communication
  - [ ] Enable mTLS for security

**Deliverable:** All Dapr components configured and tested

---

#### B3. Update Kubernetes Manifests (2 hours)
- [ ] **Backend Deployment**
  - [ ] Add Dapr sidecar annotations
  - [ ] Add Dapr configuration (app-id, enabled)
  - [ ] Update environment variables for Dapr
  - [ ] Add Dapr ports (HTTP, gRPC)

- [ ] **Frontend Deployment**
  - [ ] Add Dapr sidecar annotations
  - [ ] Configure Dapr for service invocation
  - [ ] Update API calls to use Dapr sidecar

- [ ] **Update Helm Chart**
  - [ ] Add Dapr annotations to templates
  - [ ] Create `values-dapr.yaml`
  - [ ] Add Dapr component configs
  - [ ] Update NOTES.txt with Dapr info

**Deliverable:** Updated Kubernetes manifests with Dapr

---

#### B4. Deploy & Test (2 hours)
- [ ] **Build New Images**
  - [ ] Build backend image with Dapr integration
  - [ ] Build frontend image with Dapr integration
  - [ ] Push to local registry (Minikube)

- [ ] **Deploy to Minikube**
  - [ ] Deploy Redis for Dapr components
  - [ ] Deploy Dapr components
  - [ ] Deploy application with updated Helm chart
  - [ ] Verify all pods running (including sidecars)

- [ ] **Test Dapr Features**
  - [ ] Test Pub/Sub (create todo, verify event published)
  - [ ] Test State (save/read state via Dapr API)
  - [ ] Test Service Invocation (frontend → backend via Dapr)
  - [ ] Test Bindings (cron triggers for reminders)
  - [ ] Test Secrets (retrieve secrets via Dapr)

- [ ] **Test Application Features**
  - [ ] Test all advanced features
  - [ ] Test real-time updates
  - [ ] Test recurring tasks creation
  - [ ] Test due date reminders

**Deliverable:** Fully working Dapr deployment on Minikube

---

#### B5. Documentation (1 hour)
- [ ] Document Dapr architecture
- [ ] Create Dapr troubleshooting guide
- [ ] Update deployment guide with Dapr steps
- [ ] Document component configurations
- [ ] Create testing checklist

**Deliverable:** Complete Dapr documentation

---

## 🎯 Part C: Cloud Deployment

### Goal
Deploy to production cloud (Azure AKS / Google GKE) with full monitoring

### Tasks Breakdown (8-10 hours)

#### C1. Cloud Provider Selection & Setup (1 hour)
- [ ] **Choose Cloud Provider** (Pick ONE)
  - [ ] **Oracle Cloud** (Recommended - Always Free)
    - 4 OCPUs, 24GB RAM free forever
    - No credit card needed after trial
    - Best for learning
  - [ ] **Azure AKS** ($200 credit, 30 days)
    - Good enterprise features
    - 12 months of selected free services
  - [ ] **Google GKE** ($300 credit, 90 days)
    - Best managed Kubernetes
    - Excellent integration with Google services

- [ ] **Account Setup**
  - [ ] Create cloud account
  - [ ] Set up billing (with credits)
  - [ ] Configure CLI tools (az/gcloud/oracle)
  - [ ] Authenticate with cloud

**Deliverable:** Cloud account ready

---

#### C2. Kubernetes Cluster Creation (1 hour)
- [ ] **Create Cluster**
  - [ ] For Oracle: Create OKE cluster
    ```bash
    oci ce cluster create ...
    ```
  - [ ] For Azure: Create AKS cluster
    ```bash
    az aks create --resource-group todo-app-rg --name todo-app-cluster ...
    ```
  - [ ] For GKE: Create GKE cluster
    ```bash
    gcloud container clusters create todo-app-cluster ...
    ```

- [ ] **Configure kubectl**
  - [ ] Get cluster credentials
  - [ ] Set kubectl context
  - [ ] Verify cluster access
  - [ ] Check node status

**Deliverable:** Running Kubernetes cluster on cloud

---

#### C3. Cloud Infrastructure Setup (2 hours)
- [ ] **Container Registry**
  - [ ] Create container registry (ACR/GCR/OCIR)
  - [ ] Authenticate with registry
  - [ ] Push images to registry
  - [ ] Update image references in manifests

- [ ] **Database Setup**
  - [ ] Create managed database (PostgreSQL)
    - [ ] Azure: Azure Database for PostgreSQL
    - [ ] GCP: Cloud SQL
    - [ ] Oracle: Base Database Service
  - [ ] Configure firewall/allowed IPs
  - [ ] Get connection string
  - [ ] Create database and schemas
  - [ ] Run migrations

- [ ] **Kafka Setup** (Choose ONE)
  - [ ] **Option 1: Kafka in Kubernetes**
    - [ ] Deploy Kafka + Zookeeper via Helm
    - [ ] Configure persistent storage
    - [ ] Set up Kafka topics

  - [ ] **Option 2: Managed Kafka** (Recommended)
    - [ ] Confluent Cloud (free trial available)
    - [ ] Redpanda Cloud (free tier)
    - [ ] Get connection details
    - [ ] Configure Dapr to use cloud Kafka

  - [ ] **Option 3: Alternative Pub/Sub**
    - [ ] Azure Service Bus
    - [ ] Google Pub/Sub
    - [ ] Configure Dapr component

- [ ] **Redis Setup** (for Dapr)
  - [ ] Create managed Redis (Azure Cache/GCP Memorystore)
  - [ ] Or deploy Redis in cluster
  - [ ] Get connection string
  - [ ] Update Dapr components

- [ ] **Networking**
  - [ ] Configure ingress controller (NGINX/Traefik)
  - [ ] Set up SSL/TLS certificates (Let's Encrypt)
  - [ ] Configure DNS domain (optional)
  - [ ] Set up firewall rules

**Deliverable:** All cloud infrastructure configured

---

#### C4. Dapr on Cloud Kubernetes (2 hours)
- [ ] **Install Dapr on Cloud Cluster**
  ```bash
  dapr init -k
  ```
- [ ] **Configure Dapr for Cloud**
  - [ ] Update component configs for cloud services
  - [ ] Configure cloud Redis for state store
  - [ ] Configure cloud Kafka for pub/sub
  - [ ] Configure cloud secret store
  - [ ] Enable mTLS with cert manager
  - [ ] Configure high availability (HA mode)

- [ ] **Deploy with Helm**
  - [ ] Create `values-production.yaml`
  - [ ] Update image repositories
  - [ ] Configure resource limits for cloud
  - [ ] Set replica counts (3+ for production)
  - [ ] Configure ingress rules
  - [ ] Deploy application

**Deliverable:** Dapr-enabled app running on cloud cluster

---

#### C5. CI/CD Pipeline (2 hours)
- [ ] **GitHub Actions Setup**
  - [ ] Create `.github/workflows/deploy.yml`
  - [ ] Configure workflow triggers (push to main)
  - [ ] Set up secrets in GitHub
    - [ ] Cloud credentials
    - [ ] Container registry credentials
    - [ ] Database connection strings
    - [ ] API keys

- [ ] **Build Stage**
  - [ ] Build backend Docker image
  - [ ] Build frontend Docker image
  - [ ] Run tests (unit/integration)
  - [ ] Push images to registry

- [ ] **Deploy Stage**
  - [ ] Update Kubernetes manifests with new image tags
  - [ ] Run database migrations
  - [ ] Deploy to cluster (Helm upgrade)
  - [ ] Run smoke tests
  - [ ] Notify deployment status

**Deliverable:** Automated CI/CD pipeline

---

#### C6. Monitoring & Logging (2 hours)
- [ ] **Monitoring Stack**
  - [ ] Deploy Prometheus (metrics collection)
  - [ ] Deploy Grafana (visualization)
  - [ ] Configure Prometheus targets
  - [ ] Create Grafana dashboards
    - [ ] Cluster health
    - [ ] Application metrics
    - [ ] Dapr metrics
  - [ ] Set up alerts (Alertmanager)

- [ ] **Logging Stack**
  - [ ] Deploy EFK/ELK stack
    - [ ] Elasticsearch (log storage)
    - [ ] Fluentd (log collection)
    - [ ] Kibana (log visualization)
  - [ ] Or use cloud logging
    - [ ] Azure Log Analytics
    - [ ] Google Cloud Logging
  - [ ] Configure log aggregation
  - [ ] Set up log queries and alerts

- [ ] **Distributed Tracing** (Optional)
  - [ ] Deploy Jaeger/Zipkin
  - [ ] Configure Dapr tracing
  - [ ] Add tracing to application code
  - [ ] Visualize service calls

- [ ] **Health Checks**
  - [ ] Configure liveness probes
  - [ ] Configure readiness probes
  - [ ] Set up health check endpoints
  - [ ] Configure auto-scaling (HPA)

**Deliverable:** Complete observability stack

---

#### C7. Final Testing & Documentation (2 hours)
- [ ] **End-to-End Testing**
  - [ ] Test all features in production
  - [ ] Load testing (k6/Artillery)
  - [ ] Failover testing
  - [ ] Backup/restore testing

- [ ] **Security Hardening**
  - [ ] Network policies
  - [ ] Pod security policies
  - [ ] RBAC configuration
  - [ ] Secret rotation
  - [ ] SSL/TLS verification

- [ ] **Documentation**
  - [ ] Update deployment guide for cloud
  - [ ] Document cloud infrastructure
  - [ ] Create runbook for operations
  - [ ] Document CI/CD process
  - [ ] Create disaster recovery plan

**Deliverable:** Production-ready deployment with docs

---

## 📅 Suggested Timeline (Until Sunday)

### Option 1: 5-Day Plan (Recommended)

**Day 1 (Friday)**
- ✅ Morning: A1. Database schema changes (2h)
- ✅ Afternoon: A2. Backend - Intermediate features (2h)
- ✅ Evening: Start A3. Backend - Advanced features

**Day 2 (Saturday)**
- ✅ Morning: Complete A3. Backend - Advanced features (2h)
- ✅ Afternoon: A4. Dapr integration (2h)
- ✅ Evening: A5. Frontend - Advanced features (2h)

**Day 3 (Sunday)**
- ✅ Morning: B1-B2. Dapr setup & components (3h)
- ✅ Afternoon: B3. Update manifests + B4. Deploy to Minikube (3h)
- ✅ Evening: Test & troubleshoot

**Day 4 (Monday)**
- ✅ Morning: C1-C2. Cloud account & cluster creation (2h)
- ✅ Afternoon: C3. Cloud infrastructure setup (2h)
- ✅ Evening: C4. Dapr on cloud (2h)

**Day 5 (Tuesday)**
- ✅ Morning: C5. CI/CD pipeline (2h)
- ✅ Afternoon: C6. Monitoring & logging (2h)
- ✅ Evening: C7. Final testing & documentation (2h)

---

### Option 2: 3-Day Intensive Plan

**Day 1: Part A - Features (8 hours)**
- Complete A1-A5
- Focus on backend and frontend features
- Get Kafka and Dapr working locally

**Day 2: Part B - Local + Dapr (8 hours)**
- Complete B1-B5
- Deploy everything to Minikube with Dapr
- Test thoroughly

**Day 3: Part C - Cloud (8 hours)**
- Complete C1-C7
- Deploy to cloud
- Set up CI/CD and monitoring

---

### Option 3: Focused 2-Day Plan (Minimum Viable)

**Day 1: Core Features + Local Dapr**
- A1. Database (2h)
- A2-A3. Backend features (4h) - Skip recurring tasks initially
- B1-B2. Dapr setup (2h)
- B3-B4. Deploy to Minikube (2h)

**Day 2: Cloud Deployment**
- C1-C3. Cloud setup (4h)
- C4. Deploy to cloud (2h)
- C6. Basic monitoring (2h)

*Skip: CI/CD, advanced features, full documentation*

---

## 🎯 Critical Path (Must-Have)

If you're short on time, focus on these tasks:

1. **Database schema updates** (A1)
2. **Backend API - Priority & Tags** (A2 partial)
3. **Dapr setup locally** (A4)
4. **Deploy with Dapr to Minikube** (B1-B4)
5. **Cloud cluster creation** (C1-C2)
6. **Deploy to cloud** (C3-C4)

**Minimum time:** 12-15 hours for core cloud deployment

---

## 📊 Resource Requirements

### Tools & Services Needed

| Category | Tool | Cost |
|----------|------|------|
| **Cloud** | Oracle/Azure/GCP | Free tier available |
| **Container Registry** | ACR/GCR/OCIR | Free tier |
| **Database** | Managed PostgreSQL | Free tier available |
| **Kafka** | Confluent/Redpanda | Free trial |
| **Redis** | Azure Cache/Memorystore | Free tier |
| **Monitoring** | Prometheus/Grafana | Free (self-hosted) |
| **CI/CD** | GitHub Actions | Free for public repos |
| **Domain** | Optional | $10-15/year |

**Total cost:** Can be done with **$0** using free tiers!

---

## 🚦 Risk Assessment & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Kafka complexity | High | Start with Redis pub/sub, migrate later |
| Cloud costs | Medium | Use free tiers, set budgets |
| Dapr learning curve | Medium | Follow docs, use examples |
| Time constraints | High | Focus on critical path, skip nice-to-haves |
| Cloud provider issues | Medium | Have backup provider ready |

---

## ✅ Success Criteria

### Part A
- [ ] All intermediate features working (priority, tags, search)
- [ ] At least 1-2 advanced features working (due dates, recurring tasks)
- [ ] Kafka or Dapr pub/sub working
- [ ] Dapr sidecars running locally

### Part B
- [ ] Full deployment on Minikube with Dapr
- [ ] All Dapr components configured (pub/sub, state, secrets, bindings)
- [ ] Service invocation working
- [ ] End-to-end feature testing passing

### Part C
- [ ] Application deployed on cloud Kubernetes
- [ ] Accessible via public URL/ingress
- [ ] CI/CD pipeline functional
- [ ] Basic monitoring in place
- [ ] Documentation complete

---

## 📚 Resources & References

### Documentation
- [Dapr Documentation](https://docs.dapr.io/)
- [Kafka Documentation](https://kafka.apache.org/documentation/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [Azure AKS Docs](https://docs.microsoft.com/azure/aks/)
- [Google GKE Docs](https://cloud.google.com/kubernetes-engine/docs)
- [Oracle OKE Docs](https://docs.oracle.com/en-us/contour/)

### Tutorials
- [Dapr Getting Started](https://docs.dapr.io/getting-started/)
- [Kafka with Dapr](https://docs.dapr.io/developing-applications/building-blocks/pubsub/howto-publish-subscribe/)
- [Kubernetes for Developers](https://kubernetes.io/docs/tutorials/)

### Video Guides
- Dapr YouTube Channel
- Kubernetes YouTube Channel
- Cloud provider tutorials

---

## 🎓 Learning Outcomes

After completing Phase V, you'll have experience with:

1. **Advanced Features Development**
   - Complex database relationships
   - Background workers & cron jobs
   - Event-driven architecture

2. **Dapr Distributed Runtime**
   - Microservices patterns
   - Service mesh concepts
   - Distributed state management

3. **Cloud-Native Deployment**
   - Production Kubernetes clusters
   - Managed cloud services
   - Infrastructure as Code

4. **DevOps Practices**
   - CI/CD pipelines
   - Monitoring & observability
   - Site reliability engineering

5. **Event-Driven Architecture**
   - Message queues (Kafka)
   - Pub/Sub patterns
   - Async processing

---

## 🆘 Getting Help

If you get stuck:

1. **Check logs first**
   - `kubectl logs -f <pod-name>`
   - Dapr sidecar logs: `kubectl logs <pod-name> -c daprd`

2. **Use Dapr dashboard**
   - `dapr dashboard`
   - Visual debugging

3. **Refer to Phase IV documentation**
   - [Deployment Guide](infrastructure/docs/DEPLOYMENT_GUIDE.md)
   - [Troubleshooting](infrastructure/docs/TROUBLESHOOTING.md)

4. **Ask Claude Code**
   - Specific questions about errors
   - Code review and suggestions
   - Best practices

5. **Community resources**
   - Dapr Discord
   - Kubernetes Slack
   - Stack Overflow

---

**Ready to start Phase V? Begin with Part A, Task A1: Database Schema Changes!**

Good luck! 🚀
