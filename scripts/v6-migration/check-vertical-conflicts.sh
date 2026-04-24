#!/bin/bash
# Detect Prisma model name collisions between a vertical and CRMSoft core schemas.
# Run this BEFORE integrating a vertical's Prisma files into any shared schema.
#
# Usage: ./check-vertical-conflicts.sh [vertical-name]
# Example: ./check-vertical-conflicts.sh travel

set -euo pipefail

VERTICAL=${1:-travel}
TARGET="verticals/$VERTICAL"
CORE_PRISMA="apps-backend/api/prisma"

cd "$(git rev-parse --show-toplevel)"

if [ ! -d "$TARGET" ]; then
  echo "ERROR: $TARGET not found"
  exit 1
fi

echo "=========================================="
echo "Prisma Conflict Check: $VERTICAL vs CRMSoft core"
echo "=========================================="
echo ""

# Extract CRMSoft model names (unique)
CORE_MODELS=$(grep -rh "^model " "$CORE_PRISMA" --include="*.prisma" 2>/dev/null | awk '{print $2}' | sort -u || true)
CORE_COUNT=$(echo "$CORE_MODELS" | grep -c . || echo 0)

# Extract vertical model names
VERTICAL_PRISMA_DIR="$TARGET/data-models"
if [ ! -d "$VERTICAL_PRISMA_DIR" ] || [ -z "$(find "$VERTICAL_PRISMA_DIR" -name '*.prisma' 2>/dev/null)" ]; then
  # Fallback: search anywhere in the vertical
  VERTICAL_PRISMA_DIR="$TARGET"
fi

VERTICAL_MODELS=$(grep -rh "^model " "$VERTICAL_PRISMA_DIR" --include="*.prisma" 2>/dev/null | awk '{print $2}' | sort -u || true)
VERTICAL_COUNT=0
[ -n "$VERTICAL_MODELS" ] && VERTICAL_COUNT=$(echo "$VERTICAL_MODELS" | wc -l | tr -d ' ')

echo "CRMSoft core models:  $CORE_COUNT"
echo "Vertical models:      $VERTICAL_COUNT"
echo ""

if [ "$VERTICAL_COUNT" -eq 0 ]; then
  echo "⚠️  No Prisma models found in $TARGET"
  echo "   Run import-travel-project.sh first, then reorganize-vertical.sh"
  exit 0
fi

# Find collisions
COLLISIONS=""
while IFS= read -r model; do
  [ -z "$model" ] && continue
  if echo "$CORE_MODELS" | grep -qx "$model" 2>/dev/null; then
    # Find where the core defines it
    core_file=$(grep -rln "^model $model " "$CORE_PRISMA" --include="*.prisma" 2>/dev/null | head -1)
    core_ns=$(echo "$core_file" | sed "s|.*prisma/||" | cut -d'/' -f1)
    COLLISIONS="$COLLISIONS\n  ⚠️  $model → conflicts with core schema [$core_ns]"
  fi
done <<< "$VERTICAL_MODELS"

# Known high-risk names for Travel domain
echo "=== Known risk models (CRMSoft already owns) ==="
for risk in TourPlan TourPlanVisit TourPlanPhoto Package IndustryPackage Activity Contact Organization Lead; do
  if echo "$VERTICAL_MODELS" | grep -qx "$risk" 2>/dev/null; then
    echo "  🔴 HIGH RISK: $risk — exists in both CRMSoft and Travel vertical"
  fi
done
echo ""

echo "=== All Vertical Models ==="
echo "$VERTICAL_MODELS" | sed 's/^/  /'
echo ""

if [ -n "$COLLISIONS" ]; then
  echo "=== COLLISIONS DETECTED ==="
  echo -e "$COLLISIONS"
  echo ""
  echo "Resolution options per collision:"
  echo "  A) Rename vertical model (e.g., TourPlan → TravelTourPlan)"
  echo "  B) Reuse CRMSoft model (add vertical-specific fields via relation)"
  echo "  C) Keep separate schemas (vertical owns its own DB — clean isolation)"
  echo ""
  echo "Recommended: Option C (separate Prisma client) for vertical independence."
  echo "  This keeps CRMSoft schema clean and allows the vertical to evolve independently."
  echo ""
  COLLISION_COUNT=$(echo -e "$COLLISIONS" | grep -c "⚠️" || echo 0)
  echo "Total collisions: $COLLISION_COUNT"
  exit 2
else
  echo "✅ No model name collisions. Safe to integrate."
  exit 0
fi
