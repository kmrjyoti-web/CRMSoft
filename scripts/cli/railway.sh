#!/usr/bin/env bash
# railway.sh — Zero-risk Railway CLI wrapper for CRMSoft
# Usage: bash scripts/cli/railway.sh <subcommand> [args...]
# Subcommands: deploy, env-sync, env-pull, env-push, logs, restart, status

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SUBCOMMAND="${1:-status}"
CONFIG="$REPO_ROOT/.claude/config.json"

# Read Railway project from config
RAILWAY_PROJECT=$(python3 -c "import json; d=json.load(open('$CONFIG')); print(d['railway']['project'])" 2>/dev/null || echo "CRM_V1")

# Check railway CLI
if ! command -v railway &>/dev/null; then
  echo "❌ railway CLI not installed. Install: brew install railway"
  exit 1
fi

# Source zero-risk wrapper
source "$REPO_ROOT/scripts/lib/zero-risk-wrapper.sh" 2>/dev/null || true

case "$SUBCOMMAND" in
  status)
    echo "📡 Railway status for project: $RAILWAY_PROJECT"
    railway status 2>/dev/null || echo "  (run 'railway login' and 'railway link' first)"
    ;;
  deploy)
    echo "🚀 Railway deploy (project: $RAILWAY_PROJECT)"
    _do_deploy() { railway up; }
    run_safe_action "railway-deploy" "deploy" "_do_deploy"
    ;;
  logs)
    echo "📋 Railway logs..."
    railway logs "${@:2}" 2>/dev/null || echo "  (run 'railway login' and 'railway link' first)"
    ;;
  restart)
    echo "🔄 Railway restart..."
    _do_restart() { railway redeploy; }
    run_safe_action "railway-restart" "ops" "_do_restart"
    ;;
  env-pull)
    echo "⬇️  Railway env pull..."
    railway env 2>/dev/null || echo "  (run 'railway login' and 'railway link' first)"
    ;;
  env-push)
    echo "⬆️  Railway env push..."
    echo "ℹ️  Use 'railway variables set KEY=VALUE' to push env vars."
    ;;
  env-sync)
    echo "🔄 Railway env sync (pull from Railway → local .env)..."
    _do_env_sync() {
      railway env > "$REPO_ROOT/Application/backend/.env.railway" 2>/dev/null && \
      echo "Saved to Application/backend/.env.railway"
    }
    run_safe_action "railway-env-sync" "config" "_do_env_sync"
    ;;
  *)
    echo "Usage: bash scripts/cli/railway.sh <subcommand>"
    echo "Subcommands: deploy | env-sync | env-pull | env-push | logs | restart | status"
    exit 1
    ;;
esac
