#!/usr/bin/env bash
# audit-folder-structure.sh
#
# Purpose: Dump folder structure (depth-limited) for each major app area.
# Track:   1 — Code Audit
# Output:  $OUT_DIR/folder-structure.txt (default /tmp/v2/)
# Usage:   ./audit-folder-structure.sh [MAX_DEPTH=4]

set -euo pipefail

MAX_DEPTH="${1:-4}"
OUT_DIR="${OUT_DIR:-/tmp/v2}"
OUT_FILE="$OUT_DIR/folder-structure.txt"
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

mkdir -p "$OUT_DIR"

{
  echo "=== Folder Structure Audit ==="
  echo "Repo root: $REPO_ROOT"
  echo "Max depth: $MAX_DEPTH"
  echo "Generated: $(date -Iseconds)"
  echo

  for area in Application Customer Vendor WhiteLabel PlatformConsole Shared; do
    target="$REPO_ROOT/$area"
    if [ ! -d "$target" ]; then
      echo "--- $area --- (missing)"
      echo
      continue
    fi
    echo "--- $area ---"
    find "$target" -type d \
      -not -path '*/node_modules*' \
      -not -path '*/.next*' \
      -not -path '*/dist*' \
      -not -path '*/build*' \
      -not -path '*/.git*' \
      -not -path '*/coverage*' \
      -maxdepth "$MAX_DEPTH" | sort
    echo
  done
} > "$OUT_FILE"

echo "Wrote: $OUT_FILE ($(wc -l < "$OUT_FILE") lines)"
