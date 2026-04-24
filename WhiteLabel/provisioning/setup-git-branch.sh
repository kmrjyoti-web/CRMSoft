#!/bin/bash
# setup-git-branch.sh — Create an isolated git branch for a new partner
# Usage: ./setup-git-branch.sh <partner-code> [branch-type]
# Example: ./setup-git-branch.sh abc-crm main
#          ./setup-git-branch.sh abc-crm feature custom-header

set -euo pipefail

PARTNER_CODE="${1:?Usage: $0 <partner-code> [branch-type: main|feature|hotfix] [suffix]}"
BRANCH_TYPE="${2:-main}"
SUFFIX="${3:-}"
REPO_ROOT="${CRMSOFT_REPO_PATH:-/Users/kmrjyoti/GitProject/CRM/CrmProject}"
REMOTE="${GIT_REMOTE:-origin}"

# Build branch name
case "$BRANCH_TYPE" in
  main)    BRANCH="partner/${PARTNER_CODE}/main" ;;
  feature) BRANCH="partner/${PARTNER_CODE}/feature-${SUFFIX:-new}" ;;
  hotfix)  BRANCH="partner/${PARTNER_CODE}/hotfix-${SUFFIX:-fix}" ;;
  *)       BRANCH="partner/${PARTNER_CODE}/${SUFFIX:-${BRANCH_TYPE}}" ;;
esac

PARENT_BRANCH="${PARENT_BRANCH:-main}"

echo "╔══════════════════════════════════════════════════════╗"
echo "║  CRMSoft Partner Branch Setup"
echo "╚══════════════════════════════════════════════════════╝"
echo "Partner: ${PARTNER_CODE}"
echo "Branch : ${BRANCH}"
echo "Parent : ${PARENT_BRANCH}"
echo "Remote : ${REMOTE}"
echo ""

cd "$REPO_ROOT"

# ─── Ensure we're on the parent branch, up to date ───────────
echo "▸ Syncing ${PARENT_BRANCH}..."
git checkout "${PARENT_BRANCH}"
git pull "${REMOTE}" "${PARENT_BRANCH}"

# ─── Check if branch already exists ─────────────────────────
if git show-ref --verify --quiet "refs/heads/${BRANCH}" 2>/dev/null; then
  echo "⚠️  Branch '${BRANCH}' already exists locally."
  read -rp "   Push existing branch to remote? [y/N] " confirm
  if [[ "$confirm" =~ ^[Yy]$ ]]; then
    git push "${REMOTE}" "${BRANCH}"
    echo "✅ Existing branch pushed to ${REMOTE}/${BRANCH}"
  else
    echo "Aborted."
    exit 0
  fi
else
  # ─── Create and push branch ──────────────────────────────
  echo "▸ Creating branch ${BRANCH} from ${PARENT_BRANCH}..."
  git checkout -b "${BRANCH}"
  git push "${REMOTE}" "${BRANCH}" --set-upstream

  echo ""
  echo "✅ Branch created and pushed: ${BRANCH}"
fi

# ─── Restore original branch ────────────────────────────────
git checkout "${PARENT_BRANCH}"

echo ""
echo "Next: Register this branch via wl-api:"
echo "  POST /api/v1/wl/git-branches"
echo "  { \"partnerId\": \"<id>\", \"branchName\": \"${BRANCH}\", \"branchType\": \"${BRANCH_TYPE^^}\" }"
