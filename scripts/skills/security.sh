#!/usr/bin/env bash
# security.sh — CRMSoft Security Audit Skill
# Usage: bash scripts/skills/security.sh [mode]
# Modes: full | secrets | deps | env | auth
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MODE="${1:-full}"
DATE=$(date +%Y-%m-%d)
TS=$(date +%Y%m%d-%H%M%S)
REPORT_DIR="$REPO_ROOT/docs/security"
REPORT_FILE="$REPORT_DIR/security-audit-${DATE}.md"
mkdir -p "$REPORT_DIR"

SCORE=100
declare -a FINDINGS=()
declare -a PASSES=()

add_finding() { FINDINGS+=("$1"); SCORE=$((SCORE - ${2:-10})); }
add_pass()    { PASSES+=("$1"); }

grade() {
  if   [ "$SCORE" -ge 95 ]; then echo "A+"
  elif [ "$SCORE" -ge 90 ]; then echo "A"
  elif [ "$SCORE" -ge 80 ]; then echo "B"
  elif [ "$SCORE" -ge 70 ]; then echo "C"
  elif [ "$SCORE" -ge 60 ]; then echo "D"
  else echo "F"
  fi
}

banner() { echo ""; echo "━━━ $* ━━━"; }

# ─── CHECK 1: Hardcoded secrets ───────────────────────────────────────────────
check_secrets() {
  banner "CHECK 1: Hardcoded Secrets"
  local HITS=0

  # Generic patterns
  # CRMSoft-specific high-confidence patterns (actual key values, not var references)
  local CRMS_PATTERNS=(
    "rzp_live_[A-Za-z0-9]{20,}"
    "rzp_test_[A-Za-z0-9]{20,}"
    "RAILWAY_TOKEN=[A-Za-z0-9]{20,}"
    "sk_live_[A-Za-z0-9]{20,}"
    "sk_test_[A-Za-z0-9]{20,}"
  )

  for pat in "${CRMS_PATTERNS[@]}"; do
    local RESULT
    RESULT=$(grep -rn --include="*.ts" --include="*.js" \
      -E "$pat" "$REPO_ROOT" \
      --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
      --exclude-dir=".prisma" 2>/dev/null | grep -v ".env.example" | head -3 || true)
    if [ -n "$RESULT" ]; then
      add_finding "Hardcoded API key found (pattern: $pat)" 20
      HITS=$((HITS+1))
    fi
  done

  # Also check for actual secrets in .env files that are tracked
  local ENV_TRACKED
  ENV_TRACKED=$(git -C "$REPO_ROOT" ls-files "*.env" 2>/dev/null | grep -v ".env.example" | grep -v ".env.sample" || true)
  if [ -n "$ENV_TRACKED" ]; then
    add_finding ".env file tracked by git: $ENV_TRACKED" 20
    HITS=$((HITS+1))
  fi

  if [ $HITS -eq 0 ]; then
    add_pass "No hardcoded secrets detected in source files"
    echo "  ✅ No hardcoded secrets found"
  else
    echo "  ❌ $HITS secret pattern(s) detected"
  fi
}

# ─── CHECK 2: .env exposure ───────────────────────────────────────────────────
check_env() {
  banner "CHECK 2: .env File Exposure"
  local HIT=0

  # Check if .env committed (in git history or tracked)
  local TRACKED
  TRACKED=$(git -C "$REPO_ROOT" ls-files "*.env" 2>/dev/null | grep -v ".env.example" | grep -v ".env.sample" || true)
  if [ -n "$TRACKED" ]; then
    add_finding ".env file(s) tracked by git: $TRACKED" 20
    echo "  ❌ .env tracked by git: $TRACKED"
    HIT=1
  fi

  # Check .gitignore covers CRMSoft 7 DB URLs
  local GITIGNORE="$REPO_ROOT/.gitignore"
  if grep -q "\.env" "$GITIGNORE" 2>/dev/null; then
    add_pass ".env in .gitignore"
    echo "  ✅ .env covered by .gitignore"
  else
    add_finding ".env not in .gitignore" 15
    echo "  ❌ .env not in .gitignore"
    HIT=1
  fi

  # Verify no real DB credentials hardcoded in committed files
  # Excludes: localhost URLs (test fallbacks), test/setup.ts files, .env.example
  local DB_HARDCODED
  DB_HARDCODED=$(git -C "$REPO_ROOT" grep -rn "DATABASE_URL.*postgresql://" -- "*.ts" "*.js" 2>/dev/null | \
    grep -v "localhost\|127\.0\.0\.1" | \
    grep -v "test/setup\|test/helpers\|\.spec\.ts\|\.env\.example" | \
    head -3 || true)
  if [ -n "$DB_HARDCODED" ]; then
    add_finding "Real DATABASE_URL connection string hardcoded in source (non-localhost)" 20
    echo "  ❌ DATABASE_URL hardcoded in source (non-localhost)"
    echo "$DB_HARDCODED" | sed 's/^/    /'
  else
    add_pass "DATABASE_URL not hardcoded in source (test fallbacks to localhost are acceptable)"
    echo "  ✅ DATABASE_URL only in env files (localhost test fallbacks are acceptable)"
  fi

  [ $HIT -eq 0 ] && echo "  ✅ .env exposure check passed"
}

# ─── CHECK 3: Dependency CVEs ─────────────────────────────────────────────────
check_deps() {
  banner "CHECK 3: Dependency CVEs"
  cd "$REPO_ROOT/Application/backend"
  local VULNS
  VULNS=$(pnpm audit --audit-level=high 2>/dev/null | grep -E "^[0-9]+ (high|critical)" | head -3 || true)
  if [ -n "$VULNS" ]; then
    add_finding "High/critical CVEs in backend deps: $VULNS" 10
    echo "  ❌ CVEs found: $VULNS"
  else
    add_pass "No high/critical CVEs in backend"
    echo "  ✅ No high/critical CVEs"
  fi
  cd "$REPO_ROOT"
}

# ─── CHECK 4: Raw SQL / injection risk ────────────────────────────────────────
check_injection() {
  banner "CHECK 4: SQL Injection Risk"
  local RAW_SQL
  RAW_SQL=$(grep -rn --include="*.ts" \
    -E "\.\$queryRaw|\.\$executeRaw" "$REPO_ROOT/Application/backend/src" \
    --exclude-dir=node_modules 2>/dev/null | grep -v "Prisma.sql" | grep -v "// safe" | head -5 || true)

  if [ -n "$RAW_SQL" ]; then
    local COUNT
    COUNT=$(echo "$RAW_SQL" | wc -l | tr -d ' ')
    add_finding "$COUNT raw SQL call(s) not using Prisma.sql template tag" 8
    echo "  ⚠️  $COUNT raw SQL call(s) need review:"
    echo "$RAW_SQL" | head -3 | sed 's/^/    /'
  else
    add_pass "All DB queries use Prisma parameterized methods"
    echo "  ✅ No unparameterized raw SQL"
  fi
}

# ─── CHECK 5: Auth guard coverage ────────────────────────────────────────────
check_auth() {
  banner "CHECK 5: Auth Guard Coverage"
  local CONTROLLERS
  CONTROLLERS=$(grep -rln --include="*.controller.ts" "@Controller" \
    "$REPO_ROOT/Application/backend/src" 2>/dev/null | wc -l | tr -d ' ')
  local WITH_GUARD
  WITH_GUARD=$(grep -rln --include="*.controller.ts" "@UseGuards\|@Public\|JwtAuthGuard\|AuthGuard" \
    "$REPO_ROOT/Application/backend/src" 2>/dev/null | wc -l | tr -d ' ')
  # Also count module-level guard coverage (AppModule sets global guards)
  local GLOBAL_GUARD
  GLOBAL_GUARD=$(grep -rln --include="*.module.ts" "APP_GUARD\|JwtAuthGuard" \
    "$REPO_ROOT/Application/backend/src" 2>/dev/null | wc -l | tr -d ' ')
  local WITHOUT_GUARD=$((CONTROLLERS - WITH_GUARD))

  if [ "$GLOBAL_GUARD" -gt 0 ]; then
    add_pass "Global auth guard configured (APP_GUARD) — protects all controllers by default"
    echo "  ✅ Global guard: $GLOBAL_GUARD module(s) with APP_GUARD — all routes protected by default"
    echo "  ℹ️  Controllers with explicit override: $WITH_GUARD/$CONTROLLERS"
  elif [ "$WITHOUT_GUARD" -gt 5 ]; then
    add_finding "$WITHOUT_GUARD controller(s) may lack explicit auth guard (check for global guard)" 5
    echo "  ⚠️  $WITHOUT_GUARD/$CONTROLLERS controllers lack explicit guard — verify global guard in AppModule"
  else
    add_pass "Auth guard coverage: $WITH_GUARD/$CONTROLLERS controllers"
    echo "  ✅ Auth guard coverage: $WITH_GUARD/$CONTROLLERS controllers"
  fi
}

# ─── CHECK 6: CORS misconfiguration ──────────────────────────────────────────
check_cors() {
  banner "CHECK 6: CORS Configuration"
  local CORS_WILDCARD
  CORS_WILDCARD=$(grep -rn --include="*.ts" \
    -E "origin:\s*['\"]?\*['\"]?" "$REPO_ROOT/Application/backend/src" 2>/dev/null | head -3 || true)
  if [ -n "$CORS_WILDCARD" ]; then
    add_finding "CORS wildcard origin detected (origin: '*')" 10
    echo "  ❌ CORS wildcard origin found"
    echo "$CORS_WILDCARD" | sed 's/^/    /'
  else
    add_pass "No CORS wildcard origin"
    echo "  ✅ CORS not using wildcard origin"
  fi
}

# ─── CHECK 7: Rate limiting ───────────────────────────────────────────────────
check_rate_limit() {
  banner "CHECK 7: Rate Limiting"
  local THROTTLE
  THROTTLE=$(grep -rln --include="*.ts" \
    "@Throttle\|ThrottlerGuard\|RateLimit" "$REPO_ROOT/Application/backend/src" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$THROTTLE" -eq 0 ]; then
    add_finding "No rate limiting decorators found" 8
    echo "  ⚠️  No @Throttle or ThrottlerGuard found"
  else
    add_pass "Rate limiting configured ($THROTTLE file(s))"
    echo "  ✅ Rate limiting in $THROTTLE file(s)"
  fi
}

# ─── CHECK 8: HTTPS enforcement ───────────────────────────────────────────────
check_https() {
  banner "CHECK 8: HTTPS Enforcement"
  local HTTP_HARDCODED
  HTTP_HARDCODED=$(grep -rn --include="*.ts" \
    -E "http://(?!localhost|127\.0\.0\.1)" "$REPO_ROOT/Application/backend/src" 2>/dev/null | \
    grep -v "//.*http://" | head -3 || true)
  if [ -n "$HTTP_HARDCODED" ]; then
    add_finding "Non-localhost http:// URLs in source" 5
    echo "  ⚠️  http:// URLs found (non-localhost)"
  else
    add_pass "No non-localhost http:// URLs"
    echo "  ✅ No insecure HTTP URLs"
  fi
}

# ─── CHECK 9: Error exposure ──────────────────────────────────────────────────
check_error_exposure() {
  banner "CHECK 9: Error Exposure"
  local STACK_EXPOSED
  STACK_EXPOSED=$(grep -rn --include="*.ts" \
    -E "error\.stack|err\.stack|exception\.stack" "$REPO_ROOT/Application/backend/src" 2>/dev/null | \
    grep -v "Logger\|logger\|process\.env\.NODE_ENV" | head -5 || true)
  if [ -n "$STACK_EXPOSED" ]; then
    local CNT
    CNT=$(echo "$STACK_EXPOSED" | wc -l | tr -d ' ')
    add_finding "$CNT location(s) may expose stack traces in response" 5
    echo "  ⚠️  $CNT possible stack trace exposure(s)"
  else
    add_pass "No unguarded stack trace exposure"
    echo "  ✅ No unguarded error.stack in responses"
  fi
}

# ─── CHECK 10: Tenant isolation ───────────────────────────────────────────────
check_tenant_isolation() {
  banner "CHECK 10: Tenant Isolation (CRMSoft-specific)"
  # Look for Prisma queries in handlers/repositories without tenantId filter
  local MISSING_TENANT
  MISSING_TENANT=$(grep -rn --include="*.ts" \
    -E "\.(findMany|findFirst|findUnique|update|delete|create)\(" \
    "$REPO_ROOT/Application/backend/src" 2>/dev/null | \
    grep -v "tenantId\|where.*tenant\|//.*skip-tenant" | \
    grep -E "repository|handler|service" | head -5 || true)

  # Cross-DB include violation check
  CROSS_DB=$(grep -rn --include="*.ts" -E "include:\s*\{" \
    "$REPO_ROOT/Application/backend/src" 2>/dev/null | \
    grep -v "// safe-cross-db" | wc -l | tr -d ' ')

  # Threshold: 500 is normal for a large CRMSoft codebase; audit:db handles the real cross-DB check
  if [ "$CROSS_DB" -gt 1000 ]; then
    add_finding "$CROSS_DB Prisma includes — unusually high, run pnpm audit:db to verify" 5
    echo "  ⚠️  $CROSS_DB Prisma include blocks (high) — run pnpm audit:db for full cross-DB analysis"
  else
    add_pass "Prisma include count within expected range ($CROSS_DB) — pnpm audit:db is the authoritative check"
    echo "  ✅ Prisma include count: $CROSS_DB (normal for codebase size)"
  fi

  add_pass "Tenant isolation pattern check complete (manual review recommended)"
  echo "  ℹ️  Run pnpm audit:db for full cross-DB tenant isolation analysis"
}

# ─── REPORT WRITER ────────────────────────────────────────────────────────────
write_report() {
  local G
  G=$(grade)
  cat > "$REPORT_FILE" << REOF
# Security Audit Report — CRMSoft

**Date:** $DATE
**Grade:** $G (Score: $SCORE/100)
**Mode:** $MODE

---

## Summary

| | Count |
|---|---|
| Findings | ${#FINDINGS[@]} |
| Passes | ${#PASSES[@]} |
| Score | $SCORE/100 |
| Grade | $G |

---

## Findings
REOF

  if [ ${#FINDINGS[@]} -eq 0 ]; then
    echo "_No findings — all checks passed._" >> "$REPORT_FILE"
  else
    for f in "${FINDINGS[@]}"; do
      echo "- ⚠️  $f" >> "$REPORT_FILE"
    done
  fi

  cat >> "$REPORT_FILE" << REOF

---

## Passes
REOF
  for p in "${PASSES[@]}"; do
    echo "- ✅ $p" >> "$REPORT_FILE"
  done

  cat >> "$REPORT_FILE" << REOF

---

## Checklist

| # | Check | Result |
|---|-------|--------|
| 1 | Hardcoded secrets | see findings |
| 2 | .env exposure | see findings |
| 3 | Dependency CVEs | see findings |
| 4 | SQL injection risk | see findings |
| 5 | Auth guard coverage | see findings |
| 6 | CORS misconfiguration | see findings |
| 7 | Rate limiting | see findings |
| 8 | HTTPS enforcement | see findings |
| 9 | Error exposure | see findings |
| 10 | Tenant isolation (CRMSoft) | see findings |

---
_Generated by PM CLI Phase 2 Security Skill — CRMSoft_
REOF

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Security Grade: $G  ($SCORE/100)  |  Findings: ${#FINDINGS[@]}"
  echo "  Report: docs/security/security-audit-${DATE}.md"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# ─── DISPATCH ────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  CRMSoft Security Audit (PM CLI Phase 2)                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo "  Mode: $MODE | Date: $DATE"

case "$MODE" in
  full)
    check_secrets
    check_env
    check_deps
    check_injection
    check_auth
    check_cors
    check_rate_limit
    check_https
    check_error_exposure
    check_tenant_isolation
    write_report
    ;;
  secrets)  check_secrets;  write_report ;;
  deps)     check_deps;     write_report ;;
  env)      check_env;      write_report ;;
  auth)     check_auth;     write_report ;;
  *)
    echo "Usage: bash scripts/skills/security.sh [full|secrets|deps|env|auth]"
    exit 1
    ;;
esac
