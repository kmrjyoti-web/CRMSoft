# V5 Folder Structure Overview

**Created:** Phase 1 (2026-04-22)
**Branch:** `chore/v5-restructure`

## Structure Map

```
CrmProject-V5/
│
├── apps-backend/
│   └── api/                                      # Phase 2 target — NestJS backend
│
├── apps-frontend/                                # Phase 3 targets — 7 portals
│   ├── crm-admin/        (port 3005)
│   ├── vendor-panel/     (port 3006)
│   ├── customer-portal/  (port 3007)
│   ├── marketplace/      (port 3008)
│   ├── wl-admin/         (port 3009)
│   ├── wl-partner/       (port 3011)
│   └── platform-console/ (port 3012)
│
├── packages-backend/                             # Reusable backend logic
│   ├── core-business-types/                      # 7 hardcoded core types
│   ├── core-brand-theme/                         # Brand config + tenant-brand mapping
│   ├── vertical-restaurant-backend/
│   ├── vertical-tourism-backend/
│   ├── vertical-retail-backend/
│   └── vertical-software-vendor-backend/
│
├── packages-frontend/                            # Reusable UI
│   ├── ui-aic/                                   # AICTable, AICDrawer, AICToolbar, ...
│   ├── core-brand-theme/                         # Theme provider + CSS vars
│   ├── vertical-restaurant-frontend/
│   ├── vertical-tourism-frontend/
│   ├── vertical-retail-frontend/
│   └── vertical-software-vendor-frontend/
│
├── packages-shared/                              # @crmsoft/* tsconfig aliases (Phase 5)
│   ├── types/
│   ├── enums/
│   ├── validators/
│   └── constants/
│
├── tools/                                        # Build/audit/validation utilities
│   ├── db-schema-auditor/
│   ├── cross-db-resolver-validator/
│   └── migration-helpers/
│
├── docs/v5/                                      # V5 docs (this folder)
│   ├── BASELINE_GATE.md
│   └── STRUCTURE_OVERVIEW.md (this file)
│
├── Application/backend/                          # UNTOUCHED — Phase 2 will move
├── Customer/                                     # UNTOUCHED — Phase 3 will move
├── Vendor/                                       # UNTOUCHED — Phase 3 will move
├── PlatformConsole/                              # UNTOUCHED — Phase 3 will move
├── WhiteLabel/                                   # PARTIAL — Phase 3 may move admin/partner only
└── Mobile/                                       # UNTOUCHED — Flutter app stays
```

## Phase Status

| Phase | Status | What |
|---|---|---|
| 1 | ✅ Complete | Folder skeleton + READMEs (this commit) |
| 2 | ⏳ Pending | Move `Application/backend/` → `apps-backend/api/` (preserve 7 Prisma client paths) |
| 3 | ⏳ Pending | Move 7 portals into `apps-frontend/` |
| 4 | ⏳ Pending | Add `pnpm-workspace.yaml`, root `package.json` workspaces |
| 5 | ⏳ Pending | Update `tsconfig` with `@crmsoft/*` path aliases (auto-fixes 3 frontend `@shared-types` errors) |
| 6 | ⏳ Pending | Final verify (tsc gates + Prisma gates + Next.js build) → PR |

## V5 Architecture Alignment

The 3-axis architecture has 3 movable axes:

- **Brand** (CRMSoft Main, MargCRM, TallyPlus, WL partners) — `core-brand-theme` packages
- **Vertical** (Electronics, Travel, Restaurant, Retail, Software Vendor, ...) — `vertical-*` packages
- **Core Business Type** (the 7 hardcoded types) — `core-business-types` package

Decisions encoded in the folder structure:

- Core types are **hardcoded in code** (the package), not configurable from a DB row.
- Verticals are **CRMSoft-curated** packages, not self-service.
- Brand-level overrides happen at runtime (theme tokens), not via dedicated packages.

See `docs/db/v5/10_DYNAMIC_FIELDS_V5.md` (on `develop`) for the full architecture rationale.

## Why Empty Placeholders Now

Empty folders aren't tracked by git. The README.md in each one ensures the directory survives the commit. This Phase 1 commit gives us:

- A pre-agreed destination for every Phase 2/3 move (no surprise about where things go)
- Reviewable structure before any code moves (catch design issues early)
- A safe rollback point — if Phase 2 goes wrong, `git reset --hard` to this commit recovers a clean V5 skeleton without damaging any existing source

## Constraints That Apply to Every Phase

From `BASELINE_GATE.md`:

- Backend tsc count must stay ≤ 41
- Frontend tsc count must stay ≤ 327
- All 7 Prisma clients must continue to generate
- Main `~/GitProject/CRM/CrmProject` must remain untouched (it's a separate worktree on `develop`)
- The `release/customer-x-2026-04-28` branch must remain unaffected
