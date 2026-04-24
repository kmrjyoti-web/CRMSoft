#!/usr/bin/env bash
# build-brand.sh <brand-name>
# Produces dist/brands/<brand>/index.html with brand CSS inlined (self-contained).

set -euo pipefail

BRAND=${1:-crmsoft}
ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
BRAND_DIR="$ROOT_DIR/brands/$BRAND"
DEMO_SRC="$ROOT_DIR/brands/crmsoft/demo/index.html"
DIST="$ROOT_DIR/dist/brands/$BRAND"

if [ ! -d "$BRAND_DIR" ]; then
  echo "ERROR: Brand '$BRAND' not found at $BRAND_DIR" >&2
  exit 1
fi

CSS_FILE="$BRAND_DIR/theme/variables.css"
CONFIG_FILE="$BRAND_DIR/config/brand.json"

if [ ! -f "$CSS_FILE" ]; then
  echo "ERROR: Missing $CSS_FILE" >&2
  exit 1
fi

mkdir -p "$DIST"

# Inline brand CSS into HTML using Python3
python3 - <<PYEOF
import re, json, pathlib

src = pathlib.Path('$DEMO_SRC').read_text()
css = pathlib.Path('$CSS_FILE').read_text()

# Replace <link id="brand-css" ...> with inline <style>
inlined = re.sub(
    r'<link id="brand-css"[^>]+>',
    '<style id="brand-css-inline">\n' + css + '\n</style>',
    src
)

# Update brand badge and logo text from brand.json
if pathlib.Path('$CONFIG_FILE').exists():
    cfg = json.loads(pathlib.Path('$CONFIG_FILE').read_text())
    name = cfg.get('displayName', '$BRAND')
    inlined = inlined.replace('>CRMSoft<', f'>{name}<')
    inlined = re.sub(r'<title>[^<]+</title>', f'<title>{name}</title>', inlined)

pathlib.Path('$DIST/index.html').write_text(inlined)
print(f'Built: $DIST/index.html')
PYEOF

# Copy brand.json
if [ -f "$CONFIG_FILE" ]; then
  cp "$CONFIG_FILE" "$DIST/brand.json"
fi

# Write build manifest
cat > "$DIST/build-manifest.json" <<JSON
{
  "brand": "$BRAND",
  "builtAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "source": "brands/$BRAND"
}
JSON

echo "  primary: $(grep -o '\-\-brand-primary: [^;]*' "$CSS_FILE" | head -1)"
