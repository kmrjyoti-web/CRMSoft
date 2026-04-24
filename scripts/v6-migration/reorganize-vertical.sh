#!/bin/bash
# Post-import reorganization for a vertical.
# After git subtree brings in external project files flat into verticals/{name}/,
# this script classifies and moves them into:
#   modules/        — NestJS backend modules (src/modules/ or backend/src/)
#   data-models/    — Prisma schemas (*.prisma)
#   ai-customization/ — AI config, prompts, fine-tune data
#
# Usage: ./reorganize-vertical.sh [vertical-name]
# Example: ./reorganize-vertical.sh travel

set -euo pipefail

VERTICAL=${1:-travel}
TARGET="verticals/$VERTICAL"

cd "$(git rev-parse --show-toplevel)"

if [ ! -d "$TARGET" ]; then
  echo "ERROR: $TARGET not found"
  exit 1
fi

echo "=========================================="
echo "Reorganize Vertical: $VERTICAL"
echo "Target: $TARGET"
echo "=========================================="
echo ""

# ── 1. Prisma schemas → data-models/ ──────────────────────────────────────────
echo "=== Step 1: Prisma schemas → $TARGET/data-models/ ==="
prisma_count=0
while IFS= read -r -d '' schema; do
  rel="${schema#$TARGET/}"
  dest="$TARGET/data-models/$(basename "$schema")"
  if [ "$schema" != "$dest" ]; then
    echo "  mv $rel → data-models/$(basename "$schema")"
    git mv "$schema" "$dest" 2>/dev/null || mv "$schema" "$dest"
    prisma_count=$((prisma_count + 1))
  fi
done < <(find "$TARGET" -name "*.prisma" ! -path "$TARGET/data-models/*" -print0)
echo "  Moved: $prisma_count prisma file(s)"
echo ""

# ── 2. NestJS modules → modules/ ──────────────────────────────────────────────
echo "=== Step 2: NestJS backend modules → $TARGET/modules/ ==="
module_count=0
# Detect common backend source patterns
for src_dir in "$TARGET/src/modules" "$TARGET/backend/src/modules" "$TARGET/apps/api/src/modules" "$TARGET/server/src/modules"; do
  if [ -d "$src_dir" ]; then
    echo "  Found backend modules at: $src_dir"
    for mod in "$src_dir"/*/; do
      mod_name=$(basename "$mod")
      dest="$TARGET/modules/$mod_name"
      echo "    mv $mod_name → modules/$mod_name"
      git mv "$mod" "$dest" 2>/dev/null || mv "$mod" "$dest"
      module_count=$((module_count + 1))
    done
    break
  fi
done
if [ "$module_count" -eq 0 ]; then
  echo "  ⚠️  No standard src/modules directory found — manual classification needed"
  echo "  Hint: look for *.module.ts files:"
  find "$TARGET" -name "*.module.ts" ! -path "*/node_modules/*" 2>/dev/null | head -10 | sed 's/^/    /'
fi
echo "  Moved: $module_count module(s)"
echo ""

# ── 3. AI assets → ai-customization/ ─────────────────────────────────────────
echo "=== Step 3: AI assets → $TARGET/ai-customization/ ==="
ai_count=0
for ai_dir in "$TARGET/ai" "$TARGET/src/ai" "$TARGET/prompts" "$TARGET/fine-tune"; do
  if [ -d "$ai_dir" ]; then
    echo "  Found AI dir: $ai_dir"
    dest="$TARGET/ai-customization/$(basename "$ai_dir")"
    git mv "$ai_dir" "$dest" 2>/dev/null || mv "$ai_dir" "$dest"
    ai_count=$((ai_count + 1))
  fi
done
if [ "$ai_count" -eq 0 ]; then
  echo "  No AI directories found (expected — Travel project may not have AI layer yet)"
fi
echo ""

# ── 4. Cleanup: remove build artifacts and duplicate roots ────────────────────
echo "=== Step 4: Cleanup build artifacts ==="
for artifact in node_modules dist .next .nuxt build coverage .turbo; do
  if [ -d "$TARGET/$artifact" ]; then
    echo "  Removing $artifact/ (build artifact — do not commit)"
    rm -rf "$TARGET/$artifact"
  fi
done

# Remove lock files that came from the travel project root
for lockfile in package-lock.json yarn.lock bun.lockb; do
  if [ -f "$TARGET/$lockfile" ]; then
    echo "  Removing $lockfile (use pnpm from monorepo root)"
    rm -f "$TARGET/$lockfile"
  fi
done
echo ""

# ── 5. Summary ────────────────────────────────────────────────────────────────
echo "=========================================="
echo "Reorganization summary for $VERTICAL:"
echo "  data-models/: $prisma_count prisma schema(s)"
echo "  modules/:     $module_count backend module(s)"
echo "  ai-customization/: $ai_count AI directory(s)"
echo ""
echo "Remaining files in $TARGET/ root:"
find "$TARGET" -maxdepth 1 -type f | sed "s|$TARGET/||" | grep -v "^README" | sort
echo ""
echo "Next steps:"
echo "  1. Review modules/ — are all NestJS modules present?"
echo "  2. Review data-models/ — run check-vertical-conflicts.sh"
echo "  3. Update $TARGET/README.md with module inventory"
echo "  4. git add -A && git commit -m 'chore($VERTICAL): reorganize into modules/data-models/ai-customization'"
echo "=========================================="
