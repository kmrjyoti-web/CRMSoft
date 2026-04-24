#!/bin/bash
# scripts/work-status.sh
# Show current session info — read-only, changes nothing
# Usage:  npm run work:status
# ─────────────────────────────────────────────────────────────────────────────

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"
SESSION_FILE=".work-session.json"

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  WORK:STATUS                                                 ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

# ─── Machine ─────────────────────────────────────────────────────────────────
echo ""
echo "  Machine:     $(hostname) ($(uname -s))"
echo "  Branch:      $(git branch --show-current)"
echo "  Commit:      $(git rev-parse --short HEAD) — $(git log -1 --pretty=%s)"
DIRTY=$(git status --porcelain | wc -l | tr -d ' ')
echo "  Uncommitted: $DIRTY files"

# ─── Previous session ────────────────────────────────────────────────────────
echo ""
if [ -f "$SESSION_FILE" ]; then
  python3 - <<PYEOF
import json

try:
    with open("$SESSION_FILE") as f:
        d = json.load(f)
    print("  Session file: .work-session.json")
    print(f"    Session ID:   {d.get('sessionId','?')[:12]}...")
    print(f"    Started:      {d.get('startedAt','?')}")
    print(f"    Closed:       {d.get('closedAt', '(still open)')}")
    print(f"    Machine:      {d.get('machine','?')} ({d.get('os','?')})")
    print(f"    Task:         {d.get('currentTask','?')}")
    print(f"    Tests:        {d.get('testsStatus','?')}")
    print(f"    Build:        {d.get('buildStatus','?')}")
    print(f"    Prev machine: {d.get('previousMachine','?')}")
except Exception as e:
    print(f"  (Could not read session: {e})")
PYEOF
else
  echo "  Session file: not found"
fi

# ─── Project stats ───────────────────────────────────────────────────────────
echo ""
echo "  Project:"
MOD_COUNT=$(find Application/backend/src/modules -maxdepth 2 -name "*.module.ts" 2>/dev/null | wc -l | tr -d ' ')
SPEC_COUNT=$(find Application/backend/src -name "*.spec.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "    NestJS modules: $MOD_COUNT"
echo "    Spec files:     $SPEC_COUNT"

# ─── Recent commits ──────────────────────────────────────────────────────────
echo ""
echo "  Last 5 commits:"
git log --oneline -5 | sed 's/^/    /'

# ─── Unpushed ────────────────────────────────────────────────────────────────
UNPUSHED=$(git log --oneline @{u}..HEAD 2>/dev/null | wc -l | tr -d ' ')
if [ "$UNPUSHED" -gt "0" ]; then
  echo ""
  echo "  ⚠️  $UNPUSHED commit(s) not yet pushed:"
  git log --oneline @{u}..HEAD | sed 's/^/    /'
fi

echo ""
