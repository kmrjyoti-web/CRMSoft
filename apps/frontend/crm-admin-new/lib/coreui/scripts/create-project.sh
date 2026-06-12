#!/bin/bash

# Usage: ./scripts/create-project.sh crm
# Creates: packages/ui-crm/ with all boilerplate

PROJECT_NAME=$1

if [ -z "$PROJECT_NAME" ]; then
  echo "Usage: ./scripts/create-project.sh <project-name>"
  echo "Example: ./scripts/create-project.sh crm"
  exit 1
fi

PROJECT_DIR="packages/ui-${PROJECT_NAME}"

if [ -d "$PROJECT_DIR" ]; then
  echo "Error: ${PROJECT_DIR} already exists"
  exit 1
fi

echo "Creating project override package: @coreui/ui-${PROJECT_NAME}"

# Copy template
cp -r packages/ui-project-template "$PROJECT_DIR"

# Replace PROJECT_NAME in all files
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS sed requires -i '' for in-place editing
  find "$PROJECT_DIR" -type f -exec sed -i '' "s/PROJECT_NAME/${PROJECT_NAME}/g" {} +
else
  find "$PROJECT_DIR" -type f -exec sed -i "s/PROJECT_NAME/${PROJECT_NAME}/g" {} +
fi

# Rename token file
mv "$PROJECT_DIR/src/theme/PROJECT_NAME-tokens.css" "$PROJECT_DIR/src/theme/${PROJECT_NAME}-tokens.css" 2>/dev/null

# Remove .gitkeep files
find "$PROJECT_DIR" -name ".gitkeep" -delete

echo ""
echo "Created ${PROJECT_DIR}/"
echo ""
echo "Next steps:"
echo "  1. Run: pnpm install"
echo "  2. Import in your app: import { SmartTextbox } from '@coreui/ui-${PROJECT_NAME}'"
echo "  3. To override a component, create:"
echo "     ${PROJECT_DIR}/src/overrides/SmartTextbox.tsx"
echo "  4. Then uncomment the export in ${PROJECT_DIR}/src/index.ts"
echo ""
