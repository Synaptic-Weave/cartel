#!/bin/bash

# ==============================================================================
# 🛠️ setup_worktrees.sh — Agent Syndicate Workspace Isolation Automator
# ==============================================================================
# This script configures independent, isolated Git worktrees for developer 
# agents (Apoc and Ghost). It prevents branch/state conflicts by ensuring 
# each agent runs in its own checkout namespace within .worktrees/.
# ==============================================================================

# Exit immediately if a command exits with a non-zero status
set -e

# Define color outputs for clean logging
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}[INFO] Link: Starting Git Worktree setup for Agent Syndicate...${NC}"

# 1. Prune stale worktrees
echo -e "${CYAN}[INFO] Pruning obsolete worktree registrations...${NC}"
git worktree prune

# 2. Check if .worktrees directory pattern is in .gitignore
if ! grep -q ".worktrees" .gitignore; then
  echo -e "${YELLOW}[WARNING] .worktrees not found in .gitignore. Adding it now...${NC}"
  echo -e "\n# Git Worktrees\n.worktrees" >> .gitignore
else
  echo -e "${GREEN}[OK] .worktrees already ignored in .gitignore.${NC}"
fi

# Function to safely create a worktree for an agent
setup_agent_worktree() {
  local agent_name=$1
  local branch_name="feat/${agent_name}-dev"
  local target_dir=".worktrees/${agent_name}"

  echo -e "${CYAN}[INFO] Configuring worktree for agent: ${agent_name^}...${NC}"

  # Check if worktree directory exists or is registered
  if git worktree list | grep -q "$target_dir"; then
    echo -e "${YELLOW}[WARNING] Worktree at ${target_dir} is already registered.${NC}"
    return 0
  fi

  # Check if the directory physical folder exists but is not registered
  if [ -d "$target_dir" ]; then
    echo -e "${YELLOW}[WARNING] Physical folder ${target_dir} exists but is unregistered. Cleaning up...${NC}"
    rm -rf "$target_dir"
  fi

  # Check if the target branch already exists locally
  if git show-ref --verify --quiet "refs/heads/${branch_name}"; then
    echo -e "${GREEN}[OK] Branch ${branch_name} already exists. Binding worktree...${NC}"
    git worktree add "$target_dir" "$branch_name"
  # If branch does not exist, check if it exists on origin
  elif git show-ref --verify --quiet "refs/remotes/origin/${branch_name}"; then
    echo -e "${GREEN}[OK] Branch ${branch_name} exists on remote origin. Tracking and binding worktree...${NC}"
    git worktree add "$target_dir" "origin/${branch_name}"
  else
    echo -e "${YELLOW}[INFO] Branch ${branch_name} does not exist. Creating and binding to main...${NC}"
    git worktree add -b "$branch_name" "$target_dir" main
  fi

  echo -e "${GREEN}[SUCCESS] Worktree setup for ${agent_name^} at ${target_dir} is active!${NC}"
}

# 3. Setup worktrees for developers Apoc and Ghost
setup_agent_worktree "apoc"
setup_agent_worktree "ghost"

echo -e "\n${CYAN}====================================================${NC}"
echo -e "${GREEN}✨ Git Worktrees Setup Successfully Completed! ✨${NC}"
git worktree list
echo -e "${CYAN}====================================================${NC}"
