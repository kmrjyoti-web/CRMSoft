#!/bin/bash
# deploy-partner.sh — Deploy a partner's CRMSoft instance
# Usage: ./deploy-partner.sh <partner-code> [git-tag]
# Example: ./deploy-partner.sh abc-crm v1.2.0

set -euo pipefail

PARTNER_CODE="${1:?Usage: $0 <partner-code> [git-tag]}"
GIT_TAG="${2:-}"
REPO_ROOT="${CRMSOFT_REPO_PATH:-/Users/kmrjyoti/GitProject/CRM/CrmProject}"
BRANCH="partner/${PARTNER_CODE}/main"
API_SERVICE="crmsoft-api-${PARTNER_CODE}"
CRM_SERVICE="crmsoft-crm-${PARTNER_CODE}"

echo "╔══════════════════════════════════════════════════════╗"
echo "║  CRMSoft Partner Deploy: ${PARTNER_CODE}"
echo "╚══════════════════════════════════════════════════════╝"
echo "Branch : ${BRANCH}"
echo "Tag    : ${GIT_TAG:-latest}"
echo ""

cd "$REPO_ROOT"

# ─── 1. Pull latest on partner branch ───────────────────────
echo "▸ Fetching branch ${BRANCH}..."
git fetch origin "${BRANCH}"
git checkout "${BRANCH}"
git pull origin "${BRANCH}"

if [ -n "$GIT_TAG" ]; then
  echo "▸ Checking out tag ${GIT_TAG}..."
  git checkout "$GIT_TAG"
fi

# ─── 2. Install dependencies ─────────────────────────────────
echo "▸ Installing dependencies..."
npm ci --prefix Application/backend
npm ci --prefix Customer/frontend/crm-admin
npm ci --prefix Vendor/frontend/vendor-panel

# ─── 3. Build ────────────────────────────────────────────────
echo "▸ Building backend..."
npm run build --prefix Application/backend

echo "▸ Building CRM Admin frontend..."
npm run build --prefix Customer/frontend/crm-admin

# ─── 4. Run Prisma migrations ────────────────────────────────
echo "▸ Running database migrations..."
npx prisma migrate deploy --schema Application/backend/prisma/platform.prisma
npx prisma migrate deploy --schema Application/backend/prisma/working.prisma

# ─── 5. Restart services via PM2 ────────────────────────────
echo "▸ Restarting partner services..."
pm2 restart "${API_SERVICE}" 2>/dev/null || pm2 start "Application/backend/dist/main.js" --name "${API_SERVICE}"
pm2 restart "${CRM_SERVICE}" 2>/dev/null  || pm2 start "npm" --name "${CRM_SERVICE}" -- start --prefix Customer/frontend/crm-admin

# ─── 6. Health check with auto-rollback ─────────────────────
echo "▸ Running health check (5s delay)..."
sleep 5

HEALTH_URL="${PARTNER_HEALTH_URL:-http://localhost:3001/health}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${HEALTH_URL}" || echo "000")

if [ "$HTTP_CODE" -eq 200 ]; then
  echo ""
  echo "✅ Deploy successful — health check passed (HTTP ${HTTP_CODE})"
  echo "   Partner: ${PARTNER_CODE}"
  echo "   Branch : ${BRANCH}"
  echo "   Tag    : ${GIT_TAG:-latest}"
else
  echo ""
  echo "❌ Deploy failed — health check returned HTTP ${HTTP_CODE}"
  echo "⚠️  Auto-rolling back to previous commit..."

  git checkout HEAD~1
  npm run build --prefix Application/backend
  pm2 restart "${API_SERVICE}"
  pm2 restart "${CRM_SERVICE}"

  echo "⚠️  Rolled back. Investigate logs: pm2 logs ${API_SERVICE}"
  exit 1
fi
