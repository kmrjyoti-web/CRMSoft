#!/bin/bash

# Usage: ./scripts/create-override.sh crm SmartTextbox
# Creates: packages/ui-crm/src/overrides/SmartTextbox.tsx

PROJECT_NAME=$1
COMPONENT_NAME=$2

if [ -z "$PROJECT_NAME" ] || [ -z "$COMPONENT_NAME" ]; then
  echo "Usage: ./scripts/create-override.sh <project> <ComponentName>"
  echo "Example: ./scripts/create-override.sh crm SmartTextbox"
  exit 1
fi

PROJECT_DIR="packages/ui-${PROJECT_NAME}"
OVERRIDE_DIR="${PROJECT_DIR}/src/overrides"
OVERRIDE_FILE="${OVERRIDE_DIR}/${COMPONENT_NAME}.tsx"

if [ ! -d "$PROJECT_DIR" ]; then
  echo "Error: ${PROJECT_DIR} does not exist. Run create-project.sh first."
  exit 1
fi

if [ -f "$OVERRIDE_FILE" ]; then
  echo "Error: ${OVERRIDE_FILE} already exists"
  exit 1
fi

mkdir -p "$OVERRIDE_DIR"

# Generate PascalCase project name from kebab-case
PASCAL_PROJECT=$(echo "$PROJECT_NAME" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1' | sed 's/ //g')

cat > "$OVERRIDE_FILE" << TEMPLATE
import { ${COMPONENT_NAME}, type ${COMPONENT_NAME}Props } from '@coreui/ui-react';

/**
 * ${PASCAL_PROJECT}-specific override of ${COMPONENT_NAME}.
 *
 * This wraps the CoreUI ${COMPONENT_NAME} with project-specific behavior.
 * All standard ${COMPONENT_NAME} props are passed through.
 *
 * Override pattern: WRAP (add behavior, keep base UI)
 * To EXTEND: add new props to the interface below
 * To REPLACE: remove the CoreUI import and build from scratch
 */

// Add project-specific props here:
interface ${PASCAL_PROJECT}${COMPONENT_NAME}Props extends ${COMPONENT_NAME}Props {
  // example: showCompanyLogo?: boolean;
}

export function ${PASCAL_PROJECT}${COMPONENT_NAME}(props: ${PASCAL_PROJECT}${COMPONENT_NAME}Props) {
  // Add project-specific logic here:
  // const { showCompanyLogo, ...rest } = props;

  return (
    <${COMPONENT_NAME}
      {...props}
      // Add project-specific prop overrides:
      // dt={{ ...props.dt, inputtext: { borderLeft: '3px solid red' } }}
    />
  );
}
TEMPLATE

echo ""
echo "Created ${OVERRIDE_FILE}"
echo ""
echo "NOW UPDATE: ${PROJECT_DIR}/src/index.ts"
echo "    Add this line:"
echo ""
echo "    export { ${PASCAL_PROJECT}${COMPONENT_NAME} as ${COMPONENT_NAME} } from './overrides/${COMPONENT_NAME}';"
echo ""
