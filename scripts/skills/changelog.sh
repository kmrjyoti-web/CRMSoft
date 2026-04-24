#!/usr/bin/env bash
# changelog.sh — CRMSoft Changelog Generator (Keep a Changelog format)
# Usage: bash scripts/skills/changelog.sh [mode]
# Modes: generate (default) | all | preview
# macOS bash 3.2 compatible (no declare -g, no grep -P)

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MODE="${1:-generate}"
DATE=$(date +%Y-%m-%d)
CHANGELOG_FILE="$REPO_ROOT/CHANGELOG.md"

banner() { echo ""; echo "━━━ $* ━━━"; }

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  CRMSoft Changelog Generator (PM CLI Phase 2)            ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo "  Mode: $MODE"

# ─── Extract commits by type ─────────────────────────────────────────────────
extract_type() {
  local LOG="$1"
  local TYPE="$2"
  echo "$LOG" | grep -E "^${TYPE}(\([^)]+\))?: " | \
    sed "s/^${TYPE}(\\([^)]*\\)): /- **\\1**: /" | \
    sed "s/^${TYPE}: /- /"
}

# ─── Build changelog section ─────────────────────────────────────────────────
build_changelog_content() {
  local RANGE="$1"
  local VERSION="${2:-Unreleased}"

  local LOG
  LOG=$(git -C "$REPO_ROOT" log "$RANGE" --format="%s" 2>/dev/null | head -200)

  local OUT="## [$VERSION] — $DATE"$'\n\n'

  local FEATS FIXES REFACTORS PERFS TESTS DOCS CHORES CI DEPLOYS
  FEATS=$(extract_type "$LOG" "feat")
  FIXES=$(extract_type "$LOG" "fix")
  REFACTORS=$(extract_type "$LOG" "refactor")
  PERFS=$(extract_type "$LOG" "perf")
  TESTS=$(extract_type "$LOG" "test")
  DOCS=$(extract_type "$LOG" "docs")
  CHORES=$(extract_type "$LOG" "chore")
  CI=$(extract_type "$LOG" "ci")
  DEPLOYS=$(extract_type "$LOG" "deploy")

  [ -n "$FEATS" ]     && OUT+="### Features"$'\n\n'"$FEATS"$'\n\n'
  [ -n "$FIXES" ]     && OUT+="### Bug Fixes"$'\n\n'"$FIXES"$'\n\n'
  [ -n "$REFACTORS" ] && OUT+="### Refactoring"$'\n\n'"$REFACTORS"$'\n\n'
  [ -n "$PERFS" ]     && OUT+="### Performance"$'\n\n'"$PERFS"$'\n\n'
  [ -n "$TESTS" ]     && OUT+="### Tests"$'\n\n'"$TESTS"$'\n\n'
  [ -n "$DOCS" ]      && OUT+="### Documentation"$'\n\n'"$DOCS"$'\n\n'
  [ -n "$CHORES" ]    && OUT+="### Maintenance"$'\n\n'"$CHORES"$'\n\n'
  [ -n "$CI" ]        && OUT+="### CI/CD"$'\n\n'"$CI"$'\n\n'
  [ -n "$DEPLOYS" ]   && OUT+="### Deployments"$'\n\n'"$DEPLOYS"$'\n\n'

  # Fallback if no conventional commits found
  if [ "$OUT" = "## [$VERSION] — $DATE"$'\n\n' ]; then
    OUT+="_No conventional commits found in range. Run: git log $RANGE_"$'\n\n'
    local RECENT
    RECENT=$(git -C "$REPO_ROOT" log "$RANGE" --format="- %s" 2>/dev/null | head -10)
    OUT+="### Recent Commits"$'\n\n'"$RECENT"$'\n\n'
  fi

  echo "$OUT"
}

# ─── Write / update CHANGELOG.md ─────────────────────────────────────────────
write_changelog() {
  local CONTENT="$1"
  local PREVIEW="${2:-false}"

  local HEADER
  HEADER='# Changelog

All notable changes to CRMSoft are documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Commits follow [Conventional Commits](https://www.conventionalcommits.org/).

'

  if [ "$PREVIEW" = "true" ]; then
    echo "━━━ PREVIEW (not written to file) ━━━"
    echo "$HEADER"
    echo "$CONTENT"
    echo "━━━ END PREVIEW ━━━"
    return
  fi

  if [ -f "$CHANGELOG_FILE" ]; then
    local EXISTING_BODY
    EXISTING_BODY=$(awk '/^## \[/{found=1} found{print}' "$CHANGELOG_FILE" 2>/dev/null || true)
    printf '%s\n' "$HEADER$CONTENT$EXISTING_BODY" > "$CHANGELOG_FILE"
  else
    printf '%s\n' "$HEADER$CONTENT" > "$CHANGELOG_FILE"
  fi

  echo "  ✅ Written: CHANGELOG.md"
}

# ─── Determine commit range ───────────────────────────────────────────────────
get_range() {
  case "$MODE" in
    all)
      echo "HEAD~200..HEAD"
      ;;
    *)
      local LAST_TAG
      LAST_TAG=$(git -C "$REPO_ROOT" describe --tags --abbrev=0 2>/dev/null || echo "")
      if [ -n "$LAST_TAG" ]; then
        echo "${LAST_TAG}..HEAD"
      else
        echo "HEAD~50..HEAD"
      fi
      ;;
  esac
}

# ─── DISPATCH ────────────────────────────────────────────────────────────────
case "$MODE" in
  generate|all)
    banner "Generating changelog"
    RANGE=$(get_range)
    CONTENT=$(build_changelog_content "$RANGE" "Unreleased")
    write_changelog "$CONTENT"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Changelog updated: CHANGELOG.md"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    ;;
  preview)
    banner "Preview (dry run — no file write)"
    RANGE=$(get_range)
    CONTENT=$(build_changelog_content "$RANGE" "Unreleased")
    write_changelog "$CONTENT" "true"
    ;;
  *)
    echo "Usage: bash scripts/skills/changelog.sh [generate|all|preview]"
    exit 1
    ;;
esac
