#!/bin/bash
# ==========================================
# Validation script for Minikube deployment
# Checks health of all deployed services
# ==========================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}Validating Deployment${NC}"
echo -e "${BLUE}=====================================${NC}"

PASS=0
FAIL=0
WARN=0

# Function to check resource
check() {
    local name=$1
    local status=$2
    if [ "$status" = "0" ]; then
        echo -e "${GREEN}✓ $name${NC}"
        ((PASS++))
    else
        echo -e "${RED}✗ $name${NC}"
        ((FAIL++))
    fi
}

warn() {
    local name=$1
    echo -e "${YELLOW}⚠ $name${NC}"
    ((WARN++))
}

# ==========================================
# Check Namespace
# ==========================================
echo -e "\n${BLUE}Checking namespace...${NC}"
kubectl get namespace todo-app > /dev/null 2>&1
check "Namespace exists" $?

# ==========================================
# Check Pods
# ==========================================
echo -e "\n${BLUE}Checking pods...${NC}"
PODS=$(kubectl get pods -n todo-app -o json 2>/dev/null)

if [ $? -eq 0 ]; then
    RUNNING=$(echo $PODS | jq -r '.items[] | select(.status.phase=="Running") | .metadata.name' 2>/dev/null)
    TOTAL=$(echo $PODS | jq -r '.items | length' 2>/dev/null)

    if [ ! -z "$RUNNING" ]; then
        echo -e "${GREEN}✓ Running pods:${NC}"
        echo "$RUNNING" | while read pod; do echo "  - $pod"; done
        ((PASS++))
    else
        warn "No running pods found"
    fi

    # Check if all pods are ready
    READY=$(kubectl get pods -n todo-app -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")].status}' 2>/dev/null)
    if [[ "$READY" =~ "True" ]]; then
        echo -e "${GREEN}✓ Pods are ready${NC}"
        ((PASS++))
    else
        warn "Some pods are not ready"
    fi
else
    check "Pods retrieval" 1
fi

# ==========================================
# Check Services
# ==========================================
echo -e "\n${BLUE}Checking services...${NC}"
kubectl get svc -n todo-app > /dev/null 2>&1
check "Services exist" $?

echo ""
kubectl get svc -n todo-app 2>/dev/null | grep -v NAME | while read line; do
    echo "  $line"
done

# ==========================================
# Check Endpoints
# ==========================================
echo -e "\n${BLUE}Checking endpoints...${NC}"
for svc in frontend backend postgres; do
    ENDPOINTS=$(kubectl get endpoints -n todo-app $svc -o jsonpath='{.subsets[*].addresses[*].ip}' 2>/dev/null)
    if [ ! -z "$ENDPOINTS" ]; then
        echo -e "${GREEN}✓ $svc endpoints ready${NC}"
        ((PASS++))
    else
        warn "$svc has no endpoints"
    fi
done

# ==========================================
# Backend Health Check
# ==========================================
echo -e "\n${BLUE}Checking backend health...${NC}"
MINIKUBE_IP=$(minikube ip 2>/dev/null)
if [ ! -z "$MINIKUBE_IP" ]; then
    # Try direct curl to NodePort
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://${MINIKUBE_IP}:30001/health --connect-timeout 5 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ Backend health endpoint responding${NC}"
        ((PASS++))
    else
        warn "Backend health check failed (HTTP $HTTP_CODE)"
    fi
else
    warn "Cannot get Minikube IP"
fi

# ==========================================
# Summary
# ==========================================
echo -e "\n${BLUE}=====================================${NC}"
echo -e "${BLUE}Validation Summary${NC}"
echo -e "${BLUE}=====================================${NC}"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${YELLOW}Warnings: $WARN${NC}"
echo -e "${RED}Failed: $FAIL${NC}"

if [ $FAIL -eq 0 ]; then
    echo -e "\n${GREEN}✓ Deployment is healthy!${NC}"
    exit 0
else
    echo -e "\n${RED}✗ Deployment has issues${NC}"
    echo -e "\nTo get logs:"
    echo "  kubectl logs -n todo-app -l app=backend --tail=-1"
    echo "  kubectl logs -n todo-app -l app=frontend --tail=-1"
    exit 1
fi
