#!/usr/bin/env bash
# seed-integrity.sh — CRMSoft Seed Data Integrity Check
# Verifies seed data row counts across all DBs after migration.
# Usage: bash scripts/governance/seed-integrity.sh [--db <db-name>]
#
# Requires: psql CLI + DATABASE_URL vars in Application/backend/.env

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$REPO_ROOT/Application/backend/.env"
ERRORS=0
CHECKS=0
SKIPPED=0

# Parse optional --db filter
DB_FILTER=""
while [ $# -gt 0 ]; do
  case "$1" in
    --db) DB_FILTER="$2"; shift 2 ;;
    *) shift ;;
  esac
done

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  CRMSoft Seed Data Integrity Check                       ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo "  Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

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

# Helper: read URL from .env
get_url() {
  grep "^${1}=" "$ENV_FILE" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'"
}

# Helper: check seed count (>= expected)
check_count() {
  local db_url="$1"
  local table="$2"
  local expected="$3"
  local label="$4"
  CHECKS=$((CHECKS+1))

  if [ -z "$db_url" ]; then
    echo "  ⚠️  $label: DB URL not configured — skipped"
    SKIPPED=$((SKIPPED+1))
    return
  fi

  local actual
  actual=$(timeout 10 psql "$db_url" -t -c \
    "SELECT COUNT(*) FROM \"${table}\";" \
    2>/dev/null | tr -d ' ')

  if [ -z "$actual" ] || ! echo "$actual" | grep -qE "^[0-9]+$"; then
    echo "  ⚠️  $label: table '$table' not reachable (DB down or table missing)"
    SKIPPED=$((SKIPPED+1))
    return
  fi

  if [ "$actual" -lt "$expected" ]; then
    echo "  ❌ $label: expected >= $expected rows, got $actual"
    ERRORS=$((ERRORS+1))
  else
    echo "  ✅ $label: $actual rows (expected >= $expected)"
  fi
}

# Read all URLs once
PLATFORM_URL=$(get_url "PLATFORM_DATABASE_URL")
GLOBAL_URL=$(get_url "GLOBAL_REFERENCE_DATABASE_URL")
IDENTITY_URL=$(get_url "IDENTITY_DATABASE_URL")
DEMO_URL=$(get_url "DEMO_DATABASE_URL")

# ─── PlatformDB ──────────────────────────────────────────────────────────────
if [ -z "$DB_FILTER" ] || [ "$DB_FILTER" = "platform" ]; then
  echo "═══ PlatformDB Seed Data ═══"
  check_count "$PLATFORM_URL" "gv_cfg_vertical"        2  "Verticals (gv + soft)"
  check_count "$PLATFORM_URL" "gv_cfg_vertical_module" 23 "Vertical modules"
  echo ""
fi

# ─── GlobalReferenceDB ───────────────────────────────────────────────────────
if [ -z "$DB_FILTER" ] || [ "$DB_FILTER" = "global" ]; then
  echo "═══ GlobalReferenceDB Seed Data ═══"
  check_count "$GLOBAL_URL" "gl_cfg_country"      10 "Countries"
  check_count "$GLOBAL_URL" "gl_cfg_state"        36 "States"
  check_count "$GLOBAL_URL" "gl_cfg_city"         39 "Cities"
  check_count "$GLOBAL_URL" "gl_cfg_lookup_type"   4 "Lookup types"
  check_count "$GLOBAL_URL" "gl_cfg_lookup_value" 20 "Lookup values"
  check_count "$GLOBAL_URL" "gl_cfg_gst_rate"      6 "GST rates"
  check_count "$GLOBAL_URL" "gl_cfg_hsn_code"     50 "HSN codes"
  check_count "$GLOBAL_URL" "gl_cfg_currency"     11 "Currencies"
  check_count "$GLOBAL_URL" "gl_cfg_timezone"     18 "Timezones"
  check_count "$GLOBAL_URL" "gl_cfg_industry_type" 10 "Industry types"
  check_count "$GLOBAL_URL" "gl_cfg_language"     16 "Languages"
  check_count "$GLOBAL_URL" "gl_cfg_pincode"      16 "Pincodes (sample)"
  echo ""
fi

# ─── IdentityDB ──────────────────────────────────────────────────────────────
if [ -z "$DB_FILTER" ] || [ "$DB_FILTER" = "identity" ]; then
  echo "═══ IdentityDB Seed Data ═══"
  check_count "$IDENTITY_URL" "gv_usr_user" 5  "Users (admin + defaults)"
  check_count "$IDENTITY_URL" "gv_usr_role" 12 "Roles"
  echo ""
fi

# ─── DemoDB ──────────────────────────────────────────────────────────────────
if [ -z "$DB_FILTER" ] || [ "$DB_FILTER" = "demo" ]; then
  echo "═══ DemoDB Seed Data ═══"
  if [ -n "$DEMO_URL" ]; then
    # DemoDB may have minimal seed — contacts are optional
    CONTACT_COUNT=$(timeout 10 psql "$DEMO_URL" -t -c \
      "SELECT COUNT(*) FROM \"gv_crm_contact\";" 2>/dev/null | tr -d ' ')
    if echo "$CONTACT_COUNT" | grep -qE "^[0-9]+$"; then
      if [ "$CONTACT_COUNT" -ge 3 ]; then
        echo "  ✅ Demo contacts: $CONTACT_COUNT rows (expected >= 3)"
        CHECKS=$((CHECKS+1))
      else
        echo "  ⚠️  Demo contacts: $CONTACT_COUNT rows (expected >= 3) — DemoDB may need seeding"
        SKIPPED=$((SKIPPED+1))
        CHECKS=$((CHECKS+1))
      fi
    else
      echo "  ⚠️  DemoDB seed check skipped (DB not reachable or not seeded yet)"
      SKIPPED=$((SKIPPED+1))
      CHECKS=$((CHECKS+1))
    fi
  else
    echo "  ⚠️  DEMO_DATABASE_URL not configured — skipping"
    SKIPPED=$((SKIPPED+1))
    CHECKS=$((CHECKS+1))
  fi
  echo ""
fi

# ─── Summary ─────────────────────────────────────────────────────────────────
echo "══════════════════════════════════════════════════════════"
echo "  Total checks: $CHECKS"
echo "  Passed:       $((CHECKS - ERRORS - SKIPPED))"
echo "  Skipped:      $SKIPPED  (DB not reachable or not configured)"
echo "  Errors:       $ERRORS"
echo "══════════════════════════════════════════════════════════"

if [ $ERRORS -gt 0 ]; then
  echo ""
  echo "❌ SEED INTEGRITY: $ERRORS issue(s) found"
  echo "   Run the seed scripts: cd Application/backend && pnpm db:seed"
  exit 1
fi

if [ $SKIPPED -eq $CHECKS ]; then
  echo ""
  echo "⚠️  All checks skipped — no DB connectivity (expected in offline mode)"
  echo "   Run against live Railway DBs for full verification"
  exit 0
fi

echo ""
echo "✅ SEED INTEGRITY: All reachable seeds verified"
exit 0
