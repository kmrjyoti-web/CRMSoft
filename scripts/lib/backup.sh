#!/usr/bin/env bash
# backup.sh — Create timestamped project backup in .claude/backups/
# Usage: bash scripts/lib/backup.sh [action-label]
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ACTION="${1:-manual}"
TS=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="$REPO_ROOT/.claude/backups"
BACKUP_FILE="$BACKUP_DIR/${TS}-${ACTION}.tar.gz"

mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup: ${TS}-${ACTION}.tar.gz ..."
tar -czf "$BACKUP_FILE" \
  --exclude="$REPO_ROOT/node_modules" \
  --exclude="$REPO_ROOT/Application/backend/node_modules" \
  --exclude="$REPO_ROOT/Customer/frontend/crm-admin/node_modules" \
  --exclude="$REPO_ROOT/Vendor/frontend/vendor-panel/node_modules" \
  --exclude="$REPO_ROOT/.next" \
  --exclude="*/dist" \
  --exclude="*/.prisma" \
  --exclude="$REPO_ROOT/.claude/backups" \
  -C "$REPO_ROOT/.." \
  "$(basename "$REPO_ROOT")" 2>/dev/null || true

SIZE=$(du -sh "$BACKUP_FILE" 2>/dev/null | cut -f1 || echo "unknown")
echo "✅ Backup complete: $BACKUP_FILE ($SIZE)"
echo "$BACKUP_FILE"
