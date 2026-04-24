#!/bin/bash
set -e

MODULE=$1
VERSION=$2

if [ -z "$MODULE" ] || [ -z "$VERSION" ]; then
  echo "Usage: ./rollback-module.sh <module> <version>"
  echo "Example: ./rollback-module.sh api v1.1.0"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "⚠️  Rolling back $MODULE to $VERSION"
read -p "Type ROLLBACK to confirm: " confirm
if [ "$confirm" != "ROLLBACK" ]; then
  echo "Cancelled."
  exit 1
fi

# Use deploy-module.sh with version
"$SCRIPT_DIR/deploy-module.sh" "$MODULE" "$VERSION"
echo "✅ Rolled back $MODULE to $VERSION"
