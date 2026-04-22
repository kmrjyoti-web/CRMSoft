# Track Execution Briefs

One brief per track. Read yours end-to-end before Hour 0.

## 8-audit-category coverage matrix

All 8 mandatory audit categories must be covered. Assignment:

| # | Audit category        | Primary track | Supporting track |
| :-: | :------------------ | :------------ | :--------------- |
| 1 | Project structure     | Track 1       | Track 2          |
| 2 | Architecture          | Track 2       | —                |
| 3 | Folder organization   | Track 1       | —                |
| 4 | Notion docs           | Track 4       | Track 5          |
| 5 | Database              | Track 3       | —                |
| 6 | Code                  | Track 1       | Track 2          |
| 7 | CI/CD                 | Track 2       | Track 5          |
| 8 | Test coverage         | Track 1       | Track 2          |

If a category looks underweight in your track, flag it in the Hour 4 standup.

---

## Track 1 — Code Audit

**Owner:** ___________
**Branch:** `sprint-audit/track-1-code`
**Output:** `/tmp/v2/01-code-audit.md` + V2 Notion "Code Structure" page

### Scope
- Folder structure mapping covers ALL of:
  - `Application/backend/` (primary backend) + `Application/frontend/customer-portal/` + `Application/frontend/marketplace/`
  - `Customer/frontend/crm-admin/`
  - `Vendor/frontend/vendor-panel/`
  - `WhiteLabel/wl-admin/`, `wl-partner/`, `wl-api/` (← wl-api is a second backend), `provisioning/`, `scripts/`
  - `PlatformConsole/frontend/platform-console/`
  - `Shared/backend/` (11 packages: audit, cache, encryption, errors, global-data, identity, notifications, prisma, queue, storage, tenant)
  - `Shared/common/`, `Shared/frontend/`, `Shared/prisma-schemas/`
- Module inventory — **confirmed scope: ~78 module directories in backend + 11 `Shared/backend/` packages = 89 logical units.** Pre-sprint recount also showed 144 `*.module.ts` files repo-wide. Track 1 produces the final reconciled number with evidence.
- **Shared/backend DEEP audit (Kumar Decision 2):** one inventory entry per package (`audit`, `cache`, `encryption`, `errors`, `global-data`, `identity`, `notifications`, `prisma`, `queue`, `storage`, `tenant`) — each gets: purpose, public API surface, consumers (who imports it), test coverage, naming compliance.
- Dead code candidates — **Kumar Decision 3: use `ts-prune`, not the grep heuristic.** Step 0 of Track 1 is to install it (see Steps below). Grep script is a fallback only if install fails.
- Duplicate patterns (same logic in multiple places — utils/helpers/services)
- Naming convention compliance (camelCase vs kebab-case vs PascalCase; file naming)
- Test coverage inventory — per-app + per-shared-package. 2 backends (Application/backend + WhiteLabel/wl-api) + 7 frontends + 11 shared packages.

### Input reports
- `/tmp/crm-admin-errors-audit-2026-04-19.md` — 328 tsc errors, feature-level breakdown
- `/tmp/walkthrough-notes-2026-04-19.md` — general context

### Scripts available (in `sprint-findings/scripts/`)
- `audit-folder-structure.sh` — produces folder tree per app
- `audit-module-inventory.sh` — counts modules, lists them
- `audit-dead-code-services.sh` — finds exports never imported (heuristic)
- `audit-duplicate-filenames.sh` — finds same-name files across tree
- `audit-naming-conventions.sh` — compliance check

### Steps
0. **Install `ts-prune` (Kumar Decision 3):**
   ```sh
   cd Application/backend && pnpm add -D ts-prune
   # OR globally:
   # npm install -g ts-prune
   ```
   Log the install in `/tmp/v2/track-1-raw/ts-prune-install.log`. If install fails in 10 min, fall back to `audit-dead-code-services.sh` grep heuristic and note the fallback in your Hour 4 standup.
1. Run all 5 Track 1 scripts, dump output to `/tmp/v2/track-1-raw/`
2. Run `ts-prune` against `Application/backend/`, `WhiteLabel/wl-api/`, and each of the 11 `Shared/backend/` packages — dump output to `/tmp/v2/track-1-raw/ts-prune/`
3. Skim `Application/backend/src/modules/` + `src/common/` + `src/core/` structure
4. **For each of the 7 frontends** (Application/frontend/{customer-portal,marketplace}, Customer/frontend/crm-admin, Vendor/frontend/vendor-panel, WhiteLabel/{wl-admin,wl-partner}, PlatformConsole/frontend/platform-console) — list top-level dirs under `src/`
5. **For each of the 11 `Shared/backend/` packages** — write purpose (1 line), public API (exports), consumers (who imports), test presence (y/n), naming compliance (y/n)
6. Identify top 5 dead code candidates using `ts-prune` output (not grep)
7. Identify top 5 duplicate logic patterns (same code in ≥2 files)
8. Draft `01-code-audit.md` with sections: Structure, Modules (89 reconciliation), Shared Packages (11 entries), Dead Code (ts-prune), Duplicates, Naming, Tests
9. Populate V2 Notion "Code Structure" page

### Definition of done
- All sections of `01-code-audit.md` written with evidence (file paths + line numbers)
- Module count reconciled (expected ~78 + 11 shared = 89 logical units; report final verified number)
- 11 Shared/backend packages each have their own inventory entry
- `ts-prune` output reviewed; top dead-code candidates listed with verification status
- Notion page live with folder org + module directory + shared packages + standards

---

## Track 2 — Architecture Audit

**Owner:** ___________
**Branch:** `sprint-audit/track-2-architecture`
**Output:** `/tmp/v2/02-architecture-audit.md` + V2 Notion "Architecture" page

### Scope
- Layer compliance (CQRS + DDD boundaries — controllers don't call repositories directly, etc.) — **covers both backends: Application/backend AND WhiteLabel/wl-api (Kumar Decision 1)**
- Cross-module dependencies (import graph — is it a DAG or does it have cycles?)
- **Shared/backend 11-package dependency graph (Kumar Decision 2):** which apps consume which packages; inter-package dependencies; extraction readiness per package (1-5 rating, same scale as microservice-readiness)
- API patterns consistency (REST conventions, `Result<T>` usage, DTO layer) — **attribute the 1950 routes: how many in Application/backend vs WhiteLabel/wl-api**
- Design pattern adherence (repository, service, factory, etc.)
- Microservice-readiness assessment (is the monolith splittable along module boundaries?)
- CI/CD pipeline audit — the 3 existing GitHub workflows (`ci-backend.yml`, `ci-crm-admin.yml`, `ci-vendor-panel.yml`), what they cover, blocking vs non-blocking, and which apps have NO CI (expected gaps: customer-portal, marketplace, wl-api, wl-admin, wl-partner, platform-console — confirm)
- Document the per-DB wrapper service pattern (`MktPrismaService`, `this.db.*`) as a first-class architectural decision — see strategic-analysis handoff

### Input reports
- `/tmp/smoke-test-2026-04-19.md` — portal smoke test findings
- `/tmp/strategic-analysis-2026-04-19.md` — foundation strategic state

### Scripts available
- `audit-layer-compliance.sh` — checks controller→service→repo layering
- `audit-cross-module-deps.sh` — produces import graph, flags cycles
- `audit-api-patterns.sh` — samples routes for Result<T> + DTO usage
- `audit-cqrs-adherence.sh` — command/query separation check

### Steps
1. Run all 4 Track 2 scripts → `/tmp/v2/track-2-raw/` (against **Application/backend** by default)
2. Re-run the same scripts against `WhiteLabel/wl-api/` — pass `BACKEND=WhiteLabel/wl-api/src` via env. Cross-reference Track 1's inventory of that backend.
3. Review `.github/workflows/*.yml` — document what each CI does, blocking vs informational, and enumerate apps that have NO CI
4. Pick 10 sample routes from Application/backend + 5 from wl-api, trace request → response
5. Draw two dependency graphs (mermaid):
   - Application/backend module graph
   - Shared/backend 11-package consumption graph (which app/backend imports which package)
6. Microservice-readiness: rate each Application/backend top-level module AND each Shared/backend package 1-5 (5 = ready to extract)
7. Draft `02-architecture-audit.md` — must explicitly cover: main backend, wl-api, Shared/backend deps, CI/CD, per-DB wrapper pattern
8. Coordinate with Track 1 on Shared/backend package inventory — Track 1 owns purpose/consumers; Track 2 owns dependency graph + extraction readiness. Do not duplicate.
9. Populate V2 Notion "Architecture" page

### Definition of done
- TWO import graphs committed (main backend module graph + Shared/backend consumption graph), both mermaid
- CI/CD section documents all 3 workflows + enumerates apps with no CI
- Microservice-readiness rating for each Application/backend module AND each Shared/backend package
- wl-api has its own mini-section in the report: CQRS/DDD compliance, routes, patterns, coordination with Application/backend
- Notion page live with System Design + API Patterns + CI/CD + Security + Shared Packages

---

## Track 3 — Database Audit v2

**Owner:** ___________ (+ Kumar support on 192 SAFE_DROP blocker)
**Branch:** `sprint-audit/track-3-database`
**Output:** `/tmp/v2/03-db-audit-v2.md` + V2 Notion "Database" page

### Scope
- Build on today's DB audit, do NOT redo the 617-model count work
- Per-DB purpose documentation for all 7 DBs
- Model naming conventions per DB (how are they different, why?)
- FK relationship maps (where are cross-DB refs that can't be real FKs?)
- **BLOCKER:** solve the 192 SAFE_DROP list — find it or determine it's definitively lost
- **WhiteLabel/wl-api DB connections (Kumar Decision 1):** document which of the 7 DBs wl-api connects to, any wl-specific schemas, and whether wl-api uses the same Prisma wrapper-service pattern as Application/backend. Note: today's DB audit already covers WhiteLabelDB (shared 16 tables) — extend that with wl-api's consumption perspective.

### Input reports
- `/tmp/db-audit-2026-04-19.md` — today's foundational DB audit
- `/tmp/legacy-migration-plan-2026-04-19.md` — SAFE_DROP blocker docs

### Steps
1. Re-read today's DB audit end-to-end — do not duplicate
2. For each of 7 DBs, write 1-2 paragraphs: purpose, primary consumers, lifecycle
3. For the SAFE_DROP 192 list: try commit `2b0a64a0` alternative paths, `git log -S`, backup dirs, node_modules stale copies
4. If found: produce final cleanup plan with explicit model list
5. If not found: document the gap honestly, propose rebuild approach (query live DBs for untouched-in-90-days tables)
6. FK map: where do modules conceptually reference another DB's row? List all and mark as "shared id" vs "true FK"
7. **wl-api DB audit:** inspect `WhiteLabel/wl-api/src` for Prisma usage — which DBs, which models, any wrapper-service pattern deviation. Extend today's WhiteLabelDB (16-table) documentation accordingly.
8. Populate V2 Notion "Database" page with corrected Database Architecture v2 — include wl-api's consumption diagram

### Definition of done
- Per-DB page section for all 7
- 192 SAFE_DROP resolution: either recovered or gap documented with rebuild plan
- FK/cross-DB-ref map complete
- wl-api DB consumption documented (connections, models used, pattern adherence)
- Notion page matches code reality (not old Notion)

---

## Track 4 — Notion Audit + V2 Workspace

**Owner:** ___________ (usually the friend / generalist)
**Branch:** `sprint-audit/track-4-notion`
**Output:** `/tmp/v2/04-notion-audit.md` + **live V2 Notion workspace**

### Scope
- Inventory existing Notion (list all pages/databases in current workspace)
- Classify each page: Accurate / Stale / Missing / Wrong
- Create V2 workspace with structure from `03-V2_NOTION_WORKSPACE_TEMPLATE.md`
- Migrate verified-accurate content from old workspace
- Archive old workspace with "Archive — Pre-V2" banner

### Notion admin arrangement (Kumar Decision 4)
- **Kumar is workspace OWNER.** Kumar creates "CRM Version 2" workspace before / at Hour 0.
- **Track 4 owner (friend) is added as collaborator with editor permission** — full structure + content build, page edits, database creation.
- **Customer-facing share links require Kumar approval** before going live. Friend drafts link + access scheme, Kumar approves, Kumar publishes.
- **Old workspace archival:** friend prepares the archive banner + permission change, Kumar executes (signs off and applies).

### Critical dependencies
- Kumar confirms workspace creation at or before Hour 0 (not a Track 4 unblock)
- Friend has editor access confirmed in writing (DM / email) before starting
- Permission scheme decided jointly with Kumar; final approval is Kumar's

### Steps
1. Hour 0: **Kumar creates workspace if not done.** Friend confirms editor access. Open old and new workspaces side-by-side.
2. Hour 0-4: inventory old workspace, produce classification table
3. Hour 4-8: build V2 skeleton with all 7 sections (empty pages)
4. Hour 8-16: populate Getting Started (customer priority) + Vertical Strategy + Operations + Internal
5. Hour 16-20: integrate Track 1/2/3 outputs into Architecture / Database / Code Structure pages
6. Hour 20-24: polish. **Customer share link preview built by friend → Kumar reviews → Kumar publishes.** Archive old workspace banner drafted by friend, executed by Kumar.

### Definition of done
- V2 workspace live with all 7 sections (Kumar-owned, friend-editor)
- Getting Started is customer-ready (Kumar signs off)
- Internal section set up with Tech Debt Register, Decision Log, Sprint Logs
- Customer share scheme drafted (not auto-published — Kumar publishes)
- Old workspace archive banner drafted (not auto-applied — Kumar applies)

---

## Track 5 — Coordination + Synthesis

**Owner:** Kumar
**Branch:** `sprint-audit/track-5-coordination`
**Output:** `/tmp/v2/05-sprint-summary.md` + V2 Notion "Getting Started" + "Overview"

### Scope
- Every 4h: read all standups, post sprint pulse, resolve blockers
- Every 8h: review outputs of all tracks, flag cross-track conflicts
- Hour 20-24: write sprint summary, customer-facing polish, retrospective
- Post-sprint roadmap for Apr 21 - Apr 30 (2 verticals to production)

### Steps
1. Hour 0-2: kickoff facilitation, track assignments, SPRINT_TRACKER.md filled
2. Hour 2-6: sleep block #1
3. Hour 6-10: standup review, deep work on roadmap draft
4. Hour 10-14: mid-sprint sync, course corrections
5. Hour 14-18: sleep block #2
6. Hour 18-22: convergence prep, PR reviews for tracks 1-4
7. Hour 22-24: retrospective, summary finalization

### Definition of done
- 5 standup pulses posted
- All blockers resolved or explicitly deferred
- Sprint summary written
- Apr 21-30 vertical roadmap drafted
- Retrospective notes captured
