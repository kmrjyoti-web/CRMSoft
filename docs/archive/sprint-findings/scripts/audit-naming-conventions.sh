#!/usr/bin/env bash
# audit-naming-conventions.sh
#
# Purpose: Check file naming conventions. TypeScript convention varies by area:
#          - NestJS modules: kebab-case.module.ts, kebab-case.service.ts
#          - React components: PascalCase.tsx
#          This script flags outliers — e.g. camelCase service files, kebab components.
# Track:   1 — Code Audit
# Output:  $OUT_DIR/naming-conventions.txt (default /tmp/v2/)
# Usage:   ./audit-naming-conventions.sh

set -euo pipefail

OUT_DIR="${OUT_DIR:-/tmp/v2}"
OUT_FILE="$OUT_DIR/naming-conventions.txt"
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

mkdir -p "$OUT_DIR"

find_ts() {
  find "$1" \
    \( -name '*.ts' -o -name '*.tsx' \) \
    -not -path '*/node_modules/*' \
    -not -path '*/.next/*' \
    -not -path '*/dist/*' \
    -not -path '*/build/*' \
    -not -path '*/.git/*' \
    -not -path '*/coverage/*' 2>/dev/null
}

{
  echo "=== Naming Convention Audit ==="
  echo "Repo root: $REPO_ROOT"
  echo "Generated: $(date -Iseconds)"
  echo

  echo "--- Backend (expects kebab-case) ---"
  echo "Outliers (contain uppercase in basename before extension):"
  if [ -d "$REPO_ROOT/Application/backend" ]; then
    find_ts "$REPO_ROOT/Application/backend" | awk -F/ '{
      name = $NF
      sub(/\.[^.]+$/, "", name)
      sub(/\.module$|\.service$|\.controller$|\.dto$|\.entity$|\.repository$|\.guard$|\.interceptor$|\.pipe$|\.filter$|\.decorator$|\.strategy$|\.helper$|\.util$|\.spec$|\.test$/, "", name)
      if (name ~ /[A-Z]/) print $0
    }' | head -50
  fi
  echo

  echo "--- React portals (expects PascalCase for components) ---"
  echo "Outliers (.tsx files starting with lowercase):"
  for p in \
      "$REPO_ROOT/Customer" \
      "$REPO_ROOT/Vendor" \
      "$REPO_ROOT/WhiteLabel" \
      "$REPO_ROOT/PlatformConsole"; do
    [ -d "$p" ] || continue
    find_ts "$p" | grep '\.tsx$' | awk -F/ '{
      name = $NF
      if (substr(name, 1, 1) ~ /[a-z]/ && name !~ /^index\./ && name !~ /^use[A-Z]/) print $0
    }' | head -30
  done
  echo

  echo "--- Summary counts ---"
  total=$(find_ts "$REPO_ROOT" | wc -l | tr -d ' ')
  echo "Total .ts/.tsx files: $total"
} > "$OUT_FILE"

echo "Wrote: $OUT_FILE ($(wc -l < "$OUT_FILE") lines)"
