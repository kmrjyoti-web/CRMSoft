#!/usr/bin/env bash
# audit-cqrs-adherence.sh
#
# Purpose: Check CQRS structure — presence of commands/ + queries/ folders
#          per module, handler files, and whether services still live alongside.
# Track:   2 — Architecture Audit
# Output:  $OUT_DIR/cqrs-adherence.txt (default /tmp/v2/)
# Usage:   ./audit-cqrs-adherence.sh

set -euo pipefail

OUT_DIR="${OUT_DIR:-/tmp/v2}"
OUT_FILE="$OUT_DIR/cqrs-adherence.txt"
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BACKEND="$REPO_ROOT/Application/backend/src/modules"

mkdir -p "$OUT_DIR"

if [ ! -d "$BACKEND" ]; then
  echo "Modules dir missing: $BACKEND" >&2
  exit 1
fi

{
  echo "=== CQRS Adherence Audit ==="
  echo "Target: $BACKEND"
  echo "Generated: $(date -Iseconds)"
  echo

  echo "--- Per-module CQRS structure ---"
  printf "%-30s %-10s %-10s %-10s %-10s\n" "Module" "commands/" "queries/" "services/" "handlers"
  printf "%-30s %-10s %-10s %-10s %-10s\n" "------" "---------" "--------" "---------" "--------"

  find "$BACKEND" -maxdepth 1 -mindepth 1 -type d | sort | while read -r mod; do
    name=$(basename "$mod")
    has_cmd="no"
    has_qry="no"
    has_svc="no"
    [ -d "$mod/commands" ] && has_cmd="yes"
    [ -d "$mod/queries" ] && has_qry="yes"
    [ -d "$mod/services" ] && has_svc="yes"
    handlers=$(find "$mod" -name '*.handler.ts' 2>/dev/null | wc -l | tr -d ' ')
    printf "%-30s %-10s %-10s %-10s %-10s\n" "$name" "$has_cmd" "$has_qry" "$has_svc" "$handlers"
  done

  echo
  echo "--- Total handlers across backend ---"
  total=$(find "$BACKEND" -name '*.handler.ts' | wc -l | tr -d ' ')
  echo "$total *.handler.ts files"

  echo
  echo "--- Command/Query class pattern check ---"
  cmd_classes=$(grep -rE '^export class.*Command\b' "$BACKEND" --include='*.ts' 2>/dev/null | wc -l | tr -d ' ')
  qry_classes=$(grep -rE '^export class.*Query\b' "$BACKEND" --include='*.ts' 2>/dev/null | wc -l | tr -d ' ')
  echo "Classes named *Command: $cmd_classes"
  echo "Classes named *Query:   $qry_classes"
} > "$OUT_FILE"

echo "Wrote: $OUT_FILE"
