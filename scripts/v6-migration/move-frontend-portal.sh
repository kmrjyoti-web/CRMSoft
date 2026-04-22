#!/bin/bash
# Move a frontend portal to its new V6 location.
#
# Usage: ./move-frontend-portal.sh <source-portal-name> <target-portal-name>
# Example:
#   ./move-frontend-portal.sh crm-admin crm-admin-new
#
# This uses git mv so history is preserved.

set -euo pipefail

SOURCE_NAME=$1
TARGET_NAME=$2

if [ -z "${SOURCE_NAME:-}" ] || [ -z "${TARGET_NAME:-}" ]; then
  echo "Usage: $0 <source-portal-name> <target-portal-name>"
  echo "Example: $0 crm-admin crm-admin-new"
  exit 1
fi

SOURCE="apps-frontend/$SOURCE_NAME"
TARGET="apps/frontend/$TARGET_NAME"

if [ ! -d "$SOURCE" ]; then
  echo "Error: $SOURCE does not exist"
  exit 1
fi

if [ -d "$TARGET" ] && [ "$(ls -A "$TARGET" | grep -v '.gitkeep')" ]; then
  echo "Error: Target '$TARGET' already has content. Aborting."
  exit 1
fi

# Remove the .gitkeep placeholder if present
rm -f "$TARGET/.gitkeep"

mkdir -p "$(dirname "$TARGET")"

echo "Moving: $SOURCE → $TARGET"
git mv "$SOURCE" "$TARGET"

echo ""
echo "Next steps:"
echo "1. Update pnpm-workspace.yaml: change 'apps-frontend/$SOURCE_NAME' → 'apps/frontend/$TARGET_NAME'"
echo "2. Update any tsconfig.json paths referencing the old location"
echo "3. Run: pnpm install"
echo "4. Run: ./scripts/v6-migration/verify-migration-health.sh"
echo ""
echo "✅ git mv complete."
