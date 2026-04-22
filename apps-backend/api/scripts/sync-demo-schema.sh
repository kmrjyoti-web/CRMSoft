#!/bin/bash
# scripts/sync-demo-schema.sh
# Sprint: DemoDB Wiring
#
# Keeps prisma/demo/v1/ in sync with prisma/working/v1/ after WorkingDB schema changes.
# Run this after any change to prisma/working/v1/ domain files or enums.
#
# Usage:
#   bash scripts/sync-demo-schema.sh          # sync domain files + enums
#   bash scripts/sync-demo-schema.sh --check  # dry-run: report diff only

set -euo pipefail

WORKING_DIR="prisma/working/v1"
DEMO_DIR="prisma/demo/v1"
CHECK_ONLY=false

for arg in "$@"; do
  [ "$arg" = "--check" ] && CHECK_ONLY=true
done

echo "╔══════════════════════════════════════╗"
echo "║  Demo Schema Sync                    ║"
echo "╚══════════════════════════════════════╝"

CHANGED=0

# ─── Sync domain files (all except _base.prisma) ─────────────────────────────
for src in "$WORKING_DIR"/*.prisma; do
  fname=$(basename "$src")
  [ "$fname" = "_base.prisma" ] && continue

  dst="$DEMO_DIR/$fname"

  if [ ! -f "$dst" ] || ! diff -q "$src" "$dst" > /dev/null 2>&1; then
    if $CHECK_ONLY; then
      echo "  CHANGED: $fname"
    else
      cp "$src" "$dst"
      echo "  Synced: $fname"
    fi
    CHANGED=$((CHANGED + 1))
  fi
done

# ─── Sync enums in _base.prisma ───────────────────────────────────────────────
# Extract enums from working _base.prisma and rebuild demo _base.prisma
DEMO_BASE="$DEMO_DIR/_base.prisma"
WORKING_ENUM_BLOCK=$(awk '/^\/\/ ─── Enums/,0' "$WORKING_DIR/_base.prisma")
DEMO_ENUM_BLOCK=$(awk '/^\/\/ ─── Enums/,0' "$DEMO_BASE" 2>/dev/null || echo "")

if [ "$WORKING_ENUM_BLOCK" != "$DEMO_ENUM_BLOCK" ]; then
  if $CHECK_ONLY; then
    echo "  CHANGED: _base.prisma enums"
    CHANGED=$((CHANGED + 1))
  else
    # Rebuild demo _base.prisma: keep demo header (up to first enum), append working enums
    HEADER=$(awk '/^\/\/ ─── Enums/{exit} {print}' "$DEMO_BASE")
    printf '%s\n\n' "$HEADER" > "$DEMO_BASE"
    echo "$WORKING_ENUM_BLOCK" >> "$DEMO_BASE"
    echo "  Synced: _base.prisma enums"
    CHANGED=$((CHANGED + 1))
  fi
fi

# ─── Remove demo domain files with no working counterpart ────────────────────
for dst in "$DEMO_DIR"/*.prisma; do
  fname=$(basename "$dst")
  [ "$fname" = "_base.prisma" ] && continue
  src="$WORKING_DIR/$fname"
  if [ ! -f "$src" ]; then
    if $CHECK_ONLY; then
      echo "  ORPHAN: $fname (no matching working file)"
    else
      rm "$dst"
      echo "  Removed orphan: $fname"
    fi
    CHANGED=$((CHANGED + 1))
  fi
done

echo ""
if [ "$CHANGED" -eq 0 ]; then
  echo "✅ Demo schema is in sync with WorkingDB schema."
elif $CHECK_ONLY; then
  echo "⚠  $CHANGED file(s) out of sync — run without --check to sync."
  exit 1
else
  echo "✅ Synced $CHANGED file(s)."
fi
