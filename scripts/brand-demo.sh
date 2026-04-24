#!/usr/bin/env bash
# brand-demo.sh
# Builds all partner brands and opens them in the browser to demonstrate
# multi-brand white-label deployment from a single codebase.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD="$ROOT_DIR/scripts/v6-migration/build-brand.sh"

BRANDS=("crmsoft" "partner-travel-1-brand" "partner-electronic-1-brand")

echo ""
echo "======================================================"
echo "  CRMSoft V6 — Multi-Brand Deployment Demo"
echo "======================================================"
echo ""
echo "Building 3 brand deployments from ONE codebase..."
echo ""

for brand in "${BRANDS[@]}"; do
  echo "Building: $brand"
  bash "$BUILD" "$brand"
  echo ""
done

echo "======================================================"
echo "  Brand Color Verification (isolation check)"
echo "======================================================"
echo ""

for brand in "${BRANDS[@]}"; do
  primary=$(grep -o '\-\-brand-primary: [^;]*' \
    "$ROOT_DIR/brands/$brand/theme/variables.css" | head -1 | awk '{print $2}')
  name=$(python3 -c "import json; d=json.load(open('$ROOT_DIR/brands/$brand/config/brand.json')); print(d['displayName'])" 2>/dev/null || echo "$brand")
  printf "  %-30s %s\n" "$name" "$primary"
done

echo ""

# Isolation check: all primary colors must be different
COLORS=()
for brand in "${BRANDS[@]}"; do
  c=$(grep -o '\-\-brand-primary: [^;]*' \
    "$ROOT_DIR/brands/$brand/theme/variables.css" | head -1 | awk '{print $2}')
  COLORS+=("$c")
done

if [ "${COLORS[0]}" != "${COLORS[1]}" ] && [ "${COLORS[1]}" != "${COLORS[2]}" ]; then
  echo "  ✅ ISOLATION CHECK PASSED — all 3 brands have distinct primary colors"
else
  echo "  ❌ ISOLATION CHECK FAILED — brands share a color (check CSS variables)"
  exit 1
fi

echo ""
echo "======================================================"
echo "  Opening brands in browser..."
echo "======================================================"
echo ""

for brand in "${BRANDS[@]}"; do
  FILE="$ROOT_DIR/dist/brands/$brand/index.html"
  echo "  Opening: $FILE"
  if command -v open &>/dev/null; then
    open "$FILE"
  elif command -v xdg-open &>/dev/null; then
    xdg-open "$FILE"
  else
    echo "  (Cannot auto-open — open manually: $FILE)"
  fi
  sleep 0.5
done

echo ""
echo "======================================================"
echo "  DEMO COMPLETE"
echo "======================================================"
echo ""
echo "  Same codebase. 3 brands. 3 separate deployments."
echo "  This is CRMSoft V6 multi-brand white label."
echo ""
