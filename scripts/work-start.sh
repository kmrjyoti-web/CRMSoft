#!/bin/bash
# scripts/work-start.sh
# Pull latest, restore session context, run health checks
# Usage:  npm run work:start
# ─────────────────────────────────────────────────────────────────────────────

set -uo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"
SESSION_FILE=".work-session.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
MACHINE=$(hostname)

OS_TYPE="unknown"
case "$(uname -s)" in
  Darwin*)               OS_TYPE="mac"     ;;
  MINGW*|MSYS*|Cygwin*)  OS_TYPE="windows" ;;
  Linux*)                OS_TYPE="linux"   ;;
esac

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  WORK:START                                                  ║"
echo "║  Resuming on $MACHINE ($OS_TYPE)                             ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

# ─── 1. Pull latest ──────────────────────────────────────────────────────────
echo ""
echo "=== Step 1: Pull latest code ==="
BRANCH=$(git branch --show-current)
echo "  Branch: $BRANCH"
git fetch origin --quiet 2>/dev/null || true

PULL_OUTPUT=$(git pull origin "$BRANCH" --rebase 2>&1 || true)
echo "$PULL_OUTPUT" | tail -3 | sed 's/^/  /'
echo "  ✅ Code synced"

# ─── 2. Check lockfile changes ───────────────────────────────────────────────
echo ""
echo "=== Step 2: Check dependencies ==="
LOCKFILE_CHANGED=$(git diff HEAD~1 HEAD --name-only 2>/dev/null | grep -cE "package-lock\.json|pnpm-lock\.yaml|yarn\.lock" || true)

if [ "${LOCKFILE_CHANGED:-0}" -gt "0" ]; then
  echo "  🔄 Lockfile changed — installing dependencies..."

  if [ -d "Application/backend" ]; then
    echo "  → Application/backend"
    cd Application/backend && npm ci --silent && cd "$PROJECT_ROOT"
  fi
  if [ -d "Customer/frontend/crm-admin" ]; then
    echo "  → Customer/frontend/crm-admin"
    cd Customer/frontend/crm-admin && npm ci --silent && cd "$PROJECT_ROOT"
  fi
  if [ -d "Vendor/frontend/vendor-panel" ]; then
    echo "  → Vendor/frontend/vendor-panel"
    cd Vendor/frontend/vendor-panel && npm ci --silent 2>/dev/null || true && cd "$PROJECT_ROOT"
  fi
  if [ -d "WhiteLabel/wl-api" ]; then
    echo "  → WhiteLabel/wl-api"
    cd WhiteLabel/wl-api && npm ci --silent && cd "$PROJECT_ROOT"
  fi
  echo "  ✅ Dependencies installed"
else
  echo "  ✅ Lockfiles unchanged — skipping install"
fi

# ─── 3. Prisma regenerate if schema changed ───────────────────────────────────
echo ""
echo "=== Step 3: Prisma schemas ==="
SCHEMA_CHANGED=$(git diff HEAD~1 HEAD --name-only 2>/dev/null | grep -cE "\.prisma$" || true)
if [ "${SCHEMA_CHANGED:-0}" -gt "0" ]; then
  echo "  🔄 Schema changed — regenerating Prisma clients..."
  if [ -d "Application/backend" ]; then
    cd Application/backend
    npx prisma generate --quiet 2>/dev/null && echo "  ✅ Prisma clients regenerated"
    cd "$PROJECT_ROOT"
  fi
else
  echo "  ✅ Schemas unchanged — skipping generate"
fi

# ─── 4. Previous session context ─────────────────────────────────────────────
echo ""
echo "=== Step 4: Previous session context ==="
if [ -f "$SESSION_FILE" ]; then
  python3 - <<PYEOF
import json, sys

try:
    with open("$SESSION_FILE") as f:
        d = json.load(f)

    prev_machine = d.get("machine", "unknown")
    prev_os      = d.get("os", "?")
    prev_closed  = d.get("closedAt", "not closed")
    prev_task    = d.get("currentTask", "(no task)")
    prev_tests   = d.get("testsStatus", "?")
    prev_build   = d.get("buildStatus", "?")
    prev_hash    = d.get("lastCommitHash", "")[:8]
    prev_msg     = d.get("lastCommitMessage", "")
    recent_raw   = d.get("recentFiles", "")
    recent_files = [f for f in recent_raw.split("|") if f.strip()]

    print(f"  Last machine:  {prev_machine} ({prev_os})")
    print(f"  Session closed:{prev_closed}")
    print(f"  Last task:     {prev_task}")
    print(f"  Tests:         {prev_tests}")
    print(f"  Build:         {prev_build}")
    print(f"  Last commit:   {prev_hash} — {prev_msg}")
    if recent_files:
        print("  Recent files:")
        for rf in recent_files[:10]:
            print(f"    • {rf}")
except Exception as e:
    print(f"  (Could not read session: {e})")
PYEOF
else
  echo "  No previous session found — this may be a fresh clone."
fi

# ─── 5. Health check ─────────────────────────────────────────────────────────
echo ""
echo "=== Step 5: Health check ==="

# TypeScript
echo -n "  TypeScript:  "
if [ -d "Application/backend" ]; then
  cd Application/backend
  TS_OUT=$(npx tsc --noEmit --pretty false 2>&1 || true)
  ERR_COUNT=$(echo "$TS_OUT" | grep -c "error TS" || true)
  if [ "$ERR_COUNT" -eq "0" ]; then
    echo "✅ clean"
  else
    echo "⚠️  $ERR_COUNT errors"
  fi
  cd "$PROJECT_ROOT"
else
  echo "(backend not found)"
fi

# Test file count
SPEC_COUNT=$(find Application/backend/src -name "*.spec.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "  Test files:  $SPEC_COUNT spec files found"

# Module count
MOD_COUNT=$(find Application/backend/src/modules -maxdepth 2 -name "*.module.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "  NestJS mods: $MOD_COUNT modules"

# Recent commits
echo "  Last 3 commits:"
git log --oneline -3 | sed 's/^/    /'

# ─── 6. Write new session state ──────────────────────────────────────────────
echo ""
echo "=== Step 6: Starting new session ==="

SESSION_UUID=$(python3 -c "import uuid; print(str(uuid.uuid4()))" 2>/dev/null || \
               uuidgen 2>/dev/null || echo "$(date +%s)-$$")

# Read previous values for context
PREV_MACHINE="none"
PREV_CLOSED="none"
PREV_TASK="New session"
if [ -f "$SESSION_FILE" ]; then
  PREV_MACHINE=$(python3 -c "import json; d=json.load(open('$SESSION_FILE')); print(d.get('machine','none'))" 2>/dev/null || echo "none")
  PREV_CLOSED=$(python3 -c "import json; d=json.load(open('$SESSION_FILE')); print(d.get('closedAt','none'))" 2>/dev/null || echo "none")
  PREV_TASK=$(python3 -c "import json; d=json.load(open('$SESSION_FILE')); print(d.get('currentTask','New session'))" 2>/dev/null || echo "New session")
fi

CURRENT_HASH=$(git rev-parse HEAD 2>/dev/null || echo "none")
CURRENT_MSG=$(git log -1 --pretty=%s 2>/dev/null || echo "none")

python3 - <<PYEOF
import json

session = {
  "sessionId": "$SESSION_UUID",
  "startedAt": "$TIMESTAMP",
  "machine": "$MACHINE",
  "os": "$OS_TYPE",
  "branch": "$BRANCH",
  "lastCommitHash": "$CURRENT_HASH",
  "lastCommitMessage": "$CURRENT_MSG",
  "currentTask": "$PREV_TASK",
  "previousMachine": "$PREV_MACHINE",
  "previousClosedAt": "$PREV_CLOSED",
  "testsStatus": "not checked yet",
  "buildStatus": "not checked yet"
}
with open("$SESSION_FILE", "w") as f:
    json.dump(session, f, indent=2)
print("  ✅ New session started")
PYEOF

# ─── 7. Summary ──────────────────────────────────────────────────────────────
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  SESSION STARTED                                             ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
printf "║  Machine:    %-49s║\n" "$MACHINE ($OS_TYPE)"
printf "║  Branch:     %-49s║\n" "$BRANCH"
printf "║  Previous:   %-49s║\n" "$PREV_MACHINE"
printf "║  Last task:  %-49s║\n" "$PREV_TASK"
printf "║  Time:       %-49s║\n" "$TIMESTAMP"
echo "╠═══════════════════════════════════════════════════════════════╣"
echo "║  ✅ Ready to work. Run: npm run work:close when done         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
