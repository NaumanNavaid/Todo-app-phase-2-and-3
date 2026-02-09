#!/bin/bash
# ==========================================
# Deploy todo-app using Helm
# Phase IV: Kubernetes Deployment with Helm
# ==========================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}Deploying Todo App with Helm${NC}"
echo -e "${BLUE}=====================================${NC}"

# Check if Helm is installed
if ! command -v helm &> /dev/null; then
    echo -e "${RED}✗ Helm is not installed${NC}"
    echo "Please install Helm: https://helm.sh/docs/intro/install/"
    exit 1
fi

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}✗ kubectl is not installed${NC}"
    exit 1
fi

# Check if Minikube is running
if ! minikube status &> /dev/null; then
    echo -e "${YELLOW}Minikube is not running. Starting Minikube...${NC}"
    minikube start --driver=docker --cpus=2 --memory=4096
    echo -e "${GREEN}✓ Minikube started${NC}"
fi

# Get Minikube IP
MINIKUBE_IP=$(minikube ip)
echo -e "${GREEN}✓ Minikube IP: ${MINIKUBE_IP}${NC}"

# Navigate to infrastructure directory
cd "$(dirname "$0")/.." || exit 1

# Variables
HELM_CHART="helm/todo-app"
RELEASE_NAME="todo-app"
NAMESPACE="todo-app"
VALUES_FILE="helm/todo-app/values-minikube.yaml"

# Create Minikube-specific values file
echo -e "\n${BLUE}Creating Minikube-specific values file...${NC}"
cat > "$VALUES_FILE" <<EOF
# Minikube-specific values
global:
  environment: development

# Override services to use NodePort for local access
backend:
  service:
    type: NodePort
    nodePort: 30001

frontend:
  service:
    type: NodePort
    nodePort: 30000

# Use standard storage class for Minikube
postgres:
  persistence:
    storageClass: standard
EOF

# Add Helm repositories (if needed)
echo -e "\n${BLUE}Updating Helm repositories...${NC}"
helm repo update

# Check if release exists
if helm list -n "$NAMESPACE" | grep -q "$RELEASE_NAME"; then
    echo -e "\n${YELLOW}Release '$RELEASE_NAME' already exists. Upgrading...${NC}"
    helm upgrade "$RELEASE_NAME" "$HELM_CHART" \
        --namespace "$NAMESPACE" \
        --values "$VALUES_FILE" \
        --wait \
        --timeout 5m
else
    echo -e "\n${GREEN}Installing new release...${NC}"
    helm install "$RELEASE_NAME" "$HELM_CHART" \
        --namespace "$NAMESPACE" \
        --create-namespace \
        --values "$VALUES_FILE" \
        --wait \
        --timeout 5m
fi

# Wait for deployments to be ready
echo -e "\n${BLUE}Waiting for deployments to be ready...${NC}"
kubectl wait --for=condition=available --timeout=300s \
    deployment/backend -n "$NAMESPACE" 2>/dev/null || true
kubectl wait --for=condition=ready --timeout=300s \
    pod -l app=postgres -n "$NAMESPACE" 2>/dev/null || true

# Show status
echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}=====================================${NC}"

# Get all resources
echo -e "\n${BLUE}Deployed Resources:${NC}"
kubectl get all -n "$NAMESPACE"

# Show Helm status
echo -e "\n${BLUE}Helm Release Status:${NC}"
helm status "$RELEASE_NAME" -n "$NAMESPACE"

# Display access information
echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}Access URLs${NC}"
echo -e "${GREEN}=====================================${NC}"
echo -e "\n${YELLOW}Frontend:${NC}  ${BLUE}http://${MINIKUBE_IP}:30000${NC}"
echo -e "${YELLOW}Backend:${NC}   ${BLUE}http://${MINIKUBE_IP}:30001${NC}"
echo -e "${YELLOW}API Docs:${NC}  ${BLUE}http://${MINIKUBE_IP}:30001/docs${NC}"

# Display notes
echo -e "\n${BLUE}Helm Notes:${NC}"
helm get notes "$RELEASE_NAME" -n "$NAMESPACE"

echo -e "\n${GREEN}✓ Deployment successful!${NC}\n"
