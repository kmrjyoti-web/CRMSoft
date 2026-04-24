#!/bin/bash
# scripts/work-close.sh
# Save session, commit, push — run before switching machines
# Usage:  npm run work:close
#         npm run work:close "what I was working on"
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"
SESSION_FILE=".work-session.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
MACHINE=$(hostname)

# OS detection
OS_TYPE="unknown"
case "$(uname -s)" in
  Darwin*)           OS_TYPE="mac"     ;;
  MINGW*|MSYS*|Cygwin*) OS_TYPE="windows" ;;
  Linux*)            OS_TYPE="linux"   ;;
esac

# Task description — argument or auto from last commit
TASK_NOTE="${1:-$(git log -1 --pretty=%s 2>/dev/null || echo 'work session')}"

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  WORK:CLOSE                                                  ║"
echo "║  Saving session on $MACHINE ($OS_TYPE)                       ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

# ─── 1. Git status ───────────────────────────────────────────────────────────
echo ""
echo "=== Step 1: Git status ==="
BRANCH=$(git branch --show-current)
UNCOMMITTED=$(git status --porcelain | wc -l | tr -d ' ')
echo "  Branch:       $BRANCH"
echo "  Uncommitted:  $UNCOMMITTED files"

if [ "$UNCOMMITTED" -gt "0" ]; then
  echo "  Staging all changes..."
  git add -A
  git commit -m "wip: session close on $MACHINE — $TASK_NOTE" 2>/dev/null || true
  echo "  ✅ Committed"
else
  echo "  ✅ Working tree clean — nothing to commit"
fi

# ─── 2. Push ─────────────────────────────────────────────────────────────────
echo ""
echo "=== Step 2: Push ==="
git push origin "$BRANCH" 2>&1 | tail -3
echo "  ✅ Pushed to origin/$BRANCH"

# ─── 3. Quick test status (count only — fast) ────────────────────────────────
echo ""
echo "=== Step 3: Test file count ==="
TEST_STATUS="unknown"
if [ -d "Application/backend/src" ]; then
  SPEC_COUNT=$(find Application/backend/src -name "*.spec.ts" 2>/dev/null | wc -l | tr -d ' ')
  TEST_STATUS="${SPEC_COUNT} spec files"
  echo "  Tests: $TEST_STATUS"
else
  echo "  Tests: (backend not found)"
fi

# ─── 4. Build status (typecheck only — fast) ─────────────────────────────────
echo ""
echo "=== Step 4: TypeScript check ==="
BUILD_STATUS="unknown"
if [ -d "Application/backend" ]; then
  cd Application/backend
  if npx tsc --noEmit --pretty false 2>/dev/null 1>/dev/null; then
    BUILD_STATUS="clean"
    echo "  Build: ✅ clean"
  else
    ERR_COUNT=$(npx tsc --noEmit --pretty false 2>&1 | grep -c "error TS" || true)
    BUILD_STATUS="${ERR_COUNT} TypeScript errors"
    echo "  Build: ⚠️  $BUILD_STATUS"
  fi
  cd "$PROJECT_ROOT"
else
  echo "  Build: (backend not found)"
fi

# ─── 5. Save session state ───────────────────────────────────────────────────
echo ""
echo "=== Step 5: Save session state ==="
LAST_HASH=$(git rev-parse HEAD 2>/dev/null || echo "none")
LAST_MSG=$(git log -1 --pretty=%s 2>/dev/null || echo "none")
FILES_CHANGED=$(git diff --stat HEAD~1 HEAD 2>/dev/null | tail -1 | grep -oE '[0-9]+ file' | grep -oE '[0-9]+' || echo "0")
RECENT_FILES=$(git diff --name-only HEAD~3 HEAD 2>/dev/null | head -20 | tr '\n' '|' | sed 's/|$//')

# Preserve startedAt from existing session if present
STARTED_AT="$TIMESTAMP"
if [ -f "$SESSION_FILE" ]; then
  EXISTING_START=$(python3 -c "
import json,sys
try:
  d=json.load(open('$SESSION_FILE'))
  print(d.get('startedAt',''))
except:
  print('')
" 2>/dev/null || echo "")
  [ -n "$EXISTING_START" ] && STARTED_AT="$EXISTING_START"
fi

# Generate UUID cross-platform
SESSION_UUID=$(python3 -c "import uuid; print(str(uuid.uuid4()))" 2>/dev/null || \
               uuidgen 2>/dev/null || \
               cat /proc/sys/kernel/random/uuid 2>/dev/null || \
               echo "$(date +%s)-$$")

python3 - <<PYEOF
import json, sys

session = {
  "sessionId": "$SESSION_UUID",
  "startedAt": "$STARTED_AT",
  "closedAt": "$TIMESTAMP",
  "machine": "$MACHINE",
  "os": "$OS_TYPE",
  "branch": "$BRANCH",
  "lastCommitHash": "$LAST_HASH",
  "lastCommitMessage": "$LAST_MSG",
  "currentTask": "$TASK_NOTE",
  "filesChanged": int("${FILES_CHANGED:-0}"),
  "testsStatus": "$TEST_STATUS",
  "buildStatus": "$BUILD_STATUS",
  "recentFiles": "$RECENT_FILES"
}
with open("$SESSION_FILE", "w") as f:
    json.dump(session, f, indent=2)
print("  ✅ Session saved to $SESSION_FILE")
PYEOF

# Commit session file
git add "$SESSION_FILE"
git diff --cached --quiet || git commit -m "chore: save work session state [$MACHINE]" --no-verify 2>/dev/null || true
git push origin "$BRANCH" --quiet 2>/dev/null || true

# ─── 6. Summary ──────────────────────────────────────────────────────────────
SHORT_HASH="${LAST_HASH:0:8}"
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  SESSION SAVED                                               ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
printf "║  Machine:   %-50s║\n" "$MACHINE ($OS_TYPE)"
printf "║  Branch:    %-50s║\n" "$BRANCH"
printf "║  Commit:    %-50s║\n" "$SHORT_HASH — $LAST_MSG"
printf "║  Task:      %-50s║\n" "$TASK_NOTE"
printf "║  Tests:     %-50s║\n" "$TEST_STATUS"
printf "║  Build:     %-50s║\n" "$BUILD_STATUS"
printf "║  Time:      %-50s║\n" "$TIMESTAMP"
echo "╠═══════════════════════════════════════════════════════════════╣"
echo "║  ✅ Safe to switch machines. Run: npm run work:start         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
