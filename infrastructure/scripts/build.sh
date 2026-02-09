#!/bin/bash
# ==========================================
# Build script for Docker images
# Builds backend and frontend images
# and loads them into Minikube
# ==========================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Building Docker Images${NC}"
echo -e "${GREEN}=====================================${NC}"

# Check if Minikube is running
if ! minikube status > /dev/null 2>&1; then
    echo -e "${YELLOW}Minikube is not running. Starting Minikube...${NC}"
    minikube start
fi

# Set Docker environment to Minikube
eval $(minikube docker-env)

# ==========================================
# Build Backend Image
# ==========================================
echo -e "\n${GREEN}Building backend image...${NC}"
cd "$PROJECT_ROOT/../backend"
docker build -f ../infrastructure/docker/backend/Dockerfile -t todo-backend:latest .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend image built successfully${NC}"
else
    echo -e "${RED}✗ Backend image build failed${NC}"
    exit 1
fi

# ==========================================
# Build Frontend Image
# ==========================================
echo -e "\n${GREEN}Building frontend image...${NC}"
cd "$PROJECT_ROOT/../frontend"
docker build -f ../infrastructure/docker/frontend/Dockerfile -t todo-frontend:latest .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend image built successfully${NC}"
else
    echo -e "${RED}✗ Frontend image build failed${NC}"
    exit 1
fi

# ==========================================
# List Built Images
# ==========================================
echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}Built Images:${NC}"
echo -e "${GREEN}=====================================${NC}"
docker images | grep -E "REPOSITORY|todo-"

echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}Build Complete!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo -e "Next step: Run ${YELLOW}./scripts/deploy-minikube.sh${NC} to deploy"
