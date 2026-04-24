#!/bin/bash
# Run this after a Claude Chat session to sync decisions to git
# Usage: ./infra/scripts/sync-chat-context.sh "Brief description of what was decided"

cd /Users/kmrjyoti/MyFile/Working/CRM-SOFT

DESCRIPTION=${1:-"Chat context update"}
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")

# Append to chat-context.md
echo "" >> .claude/sync/chat-context.md
echo "### $TIMESTAMP — $DESCRIPTION" >> .claude/sync/chat-context.md
echo "(Details added by Claude Chat)" >> .claude/sync/chat-context.md

# Commit and push
git add .claude/sync/
git commit -m "sync: chat context update — $DESCRIPTION [Claude Chat]"
git push origin main

echo "✅ Chat context synced to git"
echo "✅ Notion logging handled by Claude Chat directly"
echo "Next Claude Code session will read this at startup"
