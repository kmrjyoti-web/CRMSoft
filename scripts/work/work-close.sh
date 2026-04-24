#!/usr/bin/env bash
# work-close.sh — PM CLI session close script
# Usage: bash scripts/work/work-close.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OPS_LOG="$REPO_ROOT/.claude/operations.log"
CONTEXT_DIR="$REPO_ROOT/.claude/context"
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  CRMSoft PM CLI — Work Close                             ║"
echo "╚══════════════════════════════════════════════════════════╝"

cd "$REPO_ROOT"
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

# 1. Git status check
echo ""
echo "[1/4] Checking git status..."
DIRTY=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
if [ "$DIRTY" -gt 0 ]; then
  echo "  $DIRTY uncommitted file(s). Auto-committing WIP..."
  git add -A
  git commit -m "wip: session close auto-commit $(date +%Y-%m-%d)" || echo "  Commit skipped."
else
  echo "  Working tree clean."
fi

# 2. Quick typecheck (warn only)
echo "[2/4] Quick typecheck (warn only)..."
cd "$REPO_ROOT/Application/backend"
pnpm typecheck 2>&1 | tail -3 || echo "  ⚠️  TypeScript errors detected — fix before push"
cd "$REPO_ROOT"

# 3. Update last-session.md
echo "[3/4] Updating last-session context..."
cat > "$CONTEXT_DIR/last-session.md" << SESSEOF
# Last Session Summary

**Date:** $TS
**Branch:** $BRANCH

## Context
_Auto-generated at session close. Edit to add session notes._

## Files Changed
$(git diff HEAD~1 --name-only 2>/dev/null | head -20 || echo "_none_")

## Next Steps
_Review planned prompts in .claude/working/planned/_
SESSEOF
echo "  Updated: .claude/context/last-session.md"

# 4. Backup + push
echo "[4/4] Backup + push..."
bash "$REPO_ROOT/scripts/lib/backup.sh" "session-close" 2>/dev/null || echo "  ⚠️  Backup failed."
git push origin "$BRANCH" 2>/dev/null && echo "  Pushed to origin/$BRANCH." || echo "  Push skipped."

# Log
echo "[$TS] work-close branch=$BRANCH" >> "$OPS_LOG"

echo ""
echo "✅ Session closed. Have a good one!"
echo ""
