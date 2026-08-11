#!/bin/bash
# Build a brand-specific static deployment package.
#
# Copies the shared demo portal, inlines the brand's CSS variables (no external
# CSS dependency), and writes a build manifest. Proves: same codebase → N
# independent branded deployments.
#
# Usage: ./scripts/v6-migration/build-brand.sh <brand-name>
# Example: ./scripts/v6-migration/build-brand.sh partner-travel-1-brand

set -euo pipefail

BRAND=${1:-}
if [ -z "$BRAND" ]; then
  echo "Usage: $0 <brand-name>"
  echo ""
  echo "Available brands:"
  ls brands/ | grep -v "README.md" | sed 's/^/  /'
  exit 1
fi

cd "$(git rev-parse --show-toplevel)"

BRAND_DIR="brands/$BRAND"
CSS_FILE="$BRAND_DIR/theme/variables.css"
CONFIG_FILE="$BRAND_DIR/config/brand.json"
DIST_DIR="dist/brands/$BRAND"
SOURCE_HTML="brands/crmsoft/demo/index.html"

if [ ! -d "$BRAND_DIR" ]; then
  echo "ERROR: Brand directory not found: $BRAND_DIR"
  echo "Available brands:"; ls brands/ | grep -v "README.md" | sed 's/^/  /'; exit 1
fi

if [ ! -f "$CSS_FILE" ]; then
  echo "ERROR: Brand CSS not found: $CSS_FILE"; exit 1
fi

if [ ! -f "$SOURCE_HTML" ]; then
  echo "ERROR: Source demo HTML not found: $SOURCE_HTML"; exit 1
fi

mkdir -p "$DIST_DIR"

# Read brand metadata
BRAND_DISPLAY=$(python3 -c "import json,sys; d=json.load(open('$CONFIG_FILE')); print(d['displayName'])" 2>/dev/null || echo "$BRAND")
BRAND_VERTICAL=$(python3 -c "import json,sys; d=json.load(open('$CONFIG_FILE')); print(d.get('vertical','unknown'))" 2>/dev/null || echo "unknown")

echo "Building brand package: $BRAND_DISPLAY  [$BRAND]"
echo ""

# Inline the brand CSS into the HTML (self-contained deployment, no external deps).
# Replaces <link id="brand-css" ...> with an inline <style> block.
python3 - << PYEOF
import re, json, datetime

src  = open("$SOURCE_HTML").read()
css  = open("$CSS_FILE").read()
cfg  = json.load(open("$CONFIG_FILE"))

# Replace external brand CSS link with inline style
inlined = re.sub(
    r'<link id="brand-css"[^>]+>',
    '<style id="brand-css-inline">\n' + css + '\n</style>',
    src
)

# Update page title
inlined = re.sub(
    r'<title>[^<]*</title>',
    '<title>CRMSoft V6 — Brand Demo: ' + cfg['displayName'] + '</title>',
    inlined
)

with open("$DIST_DIR/index.html", "w") as f:
    f.write(inlined)

print("  HTML:     $DIST_DIR/index.html  (" + str(len(inlined)) + " bytes)")
PYEOF

# Copy brand config
cp "$CONFIG_FILE" "$DIST_DIR/brand.json"

# Write build manifest
cat > "$DIST_DIR/build-manifest.json" << EOF
{
  "brand":        "$BRAND",
  "displayName":  "$BRAND_DISPLAY",
  "vertical":     "$BRAND_VERTICAL",
  "builtAt":      "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "cssSource":    "$CSS_FILE",
  "deployment":   "$DIST_DIR/index.html",
  "cssInlined":   true
}
EOF

echo "  Config:   $DIST_DIR/brand.json"
echo "  Manifest: $DIST_DIR/build-manifest.json"
echo ""
echo "✅ $BRAND_DISPLAY — build complete"
echo "   open $DIST_DIR/index.html"
