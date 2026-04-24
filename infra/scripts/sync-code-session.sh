#!/bin/bash
# Run this at the END of a Claude Code session to sync results to git
# Usage: ./infra/scripts/sync-code-session.sh "Brief description of what was built"

cd /Users/kmrjyoti/MyFile/Working/CRM-SOFT

DESCRIPTION=${1:-"Code session update"}
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")

# Append to session-log.md
echo "" >> .claude/sync/session-log.md
echo "### $TIMESTAMP — $DESCRIPTION" >> .claude/sync/session-log.md
echo "(Details added by Claude Code)" >> .claude/sync/session-log.md

# Commit and push
git add -A
git commit -m "sync: code session — $DESCRIPTION [Claude Code]"
git push origin main

echo "✅ Code session synced to git"
echo "Notion log: managed by Claude Chat (paste results there for Notion logging)"
