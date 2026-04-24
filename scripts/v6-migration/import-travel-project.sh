#!/bin/bash
# Import an external project repo into verticals/{vertical}/ using git subtree.
# Preserves commit history from the external repo.
#
# Usage: ./import-travel-project.sh <git-url> [branch] [vertical-name]
# Example:
#   ./import-travel-project.sh https://github.com/kmrjyoti-web/travel.git main travel

set -euo pipefail

TRAVEL_REPO=${1:-}
TRAVEL_BRANCH=${2:-main}
VERTICAL_NAME=${3:-travel}
TARGET="verticals/$VERTICAL_NAME"

if [ -z "$TRAVEL_REPO" ]; then
  echo "Usage: $0 <git-url> [branch] [vertical-name]"
  echo "Example: $0 https://github.com/kmrjyoti-web/travel.git main travel"
  exit 1
fi

cd "$(git rev-parse --show-toplevel)"

# Verify target is skeleton-only (no real source files)
real_files=$(find "$TARGET" -type f ! -name '.gitkeep' ! -name 'README.md' 2>/dev/null | wc -l | tr -d ' ')
if [ "$real_files" -gt 0 ]; then
  echo "Warning: $TARGET already has $real_files files. Aborting to prevent overwrite."
  exit 1
fi

echo "Importing $TRAVEL_REPO ($TRAVEL_BRANCH) → $TARGET"
echo "This may take a few minutes..."
echo ""

git subtree add --prefix="$TARGET" "$TRAVEL_REPO" "$TRAVEL_BRANCH" --squash

echo ""
echo "✅ Import complete. Next steps:"
echo "1. Review what was imported: ls $TARGET"
echo "2. Reorganize into: $TARGET/modules/, $TARGET/data-models/, $TARGET/ai-customization/"
echo "3. Remove or adapt package.json, node_modules, etc."
echo "4. Run: pnpm install from root"
echo "5. Run: ./scripts/v6-migration/verify-migration-health.sh"
