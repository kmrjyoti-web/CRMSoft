#!/usr/bin/env bash
# Module Config UI E2E Test
# Usage: ./scripts/test-module-config-ui.sh [API_BASE] [UI_BASE]

set -euo pipefail

API="${1:-http://localhost:3001}/platform-console"
UI="${2:-http://localhost:3012}"
PASS=0; FAIL=0

green='\033[0;32m'; red='\033[0;31m'; reset='\033[0m'

check_api() {
  local label="$1"; local url="$2"; local expect="${3:-}"
  local resp http
  resp=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null)
  http=$(tail -1 <<< "$resp")
  body=$(head -n -1 <<< "$resp")
  if [[ "$http" -ge 200 && "$http" -lt 300 ]]; then
    if [[ -n "$expect" ]] && ! echo "$body" | grep -q "$expect"; then
      echo -e "  ${red}FAIL${reset}  $label — missing '$expect'"
      ((FAIL++))
    else
      echo -e "  ${green}PASS${reset}  $label — HTTP $http"
      ((PASS++))
    fi
  else
    echo -e "  ${red}FAIL${reset}  $label — HTTP $http"
    ((FAIL++))
  fi
}

check_ui() {
  local label="$1"; local url="$2"
  local http
  http=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
  if [[ "$http" -ge 200 && "$http" -lt 400 ]]; then
    echo -e "  ${green}PASS${reset}  $label — HTTP $http"
    ((PASS++))
  else
    echo -e "  ${red}FAIL${reset}  $label — HTTP $http"
    ((FAIL++))
  fi
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Module Config UI E2E Test"
echo "  API: $API"
echo "  UI:  $UI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "── API Endpoints ──"
check_api "GET /vertical-config" "$API/vertical-config"
check_api "GET /vertical-config/CRM_GENERAL" "$API/vertical-config/CRM_GENERAL" "CRM_GENERAL"
check_api "GET /vertical-config/TRAVEL" "$API/vertical-config/TRAVEL" "TRAVEL"
check_api "GET /vertical-config/ELECTRONIC" "$API/vertical-config/ELECTRONIC" "ELECTRONIC"
check_api "GET /vertical-config/SOFTWARE" "$API/vertical-config/SOFTWARE" "SOFTWARE"
check_api "GET .../CRM_GENERAL/modules" "$API/vertical-config/CRM_GENERAL/modules"
check_api "GET .../TRAVEL/menus" "$API/vertical-config/TRAVEL/menus"
check_api "GET .../ELECTRONIC/features" "$API/vertical-config/ELECTRONIC/features"
check_api "GET .../SOFTWARE/modules" "$API/vertical-config/SOFTWARE/modules" "LICENSING"

echo ""
echo "── UI Pages ──"
check_ui  "GET /vertical-config" "$UI/vertical-config"
check_ui  "GET /vertical-config/CRM_GENERAL" "$UI/vertical-config/CRM_GENERAL"
check_ui  "GET /vertical-config/TRAVEL" "$UI/vertical-config/TRAVEL"
check_ui  "GET /vertical-config/ELECTRONIC" "$UI/vertical-config/ELECTRONIC"
check_ui  "GET /vertical-config/SOFTWARE" "$UI/vertical-config/SOFTWARE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
TOTAL=$((PASS + FAIL))
echo -e "  Results: ${green}${PASS} passed${reset} / ${red}${FAIL} failed${reset} / ${TOTAL} total"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

[[ $FAIL -eq 0 ]] && exit 0 || exit 1
