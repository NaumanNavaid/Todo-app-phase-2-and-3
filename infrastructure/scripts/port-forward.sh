#!/bin/bash
# ==========================================
# Port-forward script for local access
# Forwards Kubernetes services to localhost
# ==========================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}Setting up Port Forwarding${NC}"
echo -e "${BLUE}=====================================${NC}"

# Check if namespace exists
kubectl get namespace todo-app > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ todo-app namespace not found${NC}"
    echo "Please deploy first: ./scripts/deploy-minikube.sh"
    exit 1
fi

# Function to kill existing port-forward
kill_existing() {
    local SERVICE=$1
    local PORT=$2
    local PID=$(lsof -ti:$PORT 2>/dev/null)
    if [ ! -z "$PID" ]; then
        echo -e "${YELLOW}Killing existing process on port $PORT${NC}"
        kill $PID 2>/dev/null || true
    fi
}

# Kill existing port-forwards
kill_existing "frontend" 3000
kill_existing "backend" 8000

# Start port-forwarding in background
echo -e "\n${GREEN}Starting port-forwarding...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}\n"

# Forward frontend
kubectl port-forward -n todo-app svc/frontend 3000:3000 &
FRONTEND_PID=$!

# Forward backend
kubectl port-forward -n todo-app svc/backend 8000:8000 &
BACKEND_PID=$!

# Wait a bit for port-forward to start
sleep 2

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Port Forwarding Active${NC}"
echo -e "${GREEN}=====================================${NC}"
echo -e "\n${BLUE}Access URLs:${NC}"
echo -e "  Frontend: ${YELLOW}http://localhost:3000${NC}"
echo -e "  Backend:  ${YELLOW}http://localhost:8000${NC}"
echo -e "  Backend Docs: ${YELLOW}http://localhost:8000/docs${NC}"
echo -e "\n${BLUE}Running processes:${NC}"
echo -e "  Frontend PID: $FRONTEND_PID"
echo -e "  Backend PID: $BACKEND_PID"
echo -e "\n${YELLOW}Press Ctrl+C to stop all port-forwarding${NC}"

# Handle Ctrl+C
trap "kill $FRONTEND_PID $BACKEND_PID 2>/dev/null; echo -e '\n${GREEN}Port forwarding stopped${NC}'; exit 0" INT

# Wait for processes
wait
