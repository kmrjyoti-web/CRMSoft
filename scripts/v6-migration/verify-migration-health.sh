#!/bin/bash
# Run all health checks after a migration step.
# Prints pass/fail per check. Exit code 0 = all pass, 1 = any fail.

set -uo pipefail

cd "$(git rev-parse --show-toplevel)"

PASS=0
FAIL=0

check() {
  local label=$1
  local result=$2
  local threshold=${3:-0}
  if [ "$result" -le "$threshold" ]; then
    echo "  ✅ $label: $result (≤ $threshold)"
    PASS=$((PASS + 1))
  else
    echo "  ❌ $label: $result (EXCEEDS threshold $threshold)"
    FAIL=$((FAIL + 1))
  fi
}

echo "=========================================="
echo "Migration Health Check — $(date '+%Y-%m-%d %H:%M')"
echo "=========================================="

echo ""
echo "=== TypeScript checks ==="

backend_errors=$(cd apps-backend/api && pnpm exec tsc --noEmit 2>&1 | grep -c "error TS" || true)
check "Backend tsc errors" "$backend_errors" 0

crm_errors=$(cd apps-frontend/crm-admin && rm -rf .next && pnpm exec tsc --noEmit 2>&1 | grep -c "error TS" || true)
check "crm-admin tsc errors" "$crm_errors" 329

echo ""
echo "=== Prisma checks ==="

prisma_at=$(ls apps-backend/api/node_modules/@prisma/ 2>/dev/null | grep -c "client" || true)
prisma_dot=$(ls apps-backend/api/node_modules/.prisma/ 2>/dev/null | grep -c "client" || true)
echo "  @prisma/ clients: $prisma_at (expected ≥ 4)"
echo "  .prisma/ clients: $prisma_dot (expected ≥ 3)"

echo ""
echo "=== Git status ==="
changed=$(git status --short | wc -l | tr -d ' ')
echo "  Changed files: $changed"

echo ""
echo "=========================================="
echo "Results: $PASS passed, $FAIL failed"
echo "=========================================="

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "⚠️  Some checks failed. Investigate before committing."
  exit 1
else
  echo ""
  echo "✅ All checks passed. Safe to commit this migration step."
  exit 0
fi
