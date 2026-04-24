#!/usr/bin/env bash
# git-safe.sh — Safe git helpers for PM CLI operations
# Source this file: source scripts/lib/git-safe.sh

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

check_clean() {
  local DIRTY
  DIRTY=$(git -C "$REPO_ROOT" status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  if [ "$DIRTY" -gt 0 ]; then
    echo "⚠️  Working tree has $DIRTY uncommitted change(s)."
    return 1
  fi
  return 0
}

safe_commit() {
  local MSG="${1:-chore: pm-cli auto-commit}"
  git -C "$REPO_ROOT" add -A
  git -C "$REPO_ROOT" commit -m "$MSG" || {
    echo "⚠️  Nothing to commit or commit failed."
    return 0
  }
  echo "✅ Committed: $MSG"
}

safe_push() {
  local BRANCH
  BRANCH=$(git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD)
  local TRIES=0
  while [ $TRIES -lt 3 ]; do
    if git -C "$REPO_ROOT" push origin "$BRANCH"; then
      echo "✅ Pushed to origin/$BRANCH"
      return 0
    fi
    TRIES=$((TRIES + 1))
    echo "⚠️  Push attempt $TRIES failed, retrying in 5s..."
    sleep 5
  done
  echo "❌ Push failed after 3 attempts."
  return 1
}
