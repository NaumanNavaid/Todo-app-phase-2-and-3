# AI DevOps Tools Guide - Phase IV

This guide explains how to use AI-powered DevOps tools (Gordon, kubectl-ai, Kagent) with the Todo application.

---

## 🤖 Docker AI (Gordon)

### Overview
Gordon is Docker's AI agent that helps with container operations, optimization, and troubleshooting.

### Setup Requirements

1. **Install Docker Desktop 4.53+**
   ```bash
   # Check Docker version
   docker --version

   # Update to latest Docker Desktop
   # Download: https://www.docker.com/products/docker-desktop
   ```

2. **Enable Beta Features**
   - Open Docker Desktop
   - Go to **Settings > Beta features**
   - Toggle **Enable Gordon** on
   - Restart Docker Desktop

3. **Verify Installation**
   ```bash
   docker ai "What can you do?"
   ```

### Usage Examples with Todo App

#### 1. Build Images with AI
```bash
# Ask Gordon to optimize the build
docker ai "Optimize the backend Dockerfile for production"

# Gordon will analyze and suggest improvements
docker ai "Multi-stage build for todo-backend with Python 3.11"
```

#### 2. Troubleshoot Containers
```bash
# Why is the backend crashing?
docker ai "Why is the todo-backend container exiting?"

# Check resource usage
docker ai "Analyze resource usage for todo-frontend container"
```

#### 3. Security Scanning
```bash
# Scan for vulnerabilities
docker ai "Scan todo-backend:latest for security vulnerabilities"

# Fix security issues
docker ai "Fix all critical vulnerabilities in todo-backend:latest"
```

#### 4. Optimization
```bash
# Reduce image size
docker ai "Optimize todo-frontend image size"

# Improve build cache
docker ai "Improve Dockerfile caching for faster builds"
```

#### 5. Debug Running Containers
```bash
# Check logs and identify issues
docker ai "Analyze logs from todo-backend container"

# Network troubleshooting
docker ai "Why can't frontend connect to backend?"
```

### Example Session

```bash
# Gordon helps you deploy
$ docker ai "Deploy todo-app with proper resource limits"

Gordon:
✓ Analyzing application requirements
✓ Suggesting memory: 512Mi, cpu: 500m for backend
✓ Suggesting memory: 256Mi, cpu: 200m for frontend
✓ Generating docker run command with resource limits

$ docker ai "Create docker-compose.yml for todo-app"

Gordon:
✓ Analyzing services: backend, frontend, postgres
✓ Creating network configuration
✓ Setting up volumes for persistence
✓ Configuring environment variables
✓ docker-compose.yml created successfully
```

---

## ☸️ kubectl-ai

### Overview
kubectl-ai is an AI-powered Kubernetes CLI that helps you manage clusters using natural language.

### Setup Requirements

1. **Install kubectl-ai**
   ```bash
   # Using Homebrew (macOS/Linux)
   brew install kubectl-ai

   # Using go install
   go install github.com/kubectl-ai/kubectl-ai@latest

   # Download binary
   # https://github.com/kubectl-ai/kubectl-ai/releases
   ```

2. **Configure API Key**
   ```bash
   # Set Gemini API key
   export GEMINI_API_KEY="your-gemini-api-key"

   # Or use OpenAI
   export OPENAI_API_KEY="your-openai-api-key"
   kubectl-ai --llm-provider openai
   ```

3. **Configure kubectl context**
   ```bash
   # Set Minikube context
   kubectl config use-context minikube

   # Verify
   kubectl cluster-info
   ```

### Usage Examples with Todo App

#### 1. Deploy with AI
```bash
# Deploy the entire stack
kubectl-ai "Deploy todo-app using Helm chart in infrastructure/helm/todo-app with 3 replicas"

# Scale based on load
kubectl-ai "Scale backend deployment to handle 1000 requests per second"

# Update deployment
kubectl-ai "Update frontend image to todo-frontend:v2.0"
```

#### 2. Troubleshooting
```bash
# Why are pods failing?
kubectl-ai "Check why backend pods are CrashLoopBackOff"

# Analyze cluster health
kubectl-ai "Analyze the health of todo-app namespace"

# Find resource bottlenecks
kubectl-ai "Find which pods are using the most memory in todo-app namespace"
```

#### 3. Optimization
```bash
# Optimize resource usage
kubectl-ai "Optimize resource allocation for todo-app deployments"

# Reduce costs
kubectl-ai "Suggest ways to reduce infrastructure costs for todo-app"

# Improve performance
kubectl-ai "Analyze and optimize todo-app performance"
```

#### 4. Security
```bash
# Security scan
kubectl-ai "Check for security vulnerabilities in todo-app deployment"

# Fix security issues
kubectl-ai "Apply security best practices to todo-app manifests"

# RBAC setup
kubectl-ai "Create proper RBAC rules for todo-app"
```

#### 5. Monitoring & Debugging
```bash
# Real-time monitoring
kubectl-ai "Monitor todo-app pods and alert on issues"

# Log analysis
kubectl-ai "Analyze backend logs for errors in the last hour"

# Network debugging
kubectl-ai "Debug network connectivity between frontend and backend"
```

### Example Session

```bash
# Deploy with natural language
$ kubectl-ai "Deploy todo-app using Helm with values from infrastructure/helm/todo-app/values-minikube.yaml"

AI: Analyzing Helm chart...
    ✓ Checking namespace
    ✓ Validating values file
    ✓ Installing todo-app release
    ✓ Waiting for deployments to be ready
    ✓ Deployment successful!

# Troubleshoot issues
$ kubectl-ai "Backend pods are failing, investigate and fix"

AI: Analyzing pod logs...
    Found: Database connection error
    Solution: Check postgres-secret and update DATABASE_URL
    Applying fix...
    ✓ Restarted backend pods
    ✓ Issue resolved
```

---

## 🔍 Kagent

### Overview
Kagent is an advanced Kubernetes agent for deep cluster analysis, optimization, and automation.

### Setup Requirements

1. **Install Kagent**
   ```bash
   # Using go install
   go install github.com/kubectl-ai/kagent@latest

   # Or download binary
   # https://github.com/kubectl-ai/kagent/releases
   ```

2. **Configure**
   ```bash
   # Set API key
   export GEMINI_API_KEY="your-api-key"

   # Initialize kagent
   kagent init
   ```

### Usage Examples with Todo App

#### 1. Cluster Analysis
```bash
# Complete cluster health check
kagent "Analyze the entire cluster health and identify issues"

# Resource optimization
kagent "Optimize resource allocation across all todo-app pods"

# Capacity planning
kagent "Predict when we need to scale todo-app based on current growth"
```

#### 2. Advanced Troubleshooting
```bash
# Deep dive analysis
kagent "Perform deep analysis of backend performance issues"

# Root cause analysis
kagent "Find root cause of high memory usage in frontend pods"

# Dependency analysis
kagent "Analyze dependencies between todo-app components"
```

#### 3. Cost Optimization
```bash
# Cost analysis
kagent "Analyze infrastructure costs for todo-app and suggest savings"

# Right-sizing recommendations
kagent "Suggest right-sizing for all deployments in todo-app namespace"

# Resource quotas
kagent "Setup resource quotas to prevent cost overruns"
```

#### 4. Automation
```bash
# Auto-scaling setup
kagent "Configure Horizontal Pod Autoscaler for todo-app based on CPU and memory"

# Alerting setup
kagent "Setup alerts for todo-app failures and performance degradation"

# Backup strategy
kagent "Design backup and disaster recovery strategy for todo-app"
```

#### 5. Compliance & Governance
```bash
# Compliance check
kagent "Check todo-app deployment for Kubernetes best practices compliance"

# Security audit
kagent "Perform security audit of todo-app deployment"

# Policy enforcement
kagent "Apply network policies to restrict todo-app communications"
```

### Example Session

```bash
# Comprehensive analysis
$ kagent "Analyze todo-app deployment and provide optimization recommendations"

AI: Analyzing todo-app deployment...
    ✓ Checking pod health
    ✓ Analyzing resource usage
    ✓ Reviewing security posture
    ✓ Evaluating performance

    Findings:
    1. Backend: Underutilized CPU (15%), can reduce to 200m
    2. Frontend: Memory limit too low, frequent OOM kills
    3. PostgreSQL: Missing backup strategy
    4. Network: No policies applied, security risk

    Recommendations:
    1. Update backend resources: cpu: 200m (save 40%)
    2. Increase frontend memory: 512Mi (prevent crashes)
    3. Setup PostgreSQL backup with volume snapshots
    4. Apply network policies to restrict traffic

    Would you like me to apply these changes? [y/N]
```

---

## 🚀 Complete AI-Powered Workflow

### Deploy Todo App Using AI Tools

#### Step 1: Build Images with Gordon
```bash
# Optimize and build
docker ai "Build production images for todo-backend and todo-frontend with multi-stage optimization"

# Gordon will:
# ✓ Analyze Dockerfiles
# ✓ Suggest optimizations
# ✓ Build images efficiently
# ✓ Tag and push to registry
```

#### Step 2: Deploy with kubectl-ai
```bash
# Deploy to Kubernetes
kubectl-ai "Deploy todo-app using infrastructure/helm/todo-app chart to Minikube with NodePort services"

# kubectl-ai will:
# ✓ Validate Helm chart
# ✓ Check cluster capacity
# ✓ Deploy with optimal settings
# ✓ Verify deployment health
```

#### Step 3: Optimize with Kagent
```bash
# Analyze and optimize
kagent "Analyze the deployed todo-app and optimize for production"

# Kagent will:
# ✓ Perform deep cluster analysis
# ✓ Identify bottlenecks
# ✓ Apply optimizations
# ✓ Setup monitoring
```

---

## 📊 Comparison: Manual vs AI-Powered

| Task | Manual Time | AI-Powered Time | Savings |
|------|-------------|-----------------|---------|
| **Build Docker images** | 10-15 min | 2-3 min | **80%** |
| **Debug container issues** | 20-30 min | 2-5 min | **85%** |
| **Deploy to Kubernetes** | 10-15 min | 1-2 min | **90%** |
| **Troubleshoot pods** | 15-20 min | 1-3 min | **90%** |
| **Optimize resources** | 30-60 min | 5-10 min | **85%** |
| **Security audit** | 45-60 min | 5-10 min | **90%** |

---

## 🎓 Best Practices

### 1. Always Verify AI Suggestions
```bash
# Let AI suggest changes
kubectl-ai "Optimize backend deployment"

# Review the suggested changes
kubectl diff deployment backend -n todo-app

# Apply if satisfied
kubectl apply -f suggested-changes.yaml
```

### 2. Use AI for Learning
```bash
# Ask AI to explain
kubectl-ai "Explain why StatefulSet is used for PostgreSQL instead of Deployment"

# Learn best practices
docker ai "What are Docker security best practices for production images?"
```

### 3. Combine AI Tools
```bash
# Gordon for containers
docker ai "Optimize Dockerfile"

# kubectl-ai for deployment
kubectl-ai "Deploy optimized images"

# Kagent for analysis
kagent "Analyze deployed application"
```

### 4. Version Control AI-Generated Changes
```bash
# Let AI make changes
kubectl-ai "Apply security best practices to todo-app"

# Review and commit
git diff
git add .
git commit -m "Apply AI-suggested security improvements"
```

---

## ⚠️ Limitations & Considerations

### 1. API Key Requirements
- kubectl-ai and Kagent require API keys (Gemini or OpenAI)
- Costs may apply based on usage
- Set spending limits on your API accounts

### 2. Understanding Still Required
- AI tools assist, but don't replace understanding
- Always review AI suggestions before applying
- Learn from AI recommendations

### 3. Not Always Perfect
- AI may suggest suboptimal solutions
- Context matters - AI doesn't know everything
- Test changes in non-production first

### 4. Network Dependency
- Requires internet connection for AI processing
- Latency may vary
- Have fallback manual processes ready

---

## 🔧 Troubleshooting AI Tools

### Gordon Not Available
```bash
# Check Docker Desktop version
docker --version  # Should be 4.53+

# Enable beta features
# Docker Desktop > Settings > Beta features > Toggle on Gordon

# Restart Docker Desktop
```

### kubectl-ai API Errors
```bash
# Check API key
echo $GEMINI_API_KEY

# Set new key
export GEMINI_API_KEY="your-key"

# Try different provider
kubectl-ai --llm-provider openai "test query"
```

### Kagent Issues
```bash
# Check installation
kagent version

# Reinitialize
kagent init --force

# Check logs
kagent logs --tail 50
```

---

## 📚 Additional Resources

- **Gordon Documentation**: https://docs.docker.com/gordon/
- **kubectl-ai GitHub**: https://github.com/kubectl-ai/kubectl-ai
- **Kagent GitHub**: https://github.com/kubectl-ai/kagent
- **Helm Documentation**: https://helm.sh/docs/
- **Kubernetes Documentation**: https://kubernetes.io/docs/

---

## 🎯 Quick Reference Commands

### Docker AI (Gordon)
```bash
docker ai "What can you do?"                          # Show capabilities
docker ai "Optimize Dockerfile"                        # Optimize build
docker ai "Debug container issues"                    # Troubleshoot
docker ai "Scan for vulnerabilities"                  # Security scan
```

### kubectl-ai
```bash
kubectl-ai "Deploy todo-app"                          # Deploy
kubectl-ai "Why are pods failing?"                    # Debug
kubectl-ai "Scale to 5 replicas"                      # Scale
kubectl-ai "Optimize resources"                       # Optimize
```

### Kagent
```bash
kagent "Analyze cluster health"                       # Analyze
kagent "Optimize infrastructure"                      # Optimize
kagent "Predict capacity needs"                      # Plan
kagent "Setup autoscaling"                           # Automate
```

---

**Generated:** 2025
**Phase IV Status:** ✅ Complete with Helm + AI DevOps Guide
