#!/usr/bin/env bash
# cost.sh — CRMSoft Cost Optimizer (Railway + R2 + scale forecast)
# Usage: bash scripts/skills/cost.sh [mode] [options]
# Modes: analyze | compare | forecast

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MODE="${1:-analyze}"
ARG2="${2:-}"
DATE=$(date +%Y-%m-%d)
REPORT_DIR="$REPO_ROOT/docs/costs"
REPORT_FILE="$REPORT_DIR/cost-analysis-${DATE}.md"
mkdir -p "$REPORT_DIR"

CONFIG="$REPO_ROOT/.claude/config.json"
RAILWAY_PROJECT=$(python3 -c "import json; d=json.load(open('$CONFIG')); print(d['railway']['project'])" 2>/dev/null || echo "CRM_V1")

banner() { echo ""; echo "━━━ $* ━━━"; }

declare -a REPORT_LINES=()
report() { REPORT_LINES+=("$1"); }

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  CRMSoft Cost Optimizer (PM CLI Phase 2)                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo "  Mode: $MODE | Project: $RAILWAY_PROJECT | Date: $DATE"

# ─── Railway multi-DB analysis ────────────────────────────────────────────────
analyze_railway() {
  banner "Railway Multi-DB Cost Analysis ($RAILWAY_PROJECT)"
  report "## Railway Cost Analysis"
  report ""
  report "**Project:** $RAILWAY_PROJECT"
  report ""
  report "### 7 Database Configuration"
  report ""
  report "| DB | Type | Purpose | Railway Service |"
  report "|----|------|---------|----------------|"
  report "| IdentityDB | PostgreSQL | Users, roles, permissions | identitydb |"
  report "| PlatformDB | PostgreSQL | Modules, menus, config | platformdb |"
  report "| WorkingDB | PostgreSQL | Leads, contacts, orders | workingdb |"
  report "| MarketplaceDB | PostgreSQL | Offers, profiles, feed | marketplacedb |"
  report "| PlatformConsoleDB | PostgreSQL | Admin console | platformconsoledb |"
  report "| GlobalReferenceDB | PostgreSQL | Shared reference data | globalreferencedb |"
  report "| DemoDB | PostgreSQL | Demo tenant data | demodb |"
  report ""

  # Try to get Railway usage (if linked)
  if command -v railway &>/dev/null; then
    echo "  Checking Railway status..."
    local USAGE
    USAGE=$(railway status 2>/dev/null | head -5 || echo "  (not linked — run 'railway link' for live data)")
    report "### Live Railway Status"
    report "\`\`\`"
    report "$USAGE"
    report "\`\`\`"
    report ""
  fi

  report "### Railway Pricing Reference (2026)"
  report ""
  report "| Tier | Cost | Included |"
  report "|------|------|---------|"
  report "| Hobby | \$5/mo | 512MB RAM, 1 vCPU per service |"
  report "| Pro | \$20/mo base + usage | 8GB RAM, 8 vCPU per service |"
  report "| Enterprise | Custom | Dedicated resources |"
  report ""
  report "> **Current:** 7 PostgreSQL services + 1 NestJS API + shared Redis"
  report "> **Estimated:** ~\$50-150/mo (Hobby: 7×\$5 + extras)"
  report ""
}

# ─── Cloudflare R2 analysis ───────────────────────────────────────────────────
analyze_r2() {
  banner "Cloudflare R2 Storage Analysis"
  report "## Cloudflare R2 Storage"
  report ""

  # Check R2 bucket sizes from .claude/backups as proxy
  local BACKUP_SIZE
  BACKUP_SIZE=$(du -sh "$REPO_ROOT/.claude/backups" 2>/dev/null | cut -f1 || echo "0")

  report "### R2 Bucket Structure"
  report ""
  report "| Bucket | Purpose | Retention |"
  report "|--------|---------|-----------|"
  report "| crmsoft-uploads-{env} | User uploads (docs, images) | Indefinite |"
  report "| crmsoft-backups-{env} | pg_dump backups | 30 days |"
  report "| crmsoft-public-{env} | CDN assets (logos, avatars) | Indefinite |"
  report ""
  report "### R2 Pricing (2026)"
  report ""
  report "| Metric | Cost |"
  report "|--------|------|"
  report "| Storage | \$0.015/GB/mo |"
  report "| Class A ops | \$4.50/million |"
  report "| Class B ops | \$0.36/million |"
  report "| Egress | **\$0** (zero egress cost) |"
  report ""
  report "> **Advantage over S3:** Zero egress cost — critical for multi-tenant file serving"
  report ""
  report "Local backup size: $BACKUP_SIZE"
  report ""
}

# ─── Compare providers ────────────────────────────────────────────────────────
compare_providers() {
  local WHAT="${1:-hosting}"
  banner "Provider Comparison: $WHAT"
  report "## Provider Comparison: $WHAT"
  report ""

  case "$WHAT" in
    hosting|"")
      report "### Hosting (Backend API)"
      report ""
      report "| Provider | Cost | Pros | Cons |"
      report "|----------|------|------|------|"
      report "| Railway (current) | \$5-20/mo | Easy deploy, git integration | Less control |"
      report "| Render | \$7-25/mo | Similar to Railway | Cold starts on free |"
      report "| Fly.io | \$3-15/mo | Low latency, global | More complex config |"
      report "| AWS ECS | \$15-50/mo | Full control, scalable | Complex setup |"
      report "| DigitalOcean | \$12-24/mo | Predictable pricing | Manual scaling |"
      report ""
      report "> **Recommendation:** Stay on Railway for dev/staging. Evaluate AWS ECS at 100K tenants."
      ;;
    database)
      report "### Database (PostgreSQL)"
      report ""
      report "| Provider | Cost | Pros | Cons |"
      report "|----------|------|------|------|"
      report "| Railway PG (current) | \$5/mo/db × 7 = \$35/mo | Integrated | 7 separate bills |"
      report "| Neon | \$19/mo | Serverless, branching | US-only servers |"
      report "| Supabase | \$25/mo/project | Auth + storage included | Single project |"
      report "| RDS Aurora | \$50-200/mo | Enterprise, HA | Expensive |"
      report "| PlanetScale | \$29/mo | MySQL only | Not PostgreSQL |"
      report ""
      report "> **Recommendation:** Railway consolidation (single project, shared cluster) at 50K+ tenants"
      ;;
    storage)
      report "### Storage"
      report ""
      report "| Provider | Cost | Egress | Pros |"
      report "|----------|------|--------|------|"
      report "| Cloudflare R2 (current) | \$0.015/GB | **Free** | Best choice for India |"
      report "| AWS S3 | \$0.023/GB | \$0.09/GB | Mature ecosystem |"
      report "| Backblaze B2 | \$0.006/GB | Free via CF | Cheaper storage |"
      report "| GCS | \$0.020/GB | \$0.08/GB | Google integration |"
      report ""
      report "> **Recommendation:** Stay on R2. Zero egress is critical for SMB tenant cost model."
      ;;
  esac
  report ""
}

# ─── Scale forecast ────────────────────────────────────────────────────────────
forecast_costs() {
  local USERS="${ARG2:-10000}"
  # Parse --users=N format
  if echo "$ARG2" | grep -q "users="; then
    USERS=$(echo "$ARG2" | sed 's/--users=//')
  fi

  banner "Cost Forecast at $USERS tenants"
  report "## Cost Forecast"
  report ""
  report "**Target:** $USERS tenants"
  report ""
  report "### Assumptions"
  report "- Average 10 users per tenant"
  report "- 100MB storage per tenant (docs, avatars)"
  report "- 1000 API calls/tenant/day"
  report "- Railway PostgreSQL: 7 DBs shared across all tenants"
  report ""

  # Compute estimates
  local STORAGE_GB=$(( USERS * 100 / 1024 ))
  local R2_COST=$(python3 -c "print(f'\${${STORAGE_GB} * 0.015:.0f}')" 2>/dev/null || echo "~\$$(( STORAGE_GB / 66 ))")
  local RAILWAY_COST="\$50-150"
  local TOTAL_LOW=$(( 50 + STORAGE_GB / 66 ))
  local TOTAL_HIGH=$(( 150 + STORAGE_GB / 66 ))

  report "### Estimated Monthly Costs at $USERS Tenants"
  report ""
  report "| Component | Cost Estimate |"
  report "|-----------|--------------|"
  report "| Railway (API + 7 DBs) | $RAILWAY_COST/mo |"
  report "| Cloudflare R2 (~${STORAGE_GB}GB) | ~$R2_COST/mo |"
  report "| Cloudflare Workers/CDN | ~\$5-20/mo |"
  report "| **Total** | **~\$$TOTAL_LOW-$TOTAL_HIGH/mo** |"
  report ""

  report "### Cost Per Tenant"
  local PER_TENANT_LOW=$(python3 -c "print(f'{($TOTAL_LOW / $USERS):.2f}')" 2>/dev/null || echo "?")
  local PER_TENANT_HIGH=$(python3 -c "print(f'{($TOTAL_HIGH / $USERS):.2f}')" 2>/dev/null || echo "?")
  report "- Low: ~\$$PER_TENANT_LOW/tenant/mo"
  report "- High: ~\$$PER_TENANT_HIGH/tenant/mo"
  report ""

  report "### Scale Milestones"
  report ""
  report "| Tenants | Estimated Monthly | Action Required |"
  report "|---------|-------------------|----------------|"
  report "| 100 | ~\$60/mo | Current setup sufficient |"
  report "| 1,000 | ~\$80/mo | Upgrade Railway to Pro |"
  report "| 10,000 | ~\$200/mo | DB pooling (PgBouncer), CDN tuning |"
  report "| 50,000 | ~\$800/mo | Evaluate AWS ECS migration |"
  report "| 100,000 | ~\$1,500/mo | Multi-region, dedicated infrastructure |"
  report ""
}

# ─── Write report ─────────────────────────────────────────────────────────────
write_report() {
  {
    echo "# Cost Analysis Report — CRMSoft"
    echo ""
    echo "**Date:** $DATE"
    echo "**Project:** $RAILWAY_PROJECT"
    echo "**Mode:** $MODE"
    echo ""
    echo "---"
    echo ""
    for line in "${REPORT_LINES[@]}"; do
      echo "$line"
    done
    echo ""
    echo "---"
    echo "_Generated by PM CLI Phase 2 Cost Skill_"
  } > "$REPORT_FILE"

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Report: docs/costs/cost-analysis-${DATE}.md"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# ─── DISPATCH ────────────────────────────────────────────────────────────────
case "$MODE" in
  analyze)
    analyze_railway
    analyze_r2
    write_report
    ;;
  compare)
    compare_providers "$ARG2"
    write_report
    ;;
  forecast)
    forecast_costs
    write_report
    ;;
  *)
    echo "Usage: bash scripts/skills/cost.sh [analyze|compare|forecast] [options]"
    echo "  compare: bash scripts/skills/cost.sh compare hosting|database|storage"
    echo "  forecast: bash scripts/skills/cost.sh forecast --users=10000"
    exit 1
    ;;
esac
