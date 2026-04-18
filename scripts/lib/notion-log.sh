#!/usr/bin/env bash
# notion-log.sh — CRMSoft PM CLI Notion Logger
# Usage: bash scripts/lib/notion-log.sh <action> [tag] [status] [details]
# Falls back to local-only logging if NOTION_TOKEN not set.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ACTION="${1:-unknown}"
TAG="${2:-project}"
STATUS="${3:-info}"
DETAILS="${4:-}"
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
OPS_LOG="$REPO_ROOT/.claude/operations.log"

# Always log locally first (reliable, no network dependency)
echo "[$TS] action=$ACTION tag=$TAG status=$STATUS ${DETAILS:+details=$DETAILS}" >> "$OPS_LOG"

# Try Node.js Notion logger if token is configured
if [ -n "${NOTION_TOKEN:-}" ] && [ -f "$REPO_ROOT/scripts/lib/notion-logger.js" ]; then
  node "$REPO_ROOT/scripts/lib/notion-logger.js" "$ACTION" "$TAG" "$STATUS" "$DETAILS" 2>/dev/null || {
    echo "⚠️  Notion API log failed (non-fatal) — logged locally only"
  }
else
  echo "📋 Logged locally → .claude/operations.log (set NOTION_TOKEN to enable Notion API logging)"
fi
