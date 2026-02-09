#!/bin/bash
# ==========================================
# Deploy script for Minikube
# Deploys all resources to Minikube cluster
# ==========================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
K8S_DIR="$SCRIPT_DIR/../k8s/minikube"

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Deploying to Minikube${NC}"
echo -e "${GREEN}=====================================${NC}"

# ==========================================
# Prerequisites Check
# ==========================================
echo -e "\n${BLUE}Checking prerequisites...${NC}"

# Check if Minikube is installed
if ! command -v minikube &> /dev/null; then
    echo -e "${RED}✗ Minikube is not installed${NC}"
    echo "Please install Minikube first: https://minikube.sigs.k8s.io/docs/start/"
    exit 1
fi
echo -e "${GREEN}✓ Minikube installed${NC}"

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}✗ kubectl is not installed${NC}"
    echo "Please install kubectl first: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi
echo -e "${GREEN}✓ kubectl installed${NC}"

# ==========================================
# Start Minikube
# ==========================================
echo -e "\n${BLUE}Starting Minikube...${NC}"
if ! minikube status > /dev/null 2>&1; then
    minikube start --driver=docker --cpus=2 --memory=4096
    echo -e "${GREEN}✓ Minikube started${NC}"
else
    echo -e "${YELLOW}✓ Minikube already running${NC}"
fi

# ==========================================
# Deploy Resources
# ==========================================
echo -e "\n${BLUE}Applying Kubernetes manifests...${NC}"

# Apply kustomize configuration
kubectl apply -k "$K8S_DIR"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Kubernetes manifests applied${NC}"
else
    echo -e "${RED}✗ Failed to apply manifests${NC}"
    exit 1
fi

# ==========================================
# Wait for PostgreSQL
# ==========================================
echo -e "\n${BLUE}Waiting for PostgreSQL to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=postgres -n todo-app --timeout=120s

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
else
    echo -e "${YELLOW}⚠ PostgreSQL timeout (continuing anyway)${NC}"
fi

# ==========================================
# Wait for Backend
# ==========================================
echo -e "\n${BLUE}Waiting for Backend to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=backend -n todo-app --timeout=120s

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend is ready${NC}"
else
    echo -e "${YELLOW}⚠ Backend timeout (continuing anyway)${NC}"
fi

# ==========================================
# Wait for Frontend
# ==========================================
echo -e "\n${BLUE}Waiting for Frontend to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=frontend -n todo-app --timeout=120s

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend is ready${NC}"
else
    echo -e "${YELLOW}⚠ Frontend timeout (continuing anyway)${NC}"
fi

# ==========================================
# Get Minikube IP
# ==========================================
MINIKUBE_IP=$(minikube ip)

# ==========================================
# Output Access Information
# ==========================================
echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo -e "\n${BLUE}Access URLs:${NC}"
echo -e "  Frontend: ${YELLOW}http://${MINIKUBE_IP}:30000${NC}"
echo -e "  Backend:  ${YELLOW}http://${MINIKUBE_IP}:30001${NC}"
echo -e "\n${BLUE}Or use tunnel:${NC}"
echo -e "  Run: ${YELLOW}minikube tunnel${NC}"
echo -e "  Then access via services"
echo -e "\n${BLUE}Pod Status:${NC}"
kubectl get pods -n todo-app
echo -e "\n${BLUE}Services:${NC}"
kubectl get svc -n todo-app

echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}To check logs:${NC}"
echo -e "  kubectl logs -n todo-app -l app=backend --tail=-1"
echo -e "  kubectl logs -n todo-app -l app=frontend --tail=-1"
echo -e "${GREEN}=====================================${NC}"
