#!/bin/bash
# rollback-partner.sh — Rollback a partner to a specific git tag
# Usage: ./rollback-partner.sh <partner-code> <target-tag>
# Example: ./rollback-partner.sh abc-crm v1.1.0

set -euo pipefail

PARTNER_CODE="${1:?Usage: $0 <partner-code> <target-tag>}"
TARGET_TAG="${2:?Usage: $0 <partner-code> <target-tag>}"
REPO_ROOT="${CRMSOFT_REPO_PATH:-/Users/kmrjyoti/GitProject/CRM/CrmProject}"
BRANCH="partner/${PARTNER_CODE}/main"
API_SERVICE="crmsoft-api-${PARTNER_CODE}"
CRM_SERVICE="crmsoft-crm-${PARTNER_CODE}"

echo "╔══════════════════════════════════════════════════════╗"
echo "║  CRMSoft Partner Rollback: ${PARTNER_CODE}"
echo "╚══════════════════════════════════════════════════════╝"
echo "Branch : ${BRANCH}"
echo "Target : ${TARGET_TAG}"
echo ""

cd "$REPO_ROOT"

# ─── Confirm before rollback ─────────────────────────────────
read -rp "⚠️  Roll back ${PARTNER_CODE} to ${TARGET_TAG}? This will restart services. [y/N] " confirm
[[ "$confirm" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }

# ─── Checkout target tag ─────────────────────────────────────
echo "▸ Checking out ${TARGET_TAG}..."
git fetch origin "${BRANCH}"
git checkout "${BRANCH}"
git checkout "${TARGET_TAG}"

# ─── Rebuild ─────────────────────────────────────────────────
echo "▸ Rebuilding at ${TARGET_TAG}..."
npm ci --prefix Application/backend
npm run build --prefix Application/backend

# ─── Restart ─────────────────────────────────────────────────
echo "▸ Restarting services..."
pm2 restart "${API_SERVICE}"
pm2 restart "${CRM_SERVICE}"

# ─── Health check ────────────────────────────────────────────
sleep 5
HEALTH_URL="${PARTNER_HEALTH_URL:-http://localhost:3001/health}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${HEALTH_URL}" || echo "000")

if [ "$HTTP_CODE" -eq 200 ]; then
  echo ""
  echo "✅ Rollback successful — ${PARTNER_CODE} running at ${TARGET_TAG}"
else
  echo ""
  echo "❌ Rollback health check failed (HTTP ${HTTP_CODE})"
  echo "   Manual intervention required. Check: pm2 logs ${API_SERVICE}"
  exit 1
fi
