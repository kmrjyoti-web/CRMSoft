#!/usr/bin/env bash
# audit-api-patterns.sh
#
# Purpose: Sample backend routes for compliance with Result<T> return type +
#          DTO usage. Spot-check 30 random controllers.
# Track:   2 — Architecture Audit
# Output:  $OUT_DIR/api-patterns.txt (default /tmp/v2/)
# Usage:   ./audit-api-patterns.sh [SAMPLE_SIZE=30]

set -euo pipefail

SAMPLE="${1:-30}"
OUT_DIR="${OUT_DIR:-/tmp/v2}"
OUT_FILE="$OUT_DIR/api-patterns.txt"
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BACKEND="$REPO_ROOT/Application/backend/src"

mkdir -p "$OUT_DIR"

{
  echo "=== API Pattern Compliance (sample) ==="
  echo "Target: $BACKEND"
  echo "Sample size: $SAMPLE controllers"
  echo "Generated: $(date -Iseconds)"
  echo

  total_controllers=$(find "$BACKEND" -name '*.controller.ts' | wc -l | tr -d ' ')
  echo "Total controllers: $total_controllers"
  echo

  # Repo-wide counts (cheap)
  result_usage=$(grep -rE 'Result<' "$BACKEND" --include='*.ts' 2>/dev/null | wc -l | tr -d ' ')
  dto_usage=$(grep -rE '\.dto\b|Dto\b' "$BACKEND" --include='*.ts' 2>/dev/null | wc -l | tr -d ' ')
  echo "Result<T> occurrences: $result_usage"
  echo "Dto mentions: $dto_usage"
  echo

  echo "--- Sample of $SAMPLE controllers ---"
  # macOS lacks shuf by default; prefer gshuf, fall back to deterministic head
  if command -v shuf >/dev/null 2>&1; then
    SAMPLER="shuf"
  elif command -v gshuf >/dev/null 2>&1; then
    SAMPLER="gshuf"
  else
    SAMPLER="cat"
    echo "(no shuf/gshuf available — sample is deterministic top-$SAMPLE)"
  fi

  find "$BACKEND" -name '*.controller.ts' | "$SAMPLER" | head -"$SAMPLE" | while read -r f; do
    has_result=$(grep -c 'Result<' "$f" || true)
    has_dto=$(grep -cE 'Dto\b' "$f" || true)
    has_http=$(grep -cE '@(Get|Post|Put|Patch|Delete)' "$f" || true)
    echo "  $(basename "$f"):  routes=$has_http  Result<T>=$has_result  Dto=$has_dto"
  done
} > "$OUT_FILE"

echo "Wrote: $OUT_FILE"
