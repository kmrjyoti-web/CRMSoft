#!/usr/bin/env bash
# alert.sh — Unsafe mode detection and banner helpers
# Source this file: source scripts/lib/alert.sh

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
UNSAFE_FLAG="$REPO_ROOT/.claude/.unsafe-mode"
UNSAFE_ACK="$REPO_ROOT/.claude/.unsafe-mode-ack"

is_unsafe_mode() {
  [ -f "$UNSAFE_FLAG" ]
}

require_unsafe_ack() {
  if is_unsafe_mode && [ ! -f "$UNSAFE_ACK" ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║  ⚠️   UNSAFE MODE ACTIVE — RISK CONTROLS DISABLED        ║"
    echo "║  This disables backup-before-action and git checks.      ║"
    echo "║  Create .claude/.unsafe-mode-ack to acknowledge.         ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
    return 1
  fi
  return 0
}

banner_info() {
  echo "ℹ️  $*"
}

banner_warn() {
  echo "⚠️  $*"
}

banner_error() {
  echo "❌ $*"
}

banner_success() {
  echo "✅ $*"
}
