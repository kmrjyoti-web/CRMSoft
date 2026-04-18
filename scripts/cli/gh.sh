#!/usr/bin/env bash
# gh.sh — GitHub CLI wrapper for CRMSoft
# Usage: bash scripts/cli/gh.sh <subcommand> [args...]
SUBCOMMAND="${1:-status}"

if ! command -v gh &>/dev/null; then
  echo "❌ gh CLI not installed. Install: brew install gh"
  exit 1
fi

case "$SUBCOMMAND" in
  status)
    echo "🐙 GitHub CLI status..."
    gh auth status 2>/dev/null || echo "  (run 'gh auth login' first)"
    ;;
  *)
    echo "ℹ️  Running: gh $*"
    gh "${@}"
    ;;
esac
