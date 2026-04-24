#!/usr/bin/env bash
# demo-sync-check.sh — Validate DemoDB schema stays in sync with WorkingDB
# DemoDB uses Approach B (copy from WorkingDB, not symlink).
# Usage: bash scripts/governance/demo-sync-check.sh [--fix] [--ci]
#
# --fix: auto-run sync-demo-schema.sh when drift detected, then re-verify
# --ci:  exit 1 on any drift (for CI pipeline)

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WORKING_DIR="$REPO_ROOT/Application/backend/prisma/working/v1"
DEMO_DIR="$REPO_ROOT/Application/backend/prisma/demo/v1"
ERRORS=0
WARNINGS=0

# Parse flags
FIX_MODE=false
CI_MODE=false
for arg in "$@"; do
  case "$arg" in
    --fix) FIX_MODE=true ;;
    --ci)  CI_MODE=true  ;;
  esac
done

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  CRMSoft DemoDB ↔ WorkingDB Schema Sync Check           ║"
echo "╚══════════════════════════════════════════════════════════╝"
[ "$FIX_MODE" = "true" ] && echo "  Mode: AUTO-FIX"
[ "$CI_MODE"  = "true" ] && echo "  Mode: CI (strict)"

# Guard: directories must exist
if [ ! -d "$WORKING_DIR" ]; then
  echo "❌ Working schema dir not found: $WORKING_DIR"
  exit 1
fi
if [ ! -d "$DEMO_DIR" ]; then
  echo "❌ Demo schema dir not found: $DEMO_DIR"
  exit 1
fi

echo "  Working: $WORKING_DIR"
echo "  Demo:    $DEMO_DIR"
echo ""

# ─── Check every file in working exists in demo ───────────────────────────────
echo "Checking Working → Demo coverage..."
for wfile in "$WORKING_DIR"/*.prisma; do
  [ -f "$wfile" ] || continue
  fname=$(basename "$wfile")

  # _base.prisma: different generator/datasource — compare model/enum sections only
  if [ "$fname" = "_base.prisma" ]; then
    if [ ! -f "$DEMO_DIR/$fname" ]; then
      echo "  ❌ Missing in demo: $fname"
      ERRORS=$((ERRORS+1))
    else
      # Compare enum counts as a proxy for consistency
      W_ENUMS=$(grep -c "^enum " "$wfile" 2>/dev/null || echo 0)
      D_ENUMS=$(grep -c "^enum " "$DEMO_DIR/$fname" 2>/dev/null || echo 0)
      if [ "$W_ENUMS" != "$D_ENUMS" ]; then
        echo "  ❌ Enum count mismatch in _base.prisma: working=$W_ENUMS demo=$D_ENUMS"
        # Show which enums differ
        DIFF_OUT=$(diff <(grep "^enum " "$wfile" | sort) <(grep "^enum " "$DEMO_DIR/$fname" | sort) 2>/dev/null || true)
        if [ -n "$DIFF_OUT" ]; then
          echo "$DIFF_OUT" | head -20 | sed 's/^/    /'
        fi
        ERRORS=$((ERRORS+1))
      else
        echo "  ✅ In sync: $fname ($W_ENUMS enums match)"
      fi
    fi
    continue
  fi

  dfile="$DEMO_DIR/$fname"
  if [ ! -f "$dfile" ]; then
    echo "  ❌ Missing in demo: $fname"
    ERRORS=$((ERRORS+1))
    continue
  fi

  if ! diff -q "$wfile" "$dfile" > /dev/null 2>&1; then
    echo "  ❌ Schema drift: $fname"
    # Show exact diff (first 20 lines)
    diff --unified=2 "$wfile" "$dfile" 2>/dev/null | head -20 | sed 's/^/    /'
    ERRORS=$((ERRORS+1))
  else
    echo "  ✅ In sync: $fname"
  fi
done

# ─── Check for extra files in demo not in working ────────────────────────────
echo ""
echo "Checking Demo for extra files (not in Working)..."
for dfile in "$DEMO_DIR"/*.prisma; do
  [ -f "$dfile" ] || continue
  fname=$(basename "$dfile")
  [ "$fname" = "_base.prisma" ] && continue

  if [ ! -f "$WORKING_DIR/$fname" ]; then
    echo "  ⚠️  Extra in demo (not in working): $fname"
    WARNINGS=$((WARNINGS+1))
  fi
done

# ─── Auto-fix mode ────────────────────────────────────────────────────────────
if [ "$FIX_MODE" = "true" ] && [ $ERRORS -gt 0 ]; then
  SYNC_SCRIPT="$REPO_ROOT/Application/backend/scripts/sync-demo-schema.sh"
  echo ""
  echo "━━━ Auto-fix: running sync-demo-schema.sh ━━━"
  if [ -f "$SYNC_SCRIPT" ]; then
    bash "$SYNC_SCRIPT" && echo "  ✅ Sync script completed" || echo "  ❌ Sync script failed"
    # Re-verify
    echo ""
    echo "━━━ Re-verifying after fix ━━━"
    ERRORS=0
    WARNINGS=0
    for wfile in "$WORKING_DIR"/*.prisma; do
      [ -f "$wfile" ] || continue
      fname=$(basename "$wfile")
      [ "$fname" = "_base.prisma" ] && continue
      dfile="$DEMO_DIR/$fname"
      if [ ! -f "$dfile" ]; then
        echo "  ❌ Still missing: $fname"; ERRORS=$((ERRORS+1))
      elif ! diff -q "$wfile" "$dfile" > /dev/null 2>&1; then
        echo "  ❌ Still drifted: $fname"; ERRORS=$((ERRORS+1))
      else
        echo "  ✅ Fixed: $fname"
      fi
    done
  else
    # Fallback: copy files directly
    echo "  sync-demo-schema.sh not found — copying directly..."
    for wfile in "$WORKING_DIR"/*.prisma; do
      [ -f "$wfile" ] || continue
      fname=$(basename "$wfile")
      [ "$fname" = "_base.prisma" ] && continue
      cp "$wfile" "$DEMO_DIR/$fname"
      echo "  📋 Copied: $fname"
    done
    ERRORS=0
    echo "  ✅ Direct copy complete"
  fi
fi

# ─── Summary ─────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════"
echo "  Drift errors:  $ERRORS"
echo "  Warnings:      $WARNINGS"
echo "══════════════════════════════════════"

if [ $ERRORS -gt 0 ]; then
  echo "  ❌ DemoDB out of sync ($ERRORS drift(s))"
  if [ "$FIX_MODE" != "true" ]; then
    echo "  Fix: pnpm check:demo-sync:fix"
    echo "   Or: bash Application/backend/scripts/sync-demo-schema.sh"
  fi
  exit 1
fi

if [ $WARNINGS -gt 0 ]; then
  echo "  ⚠️  Extra files in demo — review if intentional"
fi

echo "  ✅ DemoDB schema in sync with WorkingDB"
exit 0
