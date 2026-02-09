#!/bin/bash
# ==========================================
# Delete script for Minikube deployment
# Removes all deployed resources
# ==========================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=====================================${NC}"
echo -e "${YELLOW}Deleting Minikube Deployment${NC}"
echo -e "${YELLOW}=====================================${NC}"

# Ask for confirmation
read -p "Are you sure you want to delete all resources? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

# Delete namespace (which deletes all resources in it)
echo -e "\n${YELLOW}Deleting todo-app namespace...${NC}"
kubectl delete namespace todo-app --ignore-not-found=true

echo -e "${GREEN}✓ All resources deleted${NC}"
echo -e "\nNote: Persistent volumes may require manual cleanup"
echo "Run: kubectl delete pv -l app=postgres"
