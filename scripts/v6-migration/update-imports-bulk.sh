#!/bin/bash
# Bulk find-and-replace import patterns across all TS/TSX files.
#
# Usage: ./update-imports-bulk.sh <old-pattern> <new-pattern> [directory]
# Example:
#   ./update-imports-bulk.sh '@shared-types' '@crmsoft/types'
#   ./update-imports-bulk.sh 'modules/core/identity' 'core/platform/auth' apps-backend

set -euo pipefail

OLD=${1:-}
NEW=${2:-}
SEARCH_DIR=${3:-.}

if [ -z "$OLD" ] || [ -z "$NEW" ]; then
  echo "Usage: $0 <old-pattern> <new-pattern> [directory]"
  echo "Example: $0 '@shared-types' '@crmsoft/types'"
  exit 1
fi

echo "Replacing: '$OLD' → '$NEW'"
echo "In: $SEARCH_DIR"
echo ""

# Count files that will be affected
affected=$(grep -rl "$OLD" "$SEARCH_DIR" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.next \
  2>/dev/null | wc -l | tr -d ' ')

echo "Files affected: $affected"

if [ "$affected" -eq 0 ]; then
  echo "No files contain '$OLD'. Nothing to do."
  exit 0
fi

echo "Proceeding..."

# macOS-compatible sed (BSD sed requires empty string after -i)
find "$SEARCH_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' "s|${OLD}|${NEW}|g" {} \;

echo ""
echo "✅ Done. Review changes with: git diff"
echo "Then run: ./scripts/v6-migration/verify-migration-health.sh"
