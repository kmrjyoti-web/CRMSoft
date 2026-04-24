#!/usr/bin/env bash
# audit-duplicate-filenames.sh
#
# Purpose: Find files with identical basenames across the repo — signal of
#          duplicate modules/services that may share logic.
# Track:   1 — Code Audit
# Output:  $OUT_DIR/duplicate-filenames.txt (default /tmp/v2/)
# Usage:   ./audit-duplicate-filenames.sh

set -euo pipefail

OUT_DIR="${OUT_DIR:-/tmp/v2}"
OUT_FILE="$OUT_DIR/duplicate-filenames.txt"
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

mkdir -p "$OUT_DIR"

{
  echo "=== Duplicate Filenames ==="
  echo "Repo root: $REPO_ROOT"
  echo "Generated: $(date -Iseconds)"
  echo

  find "$REPO_ROOT" \
    \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) \
    -not -path '*/node_modules/*' \
    -not -path '*/.next/*' \
    -not -path '*/dist/*' \
    -not -path '*/build/*' \
    -not -path '*/.git/*' \
    -not -path '*/coverage/*' \
    | awk -F/ '{print $NF "\t" $0}' \
    | sort \
    | awk -F'\t' '
      {
        if ($1 == prev_name) {
          if (!printed) print prev_name "\n  " prev_path
          print "  " $2
          printed = 1
        } else {
          printed = 0
        }
        prev_name = $1
        prev_path = $2
      }
    '
} > "$OUT_FILE"

echo "Wrote: $OUT_FILE ($(wc -l < "$OUT_FILE") lines)"
