#!/usr/bin/env bash
# branch-check.sh — CRMSoft Git Branch Strategy Status
# Reports current branch name, naming convention compliance,
# uncommitted changes, and unpushed commits.
# Usage: bash scripts/governance/branch-check.sh

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  CRMSoft Branch Strategy Check                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "  Branch:        $BRANCH"

# Naming convention check
VALID_PREFIXES="^(main|master|develop|feature/|fix/|chore/|refactor/|sprint/|wip/|release/|hotfix/|partner/)"
if echo "$BRANCH" | grep -qE "$VALID_PREFIXES"; then
  echo "  Convention:    ✅ PASS"
else
  echo "  Convention:    ⚠️  Non-standard (expected: feature/, fix/, chore/, refactor/, sprint/, wip/, release/)"
fi

# Uncommitted changes
UNCOMMITTED=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
if [ "$UNCOMMITTED" -eq 0 ]; then
  echo "  Uncommitted:   ✅ Clean (0 files)"
else
  echo "  Uncommitted:   ⚠️  $UNCOMMITTED file(s) with changes"
fi

# Unpushed commits
UNPUSHED=$(git log "origin/${BRANCH}..HEAD" --oneline 2>/dev/null | wc -l | tr -d ' ')
if [ "$UNPUSHED" -eq 0 ]; then
  echo "  Unpushed:      ✅ Up to date"
elif [ "$UNPUSHED" -le 5 ]; then
  echo "  Unpushed:      ℹ️  $UNPUSHED commit(s) ahead of origin"
else
  echo "  Unpushed:      ⚠️  $UNPUSHED commit(s) ahead of origin — consider pushing"
fi

# Protected branch warning
for protected in main master production; do
  if [ "$BRANCH" = "$protected" ]; then
    echo ""
    echo "  ⚠️  WARNING: On protected branch '$BRANCH'"
    echo "     Never commit directly to $BRANCH — use a feature branch + PR"
    break
  fi
done

echo ""
