#!/bin/bash
# Brand Inheritance Demo — Day 4 Customer Showcase
#
# Builds two partner brand deployments from the same source codebase,
# then opens both in the browser side by side for comparison.
#
# Usage: ./scripts/v6-migration/demo-brand-inheritance.sh

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

echo "╔═══════════════════════════════════════════════════════╗"
echo "║       CRMSoft V6 — Brand Inheritance Demo             ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "Demonstrating: Same codebase → 2 independently branded deployments"
echo ""

# ── Build both partner brands ──────────────────────────────────────────────

echo "Step 1/3 — Build Travel Partner brand..."
./scripts/v6-migration/build-brand.sh partner-travel-1-brand
echo ""

echo "Step 2/3 — Build Electronic Partner brand..."
./scripts/v6-migration/build-brand.sh partner-electronic-1-brand
echo ""

# ── Verify builds ─────────────────────────────────────────────────────────

echo "Step 3/3 — Verify brand isolation..."
echo ""

TRAVEL_PRIMARY=$(grep --max-count=1 "brand-primary:" dist/brands/partner-travel-1-brand/index.html \
  | sed 's/.*brand-primary: *\(#[^;]*\);.*/\1/' | tr -d ' ')
ELEC_PRIMARY=$(grep --max-count=1 "brand-primary:" dist/brands/partner-electronic-1-brand/index.html \
  | sed 's/.*brand-primary: *\(#[^;]*\);.*/\1/' | tr -d ' ')

echo "  TravelPro CRM  →  --brand-primary: $TRAVEL_PRIMARY  (sky blue)"
echo "  ElectroHub CRM →  --brand-primary: $ELEC_PRIMARY  (crimson)"

if [ "$TRAVEL_PRIMARY" = "$ELEC_PRIMARY" ]; then
  echo ""
  echo "❌ FAIL: both brands share the same primary color — check variables.css"
  exit 1
fi

echo ""
echo "✅ Brands are visually isolated (different primary colors confirmed)"
echo ""

# ── Summary ───────────────────────────────────────────────────────────────

echo "══════════════════════════════════════════════════════════"
echo "  Two separate branded deployments from ONE codebase"
echo "══════════════════════════════════════════════════════════"
echo ""
echo "  Travel build:    dist/brands/partner-travel-1-brand/index.html"
echo "  Electronic build: dist/brands/partner-electronic-1-brand/index.html"
echo ""
echo "  What changed between the two:  CSS variables only (brands/*/theme/variables.css)"
echo "  What stayed identical:         All HTML, all business logic"
echo ""
echo "  To add a new brand:  cp brands/_template brands/<name>"
echo "                       edit brands/<name>/theme/variables.css"
echo "                       ./scripts/v6-migration/build-brand.sh <name>"
echo ""

# ── Open in browser if available ──────────────────────────────────────────

ABS_TRAVEL="$(pwd)/dist/brands/partner-travel-1-brand/index.html"
ABS_ELEC="$(pwd)/dist/brands/partner-electronic-1-brand/index.html"

if command -v open &>/dev/null; then
  echo "Opening both builds in browser..."
  open "file://$ABS_TRAVEL"
  sleep 1
  open "file://$ABS_ELEC"
elif command -v xdg-open &>/dev/null; then
  xdg-open "file://$ABS_TRAVEL" &>/dev/null &
  sleep 1
  xdg-open "file://$ABS_ELEC" &>/dev/null &
else
  echo "  Open manually:"
  echo "    file://$ABS_TRAVEL"
  echo "    file://$ABS_ELEC"
fi

echo ""
echo "Key talking point for customer:"
echo "  '62 CSS variables. One file per partner. Zero code changes.'"
echo "  'All 7 portals update instantly when we swap the brand file.'"
