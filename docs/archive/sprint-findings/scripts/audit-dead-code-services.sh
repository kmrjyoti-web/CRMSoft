#!/usr/bin/env bash
# audit-dead-code-services.sh
#
# Purpose: Heuristic dead code finder — named exports that are never imported.
#          NOTE: ts-prune is NOT installed; this uses grep-based approximation.
#          False positives possible (e.g., dynamic imports, re-exports through barrels).
# Track:   1 — Code Audit
# Output:  $OUT_DIR/dead-code-candidates.txt (default /tmp/v2/)
# Usage:   ./audit-dead-code-services.sh [TARGET_DIR=Application/backend/src]

set -euo pipefail

TARGET_REL="${1:-Application/backend/src}"
OUT_DIR="${OUT_DIR:-/tmp/v2}"
OUT_FILE="$OUT_DIR/dead-code-candidates.txt"
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TARGET="$REPO_ROOT/$TARGET_REL"

mkdir -p "$OUT_DIR"

if [ ! -d "$TARGET" ]; then
  echo "Target dir missing: $TARGET" >&2
  exit 1
fi

{
  echo "=== Dead Code Candidates (heuristic) ==="
  echo "Target: $TARGET"
  echo "Generated: $(date -Iseconds)"
  echo "NOTE: This is a grep-based heuristic. Verify each candidate manually."
  echo

  tmp_exports=$(mktemp)
  tmp_imports=$(mktemp)
  trap 'rm -f "$tmp_exports" "$tmp_imports"' EXIT

  # Collect named exports (export class/function/const Name)
  grep -rEn '^export (class|function|const|interface|enum|type) [A-Za-z_][A-Za-z0-9_]*' \
    --include='*.ts' --include='*.tsx' "$TARGET" \
    | sed -E 's/.*export (class|function|const|interface|enum|type) ([A-Za-z_][A-Za-z0-9_]*).*/\2/' \
    | sort -u > "$tmp_exports"

  echo "Total named exports found: $(wc -l < "$tmp_exports" | tr -d ' ')"
  echo

  # For each export name, count imports across the whole repo
  suspects=0
  while read -r name; do
    [ -z "$name" ] && continue
    imports=$(grep -rE "(\{[^}]*\b$name\b[^}]*\}|\bimport\b[^;]*\b$name\b)" \
      --include='*.ts' --include='*.tsx' "$REPO_ROOT" \
      --exclude-dir=node_modules \
      --exclude-dir=.next \
      --exclude-dir=dist \
      --exclude-dir=build \
      --exclude-dir=.git 2>/dev/null | wc -l | tr -d ' ')
    # A symbol that only appears in its own export line and nowhere else is suspect.
    if [ "$imports" -le 1 ]; then
      suspects=$((suspects + 1))
      echo "SUSPECT: $name  (import occurrences: $imports)"
    fi
  done < "$tmp_exports" | head -100 >> "$OUT_FILE"

  echo >> "$OUT_FILE"
  echo "Top 100 suspects listed above. Rerun without head to get all." >> "$OUT_FILE"
} > "$OUT_FILE"

echo "Wrote: $OUT_FILE ($(wc -l < "$OUT_FILE") lines)"
