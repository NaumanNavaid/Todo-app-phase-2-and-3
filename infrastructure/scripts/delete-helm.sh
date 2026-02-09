#!/bin/bash
# ==========================================
# Uninstall todo-app Helm deployment
# ==========================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}Uninstalling Todo App (Helm)${NC}"
echo -e "${BLUE}=====================================${NC}"

RELEASE_NAME="todo-app"
NAMESPACE="todo-app"

# Check if release exists
if ! helm list -n "$NAMESPACE" | grep -q "$RELEASE_NAME"; then
    echo -e "${YELLOW}Release '$RELEASE_NAME' not found${NC}"
    exit 0
fi

# Confirm deletion
read -p "$(echo -e ${YELLOW}Are you sure you want to delete '$RELEASE_NAME'? [y/N]: ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Aborted${NC}"
    exit 0
fi

# Uninstall the release
echo -e "\n${BLUE}Uninstalling Helm release...${NC}"
helm uninstall "$RELEASE_NAME" -n "$NAMESPACE"

# Optional: Delete namespace
read -p "$(echo -e ${YELLOW}Delete namespace '$NAMESPACE'? [y/N]: ${NC})" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "\n${BLUE}Deleting namespace...${NC}"
    kubectl delete namespace "$NAMESPACE"
fi

echo -e "\n${GREEN}✓ Uninstall complete${NC}"
