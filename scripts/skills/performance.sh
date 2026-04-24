#!/usr/bin/env bash
# performance.sh — CRMSoft Performance Dashboard Skill
# Usage: bash scripts/skills/performance.sh [mode]
# Modes: full | bundle | build | tests | api

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MODE="${1:-full}"
DATE=$(date +%Y-%m-%d)
TS=$(date +%Y%m%d-%H%M%S)
REPORT_DIR="$REPO_ROOT/docs/performance"
REPORT_FILE="$REPORT_DIR/perf-report-${DATE}.md"
mkdir -p "$REPORT_DIR"

banner() { echo ""; echo "━━━ $* ━━━"; }

declare -a REPORT_LINES=()
report() { REPORT_LINES+=("$1"); }

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  CRMSoft Performance Dashboard (PM CLI Phase 2)          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo "  Mode: $MODE | Date: $DATE"

# ─── Bundle size analysis ─────────────────────────────────────────────────────
check_bundle() {
  banner "Bundle Size Analysis"
  report "## Bundle Size"
  report ""
  report "| App | Build Dir | Size |"
  report "|-----|-----------|------|"

  local APPS=(
    "API (NestJS):Application/backend/dist"
    "CRM Admin:Customer/frontend/crm-admin/.next"
    "Vendor Panel:Vendor/frontend/vendor-panel/.next"
    "WL API:WhiteLabel/wl-api/dist"
    "WL Admin:WhiteLabel/wl-admin/.next"
    "WL Partner:WhiteLabel/wl-partner/.next"
  )

  for entry in "${APPS[@]}"; do
    local name="${entry%%:*}"
    local dir="$REPO_ROOT/${entry#*:}"
    if [ -d "$dir" ]; then
      local size
      size=$(du -sh "$dir" 2>/dev/null | cut -f1 || echo "?")
      echo "  $name: $size"
      report "| $name | ${entry#*:} | $size |"
    else
      echo "  $name: (not built)"
      report "| $name | ${entry#*:} | not built |"
    fi
  done
  report ""
}

# ─── Build time tracking ──────────────────────────────────────────────────────
check_build_times() {
  banner "Build Time Tracking (dry run — measures typecheck as proxy)"
  report "## Build Time (typecheck proxy)"
  report ""

  local START END ELAPSED
  echo "  Running typecheck as build proxy..."
  START=$(date +%s)
  cd "$REPO_ROOT/Application/backend" && pnpm typecheck 2>/dev/null; local RC=$?
  END=$(date +%s)
  ELAPSED=$((END - START))
  cd "$REPO_ROOT"

  echo "  API typecheck: ${ELAPSED}s (exit=$RC)"
  report "| API typecheck | ${ELAPSED}s |"
  report ""
  report "> Note: Full build times require running \`pnpm build:api\`, \`pnpm build:admin\` etc."
  report "> Run \`pnpm perf:build\` after a full build to get accurate metrics."
  report ""
}

# ─── Slow test detection ──────────────────────────────────────────────────────
check_slow_tests() {
  banner "Slow Test Detection (>2s threshold)"
  report "## Slow Test Analysis"
  report ""

  # Count total tests
  local TOTAL_SPECS
  TOTAL_SPECS=$(find "$REPO_ROOT/Application/backend/src" -name "*.spec.ts" \
    ! -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ')

  echo "  Total spec files: $TOTAL_SPECS"
  report "- Total spec files: $TOTAL_SPECS"
  report "- Slow test detection requires running Jest with --verbose --json"
  report "- Command: \`cd Application/backend && npx jest --json 2>/dev/null | jq '.testResults[] | select(.perfStats.end - .perfStats.start > 2000)'\`"
  report ""
}

# ─── Prisma client connection benchmarks ─────────────────────────────────────
check_prisma_connections() {
  banner "Prisma Client Analysis (7 DBs)"
  report "## Prisma Multi-DB Configuration"
  report ""

  local DBS=(
    "Identity:prisma/identity"
    "Platform:prisma/platform"
    "Working:prisma/working"
    "Marketplace:prisma/marketplace"
    "PlatformConsole:prisma/platform-console"
    "GlobalReference:prisma/global"
    "Demo:prisma/demo"
  )

  report "| DB | Schema Location | Status |"
  report "|----|----------------|--------|"

  for entry in "${DBS[@]}"; do
    local name="${entry%%:*}"
    local path="$REPO_ROOT/Application/backend/${entry#*:}"
    if [ -d "$path" ]; then
      local files
      files=$(ls "$path"/*.prisma 2>/dev/null | wc -l | tr -d ' ')
      echo "  $name: $files schema file(s)"
      report "| $name | ${entry#*:} | ✅ $files file(s) |"
    else
      echo "  $name: (not found)"
      report "| $name | ${entry#*:} | ❌ missing |"
    fi
  done
  report ""
}

# ─── API response benchmarks ──────────────────────────────────────────────────
check_api_benchmarks() {
  banner "API Response Benchmarks"
  report "## API Benchmarks"
  report ""

  # Check if API is running
  local API_ALIVE=false
  if curl -s http://localhost:3001/health >/dev/null 2>&1; then
    API_ALIVE=true
    echo "  API is running at :3001"

    local ENDPOINTS=("/health" "/api/v1/auth/ping" "/api/v1/modules")
    for ep in "${ENDPOINTS[@]}"; do
      local START END MS
      START=$(date +%s%N 2>/dev/null || date +%s)
      curl -s "http://localhost:3001${ep}" >/dev/null 2>&1 || true
      END=$(date +%s%N 2>/dev/null || date +%s)
      MS=$(( (END - START) / 1000000 ))
      echo "  GET $ep: ${MS}ms"
      report "| GET $ep | ${MS}ms |"
    done
  else
    echo "  API not running (start with: pnpm dev:api)"
    report "> API not running. Start with \`pnpm dev:api\` then run \`pnpm perf:api\`"
  fi
  report ""
}

# ─── Write report ─────────────────────────────────────────────────────────────
write_report() {
  cat > "$REPORT_FILE" << REOF
# Performance Report — CRMSoft

**Date:** $DATE
**Mode:** $MODE

---

REOF
  for line in "${REPORT_LINES[@]}"; do
    echo "$line" >> "$REPORT_FILE"
  done

  cat >> "$REPORT_FILE" << REOF

---
_Generated by PM CLI Phase 2 Performance Skill_
REOF

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Report: docs/performance/perf-report-${DATE}.md"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# ─── DISPATCH ────────────────────────────────────────────────────────────────
case "$MODE" in
  full)
    check_bundle
    check_prisma_connections
    check_build_times
    check_slow_tests
    check_api_benchmarks
    write_report
    ;;
  bundle)    check_bundle;             write_report ;;
  build)     check_build_times;        write_report ;;
  tests)     check_slow_tests;         write_report ;;
  api)       check_api_benchmarks;     write_report ;;
  prisma)    check_prisma_connections; write_report ;;
  *)
    echo "Usage: bash scripts/skills/performance.sh [full|bundle|build|tests|api]"
    exit 1
    ;;
esac
