#!/usr/bin/env bash
# test-generator.sh — CRMSoft Test Generator & Coverage Gap Skill
# Usage: bash scripts/skills/test-generator.sh [mode] [target-path]
# Modes: generate | audit | fix

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MODE="${1:-audit}"
TARGET="${2:-$REPO_ROOT/Application/backend/src}"
DATE=$(date +%Y-%m-%d)
REPORT_DIR="$REPO_ROOT/docs/testing"
REPORT_FILE="$REPORT_DIR/test-coverage-gap-${DATE}.md"
mkdir -p "$REPORT_DIR"

banner() { echo ""; echo "━━━ $* ━━━"; }

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  CRMSoft Test Generator (PM CLI Phase 2)                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo "  Mode: $MODE | Target: $TARGET"

# ─── AUDIT: Coverage gap analysis ────────────────────────────────────────────
do_audit() {
  banner "Scanning for untested handlers, services, repositories"

  # Count TypeScript source files
  local SRC_COUNT
  SRC_COUNT=$(find "$TARGET" -name "*.ts" ! -name "*.spec.ts" ! -name "*.d.ts" \
    ! -path "*/node_modules/*" ! -path "*/__tests__/*" 2>/dev/null | wc -l | tr -d ' ')

  # Count spec files
  local SPEC_COUNT
  SPEC_COUNT=$(find "$TARGET" -name "*.spec.ts" ! -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ')

  # Find handlers without spec files
  local HANDLERS_UNTESTED=()
  while IFS= read -r handler; do
    local base="${handler%.handler.ts}"
    local spec="${base}.handler.spec.ts"
    local spec_alt="${handler%.ts}.spec.ts"
    if [ ! -f "$spec" ] && [ ! -f "$spec_alt" ]; then
      # Check __tests__ directory
      local dir
      dir=$(dirname "$handler")
      local fname
      fname=$(basename "${handler%.handler.ts}")
      if ! find "$dir/__tests__" -name "*${fname}*" 2>/dev/null | grep -q .; then
        HANDLERS_UNTESTED+=("$handler")
      fi
    fi
  done < <(find "$TARGET" -name "*.handler.ts" ! -path "*/node_modules/*" 2>/dev/null)

  # Find services without spec files
  local SERVICES_UNTESTED=()
  while IFS= read -r svc; do
    local dir
    dir=$(dirname "$svc")
    local fname
    fname=$(basename "${svc%.service.ts}")
    if ! find "$dir" "$dir/__tests__" -name "*${fname}*.spec.ts" 2>/dev/null | grep -q .; then
      SERVICES_UNTESTED+=("$svc")
    fi
  done < <(find "$TARGET" -name "*.service.ts" ! -path "*/node_modules/*" ! -name "*.d.ts" 2>/dev/null)

  # Detect vertical modules (modules/vertical/)
  local VERTICAL_MODULES
  VERTICAL_MODULES=$(find "$TARGET" -type d -name "vertical" 2>/dev/null | head -3)

  # Detect multi-tenant handlers (have tenantId in their code)
  local MULTITENANT_FILES
  MULTITENANT_FILES=$(grep -rln "tenantId" "$TARGET" --include="*.handler.ts" 2>/dev/null | wc -l | tr -d ' ')

  banner "Scan Results"
  echo "  Source files (.ts, excl spec): $SRC_COUNT"
  echo "  Spec files:                    $SPEC_COUNT"
  echo "  Coverage ratio:                $(( SPEC_COUNT * 100 / (SRC_COUNT + 1) ))%"
  echo "  Untested handlers:             ${#HANDLERS_UNTESTED[@]}"
  echo "  Untested services:             ${#SERVICES_UNTESTED[@]}"
  echo "  Multi-tenant handlers:         $MULTITENANT_FILES"
  echo "  Vertical modules:              $(echo "$VERTICAL_MODULES" | grep -c . || echo 0)"

  banner "Writing Coverage Gap Report"
  cat > "$REPORT_FILE" << REOF
# Test Coverage Gap Report — CRMSoft

**Date:** $DATE
**Target:** $TARGET
**Mode:** $MODE

---

## Summary

| Metric | Count |
|--------|-------|
| Source files (.ts) | $SRC_COUNT |
| Spec files (.spec.ts) | $SPEC_COUNT |
| Coverage ratio | $(( SPEC_COUNT * 100 / (SRC_COUNT + 1) ))% |
| Untested handlers | ${#HANDLERS_UNTESTED[@]} |
| Untested services | ${#SERVICES_UNTESTED[@]} |
| Multi-tenant handlers | $MULTITENANT_FILES |

---

## Untested Handlers (generate tests for these first)

REOF

  if [ ${#HANDLERS_UNTESTED[@]} -eq 0 ]; then
    echo "_All handlers have spec files._" >> "$REPORT_FILE"
  else
    for h in "${HANDLERS_UNTESTED[@]}"; do
      local rel="${h#$REPO_ROOT/}"
      echo "- \`$rel\`" >> "$REPORT_FILE"
    done
  fi

  cat >> "$REPORT_FILE" << REOF

---

## Untested Services (priority 2)

REOF
  local SHOWN=0
  for s in "${SERVICES_UNTESTED[@]}"; do
    [ $SHOWN -ge 20 ] && break
    local rel="${s#$REPO_ROOT/}"
    echo "- \`$rel\`" >> "$REPORT_FILE"
    SHOWN=$((SHOWN+1))
  done
  [ ${#SERVICES_UNTESTED[@]} -eq 0 ] && echo "_All services have spec files._" >> "$REPORT_FILE"

  cat >> "$REPORT_FILE" << REOF

---

## Test Template (CRMSoft CQRS Pattern)

\`\`\`typescript
// Generated template — adapt to your handler
import { Test, TestingModule } from '@nestjs/testing';
import { XxxHandler } from './xxx.handler';
import { createMockPrismaService } from '../../../test/helpers/mock-prisma';

describe('XxxHandler', () => {
  let handler: XxxHandler;
  let mockPrisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(async () => {
    mockPrisma = createMockPrismaService();
    const module: TestingModule = await Test.createTestingModule({
      providers: [XxxHandler, { provide: 'PRISMA', useValue: mockPrisma }],
    }).compile();
    handler = module.get<XxxHandler>(XxxHandler);
  });

  // 1. Happy path (MANDATORY)
  it('should execute successfully', async () => {
    // arrange + act + assert
  });

  // 2. Error cases (MANDATORY — min 2)
  it('should fail when tenant not found', async () => { });
  it('should fail with invalid input', async () => { });

  // 3. Tenant isolation (MANDATORY for common modules)
  it('should not return data from other tenants', async () => { });

  // 4. verticalData (MANDATORY for common modules)
  it('should validate verticalData for SOFTWARE_VENDOR', async () => { });
  it('should accept empty verticalData for GENERAL', async () => { });
});
\`\`\`

---

## Next Steps

1. Run \`pnpm test:generate src/modules/<name>\` to scaffold tests for a specific module
2. Run \`pnpm test:api\` after generating to verify tests compile
3. Target: 60% coverage minimum → 80% over time

---
_Generated by PM CLI Phase 2 Test Generator Skill_
REOF

  echo "  ✅ Report: docs/testing/test-coverage-gap-${DATE}.md"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Coverage: $(( SPEC_COUNT * 100 / (SRC_COUNT + 1) ))% | Gaps: ${#HANDLERS_UNTESTED[@]} handlers, ${#SERVICES_UNTESTED[@]} services"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# ─── GENERATE: Scaffold test file for a specific module ──────────────────────
do_generate() {
  local MOD_PATH="$TARGET"
  banner "Generating test scaffolds for: $MOD_PATH"

  local GENERATED=0
  while IFS= read -r handler; do
    local dir
    dir=$(dirname "$handler")
    local fname
    fname=$(basename "$handler" .ts)
    local spec_file="$dir/__tests__/${fname}.spec.ts"

    if [ -f "$spec_file" ]; then
      echo "  skip (exists): $spec_file"
      continue
    fi

    local CLASS_NAME
    CLASS_NAME=$(grep -m1 "export class" "$handler" 2>/dev/null | sed 's/.*export class \([A-Za-z]*\).*/\1/' || echo "UnknownHandler")

    mkdir -p "$dir/__tests__"
    cat > "$spec_file" << SPECEOF
import { Test, TestingModule } from '@nestjs/testing';
import { ${CLASS_NAME} } from '../${fname}';

describe('${CLASS_NAME}', () => {
  let handler: ${CLASS_NAME};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [${CLASS_NAME}],
    }).compile();
    handler = module.get<${CLASS_NAME}>(${CLASS_NAME});
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  // TODO: Happy path
  it('should execute successfully', async () => {
    // arrange + act + assert
    expect(true).toBe(true); // replace with real test
  });

  // TODO: Error cases (mandatory — add at least 2)
  it('should fail when tenant not found', async () => {
    // arrange + act + assert
  });

  it('should fail with invalid input', async () => {
    // arrange + act + assert
  });

  // TODO: Tenant isolation (if multi-tenant)
  it('should not return data from other tenants', async () => {
    // arrange + act + assert
  });
});
SPECEOF
    echo "  ✅ Generated: $spec_file"
    GENERATED=$((GENERATED+1))
  done < <(find "$MOD_PATH" -name "*.handler.ts" ! -path "*/node_modules/*" 2>/dev/null)

  echo ""
  echo "  Generated $GENERATED test scaffold(s)."
}

# ─── FIX: Common test issue fixes ─────────────────────────────────────────────
do_fix() {
  banner "Checking for common test issues"

  # Check for missing try-catch in handlers
  local NO_TRY
  NO_TRY=$(grep -rln --include="*.handler.ts" "async execute" \
    "$TARGET" 2>/dev/null | while read f; do
    grep -q "try {" "$f" || echo "$f"
  done | head -10)

  if [ -n "$NO_TRY" ]; then
    echo "  ⚠️  Handlers missing try-catch (run pnpm add-try-catch):"
    echo "$NO_TRY" | sed 's/^/    /'
  else
    echo "  ✅ All handlers appear to have try-catch"
  fi

  # Check for unknown typed catches
  local BAD_CATCH
  BAD_CATCH=$(grep -rn --include="*.ts" "catch (e)" "$TARGET" 2>/dev/null | \
    grep -v "catch (e: unknown)" | head -5 || true)
  if [ -n "$BAD_CATCH" ]; then
    local CNT
    CNT=$(echo "$BAD_CATCH" | wc -l | tr -d ' ')
    echo "  ⚠️  $CNT catch(e) without : unknown type annotation"
  else
    echo "  ✅ Error catches properly typed"
  fi

  echo "  ℹ️  Run pnpm test:api to verify all tests compile"
}

# ─── DISPATCH ────────────────────────────────────────────────────────────────
case "$MODE" in
  audit)    do_audit ;;
  generate) do_generate ;;
  fix)      do_fix ;;
  *)
    echo "Usage: bash scripts/skills/test-generator.sh [audit|generate|fix] [path]"
    exit 1
    ;;
esac
