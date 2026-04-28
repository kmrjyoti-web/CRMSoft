#!/bin/bash
# Auto-save prompt execution log
# Usage: ./save-prompt-log.sh "SPRINT5_PART1" "Master Code Restructure DB + Backend" "feat(wl-v2): description"

SPRINT_ID="$1"
DESCRIPTION="$2"
COMMIT_MSG="$3"
DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M:%S)
BRANCH=$(git branch --show-current)
COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "uncommitted")

# Save execution log
cat > "claude-implement/wl-v2/${DATE}_${SPRINT_ID}.md" << LOG_EOF
# ${SPRINT_ID}: ${DESCRIPTION}
# Date: ${DATE} ${TIME}
# Branch: ${BRANCH}
# Commit: ${COMMIT_HASH}
# Status: COMPLETED

## Files changed in this sprint:
$(git diff --name-only HEAD~1 2>/dev/null || echo "See git log")

## Next prompt:
[Will be filled by next execution]
LOG_EOF

echo "✅ Prompt log saved: claude-implement/wl-v2/${DATE}_${SPRINT_ID}.md"

# Add to git
git add claude-implement/
git add -A
git commit -m "${COMMIT_MSG}

Auto-saved prompt log: ${SPRINT_ID}"
git push origin development/wl-platform-v2

echo "✅ Committed + pushed to development/wl-platform-v2"
