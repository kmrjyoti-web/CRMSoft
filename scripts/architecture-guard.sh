#!/bin/bash
# scripts/architecture-guard.sh
# Layer 2: Pre-commit architecture guard
# Runs on every git commit — must complete in <10 seconds
# Blocks hard violations, warns on soft ones

set -e

ERRORS=0
WARNINGS=0

echo "🛡️  Architecture Guard — checking..."

# ═══ RULE 1: No trade-specific tables for common entities ═══
TRADE_TABLES=$(grep -rn "^model Pharma\|^model Sw\|^model Tour\|^model Restaurant\|^model Retail" \
  Application/backend/prisma/*/v1/*.prisma 2>/dev/null | grep -iE "Contact|Lead|Invoice|Order|User|Product\b" || true)
if [ -n "$TRADE_TABLES" ]; then
  echo "  ❌ BLOCKED: Trade-specific table for common entity found"
  echo "     Use verticalData JSONB instead"
  echo "     $TRADE_TABLES"
  ERRORS=$((ERRORS+1))
fi

# ═══ RULE 2: core/ must NOT import from vertical/ ═══
CROSS_IMPORT=$(grep -rn "from.*['\"].*vertical/" Application/backend/src/modules/core/ \
  --include="*.ts" 2>/dev/null | grep -v spec | grep -v node_modules || true)
if [ -n "$CROSS_IMPORT" ]; then
  echo "  ❌ BLOCKED: core/ imports from vertical/"
  echo "     core/ must be trade-agnostic"
  echo "     $CROSS_IMPORT"
  ERRORS=$((ERRORS+1))
fi

# ═══ RULE 3: domain/ must be framework-free ═══
DOMAIN_FW=$(grep -rn "from '@nestjs\|from '@prisma\|from 'express'" \
  Application/backend/src/modules/*/domain/ \
  Application/backend/src/modules/*/*/domain/ \
  --include="*.ts" 2>/dev/null | grep -v node_modules | grep -v spec || true)
if [ -n "$DOMAIN_FW" ]; then
  echo "  ❌ BLOCKED: Framework import in domain/ folder"
  echo "     domain/ must be pure TypeScript"
  echo "     $DOMAIN_FW"
  ERRORS=$((ERRORS+1))
fi

# ═══ RULE 4: Common entities should have verticalData ═══
for MODEL in Contact Lead Product; do
  HAS_VD=$(grep -A 40 "^model $MODEL " Application/backend/prisma/*/v1/*.prisma 2>/dev/null | grep "verticalData" || true)
  if [ -z "$HAS_VD" ]; then
    echo "  ⚠️  WARNING: $MODEL missing verticalData JSONB column"
    WARNINGS=$((WARNINGS+1))
  fi
done

# ═══ RULE 5: No direct component duplication across portals ═══
STAGED_TSX=$(git diff --cached --name-only 2>/dev/null | grep "\.tsx$" || true)
if [ -n "$STAGED_TSX" ]; then
  for FILE in $STAGED_TSX; do
    BASENAME=$(basename "$FILE")
    COUNT=$(find . -name "$BASENAME" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$COUNT" -gt 2 ]; then
      echo "  ⚠️  WARNING: $BASENAME exists in $COUNT locations — possible duplication"
      WARNINGS=$((WARNINGS+1))
    fi
  done
fi

# ═══ RULE 6: Handlers must have try-catch ═══
STAGED_HANDLERS=$(git diff --cached --name-only 2>/dev/null | grep "handlers/.*\.ts$" | grep -v spec || true)
for HANDLER in $STAGED_HANDLERS; do
  if [ -f "$HANDLER" ]; then
    HAS_TRY=$(grep -c "try {" "$HANDLER" 2>/dev/null || echo "0")
    if [ "$HAS_TRY" -eq 0 ]; then
      echo "  ⚠️  WARNING: $HANDLER missing try-catch"
      WARNINGS=$((WARNINGS+1))
    fi
  fi
done

# ═══ RULE 7: No credentials in code ═══
CREDS=$(git diff --cached --diff-filter=ACM -p 2>/dev/null | grep -iE "password\s*=\s*['\"]|apiKey\s*=\s*['\"]|secret\s*=\s*['\"]" | grep -v "spec\|test\|mock\|example\|\.env\." | head -5 || true)
if [ -n "$CREDS" ]; then
  echo "  ❌ BLOCKED: Possible credentials in code"
  echo "     Use environment variables or encrypted DB storage"
  ERRORS=$((ERRORS+1))
fi

# ═══ RULE 8: Branch protection — no direct commits to main ═══
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
if [ "$CURRENT_BRANCH" = "main" ]; then
  echo "  ❌ BLOCKED: Direct commit to main branch"
  echo "     Use feature/* branch → PR to develop → release/* → main"
  ERRORS=$((ERRORS+1))
fi

# ═══ RULE 9: Branch naming convention ═══
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "develop" ]; then
  if ! echo "$CURRENT_BRANCH" | grep -qE "^(feature/|release/|hotfix/|partner/)"; then
    echo "  ⚠️  WARNING: Branch '$CURRENT_BRANCH' doesn't follow GitFlow naming"
    echo "     Use: feature/*, release/*, hotfix/*, partner/*"
    WARNINGS=$((WARNINGS+1))
  fi
fi

# ═══ RULE 10: New module must have tests ═══
STAGED_MODULES=$(git diff --cached --name-only 2>/dev/null | grep "\.module\.ts$" | grep -v spec | grep -v node_modules || true)
for MODULE_FILE in $STAGED_MODULES; do
  MODULE_DIR=$(dirname "$MODULE_FILE")
  MODULE_NAME=$(basename "$MODULE_DIR")
  SPEC_COUNT=$(find "$MODULE_DIR" -name "*.spec.ts" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$SPEC_COUNT" -eq 0 ]; then
    echo "  ❌ BLOCKED: New module $MODULE_NAME has zero test files"
    echo "     Every module MUST have at least one .spec.ts file"
    ERRORS=$((ERRORS+1))
  fi
done

# ═══ RULE 11: Every handler should have a spec ═══
STAGED_NEW_HANDLERS=$(git diff --cached --name-only --diff-filter=A 2>/dev/null | grep "handlers/.*\.ts$" | grep -v "\.spec\." || true)
for HANDLER in $STAGED_NEW_HANDLERS; do
  SPEC_FILE="${HANDLER%.ts}.spec.ts"
  if [ ! -f "$SPEC_FILE" ]; then
    echo "  ⚠️  WARNING: New handler $(basename $HANDLER) has no matching .spec.ts"
    WARNINGS=$((WARNINGS+1))
  fi
done

# ═══ RULE 12: Vertical modules must have schema validation test ═══
STAGED_VERTICAL=$(git diff --cached --name-only 2>/dev/null | grep "modules/vertical/" | grep -v spec | grep -v node_modules | head -1 || true)
if [ -n "$STAGED_VERTICAL" ]; then
  VERTICAL_NAME=$(echo "$STAGED_VERTICAL" | sed 's|.*modules/vertical/||' | cut -d'/' -f1)
  SCHEMA_TEST=$(find "Application/backend/src/modules/vertical/$VERTICAL_NAME" \
    -name "*schema*.spec.ts" -o -name "*validation*.spec.ts" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$SCHEMA_TEST" -eq 0 ]; then
    echo "  ⚠️  WARNING: vertical/$VERTICAL_NAME missing schema validation test"
    WARNINGS=$((WARNINGS+1))
  fi
fi

# ═══ RESULT ═══
echo ""
if [ "$ERRORS" -gt 0 ]; then
  echo "  ❌ COMMIT BLOCKED: $ERRORS violation(s) found"
  echo "  Fix the issues above and try again."
  exit 1
elif [ "$WARNINGS" -gt 0 ]; then
  echo "  ⚠️  $WARNINGS warning(s) — commit allowed, please review"
  exit 0
else
  echo "  ✅ All architecture checks passed"
  exit 0
fi
