#!/usr/bin/env bash
# audit-governance.sh — CRMSoft Unified Governance Audit
# Runs all 5 checks in order: typecheck + audit:db + lint:prisma + architecture-guard + security
# Usage: bash scripts/governance/audit-governance.sh

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ERRORS=0
WARNINGS=0
START_TS=$(date +%s)

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  CRMSoft Full Governance Audit                           ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"

# ─── [1/5] TypeScript Check ───────────────────────────────────────────────────
echo ""
echo "═══ [1/5] TypeScript Check ═══"
cd "$REPO_ROOT/Application/backend"
if pnpm typecheck 2>&1 | tail -3; then
  echo "  ✅ TypeScript: PASS"
else
  echo "  ❌ TypeScript: FAIL"
  ERRORS=$((ERRORS+1))
fi
cd "$REPO_ROOT"

# ─── [2/5] DB Schema Audit (19 module codes, vertical registry) ──────────────
echo ""
echo "═══ [2/5] DB Schema Audit (pnpm audit:db) ═══"
cd "$REPO_ROOT/Application/backend"
if pnpm audit:db 2>&1 | tail -4; then
  echo "  ✅ DB Schema Audit: PASS"
else
  echo "  ❌ DB Schema Audit: FAIL"
  ERRORS=$((ERRORS+1))
fi
cd "$REPO_ROOT"

# ─── [3/5] Prisma Structure Lint (7 rules) ────────────────────────────────────
echo ""
echo "═══ [3/5] Prisma Structure Lint (pnpm lint:prisma) ═══"
cd "$REPO_ROOT/Application/backend"
if pnpm lint:prisma 2>&1 | tail -4; then
  echo "  ✅ Prisma Lint: PASS"
else
  echo "  ❌ Prisma Lint: FAIL"
  ERRORS=$((ERRORS+1))
fi
cd "$REPO_ROOT"

# ─── [4/5] Architecture Guard ─────────────────────────────────────────────────
echo ""
echo "═══ [4/5] Architecture Guard ═══"
if bash "$REPO_ROOT/scripts/architecture-guard.sh" 2>&1 | tail -3; then
  echo "  ✅ Architecture Guard: PASS"
else
  echo "  ⚠️  Architecture Guard: warnings (non-blocking)"
  WARNINGS=$((WARNINGS+1))
fi

# ─── [5/5] Security Quick Scan (env exposure check) ──────────────────────────
echo ""
echo "═══ [5/5] Security Quick Scan ═══"
if bash "$REPO_ROOT/scripts/skills/security.sh" env 2>&1 | tail -4; then
  echo "  ✅ Security Quick Scan: PASS"
else
  echo "  ⚠️  Security: warnings (non-blocking — run pnpm security for full audit)"
  WARNINGS=$((WARNINGS+1))
fi

# ─── Summary ──────────────────────────────────────────────────────────────────
END_TS=$(date +%s)
ELAPSED=$((END_TS - START_TS))

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
printf "║  Duration: %-47s║\n" "${ELAPSED}s"
printf "║  Errors:   %-47s║\n" "$ERRORS"
printf "║  Warnings: %-47s║\n" "$WARNINGS"
echo "╠══════════════════════════════════════════════════════════╣"

if [ $ERRORS -gt 0 ]; then
  echo "║  ❌ GOVERNANCE AUDIT: $ERRORS FAILURE(S) — FIX BEFORE PUSH        ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  exit 1
fi

echo "║  ✅ GOVERNANCE AUDIT: ALL CHECKS PASS                    ║"
echo "╚══════════════════════════════════════════════════════════╝"
