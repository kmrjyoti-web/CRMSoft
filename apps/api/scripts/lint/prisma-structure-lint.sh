#!/bin/bash
# scripts/lint/prisma-structure-lint.sh
# Sprint G — Prisma File Structure Lint
#
# Enforces the prismaSchemaFolder layout introduced in Sprint F.
# Run: bash scripts/lint/prisma-structure-lint.sh
# Exit code 0 = pass, 1 = one or more errors.
#
# Rules:
#   1. prisma/schemas/ directory must NOT exist (deleted in Sprint F)
#   2. Every approved DB folder must have _base.prisma
#   3. No .prisma files outside approved folders
#   4. generator/datasource blocks only in _base.prisma files
#   5. No references to old prisma/schemas/ path in codebase
#   6. prismaSchemaFolder preview feature declared in all _base.prisma files
#   7. (WARNING) Model @@map prefix matches expected folder (prefix check)

set -euo pipefail

ERRORS=0
WARNINGS=0

APPROVED_FOLDERS="prisma/identity/v1 prisma/platform/v1 prisma/working/v1 prisma/marketplace/v1 prisma/platform-console/v1 prisma/global/v1 prisma/demo/v1"

echo "╔══════════════════════════════════════════╗"
echo "║  Prisma File Structure Lint              ║"
echo "║  Sprint G — CRMSoft Architecture v2     ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ─── Rule 1: prisma/schemas/ must NOT exist ───────────────────────────────────
if [ -d "prisma/schemas" ]; then
  echo "❌ RULE 1 FAIL: prisma/schemas/ directory exists — was deleted in Sprint F"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ Rule 1: prisma/schemas/ directory absent"
fi

# ─── Rule 2: Every approved DB folder has _base.prisma ───────────────────────
for folder in $APPROVED_FOLDERS; do
  if [ ! -f "$folder/_base.prisma" ]; then
    echo "❌ RULE 2 FAIL: $folder/_base.prisma missing"
    ERRORS=$((ERRORS + 1))
  else
    echo "✅ Rule 2: $folder/_base.prisma exists"
  fi
done

# ─── Rule 3: No .prisma files outside approved folders ───────────────────────
EXCLUDE_ARGS=""
for folder in $APPROVED_FOLDERS; do
  EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude-dir=${folder#prisma/}"
done

STRAY_FILES=$(find prisma/ -name "*.prisma" \
  | grep -v "prisma/identity/v1/" \
  | grep -v "prisma/platform/v1/" \
  | grep -v "prisma/working/v1/" \
  | grep -v "prisma/marketplace/v1/" \
  | grep -v "prisma/platform-console/v1/" \
  | grep -v "prisma/global/v1/" \
  | grep -v "prisma/demo/v1/" \
  || true)

if [ -n "$STRAY_FILES" ]; then
  echo "❌ RULE 3 FAIL: .prisma files found outside approved folders:"
  echo "$STRAY_FILES" | sed 's/^/    /'
  ERRORS=$((ERRORS + 1))
else
  echo "✅ Rule 3: No stray .prisma files outside approved folders"
fi

# ─── Rule 4: generator/datasource only in _base.prisma ───────────────────────
RULE4_FAIL=0
for folder in $APPROVED_FOLDERS; do
  if [ ! -d "$folder" ]; then continue; fi
  NON_BASE=$(find "$folder" -name "*.prisma" ! -name "_base.prisma" \
    -exec grep -lE "^generator[[:space:]]|^datasource[[:space:]]" {} \; 2>/dev/null || true)
  if [ -n "$NON_BASE" ]; then
    echo "❌ RULE 4 FAIL: generator/datasource block found outside _base.prisma in $folder:"
    echo "$NON_BASE" | sed 's/^/    /'
    ERRORS=$((ERRORS + 1))
    RULE4_FAIL=1
  fi
done
[ "$RULE4_FAIL" -eq 0 ] && echo "✅ Rule 4: generator/datasource only in _base.prisma files"

# ─── Rule 5: No old prisma/schemas/ references in codebase ───────────────────
OLD_REFS=$(grep -rn "prisma/schemas/" . \
  --include="*.ts" \
  --include="*.yml" \
  --include="*.sh" \
  --include="*.json" \
  2>/dev/null \
  | grep -v "node_modules" \
  | grep -v ".git/" \
  | grep -v "docs/health-reports/" \
  | grep -v "docs/discovery/" \
  | grep -v "scripts/lint/prisma-structure-lint.sh" \
  || true)

if [ -n "$OLD_REFS" ]; then
  echo "❌ RULE 5 FAIL: Old prisma/schemas/ references found in codebase:"
  echo "$OLD_REFS" | sed 's/^/    /'
  ERRORS=$((ERRORS + 1))
else
  echo "✅ Rule 5: No prisma/schemas/ references in code/CI/scripts"
fi

# ─── Rule 6: prismaSchemaFolder in all _base.prisma files ────────────────────
RULE6_FAIL=0
for folder in $APPROVED_FOLDERS; do
  if [ ! -f "$folder/_base.prisma" ]; then continue; fi
  if ! grep -q "prismaSchemaFolder" "$folder/_base.prisma" 2>/dev/null; then
    echo "❌ RULE 6 FAIL: prismaSchemaFolder preview feature missing in $folder/_base.prisma"
    ERRORS=$((ERRORS + 1))
    RULE6_FAIL=1
  fi
done
[ "$RULE6_FAIL" -eq 0 ] && echo "✅ Rule 6: prismaSchemaFolder declared in all _base.prisma files"

# ─── Rule 7: Model @@map prefix matches expected folder (WARNING) ─────────────
check_prefix() {
  local folder=$1
  local allowed_regex=$2
  local label=$3
  if [ ! -d "$folder" ]; then return; fi

  WRONG=$(grep -h "@@map" "$folder"/*.prisma 2>/dev/null \
    | grep -oE '"[^"]+"' \
    | grep -vE "$allowed_regex" \
    | grep -vE '"_prisma_' \
    || true)
  if [ -n "$WRONG" ]; then
    echo "⚠  Rule 7 WARNING: Unexpected @@map prefix in $label ($folder):"
    echo "$WRONG" | sed 's/^/    /'
    WARNINGS=$((WARNINGS + 1))
  fi
}

check_prefix "prisma/identity/v1"          '^"(gv_usr_|gv_cfg_|gv_aud_|gv_lic_)' "IdentityDB"
check_prefix "prisma/platform/v1"          '^"(gv_cfg_|gv_qa_|gv_mkt_|gv_lic_|soft_|gv_pay_|gv_ven_|gv_aud_|gv_doc_)' "PlatformDB"
check_prefix "prisma/working/v1"           '^"(gv_crm_|gv_sal_|gv_inv_|gv_acc_|gv_pay_|gv_tax_|gv_hr_|gv_wf_|gv_not_|gv_rpt_|gv_doc_|gv_cmn_|gv_aud_|gv_cfg_|gv_qa_|gv_mkt_)' "WorkingDB"
check_prefix "prisma/marketplace/v1"       '^"(gv_mkt_)' "MarketplaceDB"
check_prefix "prisma/platform-console/v1"  '^"(pc_|gv_)' "PlatformConsoleDB"
check_prefix "prisma/global/v1"            '^"(gl_)' "GlobalReferenceDB"
# DemoDB mirrors WorkingDB exactly — same prefix rules apply
check_prefix "prisma/demo/v1"             '^"(gv_crm_|gv_sal_|gv_inv_|gv_acc_|gv_pay_|gv_tax_|gv_hr_|gv_wf_|gv_not_|gv_rpt_|gv_doc_|gv_cmn_|gv_aud_|gv_cfg_|gv_qa_|gv_mkt_)' "DemoDB"

echo "✅ Rule 7: Prefix check complete"

# ─── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════"
printf "  Errors:   %d\n" "$ERRORS"
printf "  Warnings: %d\n" "$WARNINGS"
echo "════════════════════════════════════════════"

if [ "$ERRORS" -gt 0 ]; then
  echo ""
  echo "FAIL — $ERRORS rule(s) violated. Fix before merging."
  exit 1
fi

if [ "$WARNINGS" -gt 0 ]; then
  echo ""
  echo "PASS (with $WARNINGS warning(s)) — review warnings above."
fi

echo ""
echo "Prisma structure lint passed. ✅"
exit 0
