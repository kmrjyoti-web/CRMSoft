#!/usr/bin/env bash
# audit-module-inventory.sh
#
# Purpose: Inventory backend + portal modules. Verifies the claimed 83 count.
# Track:   1 — Code Audit
# Output:  $OUT_DIR/module-inventory.txt (default /tmp/v2/)
# Usage:   ./audit-module-inventory.sh

set -euo pipefail

OUT_DIR="${OUT_DIR:-/tmp/v2}"
OUT_FILE="$OUT_DIR/module-inventory.txt"
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

mkdir -p "$OUT_DIR"

{
  echo "=== Module Inventory ==="
  echo "Repo root: $REPO_ROOT"
  echo "Generated: $(date -Iseconds)"
  echo

  total=0
  for candidate in \
      "$REPO_ROOT/Application/backend/src/modules" \
      "$REPO_ROOT/Application/backend/src/core" \
      "$REPO_ROOT/Application/backend/src/common" \
      "$REPO_ROOT/Application/frontend/customer-portal/src" \
      "$REPO_ROOT/Application/frontend/marketplace/src" \
      "$REPO_ROOT/Customer/frontend/crm-admin/src" \
      "$REPO_ROOT/Vendor/frontend/vendor-panel/src" \
      "$REPO_ROOT/WhiteLabel/wl-admin/src" \
      "$REPO_ROOT/WhiteLabel/wl-partner/src" \
      "$REPO_ROOT/WhiteLabel/wl-api/src" \
      "$REPO_ROOT/PlatformConsole/frontend/platform-console/src"; do
    if [ ! -d "$candidate" ]; then
      echo "--- $candidate --- (not found)"
      echo
      continue
    fi
    count=$(find "$candidate" -maxdepth 1 -mindepth 1 -type d | wc -l | tr -d ' ')
    total=$((total + count))
    echo "--- $candidate ($count modules) ---"
    find "$candidate" -maxdepth 1 -mindepth 1 -type d | sort
    echo
  done

  echo "=== TOTAL (direct subdirs of scanned roots): $total ==="
  echo "Claimed 83 — verify against this and Shared/backend + *.module.ts count below"
  echo

  echo "--- Shared/backend packages (11 expected) ---"
  if [ -d "$REPO_ROOT/Shared/backend" ]; then
    pkgs=$(find "$REPO_ROOT/Shared/backend" -maxdepth 1 -mindepth 1 -type d | wc -l | tr -d ' ')
    echo "$pkgs shared backend packages:"
    find "$REPO_ROOT/Shared/backend" -maxdepth 1 -mindepth 1 -type d | sort
  else
    echo "Shared/backend not found"
  fi
  echo

  echo "--- Repo-wide *.module.ts files ---"
  find "$REPO_ROOT" -name '*.module.ts' \
    -not -path '*/node_modules/*' \
    -not -path '*/.next/*' \
    -not -path '*/dist/*' | wc -l | tr -d ' ' | xargs -I{} echo "  {} *.module.ts files found"
} > "$OUT_FILE"

echo "Wrote: $OUT_FILE ($(wc -l < "$OUT_FILE") lines)"
