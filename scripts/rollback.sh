#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════
# CRM-SOFT Rollback Script
# Usage: ./scripts/rollback.sh <backup_dir> [reason]
# Example: ./scripts/rollback.sh ./backups/20260310_143000_v1.2.0 "Critical bug"
# ═══════════════════════════════════════════════════════

set -euo pipefail

BACKUP_DIR="${1:?Usage: rollback.sh <backup_dir> [reason]}"
REASON="${2:-Manual rollback}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

if [ ! -d "$BACKUP_DIR" ]; then
  echo "✗ Backup directory not found: ${BACKUP_DIR}"
  exit 1
fi

echo "═══════════════════════════════════════════════"
echo "  CRM-SOFT Rollback"
echo "  From: ${BACKUP_DIR}"
echo "  Reason: ${REASON}"
echo "═══════════════════════════════════════════════"

echo ""
read -p "Are you sure you want to rollback? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Rollback cancelled."
  exit 0
fi

echo ""
echo "▸ Restoring schema..."
if [ -f "${BACKUP_DIR}/schema.prisma.bak" ]; then
  cp "${BACKUP_DIR}/schema.prisma.bak" API/prisma/schema.prisma
  echo "  ✓ Schema restored"
else
  echo "  ⚠ No schema backup found, skipping"
fi

echo ""
echo "▸ Restoring database..."
if [ -f "${BACKUP_DIR}/db_backup.dump" ] && command -v pg_restore &>/dev/null && [ -n "${DATABASE_URL:-}" ]; then
  echo "  ⚠ Database restore requires manual review."
  echo "  Run: pg_restore --clean --dbname=\$DATABASE_URL ${BACKUP_DIR}/db_backup.dump"
  echo "  Skipping automatic restore for safety."
else
  echo "  ⚠ No database backup or pg_restore not available, skipping"
fi

if [ -f "${BACKUP_DIR}/env.bak" ]; then
  echo ""
  echo "▸ Environment config available at: ${BACKUP_DIR}/env.bak"
  echo "  Review and restore manually if needed."
fi

echo ""
echo "▸ Rebuilding applications..."
cd API && npm run build 2>&1 | tail -1 && cd ..
echo "  ✓ API rebuilt"

cd UI/crm-admin && npm run build 2>&1 | tail -1 && cd ../..
echo "  ✓ CRM Admin rebuilt"

cd UI/vendor-panel && npm run build 2>&1 | tail -1 && cd ../..
echo "  ✓ Vendor Panel rebuilt"

echo ""
echo "▸ Logging rollback..."
ROLLBACK_LOG="./backups/rollback_log.txt"
mkdir -p ./backups
echo "[${TIMESTAMP}] ROLLBACK from ${BACKUP_DIR} — Reason: ${REASON}" >> "$ROLLBACK_LOG"
echo "  ✓ Logged to ${ROLLBACK_LOG}"

echo ""
echo "═══════════════════════════════════════════════"
echo "  ✓ Rollback complete!"
echo "  Restored from: ${BACKUP_DIR}"
echo "  Reason: ${REASON}"
echo "═══════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Restart services"
echo "  2. Verify health: curl http://localhost:3000/api/v1/health"
echo "  3. Review database if restore was skipped"
