#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# backup-to-r2.sh — Backup all CRMSoft database schemas to Cloudflare R2
#
# Usage:
#   bash scripts/backup-to-r2.sh
#   bash scripts/backup-to-r2.sh --env staging
#
# Required env vars (set in .env or CI secrets):
#   POSTGRES_URL        — base postgres connection (without database name)
#   CLOUDFLARE_ACCOUNT_ID
#   R2_ACCESS_KEY_ID
#   R2_SECRET_ACCESS_KEY
#   R2_BUCKET_BACKUPS   — defaults to crmsoft-backups-prod
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ─── Configuration ────────────────────────────────────────────────────────────
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
ENV="${1:-prod}"
if [ "$1" = "--env" ] && [ -n "${2:-}" ]; then ENV="$2"; fi

BUCKET="${R2_BUCKET_BACKUPS:-crmsoft-backups-${ENV}}"
BACKUP_DIR="/tmp/crmsoft-backups-${TIMESTAMP}"
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"

SCHEMAS=(
  "identity_db"
  "platform_db"
  "working_db"
  "marketplace_db"
)

mkdir -p "$BACKUP_DIR"

# ─── Color output ─────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[BACKUP]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC}  $*"; }
err()  { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ─── Dependency checks ────────────────────────────────────────────────────────
command -v pg_dump  >/dev/null 2>&1 || err "pg_dump not found. Install PostgreSQL client tools."
command -v wrangler >/dev/null 2>&1 || err "wrangler not found. Run: npm install -g wrangler"
command -v sha256sum >/dev/null 2>&1 || command -v shasum >/dev/null 2>&1 || err "sha256sum / shasum not found"

# Use shasum on macOS, sha256sum on Linux
SHA_CMD="sha256sum"
if ! command -v sha256sum >/dev/null 2>&1; then SHA_CMD="shasum -a 256"; fi

log "Starting CRMSoft backup — ${TIMESTAMP}"
log "Target bucket: ${BUCKET}"
log "Schemas: ${SCHEMAS[*]}"
echo ""

FAILED=()
UPLOADED=()

# ─── Backup each schema ───────────────────────────────────────────────────────
for DB in "${SCHEMAS[@]}"; do
  log "Backing up: ${DB}"
  DUMP_FILE="${BACKUP_DIR}/${DB}_${TIMESTAMP}.dump"
  GZIP_FILE="${DUMP_FILE}.gz"
  R2_KEY="db-backups/${TIMESTAMP}/${DB}_${TIMESTAMP}.dump.gz"

  # pg_dump in custom format (faster restore, selective restore possible)
  if pg_dump \
    --host="$POSTGRES_HOST" \
    --port="$POSTGRES_PORT" \
    --username="$POSTGRES_USER" \
    --format=custom \
    --no-password \
    --verbose \
    "$DB" > "$DUMP_FILE" 2>/dev/null; then

    # Compress
    gzip -9 "$DUMP_FILE"
    FILESIZE=$(du -sh "$GZIP_FILE" | cut -f1)

    # SHA-256 checksum
    CHECKSUM=$($SHA_CMD "$GZIP_FILE" | awk '{print $1}')
    echo "$CHECKSUM  ${DB}_${TIMESTAMP}.dump.gz" > "${GZIP_FILE}.sha256"

    log "  Compressed: ${FILESIZE} | SHA-256: ${CHECKSUM:0:16}..."

    # Upload to R2
    if wrangler r2 object put "${BUCKET}/${R2_KEY}" \
      --file="$GZIP_FILE" \
      --content-type="application/gzip" 2>/dev/null; then

      # Upload checksum file
      wrangler r2 object put "${BUCKET}/${R2_KEY}.sha256" \
        --file="${GZIP_FILE}.sha256" \
        --content-type="text/plain" 2>/dev/null

      log "  ✅ Uploaded → r2://${BUCKET}/${R2_KEY}"
      UPLOADED+=("$DB")
    else
      warn "  ❌ Upload failed for ${DB}"
      FAILED+=("$DB")
    fi
  else
    warn "  ❌ pg_dump failed for ${DB} (database may not exist or connection refused)"
    FAILED+=("$DB")
  fi

  echo ""
done

# ─── Write manifest ───────────────────────────────────────────────────────────
MANIFEST_FILE="${BACKUP_DIR}/manifest_${TIMESTAMP}.json"
cat > "$MANIFEST_FILE" << EOF
{
  "timestamp": "${TIMESTAMP}",
  "environment": "${ENV}",
  "bucket": "${BUCKET}",
  "schemas": $(printf '%s\n' "${SCHEMAS[@]}" | jq -R . | jq -s .),
  "uploaded": $(printf '%s\n' "${UPLOADED[@]:-}" | jq -R . | jq -s .),
  "failed": $(printf '%s\n' "${FAILED[@]:-}" | jq -R . | jq -s .),
  "machine": "$(hostname)",
  "pgVersion": "$(pg_dump --version 2>/dev/null | head -1 || echo unknown)"
}
EOF

wrangler r2 object put "${BUCKET}/db-backups/${TIMESTAMP}/manifest.json" \
  --file="$MANIFEST_FILE" \
  --content-type="application/json" 2>/dev/null || warn "Manifest upload failed"

# ─── Cleanup temp files ───────────────────────────────────────────────────────
rm -rf "$BACKUP_DIR"

# ─── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║  BACKUP SUMMARY                                       ║"
echo "╠═══════════════════════════════════════════════════════╣"
printf "║  Timestamp : %-40s ║\n" "$TIMESTAMP"
printf "║  Bucket    : %-40s ║\n" "$BUCKET"
printf "║  Uploaded  : %-40s ║\n" "${#UPLOADED[@]} / ${#SCHEMAS[@]} schemas"
echo "╚═══════════════════════════════════════════════════════╝"

if [ ${#FAILED[@]} -gt 0 ]; then
  echo ""
  warn "Failed schemas: ${FAILED[*]}"
  echo "Check database connectivity and try again."
  exit 1
fi

log "All schemas backed up successfully ✅"
log "Find at: r2://${BUCKET}/db-backups/${TIMESTAMP}/"
