#!/usr/bin/env bash
# work-start.sh — PM CLI session start script
# Usage: bash scripts/work/work-start.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OPS_LOG="$REPO_ROOT/.claude/operations.log"
SESSION_DIR="$REPO_ROOT/.claude/sessions"
CONTEXT_DIR="$REPO_ROOT/.claude/context"
TS=$(date +%Y%m%d-%H%M%S)
DATE=$(date +%Y-%m-%d)
SESSION_FILE="$SESSION_DIR/${DATE}-${TS}.md"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  CRMSoft PM CLI — Work Start                             ║"
echo "╚══════════════════════════════════════════════════════════╝"

# 1. Git pull
echo ""
echo "[1/4] Fetching + pulling latest..."
cd "$REPO_ROOT"
git fetch --quiet 2>/dev/null || echo "  ⚠️  git fetch failed (offline?)"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
git pull --ff-only origin "$BRANCH" 2>/dev/null || echo "  ⚠️  git pull failed or already up to date."

# 2. Install deps if lockfile changed
echo "[2/4] Checking dependencies..."
if git diff HEAD~1 --name-only 2>/dev/null | grep -q "pnpm-lock.yaml\|package.json"; then
  echo "  lockfile changed — running pnpm install..."
  pnpm install --frozen-lockfile 2>/dev/null || pnpm install || true
else
  echo "  Dependencies up to date."
fi

# 3. Show last session context
echo "[3/4] Last session context..."
LAST_SESSION="$CONTEXT_DIR/last-session.md"
if [ -f "$LAST_SESSION" ]; then
  echo ""
  cat "$LAST_SESSION"
  echo ""
else
  echo "  No prior session found."
fi

# 4. Create new session log
echo "[4/4] Creating session log..."
mkdir -p "$SESSION_DIR"
cat > "$SESSION_FILE" << SESSIONEOF
# Session: $DATE $TS

**Branch:** $BRANCH
**Started:** $(date -u +%Y-%m-%dT%H:%M:%SZ)

## Work Done
_Fill in during session_

## Decisions Made
_Fill in during session_

## Next Steps
_Fill in at close_
SESSIONEOF
echo "  Session log: .claude/sessions/$(basename "$SESSION_FILE")"

# Log to ops
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] work-start branch=$BRANCH session=$(basename "$SESSION_FILE")" >> "$OPS_LOG"

echo ""
echo "✅ Ready. Current branch: $BRANCH"

# Show planned prompts
PLANNED=$(ls "$REPO_ROOT/.claude/working/planned/"*.md 2>/dev/null | wc -l | tr -d ' ')
IN_PROG=$(ls "$REPO_ROOT/.claude/working/in-progress/"*.md 2>/dev/null | wc -l | tr -d ' ')
echo "   Planned prompts: $PLANNED | In-progress: $IN_PROG"
echo ""
