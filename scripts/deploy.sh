#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════
# CRM-SOFT Deployment Script
# Usage: ./scripts/deploy.sh <version> [environment]
# Example: ./scripts/deploy.sh 1.2.0 production
# ═══════════════════════════════════════════════════════

set -euo pipefail

VERSION="${1:?Usage: deploy.sh <version> [environment]}"
ENV="${2:-production}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/${TIMESTAMP}_v${VERSION}"
GIT_TAG="v${VERSION}"

echo "═══════════════════════════════════════════════"
echo "  CRM-SOFT Deploy — v${VERSION} → ${ENV}"
echo "═══════════════════════════════════════════════"

# ── Pre-flight checks ──
echo ""
echo "▸ Pre-flight checks..."

if ! git diff-index --quiet HEAD -- 2>/dev/null; then
  echo "  ✗ Uncommitted changes detected. Commit or stash first."
  exit 1
fi
echo "  ✓ Working tree clean"

if git rev-parse "$GIT_TAG" >/dev/null 2>&1; then
  echo "  ⚠ Tag ${GIT_TAG} already exists (re-deploy)"
else
  echo "  ✓ Tag ${GIT_TAG} is available"
fi

# ── Create backup ──
echo ""
echo "▸ Creating pre-deploy backup..."
mkdir -p "$BACKUP_DIR"

# Database backup (if pg_dump available)
if command -v pg_dump &>/dev/null && [ -n "${DATABASE_URL:-}" ]; then
  pg_dump "$DATABASE_URL" --format=custom --file="${BACKUP_DIR}/db_backup.dump" 2>/dev/null && \
    echo "  ✓ Database backup → ${BACKUP_DIR}/db_backup.dump" || \
    echo "  ⚠ Database backup skipped (pg_dump failed)"
else
  echo "  ⚠ Database backup skipped (pg_dump not available or DATABASE_URL not set)"
fi

# Schema snapshot
cp API/prisma/schema.prisma "${BACKUP_DIR}/schema.prisma.bak"
echo "  ✓ Schema snapshot saved"

# Git info
git log -1 --format="%H %s" > "${BACKUP_DIR}/git_info.txt"
echo "  ✓ Git info saved"

# Config snapshot
if [ -f ".env.${ENV}" ]; then
  cp ".env.${ENV}" "${BACKUP_DIR}/env.bak"
  echo "  ✓ Environment config saved"
fi

echo "  ✓ Backup complete → ${BACKUP_DIR}"

# ── Build ──
echo ""
echo "▸ Building applications..."

echo "  Building API..."
cd API && npm run build 2>&1 | tail -1 && cd ..
echo "  ✓ API built"

echo "  Building CRM Admin..."
cd UI/crm-admin && npm run build 2>&1 | tail -1 && cd ../..
echo "  ✓ CRM Admin built"

echo "  Building Vendor Panel..."
cd UI/vendor-panel && npm run build 2>&1 | tail -1 && cd ../..
echo "  ✓ Vendor Panel built"

# ── Database migrations ──
echo ""
echo "▸ Running database migrations..."
cd API && npx prisma migrate deploy 2>&1 | tail -3 && cd ..
echo "  ✓ Migrations applied"

# ── Git tag ──
echo ""
echo "▸ Creating git tag..."
if ! git rev-parse "$GIT_TAG" >/dev/null 2>&1; then
  git tag -a "$GIT_TAG" -m "Release ${VERSION} — deployed to ${ENV} at ${TIMESTAMP}"
  echo "  ✓ Tagged: ${GIT_TAG}"
else
  echo "  ⚠ Tag ${GIT_TAG} already exists, skipping"
fi

# ── Summary ──
echo ""
echo "═══════════════════════════════════════════════"
echo "  ✓ Deploy v${VERSION} complete!"
echo "  Backup: ${BACKUP_DIR}"
echo "  Tag: ${GIT_TAG}"
echo "  Env: ${ENV}"
echo "═══════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Push tag:    git push origin ${GIT_TAG}"
echo "  2. Restart services"
echo "  3. Verify health: curl http://localhost:3000/api/v1/health"
