#!/bin/bash
# Open the V6 brand inheritance demo in the default browser.
# Shows live CSS variable switching between CRMSoft and partner brands.
#
# Usage: ./scripts/brand-demo.sh

cd "$(git rev-parse --show-toplevel)"

DEMO_FILE="brands/crmsoft/demo/index.html"

if [ ! -f "$DEMO_FILE" ]; then
  echo "ERROR: Demo file not found: $DEMO_FILE"
  echo "Run this script from the repo root."
  exit 1
fi

ABS_PATH="$(pwd)/$DEMO_FILE"

echo "========================================"
echo "CRMSoft V6 — Brand Inheritance Demo"
echo "========================================"
echo ""
echo "Demo file: $ABS_PATH"
echo ""
echo "What to show:"
echo "  1. Open the page — shows CRMSoft default (blue sidebar, standard palette)"
echo "  2. Click 'TravelPro (Partner Brand)'"
echo "     → Sidebar turns ocean blue, primary becomes sky blue"
echo "     → Same HTML, same React components, different CSS variables"
echo "  3. Right panel shows exactly which tokens changed"
echo ""
echo "Key talking point:"
echo "  'Your developers customize 1 CSS file. 50+ variables."
echo "   The entire platform updates. Zero code changes.'"
echo ""

# Open in browser
if command -v open &>/dev/null; then
  echo "Opening in browser..."
  open "$ABS_PATH"
elif command -v xdg-open &>/dev/null; then
  echo "Opening in browser..."
  xdg-open "$ABS_PATH"
else
  echo "Open manually in browser:"
  echo "  file://$ABS_PATH"
fi
