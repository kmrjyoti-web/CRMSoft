#!/bin/bash
# Move a backend NestJS module to its new V6 location, preserving git history.
#
# Usage: ./move-backend-module.sh <source-dir> <target-dir>
# Example:
#   ./move-backend-module.sh \
#     apps-backend/api/src/modules/core/identity \
#     core/platform/auth
#
# Safety: always run verify-migration-health.sh after this script.

set -euo pipefail

SOURCE=$1
TARGET=$2

if [ -z "${SOURCE:-}" ] || [ -z "${TARGET:-}" ]; then
  echo "Usage: $0 <source> <target>"
  echo "Example: $0 apps-backend/api/src/modules/core/identity core/platform/auth"
  exit 1
fi

if [ ! -d "$SOURCE" ]; then
  echo "Error: Source directory '$SOURCE' does not exist"
  exit 1
fi

if [ -d "$TARGET" ] && [ "$(ls -A "$TARGET" | grep -v '.gitkeep')" ]; then
  echo "Error: Target '$TARGET' already has content. Aborting to prevent overwrite."
  exit 1
fi

# Create parent dir if needed
mkdir -p "$(dirname "$TARGET")"

echo "Moving: $SOURCE → $TARGET"
git mv "$SOURCE" "$TARGET"

echo ""
echo "Import paths to update manually:"
echo "  Old: $(echo "$SOURCE" | sed 's|apps-backend/api/src/||')"
echo "  New: $(echo "$TARGET")"
echo ""
echo "Run: ./scripts/v6-migration/update-imports-bulk.sh <old-pattern> <new-pattern>"
echo ""
echo "Then: ./scripts/v6-migration/verify-migration-health.sh"
echo ""
echo "✅ git mv complete. Verify tsc before committing."
