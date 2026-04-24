#!/usr/bin/env bash
# audit-cross-module-deps.sh
#
# Purpose: Produce a raw cross-module import graph. Caller builds mermaid
#          from the edge list. Also flags potential cycles (A imports B and B imports A).
# Track:   2 — Architecture Audit
# Output:  $OUT_DIR/cross-module-deps.txt  (human)
#          $OUT_DIR/cross-module-edges.tsv (machine: src TAB dst)
# Usage:   ./audit-cross-module-deps.sh

set -euo pipefail

OUT_DIR="${OUT_DIR:-/tmp/v2}"
OUT_FILE="$OUT_DIR/cross-module-deps.txt"
EDGES_FILE="$OUT_DIR/cross-module-edges.tsv"
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BACKEND="$REPO_ROOT/Application/backend/src/modules"

mkdir -p "$OUT_DIR"

if [ ! -d "$BACKEND" ]; then
  echo "Modules dir missing: $BACKEND" >&2
  exit 1
fi

: > "$EDGES_FILE"

# Get list of modules (top-level dirs under modules/)
modules=$(find "$BACKEND" -maxdepth 1 -mindepth 1 -type d -exec basename {} \; | sort)

{
  echo "=== Cross-Module Dependency Graph ==="
  echo "Target: $BACKEND"
  echo "Generated: $(date -Iseconds)"
  echo
  echo "Modules detected:"
  echo "$modules" | sed 's/^/  - /'
  echo

  echo "--- Edges (src -> dst) ---"
  for src in $modules; do
    for dst in $modules; do
      [ "$src" = "$dst" ] && continue
      # Count imports from src files that reference dst module path
      count=$(grep -rE "from ['\"].*modules/$dst(/|['\"])" "$BACKEND/$src" --include='*.ts' 2>/dev/null | wc -l | tr -d ' ')
      if [ "$count" -gt 0 ]; then
        echo "  $src -> $dst  ($count imports)"
        printf "%s\t%s\t%s\n" "$src" "$dst" "$count" >> "$EDGES_FILE"
      fi
    done
  done
  echo

  echo "--- Potential cycles (A<->B both directions) ---"
  awk -F'\t' '{edges[$1"->"$2]=1} END { for (k in edges) { split(k, p, "->"); rev=p[2]"->"p[1]; if (rev in edges && p[1] < p[2]) print "  CYCLE: " k " <-> " rev } }' "$EDGES_FILE"
} > "$OUT_FILE"

echo "Wrote: $OUT_FILE + $EDGES_FILE"
echo "Edges: $(wc -l < "$EDGES_FILE" | tr -d ' ')"
