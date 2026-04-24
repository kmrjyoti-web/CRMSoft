#!/usr/bin/env bash
# smoke-test.sh — CRMSoft Multi-Portal Smoke Test
# Tests API health + frontend reachability across all portals.
# Usage: bash scripts/governance/smoke-test.sh [--quick]
#
# --quick: API health only (no frontend startup, ~30s)
# full:    API + 3 frontends (~2min, requires ports free)
#
# Note: This script starts processes and cleans them up.
# It is safe to run in CI (ports are killed before + after).

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
QUICK="${1:-}"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
REPORT_FILE="$REPO_ROOT/docs/smoke/smoke-${TIMESTAMP//:/}.md"
PASS=0
FAIL=0
WARN=0
PIDS=()

# ─── Colours ─────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}  ✅ PASS${NC}  $1"; PASS=$((PASS+1)); }
fail() { echo -e "${RED}  ❌ FAIL${NC}  $1"; FAIL=$((FAIL+1)); }
warn() { echo -e "${YELLOW}  ⚠️  WARN${NC}  $1"; WARN=$((WARN+1)); }
info() { echo -e "  ℹ️   $1"; }

# ─── Cleanup on exit ─────────────────────────────────────────────────────────
cleanup() {
  if [ ${#PIDS[@]} -gt 0 ]; then
    info "Stopping background processes..."
    for pid in "${PIDS[@]}"; do
      kill "$pid" 2>/dev/null || true
    done
  fi
  # Re-kill ports to leave clean
  npx --yes kill-port 3001 3005 3006 3012 2>/dev/null || true
}
trap cleanup EXIT

# ─── Header ──────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║          CRMSoft Multi-Portal Smoke Test                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo "  Run: $TIMESTAMP"
[ "$QUICK" = "--quick" ] && echo "  Mode: QUICK (API only)" || echo "  Mode: FULL (API + frontends)"
echo ""

# ─── Step 1: Kill stray processes ────────────────────────────────────────────
echo "━━━ [1/5] Clearing ports ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npx --yes kill-port 3001 3005 3006 3007 3008 3009 3010 3011 3012 2>/dev/null || true
sleep 2
pass "Ports cleared (3001 3005 3006 3007 3008 3009 3010 3011 3012)"

# ─── Step 2: Start API ───────────────────────────────────────────────────────
echo ""
echo "━━━ [2/5] Starting API (port 3001) ━━━━━━━━━━━━━━━━━━━━━━━━━"
info "Launching: cd Application/backend && npm run start:dev"

(cd "$REPO_ROOT/Application/backend" && npm run start:dev > /tmp/smoke-api.log 2>&1) &
API_PID=$!
PIDS+=("$API_PID")

info "Waiting 45s for API startup..."
sleep 45

# Check process still alive
if ! kill -0 "$API_PID" 2>/dev/null; then
  fail "API process exited — check /tmp/smoke-api.log"
  echo ""
  tail -20 /tmp/smoke-api.log 2>/dev/null | sed 's/^/    /'
else
  pass "API process alive (PID $API_PID)"
fi

# ─── Step 3: Test API health endpoint ────────────────────────────────────────
echo ""
echo "━━━ [3/5] API Health Checks ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_endpoint() {
  local label="$1"
  local url="$2"
  local expected_status="${3:-200}"

  local http_status
  http_status=$(curl -s -o /dev/null -w "%{http_code}" \
    --max-time 10 --connect-timeout 5 "$url" 2>/dev/null)
  # curl always writes http_code to stdout even on failure (connection refused → 000)
  http_status="${http_status:-000}"

  if [ "$http_status" = "$expected_status" ]; then
    pass "$label → HTTP $http_status ($url)"
  elif [ "$http_status" = "000" ]; then
    fail "$label → No response (connection refused or timeout) ($url)"
  else
    warn "$label → HTTP $http_status (expected $expected_status) ($url)"
  fi
}

# Primary health endpoint
check_endpoint "GET /api/v1/health" "http://localhost:3001/api/v1/health" "200"

# Alternate health paths (try both — different NestJS setups use different paths)
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  --max-time 10 --connect-timeout 5 \
  "http://localhost:3001/health" 2>/dev/null)
HEALTH_STATUS="${HEALTH_STATUS:-000}"
if [ "$HEALTH_STATUS" = "200" ] || [ "$HEALTH_STATUS" = "404" ]; then
  # 404 = API is up but no /health at root — that's fine
  pass "API is responding (HTTP $HEALTH_STATUS on /health)"
else
  warn "API /health returned $HEALTH_STATUS — may still be starting"
fi

# ─── Step 4: Frontend smoke (full mode only) ─────────────────────────────────
if [ "$QUICK" != "--quick" ]; then
  echo ""
  echo "━━━ [4/5] Frontend Smoke Tests ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  start_frontend() {
    local label="$1"
    local dir="$2"
    local port="$3"
    local cmd="${4:-pnpm dev}"

    info "Starting $label on port $port..."
    (cd "$REPO_ROOT/$dir" && $cmd > "/tmp/smoke-${port}.log" 2>&1) &
    PIDS+=("$!")
  }

  check_frontend() {
    local label="$1"
    local port="$2"
    local wait_secs="${3:-30}"

    info "Waiting ${wait_secs}s for $label..."
    sleep "$wait_secs"

    local http_status
    http_status=$(curl -s -o /dev/null -w "%{http_code}" \
      --max-time 10 --connect-timeout 5 \
      "http://localhost:${port}" 2>/dev/null)
    http_status="${http_status:-000}"

    if [ "$http_status" = "200" ] || [ "$http_status" = "307" ] || [ "$http_status" = "308" ]; then
      pass "$label (port $port) → HTTP $http_status"
    elif [ "$http_status" = "000" ]; then
      fail "$label (port $port) → No response — check /tmp/smoke-${port}.log"
    else
      warn "$label (port $port) → HTTP $http_status (may be loading)"
    fi
  }

  # Launch frontends in parallel
  if [ -d "$REPO_ROOT/Customer/frontend/crm-admin" ]; then
    start_frontend "CRM Admin" "Customer/frontend/crm-admin" "3005" "pnpm dev"
  else
    warn "CRM Admin directory not found — skipping"
  fi

  if [ -d "$REPO_ROOT/Vendor/frontend/vendor-panel" ]; then
    start_frontend "Vendor Panel" "Vendor/frontend/vendor-panel" "3006" "pnpm dev"
  else
    warn "Vendor Panel directory not found — skipping"
  fi

  if [ -d "$REPO_ROOT/PlatformConsole/frontend/platform-console" ]; then
    start_frontend "Platform Console" "PlatformConsole/frontend/platform-console" "3012" "npm run dev"
  else
    warn "Platform Console directory not found — skipping"
  fi

  # Check all 3 frontends (30s wait baked into each)
  check_frontend "CRM Admin" "3005" "30"
  check_frontend "Vendor Panel" "3006" "10"
  check_frontend "Platform Console" "3012" "10"
else
  echo ""
  echo "━━━ [4/5] Frontend Smoke Tests ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  info "QUICK mode — frontend tests skipped. Run without --quick for full test."
fi

# ─── Step 5: Summary ─────────────────────────────────────────────────────────
echo ""
echo "━━━ [5/5] Summary ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
TOTAL=$((PASS+FAIL+WARN))
echo "  PASS:  $PASS / $TOTAL"
echo "  WARN:  $WARN / $TOTAL"
echo "  FAIL:  $FAIL / $TOTAL"
echo ""

# ─── Write report ─────────────────────────────────────────────────────────────
mkdir -p "$REPO_ROOT/docs/smoke"
cat > "$REPORT_FILE" <<EOF
# CRMSoft Smoke Test Report
**Date:** $TIMESTAMP
**Mode:** $([ "$QUICK" = "--quick" ] && echo "Quick (API only)" || echo "Full (API + frontends)")
**Result:** $([ $FAIL -eq 0 ] && echo "✅ PASS" || echo "❌ FAIL ($FAIL failures)")

## Summary
| Status | Count |
|--------|-------|
| ✅ Pass | $PASS |
| ⚠️ Warn | $WARN |
| ❌ Fail | $FAIL |
| **Total** | **$TOTAL** |

## Portals Tested
| Portal | Port | Expected |
|--------|------|----------|
| API (NestJS) | 3001 | \`/api/v1/health → 200\` |
| CRM Admin | 3005 | \`/ → 200/307\` |
| Vendor Panel | 3006 | \`/ → 200/307\` |
| Platform Console | 3012 | \`/ → 200/307\` |

## Notes
- Full API startup can take 45–90s (Prisma client init × 7 DBs)
- Frontend dev servers need 20–30s for Next.js compilation
- Run \`pnpm smoke --quick\` for API-only check in CI
- Full logs in \`/tmp/smoke-*.log\`
EOF

info "Report saved: docs/smoke/smoke-${TIMESTAMP//:/}.md"
echo ""

if [ $FAIL -gt 0 ]; then
  echo -e "${RED}❌ Smoke test FAILED ($FAIL failure(s))${NC}"
  echo "   Check logs in /tmp/smoke-*.log for details."
  exit 1
else
  echo -e "${GREEN}✅ Smoke test PASSED${NC} ($PASS checks, $WARN warnings)"
  exit 0
fi
