#!/bin/bash
# health-check-all.sh — Check health of all active partner deployments
# Usage: ./health-check-all.sh [--json]
# Requires: WL_API_URL and WL_API_TOKEN env vars (or defaults)

set -euo pipefail

WL_API_URL="${WL_API_URL:-http://localhost:3010/api/v1/wl}"
WL_API_TOKEN="${WL_API_TOKEN:-}"
OUTPUT_JSON="${1:-}"
PASS=0
FAIL=0
TOTAL=0

echo "╔══════════════════════════════════════════════════════╗"
echo "║  CRMSoft Partner Health Check — All                 ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ─── Fetch active partners from wl-api ───────────────────────
PARTNERS_JSON=$(curl -s \
  -H "Authorization: Bearer ${WL_API_TOKEN}" \
  -H "Content-Type: application/json" \
  "${WL_API_URL}/partners?status=ACTIVE&limit=500" \
  || echo '{"partners":[]}')

# Parse partner list (requires jq)
if ! command -v jq &>/dev/null; then
  echo "⚠️  jq not found. Install with: brew install jq"
  exit 1
fi

PARTNERS=$(echo "$PARTNERS_JSON" | jq -r '.partners[]? | "\(.id)|\(.partnerCode)|\(.customDomain // "localhost")"')

if [ -z "$PARTNERS" ]; then
  echo "No active partners found (check WL_API_URL and WL_API_TOKEN)"
  exit 0
fi

printf "%-20s %-12s %-10s %-12s\n" "PARTNER" "STATUS" "HTTP" "RESPONSE_MS"
printf "%-20s %-12s %-10s %-12s\n" "────────────────────" "────────────" "──────────" "────────────"

while IFS='|' read -r PARTNER_ID PARTNER_CODE DOMAIN; do
  TOTAL=$((TOTAL + 1))
  HEALTH_URL="https://${DOMAIN}/health"

  START_MS=$(date +%s%3N)
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${HEALTH_URL}" 2>/dev/null || echo "000")
  END_MS=$(date +%s%3N)
  ELAPSED=$((END_MS - START_MS))

  if [ "$HTTP_CODE" -eq 200 ]; then
    STATUS="✅ healthy"
    PASS=$((PASS + 1))
  elif [ "$HTTP_CODE" -eq 000 ]; then
    STATUS="⚠️  timeout"
    FAIL=$((FAIL + 1))
  else
    STATUS="❌ HTTP ${HTTP_CODE}"
    FAIL=$((FAIL + 1))
  fi

  printf "%-20s %-12s %-10s %-12s\n" "${PARTNER_CODE:0:20}" "${STATUS}" "${HTTP_CODE}" "${ELAPSED}ms"
done <<< "$PARTNERS"

echo ""
echo "Summary: ${PASS}/${TOTAL} healthy, ${FAIL} degraded/down"
echo "Checked: $(date '+%Y-%m-%d %H:%M:%S %Z')"

[ "$FAIL" -gt 0 ] && exit 1 || exit 0
