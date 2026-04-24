#!/usr/bin/env bash
# Platform Console E2E smoke test
# Usage: ./scripts/test-platform-console-e2e.sh [API_BASE]
# Default API base: http://localhost:3001

set -euo pipefail

API="${1:-http://localhost:3001}"
PASS=0; FAIL=0

green='\033[0;32m'; red='\033[0;31m'; yellow='\033[0;33m'; reset='\033[0m'

check() {
  local label="$1"; local url="$2"; local expected_field="${3:-}"
  local resp http_code body
  resp=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null)
  http_code=$(tail -1 <<< "$resp")
  body=$(head -n -1 <<< "$resp")
  if [[ "$http_code" -ge 200 && "$http_code" -lt 300 ]]; then
    if [[ -n "$expected_field" ]] && ! echo "$body" | grep -q "$expected_field"; then
      echo -e "  ${yellow}WARN${reset}  $label — HTTP $http_code but missing '$expected_field'"
      ((FAIL++))
    else
      echo -e "  ${green}PASS${reset}  $label — HTTP $http_code"
      ((PASS++))
    fi
  else
    echo -e "  ${red}FAIL${reset}  $label — HTTP $http_code"
    ((FAIL++))
  fi
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Platform Console E2E Smoke Test"
echo "  API: $API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "── Dashboard ──"
check "GET /dashboard"           "$API/platform-console/dashboard"
check "GET /dashboard/health"    "$API/platform-console/dashboard/health"

echo ""
echo "── Brand Config ──"
check "GET /brands/config"               "$API/platform-console/brands/config"
check "GET /brands/config/crmsoft"       "$API/platform-console/brands/config/crmsoft"        "crmsoft"
check "GET /brands/config/partner-travel-1" "$API/platform-console/brands/config/partner-travel-1" "TravelCRM"

echo ""
echo "── Partners ──"
check "GET /partners"            "$API/platform-console/partners"
check "GET /partners/travel-01"  "$API/platform-console/partners/travel-01"   "travel-01"
check "GET /partners/electronic-01" "$API/platform-console/partners/electronic-01" "electronic-01"

echo ""
echo "── Partner Verticals ──"
check "GET /partners/travel-01/verticals"      "$API/platform-console/partners/travel-01/verticals"
check "GET /partners/electronic-01/verticals"  "$API/platform-console/partners/electronic-01/verticals"

echo ""
echo "── Verticals ──"
check "GET /verticals"           "$API/platform-console/verticals"
check "GET /verticals/GENERAL"   "$API/platform-console/verticals/GENERAL"   "GENERAL"
check "GET /verticals/TOURISM"   "$API/platform-console/verticals/TOURISM"   "TOURISM"

echo ""
echo "── Health ──"
check "GET /health"              "$API/platform-console/health"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
TOTAL=$((PASS + FAIL))
echo -e "  Results: ${green}${PASS} passed${reset} / ${red}${FAIL} failed${reset} / ${TOTAL} total"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

[[ $FAIL -eq 0 ]] && exit 0 || exit 1
