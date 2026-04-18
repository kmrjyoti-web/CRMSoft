#!/bin/bash
# scripts/weekly-health-check.sh
# Layer 5: Weekly health check — runs Sunday 6 AM IST (via CI scheduled workflow)
# Also runnable manually: bash scripts/weekly-health-check.sh

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

DATE=$(date +%Y-%m-%d)
REPORT_DIR="docs/health-reports"
REPORT_FILE="$REPORT_DIR/$DATE.md"

mkdir -p "$REPORT_DIR"

echo "# CRMSoft Health Report — $DATE" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "## Module stats" >> "$REPORT_FILE"

# 1. Module count
MODULES=$(find Application/backend/src -name "*.module.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "- Total modules: $MODULES" >> "$REPORT_FILE"

WL_MODULES=$(find WhiteLabel/wl-api/src -name "*.module.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "- WhiteLabel modules: $WL_MODULES" >> "$REPORT_FILE"

VERTICAL_MODULES=$(find Application/backend/src/modules/vertical -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
echo "- Vertical modules: $VERTICAL_MODULES" >> "$REPORT_FILE"

# 2. Test count
TESTS=$(find Application/backend/src -name "*.spec.ts" 2>/dev/null | wc -l | tr -d ' ')
WL_TESTS=$(find WhiteLabel/wl-api/src -name "*.spec.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "- Backend spec files: $TESTS" >> "$REPORT_FILE"
echo "- WL-API spec files: $WL_TESTS" >> "$REPORT_FILE"

# 3. any type count
ANY_COUNT=$(grep -rn ": any\b\|as any\b" Application/backend/src --include="*.ts" \
  --exclude-dir=node_modules --exclude-dir=dist \
  --exclude="*.spec.ts" --exclude="*.test.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "- TypeScript 'any' types: $ANY_COUNT (threshold: 2200)" >> "$REPORT_FILE"

# 4. Lines of code (backend)
LOC=$(find Application/backend/src -name "*.ts" -not -name "*.spec.*" 2>/dev/null | \
  xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
echo "- Backend LoC (non-test): $LOC" >> "$REPORT_FILE"

# 5. Endpoints
ENDPOINTS=$(grep -rn "@Get\|@Post\|@Patch\|@Delete\|@Put" Application/backend/src \
  --include="*.controller.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "- API endpoints: $ENDPOINTS" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "## Architecture violations" >> "$REPORT_FILE"

# Cross imports: core → vertical
CROSS=$(grep -rn "from.*vertical/" Application/backend/src/modules/core/ \
  --include="*.ts" 2>/dev/null | grep -v spec | wc -l | tr -d ' ')
STATUS_CROSS="✅"
[ "$CROSS" -gt 0 ] && STATUS_CROSS="❌"
echo "- core/ → vertical/ imports: $CROSS (must be 0) $STATUS_CROSS" >> "$REPORT_FILE"

# Domain framework imports
DOMAIN_FW=$(grep -rn "@nestjs\|@prisma\|from 'express'" \
  Application/backend/src/modules/*/domain/ \
  Application/backend/src/modules/*/*/domain/ \
  --include="*.ts" 2>/dev/null | grep -v spec | wc -l | tr -d ' ')
STATUS_FW="✅"
[ "$DOMAIN_FW" -gt 0 ] && STATUS_FW="❌"
echo "- Framework imports in domain/: $DOMAIN_FW (must be 0) $STATUS_FW" >> "$REPORT_FILE"

# Trade-specific tables for common entities
TRADE_TABLES=$(grep -rn "^model Pharma\|^model Sw\|^model Tour\|^model Restaurant\|^model Retail" \
  Application/backend/prisma/*/v1/*.prisma 2>/dev/null | grep -iE "Contact|Lead|Invoice|Order|User|Product\b" | wc -l | tr -d ' ')
STATUS_TT="✅"
[ "$TRADE_TABLES" -gt 0 ] && STATUS_TT="❌"
echo "- Trade tables for common entities: $TRADE_TABLES (must be 0) $STATUS_TT" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "## Potential duplication" >> "$REPORT_FILE"

DUP_FOUND=0
while IFS= read -r line; do
  COUNT=$(echo "$line" | awk '{print $1}')
  NAME=$(echo "$line" | awk '{print $2}')
  if [ "$COUNT" -gt 2 ] && [ -n "$NAME" ]; then
    echo "- ⚠️  $NAME appears $COUNT times" >> "$REPORT_FILE"
    DUP_FOUND=1
  fi
done < <(find . -path "*/components/*" -name "*.tsx" -not -path "*/node_modules/*" 2>/dev/null | \
  sed 's|.*/||' | sort | uniq -c | sort -rn | head -10)

[ "$DUP_FOUND" -eq 0 ] && echo "- ✅ No obvious duplication found" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "## Barrel exports (index.ts)" >> "$REPORT_FILE"

MISSING_BARREL=0
for dir in Application/backend/src/modules/*/; do
  if [ ! -f "${dir}index.ts" ]; then
    echo "- ❌ $(basename $dir)" >> "$REPORT_FILE"
    MISSING_BARREL=1
  fi
done
[ "$MISSING_BARREL" -eq 0 ] && echo "- ✅ All top-level modules have index.ts" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "## Handlers without try-catch" >> "$REPORT_FILE"

NO_TRY=0
HANDLER_TOTAL=0
HANDLER_COVERED=0
for handler in $(find Application/backend/src/modules -name "*.handler.ts" -not -name "*.spec.ts" 2>/dev/null); do
  HANDLER_TOTAL=$((HANDLER_TOTAL+1))
  HAS_TRY=$(grep -c "try {" "$handler" 2>/dev/null | tr -d ' \n' || echo "0")
  if [ "$HAS_TRY" -eq 0 ]; then
    echo "- ⚠️  $(basename $handler)" >> "$REPORT_FILE"
    NO_TRY=1
  else
    HANDLER_COVERED=$((HANDLER_COVERED+1))
  fi
done
[ "$NO_TRY" -eq 0 ] && echo "- ✅ All $HANDLER_TOTAL handlers have try-catch" >> "$REPORT_FILE"
[ "$NO_TRY" -eq 1 ] && echo "- Coverage: $HANDLER_COVERED / $HANDLER_TOTAL handlers" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "## verticalData on common entities" >> "$REPORT_FILE"

VERTICAL_DATA_MISSING=0
for entity in Contact Lead Product Invoice SaleOrder PurchaseOrder; do
  # Search in split schemas first, then combined
  HAS_VD=$(grep -rn "verticalData" Application/backend/prisma/*/v1/ 2>/dev/null | \
    grep -i "vertical_data\|verticalData" | wc -l | tr -d ' ')
  if [ "$HAS_VD" -eq 0 ]; then
    echo "- ❌ $entity missing verticalData" >> "$REPORT_FILE"
    VERTICAL_DATA_MISSING=1
  fi
done
# Specific per-entity check
ENTITIES_WITH_VD=0
for entity in Contact Lead Product Invoice SaleOrder PurchaseOrder; do
  SCHEMA_FILE=""
  # Find which schema file contains this model
  for f in Application/backend/prisma/*/v1/*.prisma; do
    if grep -q "^model $entity " "$f" 2>/dev/null; then
      SCHEMA_FILE="$f"
      break
    fi
  done
  if [ -n "$SCHEMA_FILE" ]; then
    # Check if verticalData is within 80 lines after the model declaration
    FOUND=$(awk "/^model $entity /,/^}/" "$SCHEMA_FILE" 2>/dev/null | grep -c "verticalData" || echo "0")
    if [ "$FOUND" -gt 0 ]; then
      ENTITIES_WITH_VD=$((ENTITIES_WITH_VD+1))
    else
      echo "- ❌ $entity: verticalData missing" >> "$REPORT_FILE"
      VERTICAL_DATA_MISSING=1
    fi
  fi
done
[ "$VERTICAL_DATA_MISSING" -eq 0 ] && echo "- ✅ All 6 common entities have verticalData JSONB" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "## Untested modules" >> "$REPORT_FILE"

UNTESTED=0
for dir in $(find Application/backend/src/modules -maxdepth 3 -name "*.module.ts" -exec dirname {} \; 2>/dev/null); do
  SPECS=$(find "$dir" -name "*.spec.ts" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$SPECS" -eq 0 ]; then
    echo "- ⚠️  $(basename $dir)" >> "$REPORT_FILE"
    UNTESTED=1
  fi
done
[ "$UNTESTED" -eq 0 ] && echo "- ✅ All modules have at least one spec file" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "## Health score" >> "$REPORT_FILE"

# ── Scoring ────────────────────────────────────────────────────────────────
# Deductions (max -85)
SCORE=100
[ "$CROSS" -gt 0 ]          && SCORE=$((SCORE-30))   # arch violation: critical
[ "$DOMAIN_FW" -gt 0 ]      && SCORE=$((SCORE-20))   # arch violation: critical
[ "$TRADE_TABLES" -gt 0 ]   && SCORE=$((SCORE-20))   # arch violation: critical
[ "$ANY_COUNT" -gt 2200 ]   && SCORE=$((SCORE-10))   # type safety
[ "$UNTESTED" -eq 1 ]       && SCORE=$((SCORE-10))   # test coverage
[ "$NO_TRY" -eq 1 ]         && SCORE=$((SCORE-5))    # error handling
[ "$DUP_FOUND" -eq 1 ]      && SCORE=$((SCORE-5))    # duplication

# Bonuses (max +15 — reward work already done)
[ "$MISSING_BARREL" -eq 0 ]        && SCORE=$((SCORE+5))   # all barrel exports present
[ "$VERTICAL_DATA_MISSING" -eq 0 ] && SCORE=$((SCORE+5))   # verticalData on common entities
[ "$SCORE" -gt 100 ]               && SCORE=100             # cap at 100

GRADE="🟢 Healthy"
[ "$SCORE" -lt 70 ] && GRADE="🟡 Needs attention"
[ "$SCORE" -lt 50 ] && GRADE="🔴 Urgent"

echo "- Score: $SCORE/100 — $GRADE" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$REPORT_FILE"

echo ""
echo "✅ Health report saved: $REPORT_FILE"
echo ""
cat "$REPORT_FILE"
