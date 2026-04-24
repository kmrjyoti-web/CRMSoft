# Dev 4 — Travel Project Merge: Complete Runbook

**Date:** 2026-04-23 (prep) | Execute Day 2-3
**Branch:** feat/dev4-travel-merge
**Target:** verticals/travel/

---

## STATUS: BLOCKED — Waiting for Kumar to provide Travel project git URL

Once URL is received, execute phases in order. Each phase has a DONE gate before proceeding.

---

## Pre-flight Checklist

```bash
cd ~/GitProject/CRM/CrmProject

# Verify you're on the right branch
git branch --show-current
# → feat/dev4-travel-merge

# Verify verticals/travel/ is skeleton-only (should show 3 .gitkeep files)
find verticals/travel -type f
# → verticals/travel/data-models/.gitkeep
# → verticals/travel/ai-customization/.gitkeep
# → verticals/travel/modules/.gitkeep

# Confirm CRMSoft backend tsc is clean (baseline = 0)
cd apps-backend/api && pnpm exec tsc --noEmit 2>&1 | grep -c "error TS" || true
# → 0
cd ../..
```

**DONE gate:** All 3 checks pass before proceeding.

---

## PHASE 1: Clone and Audit (1 hr)

### Step 1.1 — Receive URL from Kumar

Replace `<TRAVEL_REPO_URL>` with the URL Kumar provides at standup.

```bash
TRAVEL_REPO="<TRAVEL_REPO_URL>"
echo "Travel repo: $TRAVEL_REPO"
```

### Step 1.2 — Clone to temp for audit

```bash
cd /tmp
rm -rf travel-audit
git clone $TRAVEL_REPO travel-audit
cd travel-audit

echo "=== Root structure ==="
ls -la

echo "=== package.json name and version ==="
cat package.json | head -5

echo "=== Source directories (2 levels) ==="
find src -maxdepth 2 -type d 2>/dev/null | head -30 || find . -maxdepth 3 -type d | grep -v node_modules | head -30

echo "=== NestJS modules ==="
find . -name "*.module.ts" ! -path "*/node_modules/*" | head -20

echo "=== Prisma schemas ==="
find . -name "*.prisma" ! -path "*/node_modules/*"

echo "=== Frontend presence ==="
find . -name "next.config*" -o -name "vite.config*" | grep -v node_modules | head -5

echo "=== File count (no node_modules) ==="
find . -type f ! -path "*/node_modules/*" ! -path "*/.git/*" | wc -l
```

### Step 1.3 — Record audit findings

Fill in this table before continuing:

| Question | Answer |
|---|---|
| Root package name | |
| Has backend (NestJS)? | Y / N |
| Backend entry: `src/modules/` path | |
| NestJS module count | |
| Has frontend (Next/Vite/React)? | Y / N |
| Frontend type | |
| Has Prisma schemas? | Y / N |
| Prisma schema count | |
| Has AI/ML code? | Y / N |

### Step 1.4 — Check for shared entity overlap

```bash
cd /tmp/travel-audit

# Extract Travel model names
grep -rh "^model " --include="*.prisma" . 2>/dev/null | awk '{print $2}' | sort -u

# Check for names that CRMSoft already owns (HIGH RISK LIST):
# TourPlan, TourPlanVisit, TourPlanPhoto → in CRMSoft demo/working crm.prisma
# Package, IndustryPackage → in CRMSoft platform schemas
# Activity, Contact, Organization, Lead → in CRMSoft core CRM
```

**DONE gate:** Audit table filled. Model overlap identified. Proceed to Phase 2.

---

## PHASE 2: Import via git subtree (1 hr)

```bash
cd ~/GitProject/CRM/CrmProject

# Run the import script (uses git subtree add --squash)
./scripts/v6-migration/import-travel-project.sh $TRAVEL_REPO main travel
```

**What the script does:**
1. Verifies `verticals/travel/` has no real source files (safe guard)
2. Runs `git subtree add --prefix=verticals/travel/ <url> main --squash`
3. This creates ONE squash commit preserving all Travel history attribution

**If import fails:**

```bash
# Option A: subtree conflicts — check if verticals/travel/ has unexpected files
find verticals/travel -type f ! -name ".gitkeep"

# Option B: auth failure — check SSH key or token for Travel repo
ssh -T git@github.com   # or equivalent

# Option C: branch name wrong — try 'master' instead of 'main'
./scripts/v6-migration/import-travel-project.sh $TRAVEL_REPO master travel
```

**DONE gate:** `ls verticals/travel/` shows Travel project files mixed with `.gitkeep` dirs.

---

## PHASE 3: Reorganize into Vertical Structure (2-3 hrs)

### Step 3.1 — Remove build artifacts first

```bash
cd ~/GitProject/CRM/CrmProject

# Remove artifacts that must NOT be committed
rm -rf verticals/travel/node_modules
rm -rf verticals/travel/dist
rm -rf verticals/travel/.next
rm -f  verticals/travel/package-lock.json
rm -f  verticals/travel/yarn.lock
```

### Step 3.2 — Run the reorganize script

```bash
./scripts/v6-migration/reorganize-vertical.sh travel
```

**The script will:**
- Move `*.prisma` files → `verticals/travel/data-models/`
- Detect `src/modules/` pattern and move NestJS modules → `verticals/travel/modules/`
- Detect AI directories → `verticals/travel/ai-customization/`
- Report anything it couldn't classify automatically

### Step 3.3 — Manual classification (script handles common patterns; edge cases need human)

After the script runs, check what remains unclassified:

```bash
# Files still in the travel root that need placement
find verticals/travel -maxdepth 1 -type f | grep -v "README\|package.json"

# Directories still in root (besides modules/data-models/ai-customization/)
find verticals/travel -maxdepth 1 -type d | grep -v "modules\|data-models\|ai-customization\|\.git"
```

**Common patterns to handle manually:**

| Travel directory | Where to put it |
|---|---|
| `src/config/` | `modules/config/` |
| `src/common/` or `src/shared/` | `modules/_shared/` |
| `frontend/` or `apps/web/` | Note in README — separate App entry for Day 3 |
| `docs/` | Keep in `verticals/travel/docs/` |
| `scripts/` | Keep in `verticals/travel/scripts/` (don't delete) |

### Step 3.4 — Update verticals/travel/README.md

Create a module inventory:

```bash
cat > verticals/travel/README.md << 'EOF'
# Vertical: Travel

Imported from: <TRAVEL_REPO_URL> (commit: $(git log --oneline -1 verticals/travel/ | awk '{print $1}'))
Import date: 2026-04-24
Importer: Dev 4

## Modules

| Module | Path | Description |
|---|---|---|
| (fill after reorganize) | modules/ | |

## Data Models

| Schema | Models | Notes |
|---|---|---|
| (fill from data-models/) | | |

## Known CRMSoft Overlaps

| Travel Model | CRMSoft Model | Resolution |
|---|---|---|
| TourPlan (if present) | TourPlan in demo/working crm.prisma | Use separate Prisma client |

## Integration Status

- [ ] Modules imported
- [ ] Prisma schemas in data-models/
- [ ] Conflict check run (check-vertical-conflicts.sh)
- [ ] CRMSoft backend tsc still 0 errors
EOF
```

**DONE gate:** `verticals/travel/modules/` has NestJS module directories. `verticals/travel/data-models/` has `.prisma` files (or empty if Travel had none). README updated.

---

## PHASE 4: Conflict Check + Integration Test (1-2 hrs)

### Step 4.1 — Run conflict checker

```bash
./scripts/v6-migration/check-vertical-conflicts.sh travel
```

**Expected outcomes:**

| Exit code | Meaning | Action |
|---|---|---|
| 0 | No collisions | Proceed to 4.2 |
| 2 | Collisions found | See conflict resolution below |

**Conflict resolution (if exit code 2):**

Recommended strategy: **keep Travel Prisma schemas in a separate Prisma client**, same pattern as CRMSoft's 7 per-module clients. This avoids any renaming.

```bash
# Add a verticals/travel/data-models/_base.prisma with dedicated datasource:
cat > verticals/travel/data-models/_base.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
  output   = "../../../../apps-backend/api/node_modules/.prisma/travel-client"
}

datasource db {
  provider = "postgresql"
  url      = env("TRAVEL_DATABASE_URL")
}
EOF
```

This way Travel models exist in a completely isolated Prisma client — zero naming conflicts possible.

### Step 4.2 — Verify CRMSoft backend tsc stays clean

```bash
cd apps-backend/api
pnpm exec tsc --noEmit 2>&1 | grep -c "error TS" || true
# MUST still be 0 — if not, the import broke something in imports resolution
```

### Step 4.3 — Run full health check

```bash
cd ~/GitProject/CRM/CrmProject
./scripts/v6-migration/verify-migration-health.sh
```

**DONE gate:** Health check passes. Backend tsc = 0. Conflict check exit 0 or resolution documented.

---

## PHASE 5: Commit and PR (30 min)

### Step 5.1 — Stage and commit

```bash
cd ~/GitProject/CRM/CrmProject

git add verticals/travel/
git add scripts/v6-migration/reorganize-vertical.sh
git add scripts/v6-migration/check-vertical-conflicts.sh

git status --short | grep -v "^??" | head -20

git commit -m "feat(dev4): travel project imported and reorganized into verticals/travel"
```

### Step 5.2 — Open PR

```bash
git push origin feat/dev4-travel-merge

gh pr create \
  --base sprint/v6-skeleton-2026-04-23 \
  --title "feat(dev4): travel project merge into verticals/travel" \
  --body "## Summary

- Travel project imported via git subtree (history preserved)
- Reorganized into modules/, data-models/, ai-customization/
- Prisma conflict check run: [0 / N] collisions
- CRMSoft backend tsc: 0 errors (unchanged)

## Vertical Structure

\`\`\`
verticals/travel/
├── modules/       (<N> NestJS modules)
├── data-models/   (<N> Prisma schemas)
├── ai-customization/
└── README.md
\`\`\`

## Conflicts

[Describe any model name collisions and how resolved]

## Test plan
- [ ] \`./scripts/v6-migration/check-vertical-conflicts.sh travel\` → exit 0
- [ ] \`cd apps-backend/api && pnpm exec tsc --noEmit\` → 0 errors
- [ ] \`./scripts/v6-migration/verify-migration-health.sh\` → all pass
- [ ] verticals/travel/modules/ has actual NestJS modules (not just .gitkeep)"
```

---

## Day 3 Extension: Electronic Project

Once Travel PR is merged, repeat PHASES 1-5 for Electronic:

```bash
git checkout sprint/v6-skeleton-2026-04-23
git pull
git checkout -b feat/dev4-electronic-merge

ELECTRONIC_REPO="<ELECTRONIC_REPO_URL from Kumar>"
./scripts/v6-migration/import-travel-project.sh $ELECTRONIC_REPO main electronic
./scripts/v6-migration/reorganize-vertical.sh electronic
./scripts/v6-migration/check-vertical-conflicts.sh electronic
```

---

## Known CRMSoft High-Risk Models

Models CRMSoft already owns that a Travel/Electronic project is likely to reuse:

| Model | CRMSoft Schema | Risk Level |
|---|---|---|
| TourPlan | `demo/crm.prisma`, `working/crm.prisma` | HIGH |
| TourPlanVisit | `demo/crm.prisma`, `working/crm.prisma` | HIGH |
| TourPlanPhoto | `demo/crm.prisma`, `working/crm.prisma` | HIGH |
| Package | `platform/modules.prisma` | MEDIUM |
| IndustryPackage | `platform/modules.prisma` | MEDIUM |
| Activity | `demo/crm.prisma`, `working/crm.prisma` | HIGH |
| Contact | `demo/crm.prisma`, `working/crm.prisma` | HIGH |
| Lead | `demo/crm.prisma`, `working/crm.prisma` | MEDIUM |
| Booking* | Not in CRMSoft | LOW (new) |
| Itinerary* | Not in CRMSoft | LOW (new) |
| Flight* | Not in CRMSoft | LOW (new) |

**Recommended resolution for all conflicts:** Separate Prisma client per vertical.
CRMSoft already uses 7 per-module clients — same pattern scales to verticals cleanly.

---

## Escalation

| Situation | Action |
|---|---|
| Travel repo access denied | DM Kumar immediately — Day 2 blocker |
| git subtree fails with large history | Use `--squash` (already in script) |
| >10 model name collisions | Escalate to Kumar — architecture decision on DB isolation |
| CRMSoft backend tsc breaks after import | Do NOT commit — git stash, investigate imports |
