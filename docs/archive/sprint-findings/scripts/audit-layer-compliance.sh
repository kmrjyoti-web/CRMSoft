#!/usr/bin/env bash
# audit-layer-compliance.sh
#
# Purpose: Flag layer violations — e.g. controllers importing repositories
#          directly (should go through service), services importing other
#          services cross-module, etc.
# Track:   2 — Architecture Audit
# Output:  $OUT_DIR/layer-compliance.txt (default /tmp/v2/)
# Usage:   ./audit-layer-compliance.sh

set -euo pipefail

OUT_DIR="${OUT_DIR:-/tmp/v2}"
OUT_FILE="$OUT_DIR/layer-compliance.txt"
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BACKEND="$REPO_ROOT/Application/backend/src"

mkdir -p "$OUT_DIR"

if [ ! -d "$BACKEND" ]; then
  echo "Backend src missing: $BACKEND" >&2
  exit 1
fi

{
  echo "=== Layer Compliance Audit ==="
  echo "Target: $BACKEND"
  echo "Generated: $(date -Iseconds)"
  echo

  echo "--- Controllers importing repositories directly (VIOLATION) ---"
  find "$BACKEND" -name '*.controller.ts' -exec grep -lE "import.*[Rr]epository.*from" {} \; 2>/dev/null | head -30
  echo

  echo "--- Controllers importing from other modules' internals (not via index) ---"
  find "$BACKEND" -name '*.controller.ts' -exec grep -HnE "from '\.\./\.\./[^']+/(services|repositories)/" {} \; 2>/dev/null | head -30
  echo

  echo "--- Services importing repositories from OTHER modules (cross-module leak) ---"
  find "$BACKEND" -name '*.service.ts' -exec grep -HnE "from '\.\./\.\./[^']+/repositories/" {} \; 2>/dev/null | head -30
  echo

  echo "--- Repositories importing services (backward dependency) ---"
  find "$BACKEND" -name '*.repository.ts' -exec grep -HnE "import.*[Ss]ervice.*from" {} \; 2>/dev/null | head -30
  echo

  echo "--- Summary ---"
  controllers=$(find "$BACKEND" -name '*.controller.ts' | wc -l | tr -d ' ')
  services=$(find "$BACKEND" -name '*.service.ts' | wc -l | tr -d ' ')
  repos=$(find "$BACKEND" -name '*.repository.ts' | wc -l | tr -d ' ')
  echo "Controllers: $controllers  Services: $services  Repositories: $repos"
} > "$OUT_FILE"

echo "Wrote: $OUT_FILE ($(wc -l < "$OUT_FILE") lines)"
