#!/usr/bin/env bash
# wrangler.sh — Cloudflare Wrangler CLI wrapper for CRMSoft R2/Workers
# Usage: bash scripts/cli/wrangler.sh <subcommand> [args...]
SUBCOMMAND="${1:-status}"

if ! command -v wrangler &>/dev/null; then
  echo "❌ wrangler CLI not installed. Install: npm install -g wrangler"
  exit 1
fi

case "$SUBCOMMAND" in
  status)
    echo "☁️  Wrangler status..."
    wrangler whoami 2>/dev/null || echo "  (run 'wrangler login' first)"
    ;;
  *)
    echo "ℹ️  Running: wrangler $*"
    wrangler "${@}"
    ;;
esac
