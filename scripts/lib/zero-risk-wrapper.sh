#!/usr/bin/env bash
# zero-risk-wrapper.sh — 7-step safe action runner for CRMSoft PM CLI
# Source this file: source scripts/lib/zero-risk-wrapper.sh
# Then call: run_safe_action "action-name" "tag" <cmd_function>

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Source helpers
source "$REPO_ROOT/scripts/lib/backup.sh" 2>/dev/null || true
source "$REPO_ROOT/scripts/lib/git-safe.sh" 2>/dev/null || true
source "$REPO_ROOT/scripts/lib/alert.sh" 2>/dev/null || true

# run_safe_action <action-name> <tag> <callback-function>
# The callback function receives no args and should return 0 on success.
run_safe_action() {
  local ACTION="${1:-unknown}"
  local TAG="${2:-project}"
  local CMD="${3:-}"
  local TS
  TS=$(date +%Y%m%d-%H%M%S)
  local OPS_LOG="$REPO_ROOT/.claude/operations.log"

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  PM CLI — Safe Action: $ACTION"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # Step 1 — Backup
  echo "[1/7] Backup..."
  local BACKUP_PATH
  BACKUP_PATH=$(bash "$REPO_ROOT/scripts/lib/backup.sh" "$ACTION" 2>/dev/null) || {
    echo "⚠️  Backup failed — continuing in strict mode blocks this. Aborting."
    return 1
  }

  # Step 2 — Git check
  echo "[2/7] Git state check..."
  local BRANCH
  BRANCH=$(git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
  local DIRTY
  DIRTY=$(git -C "$REPO_ROOT" status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  echo "  Branch: $BRANCH | Uncommitted: $DIRTY file(s)"

  # Step 3 — Pre-action commit (if dirty)
  echo "[3/7] Pre-action commit..."
  if [ "$DIRTY" -gt 0 ]; then
    git -C "$REPO_ROOT" add -A
    git -C "$REPO_ROOT" commit -m "chore: pre-action snapshot before $ACTION" 2>/dev/null || echo "  Nothing to commit."
  else
    echo "  Working tree clean — skipping pre-action commit."
  fi

  # Step 4 — Execute CLI action
  echo "[4/7] Executing action: $ACTION..."
  if [ -n "$CMD" ] && declare -f "$CMD" > /dev/null 2>&1; then
    "$CMD"
    local EXIT_CODE=$?
  else
    echo "  No callback provided — dry run."
    local EXIT_CODE=0
  fi

  # Step 5 — Notion log
  echo "[5/7] Notion log..."
  bash "$REPO_ROOT/scripts/lib/notion-log.sh" "$ACTION" "$TAG" "$([ $EXIT_CODE -eq 0 ] && echo 'success' || echo 'failure')" 2>/dev/null || true

  # Step 6 — Ops log
  echo "[6/7] Ops log..."
  echo "[$TS] action=$ACTION tag=$TAG branch=$BRANCH exit=$EXIT_CODE backup=$BACKUP_PATH" >> "$OPS_LOG"

  # Step 7 — Push on success
  echo "[7/7] Push..."
  if [ $EXIT_CODE -eq 0 ]; then
    git -C "$REPO_ROOT" push origin "$BRANCH" 2>/dev/null && echo "  Pushed to origin/$BRANCH." || echo "  Push skipped (nothing new or not configured)."
  else
    echo "  Action failed (exit=$EXIT_CODE) — skipping push."
  fi

  echo ""
  if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Action '$ACTION' completed successfully."
  else
    echo "❌ Action '$ACTION' failed (exit=$EXIT_CODE). Backup available at: $BACKUP_PATH"
  fi
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  return $EXIT_CODE
}
