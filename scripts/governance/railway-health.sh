#!/usr/bin/env bash
# railway-health.sh — CRMSoft Railway CRM_V1 Health Monitor
# Checks connectivity + table counts for all 7 PostgreSQL DBs.
# Usage: bash scripts/governance/railway-health.sh [--quiet]
#
# Requires: psql CLI + DATABASE_URL vars in Application/backend/.env
# Note: Runs against LIVE Railway DBs — requires network access.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$REPO_ROOT/Application/backend/.env"
QUIET="${1:-}"
PASS=0
FAIL=0
WARN=0
TOTAL=0

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Railway CRM_V1 Health Monitor                           ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo "  Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

# Guard: .env must exist
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env not found: $ENV_FILE"
  echo "   Copy .env.example and fill in Railway DATABASE_URLs"
  exit 1
fi

# Guard: psql must be installed
if ! command -v psql > /dev/null 2>&1; then
  echo "❌ psql not installed — install PostgreSQL client tools"
  echo "   macOS: brew install libpq && brew link --force libpq"
  exit 1
fi

# Expected table counts per DB (from CRM_V1 Fresh Push — Sprint G)
# Update these after schema changes
EXPECTED_identitydb=43
EXPECTED_platformdb=64
EXPECTED_workingdb=229
EXPECTED_marketplacedb=13
EXPECTED_platformconsoledb=29
EXPECTED_globalreferencedb=12
EXPECTED_demodb=228

# Map env var names → DB label
DB_VARS="IDENTITY_DATABASE_URL PLATFORM_DATABASE_URL WORKING_DATABASE_URL MARKETPLACE_DATABASE_URL PLATFORM_CONSOLE_DATABASE_URL GLOBAL_REFERENCE_DATABASE_URL DEMO_DATABASE_URL"

check_db() {
  local var_name="$1"
  TOTAL=$((TOTAL+1))

  # Read URL from .env (strip quotes, handle = in value)
  local raw_url
  raw_url=$(grep "^${var_name}=" "$ENV_FILE" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")

  if [ -z "$raw_url" ]; then
    echo "  ⚠️  $var_name not set in .env — skipping"
    WARN=$((WARN+1))
    return
  fi

  # Extract DB name from URL (last path segment)
  local db_name
  db_name=$(echo "$raw_url" | sed 's/.*\///' | sed 's/?.*$//' | tr '[:upper:]' '[:lower:]')

  echo "─── $var_name ─────────────────────────────────────"
  echo "    DB: $db_name"

  # Test connectivity (timeout 15s)
  local table_count
  table_count=$(timeout 15 psql "$raw_url" -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" \
    2>/dev/null | tr -d ' ')

  if [ -z "$table_count" ] || ! echo "$table_count" | grep -qE "^[0-9]+$"; then
    echo "    ❌ Connection FAILED (timeout or auth error)"
    FAIL=$((FAIL+1))
    return
  fi

  # Get expected count for this DB (lookup by normalized db_name)
  local expected_var="EXPECTED_${db_name}"
  local expected
  expected=$(eval echo "\${${expected_var}:-0}")

  local status_icon="✅"
  local count_note=""

  if [ "$expected" -gt 0 ] && [ "$table_count" -ne "$expected" ]; then
    local drift=$((table_count - expected))
    if [ $drift -lt 0 ]; then
      status_icon="⚠️ "
      count_note=" ⚠️ DRIFT: expected $expected, got $table_count ($(( drift * -1 )) tables missing)"
      WARN=$((WARN+1))
    else
      count_note=" (expected $expected, +$drift new tables)"
      PASS=$((PASS+1))
    fi
  else
    PASS=$((PASS+1))
  fi

  echo "    $status_icon Connected — $table_count tables$count_note"

  # Extra: row count on key tables (if not quiet)
  if [ "$QUIET" != "--quiet" ] && [ "$table_count" -gt 0 ]; then
    local schema_version
    schema_version=$(psql "$raw_url" -t -c \
      "SELECT MAX(\"applied_steps_count\") FROM \"_prisma_migrations\" LIMIT 1;" \
      2>/dev/null | tr -d ' ' || echo "n/a")
    [ -n "$schema_version" ] && [ "$schema_version" != "n/a" ] && \
      echo "    📋 Migrations applied: $schema_version"
  fi
}

# Check all 7 DBs
for var in $DB_VARS; do
  check_db "$var"
  echo ""
done

# ─── Summary ─────────────────────────────────────────────────────────────────
echo "══════════════════════════════════════════════════════════"
echo "  DBs checked: $TOTAL"
echo "  Connected:   $PASS"
echo "  Warnings:    $WARN  (drift or not configured)"
echo "  Failed:      $FAIL"
echo "══════════════════════════════════════════════════════════"

if [ $FAIL -gt 0 ]; then
  echo ""
  echo "❌ $FAIL DB(s) unreachable — check Railway project CRM_V1 and .env URLs"
  exit 1
fi

if [ $WARN -gt 0 ]; then
  echo ""
  echo "⚠️  $WARN warning(s) — review table count drift or missing env vars"
fi

echo ""
echo "✅ Railway health check passed ($PASS/$TOTAL DBs connected)"
exit 0
