#!/usr/bin/env bash
# prisma-safety.sh — CRMSoft Prisma Migration Safety Net
# Captures table count BEFORE a db push, applies it, and shows AFTER count.
# Warns loudly if tables were dropped (unexpected for schema modifications).
#
# Usage:
#   bash scripts/governance/prisma-safety.sh <schema-path> <db-url-env-var>
#
# Examples:
#   bash scripts/governance/prisma-safety.sh prisma/platform/v1/ PLATFORM_DATABASE_URL
#   bash scripts/governance/prisma-safety.sh prisma/identity/v1/ IDENTITY_DATABASE_URL
#
# IMPORTANT: This script APPLIES changes (Prisma has no true dry-run for db push).
# For a diff-only check: npx prisma migrate diff
# Always backup first: pnpm backup

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKEND_DIR="$REPO_ROOT/Application/backend"
ENV_FILE="$BACKEND_DIR/.env"

SCHEMA_PATH="${1:-}"
DB_URL_VAR="${2:-}"

# Guard: require both args
if [ -z "$SCHEMA_PATH" ] || [ -z "$DB_URL_VAR" ]; then
  echo ""
  echo "Usage: bash scripts/governance/prisma-safety.sh <schema-path> <db-url-env-var>"
  echo ""
  echo "Examples:"
  echo "  pnpm db:push:platform   → prisma/platform/v1/ PLATFORM_DATABASE_URL"
  echo "  pnpm db:push:identity   → prisma/identity/v1/ IDENTITY_DATABASE_URL"
  echo "  pnpm db:push:console    → prisma/platform-console/v1/ PLATFORM_CONSOLE_DATABASE_URL"
  echo ""
  echo "PlatformDB/PlatformConsoleDB: use db push ONLY (never migrate deploy)"
  exit 1
fi

# Guard: .env must exist
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env not found: $ENV_FILE"
  exit 1
fi

# Guard: psql must be available
if ! command -v psql > /dev/null 2>&1; then
  echo "❌ psql not installed — install PostgreSQL client tools"
  echo "   macOS: brew install libpq && brew link --force libpq"
  exit 1
fi

# Read DB URL from .env
DB_URL=$(grep "^${DB_URL_VAR}=" "$ENV_FILE" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")

if [ -z "$DB_URL" ]; then
  echo "❌ $DB_URL_VAR not found in .env"
  exit 1
fi

# Resolve full schema path
FULL_SCHEMA="$BACKEND_DIR/$SCHEMA_PATH"
if [ ! -d "$FULL_SCHEMA" ] && [ ! -f "$FULL_SCHEMA" ]; then
  echo "❌ Schema path not found: $FULL_SCHEMA"
  exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Prisma Migration Safety Net                             ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo "  Schema: $SCHEMA_PATH"
echo "  DB var: $DB_URL_VAR"
echo ""

# Step 1: Backup recommendation
echo "⚠️  This will apply schema changes to the live database."
echo "   Recommend running: pnpm backup  (before this step)"
echo ""

# Step 2: Count tables BEFORE
BEFORE=$(timeout 10 psql "$DB_URL" -t -c \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" \
  2>/dev/null | tr -d ' ')

if [ -z "$BEFORE" ] || ! echo "$BEFORE" | grep -qE "^[0-9]+$"; then
  echo "❌ Cannot connect to database ($DB_URL_VAR)"
  echo "   Check Railway project status and .env credentials"
  exit 1
fi

echo "━━━ Before ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Tables: $BEFORE"

# Step 3: Run db push
echo ""
echo "━━━ Applying schema ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd "$BACKEND_DIR"
npx prisma db push \
  --schema="$FULL_SCHEMA" \
  --accept-data-loss \
  2>&1 | tail -15

# Step 4: Count tables AFTER
AFTER=$(timeout 10 psql "$DB_URL" -t -c \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" \
  2>/dev/null | tr -d ' ')

echo ""
echo "━━━ After ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Tables: $AFTER"

# Step 5: Compare + warn on drops
if echo "$BEFORE" | grep -qE "^[0-9]+$" && echo "$AFTER" | grep -qE "^[0-9]+$"; then
  DIFF=$((AFTER - BEFORE))
  echo ""
  if [ $DIFF -lt 0 ]; then
    DROPPED=$(( DIFF * -1 ))
    echo "⚠️  WARNING: $DROPPED table(s) were DROPPED!"
    echo "   This is unexpected for a normal schema migration."
    echo "   If this was unintended, restore from backup immediately:"
    echo "     pnpm backup:list"
    echo "     # then restore from .claude/backups/"
  elif [ $DIFF -gt 0 ]; then
    echo "✅ $DIFF new table(s) added (expected for new models)"
  else
    echo "✅ Table count unchanged (schema modification only — no new/dropped tables)"
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Before: $BEFORE tables → After: $AFTER tables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
exit 0
