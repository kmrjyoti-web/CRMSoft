#!/usr/bin/env bash
# work-pickup.sh — Pick and execute next planned prompt
# Usage: bash scripts/work/work-pickup.sh [--batch]
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PLANNED_DIR="$REPO_ROOT/.claude/working/planned"
IN_PROG_DIR="$REPO_ROOT/.claude/working/in-progress"
DONE_DIR="$REPO_ROOT/.claude/working/completed"
OPS_LOG="$REPO_ROOT/.claude/operations.log"
BATCH="${1:-}"

# Source alert helpers
source "$REPO_ROOT/scripts/lib/alert.sh" 2>/dev/null || true

pickup_one() {
  # Get oldest planned prompt
  local NEXT
  NEXT=$(ls -t "$PLANNED_DIR"/*.md 2>/dev/null | tail -1 || echo "")

  if [ -z "$NEXT" ]; then
    echo "📭 No planned prompts in .claude/working/planned/"
    return 0
  fi

  local FNAME
  FNAME=$(basename "$NEXT")
  echo ""
  echo "📋 Picking up: $FNAME"

  # Move to in-progress
  mv "$NEXT" "$IN_PROG_DIR/$FNAME"
  echo "  Moved to in-progress/"

  # Try to execute via claude CLI
  if command -v claude &>/dev/null; then
    echo "  Executing via claude CLI..."
    if claude < "$IN_PROG_DIR/$FNAME"; then
      mv "$IN_PROG_DIR/$FNAME" "$DONE_DIR/$FNAME"
      echo "✅ Completed: $FNAME → completed/"
      echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] pickup success file=$FNAME" >> "$OPS_LOG"
      cd "$REPO_ROOT" && git add -A && git commit -m "chore(pm-cli): completed prompt $FNAME" 2>/dev/null || true
    else
      mv "$IN_PROG_DIR/$FNAME" "$PLANNED_DIR/${FNAME%.md}.failed.md"
      echo "❌ Failed: $FNAME → planned/ (with .failed suffix)"
      echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] pickup failed file=$FNAME" >> "$OPS_LOG"
      return 1
    fi
  else
    echo ""
    echo "ℹ️  claude CLI not found. Showing prompt content for manual execution:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    cat "$IN_PROG_DIR/$FNAME"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "After manual execution, run: mv .claude/working/in-progress/$FNAME .claude/working/completed/"
  fi
}

if [ "$BATCH" = "--batch" ]; then
  echo "🔄 Batch mode — processing all planned prompts..."
  COUNT=0
  while ls "$PLANNED_DIR"/*.md &>/dev/null 2>&1; do
    pickup_one || break
    COUNT=$((COUNT + 1))
  done
  echo "🏁 Batch done. Processed: $COUNT prompt(s)."
else
  pickup_one
fi
