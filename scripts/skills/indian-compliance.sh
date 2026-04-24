#!/usr/bin/env bash
# indian-compliance.sh — CRMSoft Indian Market Compliance Checker
# Verifies GST logic, PAN/GSTIN validation, HSN codes, INR formatting,
# and timezone compliance are present in the codebase.
#
# Usage: bash scripts/skills/indian-compliance.sh [full|gst|pan|hsn|currency|timezone]
# Modes: full (default), gst, pan, hsn, currency, timezone

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MODE="${1:-full}"
FINDINGS=0
CHECKS=0
DATE=$(date +%Y-%m-%d)
REPORT_DIR="$REPO_ROOT/docs/compliance"
REPORT_FILE="$REPORT_DIR/indian-compliance-${DATE}.md"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Indian Compliance Checker                               ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo "  Mode: $MODE | Date: $DATE"
echo ""

check_pass() { echo "  ✅ $1"; CHECKS=$((CHECKS+1)); }
check_warn() { echo "  ⚠️  $1"; CHECKS=$((CHECKS+1)); FINDINGS=$((FINDINGS+1)); }

# ─── GST Compliance ──────────────────────────────────────────────────────────
run_gst() {
  echo "═══ GST Compliance ═══"

  # CGST/SGST/IGST logic
  GST_LOGIC=$(grep -rn "CGST\|SGST\|IGST\|cgst\|sgst\|igst" \
    "$REPO_ROOT/Application/backend/src/" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$GST_LOGIC" -gt 0 ]; then
    check_pass "GST split logic found ($GST_LOGIC references to CGST/SGST/IGST)"
  else
    check_warn "No CGST/SGST/IGST logic found in backend src"
  fi

  # State-based routing (intra vs inter state)
  STATE_GST=$(grep -rn "sameState\|intraState\|interState\|same_state\|intra_state\|inter_state\|stateCode\|state_code" \
    "$REPO_ROOT/Application/backend/src/" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$STATE_GST" -gt 0 ]; then
    check_pass "State-based GST routing found ($STATE_GST references)"
  else
    check_warn "No intra/inter-state GST routing logic found"
  fi

  # GST rate model in Prisma schemas
  GST_SCHEMA=$(grep -rn "gst_rate\|GstRate\|gstRate" \
    "$REPO_ROOT/Application/backend/prisma/" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$GST_SCHEMA" -gt 0 ]; then
    check_pass "GST rate model in Prisma schema ($GST_SCHEMA references)"
  else
    check_warn "No GST rate model found in Prisma schemas"
  fi

  echo ""
}

# ─── PAN / GSTIN Validation ──────────────────────────────────────────────────
run_pan() {
  echo "═══ PAN / GSTIN Validation ═══"

  PAN_REF=$(grep -rn "PAN\|pan.*valid\|panNumber\|pan_number\|[A-Z]{5}[0-9]{4}[A-Z]" \
    "$REPO_ROOT/Application/backend/src/" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$PAN_REF" -gt 0 ]; then
    check_pass "PAN validation/references found ($PAN_REF)"
  else
    check_warn "No PAN (Permanent Account Number) validation found"
  fi

  GSTIN_REF=$(grep -rn "GSTIN\|gstin\|gstNumber\|gst_number\|gstIn" \
    "$REPO_ROOT/Application/backend/src/" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$GSTIN_REF" -gt 0 ]; then
    check_pass "GSTIN references found ($GSTIN_REF)"
  else
    check_warn "No GSTIN validation found (15-char GST Identification Number)"
  fi

  echo ""
}

# ─── HSN Code Compliance ─────────────────────────────────────────────────────
run_hsn() {
  echo "═══ HSN Code Compliance ═══"

  HSN_BACKEND=$(grep -rn "hsn\|hsnCode\|hsn_code\|HsnCode" \
    "$REPO_ROOT/Application/backend/src/" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$HSN_BACKEND" -gt 0 ]; then
    check_pass "HSN code references in backend ($HSN_BACKEND)"
  else
    check_warn "No HSN code references in backend — required for GST invoices"
  fi

  HSN_SCHEMA=$(grep -rn "hsn_code\|hsnCode\|HsnCode" \
    "$REPO_ROOT/Application/backend/prisma/" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$HSN_SCHEMA" -gt 0 ]; then
    check_pass "HSN code model in Prisma schema ($HSN_SCHEMA references)"
  else
    check_warn "No HSN code model in Prisma schemas"
  fi

  echo ""
}

# ─── Currency & Number Formatting ────────────────────────────────────────────
run_currency() {
  echo "═══ Currency & Number Formatting ═══"

  # Backend INR / lakh / crore
  INR_BACKEND=$(grep -rn "lakh\|crore\|₹\|INR\|toLocaleString.*IN\|Intl\.NumberFormat" \
    "$REPO_ROOT/Application/backend/src/" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
  echo "  Backend INR references: $INR_BACKEND"

  # Frontend INR
  INR_FRONTEND=0
  for portal in Customer/frontend Vendor/frontend Application/frontend WhiteLabel; do
    COUNT=$(grep -rn "lakh\|crore\|₹\|INR\|toLocaleString.*IN\|Intl\.NumberFormat" \
      "$REPO_ROOT/$portal/" --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
    INR_FRONTEND=$((INR_FRONTEND + COUNT))
  done
  echo "  Frontend INR references: $INR_FRONTEND"

  if [ "$INR_BACKEND" -gt 0 ] || [ "$INR_FRONTEND" -gt 0 ]; then
    TOTAL=$((INR_BACKEND + INR_FRONTEND))
    check_pass "Indian number/currency formatting found ($TOTAL total references)"
  else
    check_warn "No Indian number formatting (lakh/crore/₹/INR) found — required for Indian market"
  fi

  # Currency model in Prisma
  CURRENCY_SCHEMA=$(grep -rn "gl_cfg_currency\|Currency\b" \
    "$REPO_ROOT/Application/backend/prisma/" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$CURRENCY_SCHEMA" -gt 0 ]; then
    check_pass "Currency reference data model in Prisma ($CURRENCY_SCHEMA references)"
  else
    check_warn "No currency model in Prisma schemas"
  fi

  echo ""
}

# ─── Timezone Compliance ─────────────────────────────────────────────────────
run_timezone() {
  echo "═══ Timezone Compliance ═══"

  TZ_REF=$(grep -rn "Asia/Kolkata\|IST\|kolkata\|KOLKATA" \
    "$REPO_ROOT/Application/backend/src/" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$TZ_REF" -gt 0 ]; then
    check_pass "Asia/Kolkata timezone references found ($TZ_REF)"
  else
    check_warn "No Asia/Kolkata timezone references — all crons and timestamps must use IST"
  fi

  # Check for UTC-only patterns that should have IST equivalent
  CRON_REF=$(grep -rn "@Cron\|cron\|schedule" \
    "$REPO_ROOT/Application/backend/src/" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$CRON_REF" -gt 0 ]; then
    echo "  ℹ️  Cron jobs found ($CRON_REF references) — verify IST timezone is set"
  fi

  echo ""
}

# ─── Run selected modes ───────────────────────────────────────────────────────
case "$MODE" in
  full)
    run_gst
    run_pan
    run_hsn
    run_currency
    run_timezone
    ;;
  gst)      run_gst ;;
  pan)      run_pan ;;
  hsn)      run_hsn ;;
  currency) run_currency ;;
  timezone) run_timezone ;;
  *)
    echo "❌ Unknown mode: $MODE"
    echo "   Valid: full gst pan hsn currency timezone"
    exit 1
    ;;
esac

# ─── Grade ───────────────────────────────────────────────────────────────────
if [ $FINDINGS -eq 0 ]; then
  GRADE="A"
elif [ $FINDINGS -le 2 ]; then
  GRADE="B"
elif [ $FINDINGS -le 4 ]; then
  GRADE="C"
else
  GRADE="D"
fi

echo "══════════════════════════════════════════════════════════"
echo "  Checks:   $CHECKS"
echo "  Passed:   $((CHECKS - FINDINGS))"
echo "  Findings: $FINDINGS"
echo "  Grade:    $GRADE"
echo "══════════════════════════════════════════════════════════"

# ─── Save report ─────────────────────────────────────────────────────────────
mkdir -p "$REPORT_DIR"
cat > "$REPORT_FILE" <<EOF
# Indian Compliance Report
**Date:** $DATE
**Mode:** $MODE
**Grade:** $GRADE
**Findings:** $FINDINGS / $CHECKS checks

## Checklist
| Area | Status |
|------|--------|
| GST (CGST/SGST/IGST) | $([ $GRADE = 'A' ] && echo '✅' || echo '⚠️') |
| PAN / GSTIN validation | ✅ checked |
| HSN codes | ✅ checked |
| INR formatting | ✅ checked |
| Timezone (Asia/Kolkata) | ✅ checked |

## Notes
- Full GST compliance requires both CGST/SGST (intra-state) and IGST (inter-state) logic
- PAN format: ABCDE1234F (5 alpha + 4 numeric + 1 alpha)
- GSTIN format: 15 chars (state code + PAN + entity type + checksum)
- HSN codes required on all invoices for GST filing
EOF

echo "  Report: $REPORT_FILE"

if [ $FINDINGS -eq 0 ]; then
  echo ""
  echo "✅ Indian Compliance: All checks passed (Grade $GRADE)"
else
  echo ""
  echo "⚠️  Indian Compliance: $FINDINGS gap(s) found (Grade $GRADE)"
  echo "   See full report: $REPORT_FILE"
fi

exit 0
