#!/bin/bash
# V6 smoke test — run after any migration step to confirm nothing broke.
# Tests: pnpm install, backend tsc, frontend tsc baselines, V6 structure tests.
# Does NOT boot servers (use for CI / rapid local checks).
#
# Usage: ./scripts/v6-migration/smoke-test-v6.sh [--full]
# --full: also runs V6 integration tests (requires node_modules in tests/integration/v6/)

set -uo pipefail

FULL=${1:-}
PASS=0
FAIL=0
START=$(date +%s)

cd "$(git rev-parse --show-toplevel)"

banner() { echo ""; echo "══════════════════════════════════════════"; echo "  $1"; echo "══════════════════════════════════════════"; }
ok()  { echo "  ✅ $1"; PASS=$((PASS + 1)); }
err() { echo "  ❌ $1"; FAIL=$((FAIL + 1)); }
warn(){ echo "  ⚠️  $1"; }

banner "V6 Smoke Test — $(date '+%Y-%m-%d %H:%M')"

# ── 1. pnpm workspace integrity ────────────────────────────────────────────────
banner "1/6 pnpm workspace"
if pnpm install --frozen-lockfile 2>&1 | tail -3 | grep -q "Done"; then
  ok "pnpm install --frozen-lockfile"
else
  warn "pnpm install may have issues (check output above)"
fi

# ── 2. Backend tsc (MUST stay 0) ──────────────────────────────────────────────
banner "2/6 Backend TypeScript"
BACKEND_ERRORS=$(cd apps-backend/api && pnpm exec tsc --noEmit 2>&1 | grep -c "error TS") || true
if [ "$BACKEND_ERRORS" -eq 0 ]; then
  ok "Backend tsc: 0 errors"
else
  err "Backend tsc: $BACKEND_ERRORS errors (baseline must be 0)"
fi

# ── 3. crm-admin tsc (baseline ≤329) ──────────────────────────────────────────
banner "3/6 Frontend tsc (V5 originals)"
CRM_ERRORS=$(cd apps-frontend/crm-admin && pnpm exec tsc --noEmit 2>&1 | grep -c "error TS") || true
# Sprint branch baseline: 332 (ticket #4 fix on develop not yet merged to sprint)
# Tighten to 329 after PR #16 merges into sprint
if [ "${CRM_ERRORS:-0}" -le 332 ]; then
  ok "crm-admin tsc: ${CRM_ERRORS:-0} errors (≤332 sprint baseline)"
else
  err "crm-admin tsc: ${CRM_ERRORS:-0} errors (EXCEEDS 332 sprint baseline)"
fi

VENDOR_ERRORS=$(cd apps-frontend/vendor-panel && pnpm exec tsc --noEmit 2>&1 | grep -c "error TS") || true
if [ "${VENDOR_ERRORS:-0}" -le 1 ]; then
  ok "vendor-panel tsc: ${VENDOR_ERRORS:-0} errors (≤1 baseline)"
else
  err "vendor-panel tsc: ${VENDOR_ERRORS:-0} errors (EXCEEDS 1 baseline)"
fi

# ── 4. V6 new frontend portals tsc ────────────────────────────────────────────
banner "4/6 Frontend tsc (V6 new portals)"
for portal in crm-admin-new vendor-panel-new customer-portal-new marketplace-new; do
  PORTAL_DIR="apps/frontend/$portal"
  if [ -f "$PORTAL_DIR/package.json" ]; then
    PORTAL_ERRORS=$(cd "$PORTAL_DIR" && pnpm exec tsc --noEmit 2>&1 | grep -c "error TS") || true
    if [ "${PORTAL_ERRORS:-0}" -eq 0 ]; then
      ok "$portal tsc: 0 errors"
    else
      warn "$portal tsc: ${PORTAL_ERRORS:-0} errors (non-blocking in v1)"
    fi
  else
    echo "  ⏭  $portal not yet migrated — skipping"
  fi
done

# ── 5. V6 structure validation ────────────────────────────────────────────────
banner "5/6 V6 folder structure"
REQUIRED_DIRS=(
  "core/platform"
  "core/ai-engine"
  "core/governance/ci-rules"
  "verticals/travel"
  "verticals/electronic"
  "brands/crmsoft/theme"
  "brands/crmsoft/config"
  "apps/frontend"
  "partner-customizations"
)
for dir in "${REQUIRED_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    ok "$dir/"
  else
    err "$dir/ missing"
  fi
done

# Brand token check
if [ -f "brands/crmsoft/theme/variables.css" ]; then
  TOKEN_COUNT=$(grep -c "^  --brand-" brands/crmsoft/theme/variables.css || echo 0)
  ok "brands/crmsoft/theme/variables.css: $TOKEN_COUNT CSS tokens"
else
  err "brands/crmsoft/theme/variables.css missing"
fi

# ── 6. V6 integration tests (optional --full) ──────────────────────────────────
banner "6/6 V6 integration tests"
if [ "$FULL" = "--full" ]; then
  if [ -d "tests/integration/v6/node_modules" ]; then
    TEST_RESULT=$(cd tests/integration/v6 && pnpm exec jest --config jest.config.ts --passWithNoTests 2>&1 | tail -3)
    echo "$TEST_RESULT"
    if echo "$TEST_RESULT" | grep -q "passed"; then
      ok "V6 integration tests passed"
    else
      err "V6 integration tests failed"
    fi
  else
    warn "Run 'pnpm install --filter @crmsoft/v6-integration-tests' first"
  fi
else
  echo "  Skipped (add --full to run)"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
END=$(date +%s)
ELAPSED=$((END - START))

banner "Results"
echo "  ✅ Passed: $PASS"
echo "  ❌ Failed: $FAIL"
echo "  ⏱  Time:   ${ELAPSED}s"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "  ⚠️  $FAIL check(s) failed. Do NOT commit until resolved."
  exit 1
else
  echo "  ✅ All checks passed. Safe to continue migration."
  exit 0
fi
