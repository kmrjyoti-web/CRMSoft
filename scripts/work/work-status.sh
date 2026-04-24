#!/usr/bin/env bash
# work-status.sh — PM CLI quick status dashboard
# Usage: bash scripts/work/work-status.sh

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
DIRTY=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
AHEAD=$(git rev-list @{u}..HEAD 2>/dev/null | wc -l | tr -d ' ' || echo "?")
PLANNED=$(ls "$REPO_ROOT/.claude/working/planned/"*.md 2>/dev/null | wc -l | tr -d ' ')
IN_PROG=$(ls "$REPO_ROOT/.claude/working/in-progress/"*.md 2>/dev/null | wc -l | tr -d ' ')
COMPLETED=$(ls "$REPO_ROOT/.claude/working/completed/"*.md 2>/dev/null | wc -l | tr -d ' ')
LAST_SESSION=$(ls -t "$REPO_ROOT/.claude/sessions/"*.md 2>/dev/null | head -1 | xargs basename 2>/dev/null || echo "none")
LAST_BACKUP=$(ls -t "$REPO_ROOT/.claude/backups/"*.tar.gz 2>/dev/null | head -1 | xargs basename 2>/dev/null || echo "none")

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  CRMSoft PM CLI — Status                                 ║"
echo "╠══════════════════════════════════════════════════════════╣"
printf "║  Branch:         %-40s║\n" "$BRANCH"
printf "║  Uncommitted:    %-40s║\n" "$DIRTY file(s)"
printf "║  Ahead of remote:%-40s║\n" "$AHEAD commit(s)"
echo "╠══════════════════════════════════════════════════════════╣"
printf "║  Planned prompts:%-40s║\n" "$PLANNED"
printf "║  In-progress:    %-40s║\n" "$IN_PROG"
printf "║  Completed:      %-40s║\n" "$COMPLETED"
echo "╠══════════════════════════════════════════════════════════╣"
printf "║  Last session:   %-40s║\n" "$LAST_SESSION"
printf "║  Last backup:    %-40s║\n" "$LAST_BACKUP"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
