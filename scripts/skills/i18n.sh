#!/usr/bin/env bash
# i18n.sh — CRMSoft i18n Gap Finder (Indian market focused)
# Usage: bash scripts/skills/i18n.sh [mode]
# Modes: scan | missing | rtl | extract

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MODE="${1:-scan}"
DATE=$(date +%Y-%m-%d)
REPORT_DIR="$REPO_ROOT/docs/i18n"
REPORT_FILE="$REPORT_DIR/i18n-gap-report-${DATE}.md"
mkdir -p "$REPORT_DIR"

FRONTEND_DIRS=(
  "Customer/frontend/crm-admin/src"
  "Vendor/frontend/vendor-panel/src"
  "Application/frontend/marketplace/src"
  "WhiteLabel/wl-admin/src"
  "WhiteLabel/wl-partner/src"
)

banner() { echo ""; echo "━━━ $* ━━━"; }

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  CRMSoft i18n Gap Finder (PM CLI Phase 2)                ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo "  Mode: $MODE | Date: $DATE"

declare -a REPORT_LINES=()
report() { REPORT_LINES+=("$1"); }

# ─── SCAN: Find hardcoded strings ────────────────────────────────────────────
do_scan() {
  banner "Scanning for hardcoded UI strings"
  report "## Hardcoded String Scan"
  report ""

  local TOTAL_HITS=0

  for DIR in "${FRONTEND_DIRS[@]}"; do
    local FULL_PATH="$REPO_ROOT/$DIR"
    [ -d "$FULL_PATH" ] || continue

    local APP_NAME
    APP_NAME=$(basename "$(dirname "$FULL_PATH")")

    # Find JSX text content (hardcoded strings in JSX/TSX)
    local JSX_STRINGS
    JSX_STRINGS=$(grep -rn --include="*.tsx" --include="*.jsx" \
      -E ">[A-Z][a-zA-Z ]{3,}[^{<>]*</" "$FULL_PATH" 2>/dev/null | \
      grep -v "console\.\|className\|data-\|aria-\|//\|import\|export" | \
      wc -l | tr -d ' ')

    # Find hardcoded button/label text
    local BUTTON_TEXT
    BUTTON_TEXT=$(grep -rn --include="*.tsx" --include="*.jsx" \
      -E "(>|label=|placeholder=|title=)[\"'][A-Z][a-zA-Z ]+[\"']" \
      "$FULL_PATH" 2>/dev/null | wc -l | tr -d ' ')

    local TOTAL=$((JSX_STRINGS + BUTTON_TEXT))
    TOTAL_HITS=$((TOTAL_HITS + TOTAL))

    echo "  $APP_NAME: ~$TOTAL possible hardcoded strings (JSX: $JSX_STRINGS, labels: $BUTTON_TEXT)"
    report "| $APP_NAME | $JSX_STRINGS JSX text | $BUTTON_TEXT labels | **$TOTAL** |"
  done

  echo "  Total across all apps: ~$TOTAL_HITS"
  report ""
  report "**Total possible hardcoded strings: ~$TOTAL_HITS**"
  report ""
}

# ─── Indian market: Lakh/crore formatting check ───────────────────────────────
do_indian_formats() {
  banner "Indian Market: Currency + Date + GST Checks"
  report "## Indian Market Compliance"
  report ""

  # Check for Intl.NumberFormat usage (preferred over manual lakh/crore)
  local INTL_USAGE=0
  local MANUAL_FORMAT=0
  for DIR in "${FRONTEND_DIRS[@]}"; do
    local FULL_PATH="$REPO_ROOT/$DIR"
    [ -d "$FULL_PATH" ] || continue
    local I
    I=$(grep -rn --include="*.ts" --include="*.tsx" "Intl.NumberFormat" "$FULL_PATH" 2>/dev/null | wc -l | tr -d ' ')
    INTL_USAGE=$((INTL_USAGE + I))
    local M
    M=$(grep -rn --include="*.ts" --include="*.tsx" "lakh\|crore\|₹" "$FULL_PATH" 2>/dev/null | wc -l | tr -d ' ')
    MANUAL_FORMAT=$((MANUAL_FORMAT + M))
  done

  echo "  Intl.NumberFormat uses: $INTL_USAGE"
  echo "  Manual ₹/lakh/crore: $MANUAL_FORMAT"
  report "### Currency Formatting"
  report "- \`Intl.NumberFormat\` uses: $INTL_USAGE"
  report "- Manual ₹/lakh/crore references: $MANUAL_FORMAT"
  if [ "$INTL_USAGE" -eq 0 ] && [ "$MANUAL_FORMAT" -gt 0 ]; then
    report "- ⚠️  No \`Intl.NumberFormat\` found — currency formatting may be inconsistent"
  elif [ "$INTL_USAGE" -gt 0 ]; then
    report "- ✅ \`Intl.NumberFormat\` in use"
  fi
  report ""

  # GST label hardcoding
  local GST_LABELS
  GST_LABELS=$(grep -rn --include="*.tsx" --include="*.ts" \
    -E "CGST|SGST|IGST" "$REPO_ROOT/Customer/frontend/crm-admin/src" 2>/dev/null | \
    wc -l | tr -d ' ' || echo 0)
  echo "  GST label references: $GST_LABELS"
  report "### GST Labels (CGST/SGST/IGST)"
  report "- References: $GST_LABELS"
  if [ "$GST_LABELS" -gt 0 ]; then
    report "- ℹ️  Verify these are from i18n keys, not hardcoded strings"
  fi
  report ""

  # Date format check (DD-MMM-YYYY pattern)
  local DATE_FORMAT_HITS
  DATE_FORMAT_HITS=$(grep -rn --include="*.ts" --include="*.tsx" \
    -E "DD-MMM-YYYY|DD/MM/YYYY|format.*date" \
    "$REPO_ROOT/Customer/frontend/crm-admin/src" 2>/dev/null | wc -l | tr -d ' ' || echo 0)
  echo "  Date format references: $DATE_FORMAT_HITS"
  report "### Date Format"
  report "- Date format references: $DATE_FORMAT_HITS (target: DD-MMM-YYYY for Indian market)"
  report ""
}

# ─── Language coverage ────────────────────────────────────────────────────────
do_language_coverage() {
  banner "Language File Coverage"
  report "## Language Coverage"
  report ""

  local LOCALES_FOUND=0
  local LOCALE_DIRS=()

  for DIR in "${FRONTEND_DIRS[@]}"; do
    local FULL_PATH="$REPO_ROOT/$DIR"
    [ -d "$FULL_PATH" ] || continue
    local LOCALE
    LOCALE=$(find "$FULL_PATH" -type d \( -name "locales" -o -name "i18n" -o -name "translations" \) 2>/dev/null | head -3)
    if [ -n "$LOCALE" ]; then
      LOCALES_FOUND=$((LOCALES_FOUND + 1))
      LOCALE_DIRS+=("$LOCALE")
      local LANGS
      LANGS=$(ls "$LOCALE" 2>/dev/null | tr '\n' ', ' || echo "none")
      echo "  Found: $LOCALE → $LANGS"
      report "- Found: \`$LOCALE\` → $LANGS"
    fi
  done

  if [ $LOCALES_FOUND -eq 0 ]; then
    echo "  ⚠️  No locale directories found"
    report "- ⚠️  No \`locales/\` or \`i18n/\` directories found in frontend apps"
    report "- Priority: Add Hindi (hi) as first locale, then Marathi (mr), Tamil (ta)"
    report ""
    report "### Indian Language Priority"
    report ""
    report "| Language | Code | Priority | Market |"
    report "|----------|------|----------|--------|"
    report "| Hindi | hi | 🔴 Critical | National |"
    report "| Marathi | mr | 🟡 High | Maharashtra |"
    report "| Tamil | ta | 🟡 High | Tamil Nadu |"
    report "| Telugu | te | 🟡 High | AP/Telangana |"
    report "| Bengali | bn | 🟠 Medium | West Bengal |"
    report "| Gujarati | gu | 🟠 Medium | Gujarat |"
    report "| Kannada | kn | 🟠 Medium | Karnataka |"
    report "| Malayalam | ml | 🟠 Medium | Kerala |"
    report "| Punjabi | pa | 🟢 Low | Punjab |"
    report "| Odia | or | 🟢 Low | Odisha |"
    report "| Assamese | as | 🟢 Low | Assam |"
  fi
  report ""
}

# ─── Missing keys ─────────────────────────────────────────────────────────────
do_missing() {
  banner "Missing Translation Keys"
  report "## Missing Translation Keys"
  report ""

  local FOUND=false
  for DIR in "${FRONTEND_DIRS[@]}"; do
    local FULL_PATH="$REPO_ROOT/$DIR"
    [ -d "$FULL_PATH" ] || continue
    local EN_FILE
    EN_FILE=$(find "$FULL_PATH" -name "en.json" -o -name "en.ts" 2>/dev/null | head -1)
    local HI_FILE
    HI_FILE=$(find "$FULL_PATH" -name "hi.json" -o -name "hi.ts" 2>/dev/null | head -1)

    if [ -n "$EN_FILE" ] && [ -n "$HI_FILE" ]; then
      FOUND=true
      local EN_KEYS HI_KEYS MISSING
      EN_KEYS=$(python3 -c "import json; d=json.load(open('$EN_FILE')); print(len(d))" 2>/dev/null || echo "?")
      HI_KEYS=$(python3 -c "import json; d=json.load(open('$HI_FILE')); print(len(d))" 2>/dev/null || echo "?")
      MISSING=$((${EN_KEYS:-0} - ${HI_KEYS:-0}))
      echo "  en: $EN_KEYS keys, hi: $HI_KEYS keys, gap: $MISSING"
      report "- en: $EN_KEYS keys | hi: $HI_KEYS keys | gap: **$MISSING missing**"
    fi
  done

  if [ "$FOUND" = false ]; then
    echo "  No translation files found (en.json / hi.json)"
    report "> No translation files found. Create \`locales/en.json\` and \`locales/hi.json\` first."
  fi
  report ""
}

# ─── RTL compliance ───────────────────────────────────────────────────────────
do_rtl() {
  banner "RTL Compliance Check (Urdu/Arabic future support)"
  report "## RTL Compliance"
  report ""

  local RTL_FOUND=0
  for DIR in "${FRONTEND_DIRS[@]}"; do
    local FULL_PATH="$REPO_ROOT/$DIR"
    [ -d "$FULL_PATH" ] || continue
    local R
    R=$(grep -rn --include="*.tsx" --include="*.css" \
      -E "dir=\"rtl\"|direction:\s*rtl|rtl" "$FULL_PATH" 2>/dev/null | wc -l | tr -d ' ')
    RTL_FOUND=$((RTL_FOUND + R))
  done

  if [ "$RTL_FOUND" -gt 0 ]; then
    echo "  RTL references found: $RTL_FOUND"
    report "- ✅ RTL references found: $RTL_FOUND"
  else
    echo "  No RTL support detected (future: Urdu)"
    report "- ℹ️  No RTL support detected. Plan for Urdu language support in future."
  fi
  report ""
}

# ─── Extract: List hardcoded strings ─────────────────────────────────────────
do_extract() {
  banner "Extracting hardcoded strings (sample)"
  report "## Hardcoded String Samples"
  report ""

  for DIR in "${FRONTEND_DIRS[@]}"; do
    local FULL_PATH="$REPO_ROOT/$DIR"
    [ -d "$FULL_PATH" ] || continue
    local APP_NAME
    APP_NAME=$(basename "$(dirname "$FULL_PATH")")

    echo "  $APP_NAME:"
    local SAMPLES
    SAMPLES=$(grep -rn --include="*.tsx" \
      -E ">[A-Z][a-zA-Z ]{3,}[^{<>]*</" "$FULL_PATH" 2>/dev/null | \
      grep -v "className\|import\|export\|console" | head -5 | \
      sed "s|$REPO_ROOT/||")

    if [ -n "$SAMPLES" ]; then
      echo "$SAMPLES" | while IFS= read -r line; do
        echo "    $line"
        report "- \`$line\`"
      done
    else
      echo "    (no matches)"
    fi
  done
  report ""
}

# ─── Write report ─────────────────────────────────────────────────────────────
write_report() {
  {
    echo "# i18n Gap Report — CRMSoft"
    echo ""
    echo "**Date:** $DATE"
    echo "**Mode:** $MODE"
    echo ""
    echo "---"
    echo ""
    for line in "${REPORT_LINES[@]}"; do
      echo "$line"
    done
    echo ""
    echo "---"
    echo "_Generated by PM CLI Phase 2 i18n Skill_"
  } > "$REPORT_FILE"

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Report: docs/i18n/i18n-gap-report-${DATE}.md"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# ─── DISPATCH ────────────────────────────────────────────────────────────────
case "$MODE" in
  scan)
    do_scan
    do_indian_formats
    do_language_coverage
    write_report
    ;;
  missing)
    do_missing
    write_report
    ;;
  rtl)
    do_rtl
    write_report
    ;;
  extract)
    do_extract
    write_report
    ;;
  *)
    echo "Usage: bash scripts/skills/i18n.sh [scan|missing|rtl|extract]"
    exit 1
    ;;
esac
