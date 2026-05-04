# Folder Structure Audit
Date: 2026-05-04
Branch: development/wl-platform-v2

---

## TL;DR

- **30 top-level dirs**, but only **~6 have real code**
- **12 folders are 100% skeleton** (zero real files — .gitkeep + README only)
- **1 SECURITY RISK**: `apps-backend/api/pas` contains plaintext credentials
- **Shared/ packages**: in workspace.yaml but zero imports from apps-backend — effectively orphaned
- **Two parallel prisma schemas**: Shared/prisma-schemas (old monolithic) vs apps-backend/api/prisma (canonical split). Former is stale.
- **apps/ vs apps-frontend/**: two frontend dirs — `apps/` is all empty stubs, `apps-frontend/` is real

---

## Category 1 — LIVE PRODUCTION CODE (Do Not Touch)

| Folder | Size | Notes |
|---|---|---|
| `apps-backend/api/src/` | 3,100 .ts files | Main NestJS backend — THE app |
| `apps-frontend/crm-admin/` | active | CRM admin portal |
| `apps-frontend/customer-portal/` | active | Customer-facing portal |
| `apps-frontend/marketplace/` | active | Marketplace frontend |
| `apps-frontend/platform-console/` | active | Platform console |
| `apps-frontend/vendor-panel/` | active | Vendor panel |
| `apps-frontend/wl-admin/` | active | White-label admin |
| `apps-frontend/wl-partner/` | active | Partner portal |
| `WhiteLabel/wl-api/` | 81 .ts files | Separate NestJS WL service |
| `Shared/backend/` | 96 .ts files | 11 packages still in workspace.yaml |
| `Shared/common/` | types + constants | In workspace, has dist build |
| `Shared/frontend/` | shared components | In workspace |

---

## Category 2 — CONFIG & TOOLING (Keep at Root)

| Item | Notes |
|---|---|
| `CLAUDE.md` | Project instructions |
| `Makefile` | Build tasks |
| `package.json` | Root package |
| `pnpm-lock.yaml` | Lockfile |
| `pnpm-workspace.yaml` | Workspace config |
| `tsconfig.base.json` | Base TS config |
| `wrangler.toml` | Cloudflare R2 config (uploads/backups/public buckets) |
| `scripts/` | 51 utility scripts: work-start, backup, deploy, v6-migration helpers |
| `infra/` | Docker, deploy scripts, init-databases.sql |
| `docs/` | Project docs, health reports, cost analysis |
| `claude-implement/` | Claude session logs |
| `brand-assets/` | Travelsis brand assets (HTML, screenshots) |

---

## Category 3 — SKELETON FOLDERS (100% Placeholder, Zero Real Code)

All 12 of these contain ONLY `.gitkeep`, `README.md`, `.DS_Store`. No production code.

| Folder | Created | Purpose (per README) | Verdict |
|---|---|---|---|
| `apps/frontend/*-new/` | Apr 22 (V5) | Empty Next.js stubs for future migration | Confusing — real apps are in `apps-frontend/` |
| `core/` | Apr 23 (V6) | AI engine, platform, base-modules skeleton | Future architecture vision |
| `verticals/` | Apr 23 (V6) | restaurant/tourism/retail/software/travel/electronic stubs | Future |
| `brands/` | Apr 23 (V6) | Brand config skeleton | Future |
| `tools/` | Apr 22 (V5) | Migration helpers, schema auditors | Future |
| `packages-backend/` | Apr 22 (V5) | Future extracted backend packages | V5 target (not started) |
| `packages-frontend/` | Apr 22 (V5) | Future extracted frontend packages | V5 target (not started) |
| `packages-shared/` | Apr 22 (V5) | Future shared types/constants | V5 target (not started) |
| `Customer/` | Apr 22 (V5) | Customer backend README only | Ghost from restructure |
| `Vendor/` | Apr 22 (V5) | Vendor backend README only | Ghost from restructure |
| `partner-customizations/` | Apr 23 (V6) | .gitkeep + README | Future |
| `tests/` | — | integration/v6/node_modules only (no actual tests) | Dead |

---

## Category 4 — LEGACY / STALE

| Folder/File | Last Real Commit | Issue |
|---|---|---|
| `archive/legacy-folders/` | — (no git commit) | Contains only .DS_Store + node_modules/.bin symlinks. Zero useful content. |
| `backups/` | Apr 26, 2026 | 3 SQL files (11MB) — pre-M1 migration backups. Should move to R2/external storage, not in git. |
| `Shared/prisma-schemas/` | Apr 24 (last real update) | OLD monolithic schemas: identity.prisma (1873 lines), platform.prisma (2389 lines), working.prisma (9642 lines), marketplace.prisma (506 lines). Canonical schemas are now in `apps-backend/api/prisma/*/v1/`. These are OUT OF SYNC and misleading. |

---

## Category 5 — JUNK FILES (Safe to Delete)

| File | Size | Issue |
|---|---|---|
| `apps-backend/api/pas` | 4KB | **🔴 SECURITY RISK** — Contains plaintext Supabase credentials: username `CRMSales`, password `FD7ezSv8fJcIAMk5`, full connection string `postgresql://postgres:FD7ezSv8fJcIAMk5@db.kbelkjphkeyvpzapxcpo.supabase.co:5432/postgres`. Should be deleted and credentials rotated if still valid. |
| `apps-backend/api/seed.txt` | 40KB | Seed data reference doc in wrong location. Belongs in `docs/` or `claude-implement/`. |
| `2026-04-26_CRMSoft_ENDPOINTS_AND_SEED_USERS.txt` | 35KB | Loose at project root. Belongs in `docs/` or `claude-implement/`. |
| `mobile.html` | — | Standalone HTML test file at project root. Purpose unclear. |

---

## Duplicate / Parallel Structure Problems

### Problem 1: Two frontend directories
```
apps/frontend/crm-admin-new/       ← EMPTY stubs (just .gitkeep + tsconfig.tsbuildinfo)
apps-frontend/crm-admin/           ← REAL app (active development)
```
The `apps/` folder was created Apr 22 (V5 restructure) as the intended future home.
The `apps-frontend/` folder has all the real running code.
Neither matches the pnpm workspace pattern used by apps-frontend — `apps-backend/*` and `apps-frontend/*` are in workspace, `apps/` is not.

### Problem 2: Old vs new Prisma schemas
```
Shared/prisma-schemas/platform.prisma          ← 2,389 lines (monolithic, stale)
apps-backend/api/prisma/platform/v1/           ← 5,228 lines (canonical split, with DNA columns)
```
`Shared/prisma-schemas/` still has the old monolithic schemas from before the prismaSchemaFolder migration.
The `platform.prisma` was touched Apr 29 (same day as Rule #14 fix) — likely a stale copy that was edited by mistake.

### Problem 3: Three scripts directories
```
scripts/               ← Root-level: work scripts, backup, v6-migration helpers
infra/scripts/         ← Infrastructure: deploy, rollback, database init
apps-backend/api/scripts/  ← API-specific: seed scripts, db tools
WhiteLabel/scripts/    ← WL-specific: deploy-partner, rollback-partner, health-check
```
No naming conflict but no clear convention for where new scripts go.

### Problem 4: Shared/ vs packages-*/
```
Shared/backend/{audit,cache,encryption,...}/    ← Old pre-V5 structure, still in workspace.yaml
packages-backend/vertical-*/                    ← V5 target structure, all README-only
```
`apps-backend` imports ZERO packages from `Shared/backend/` (confirmed by grep). Yet 11 Shared packages are in workspace.yaml. They're either imported transitively or genuinely orphaned.

---

## Git History Summary

| Folder | Last Commit | Summary |
|---|---|---|
| Customer/ | Apr 22 | V5 architecture restructure |
| Vendor/ | Apr 22 | V5 architecture restructure |
| archive/ | (no commit) | — |
| backups/ | (no commit) | — |
| tests/ | (no commit) | — |
| WhiteLabel/ | Apr 22 | Security fix (remove hardcoded passwords) |
| Shared/ | Apr 29 | Rule #14 golden rules fix |
| apps/ | Apr 29 | SDK audit docs |
| tools/ | Apr 22 | V5 architecture restructure |
| packages-*/ | Apr 22 | V5 architecture restructure |
| core/ | Apr 23 | V6 foundation skeleton |
| verticals/ | Apr 23 | V6 foundation skeleton |
| brands/ | Apr 23 | V6 foundation skeleton |
| scripts/ | Apr 23 | dev4 travel merge prep |
| infra/ | Apr 18 | .gitignore cleanup |

---

## Recommended Target Structure (Future State)

```
CrmProject/
├── apps-backend/api/          ← Keep as-is (THE backend)
├── apps-frontend/             ← Keep as-is (7 real frontend apps)
│   ├── crm-admin/
│   ├── customer-portal/
│   ├── marketplace/
│   ├── platform-console/
│   ├── vendor-panel/
│   ├── wl-admin/
│   └── wl-partner/
├── packages-backend/          ← Future (populate from Shared/backend/ migration)
├── packages-frontend/         ← Future (populate from Shared/frontend/ migration)
├── packages-shared/           ← Future (populate from Shared/common/ migration)
├── wl-service/                ← Rename from WhiteLabel/wl-api/
├── scripts/                   ← Keep, consolidate infra/scripts here eventually
├── infra/                     ← Keep
├── docs/                      ← Keep + move seed.txt + loose txt files here
├── brand-assets/              ← Keep
├── verticals/                 ← Keep skeleton (it's the design contract)
├── brands/                    ← Keep skeleton
├── claude-implement/          ← Keep
└── [root config files]
```

---

## Cleanup Plan (3 Phases)

### Phase 1: SECURITY + JUNK (Do immediately, no migration needed)
- Delete `apps-backend/api/pas` — credentials file
- Move `apps-backend/api/seed.txt` → `docs/seed-reference.txt`
- Move `2026-04-26_CRMSoft_ENDPOINTS_AND_SEED_USERS.txt` → `claude-implement/` or delete
- Delete `mobile.html` (or move to docs if needed)
- Move/gitignore `backups/` SQL files → external R2 storage
- Delete `archive/legacy-folders/` — only .DS_Store inside

### Phase 2: SKELETON CLEANUP (Safe, no imports to update)
- Delete `Customer/` (just a README)
- Delete `Vendor/` (just a README)
- Delete `partner-customizations/` (just .gitkeep)
- Delete `tests/integration/v6/` (node_modules only, no tests)
- Delete or gitignore `apps/` empty stubs (confusing duplicate of `apps-frontend/`)
- Mark `Shared/prisma-schemas/` as READ-ONLY reference (or delete — canonical schemas are in apps-backend/api/prisma/)

### Phase 3: STRUCTURE CONSOLIDATION (When migrating Shared/ → packages-*)
Trigger: When apps-backend is ready to consume packages from the monorepo
- Migrate `Shared/backend/*` → `packages-backend/*` (11 packages)
- Migrate `Shared/common/` → `packages-shared/types`
- Migrate `Shared/frontend/` → `packages-frontend/ui-core`
- Rename `WhiteLabel/wl-api/` → `wl-service/` (to match V5 naming)
- Merge root `scripts/` + `infra/scripts/` into single `scripts/` with subdirs

---

## Stat Summary

```
Top-level folders:           30
With real code (live):        6  (apps-backend, apps-frontend, Shared, WhiteLabel/wl-api, scripts, infra)
Pure skeleton (0 real files): 12
Legacy/stale:                  3  (archive, backups, Shared/prisma-schemas)
Loose root files:             11  (4 are junk/misplaced)
Security risk files:           1  (apps-backend/api/pas)
Total .ts files:            7,237  (non-node_modules)
Real production .ts files:  3,100  (apps-backend/api/src only)
```
