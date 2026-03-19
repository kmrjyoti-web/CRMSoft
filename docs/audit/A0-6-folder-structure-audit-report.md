# A0-6: Folder Structure Audit Report
## CRMSoft — Phase 0 Audit

**Date:** 2026-03-18
**Auditor:** Claude Code (automated scan)
**Scope:** `API/src/` + `UI/crm-admin/src/` + `UI/vendor-panel/src/`

---

## SCORECARD

| Dimension | Score | Status |
|-----------|-------|--------|
| V4 Category Structure | 3/10 | 🔴 76 modules at root; only `marketplace/` + `plugins/` categorized |
| DDD Layer Compliance | 5/10 | ⚠️ 8/77 full DDD; 26 partial; 43 service-pattern |
| Core Framework Separation | 8/10 | ✅ `src/core/` correctly isolated from `src/modules/` |
| Common/Shared Folder | 9/10 | ✅ `src/common/` well-structured |
| Frontend Feature Structure | 8/10 | ✅ 81 features following DDD naming |
| Misplaced Files | 9/10 | ✅ No spec files outside `__tests__/`; clean root |
| Shared Packages | 3/10 | 🔴 No `packages/` workspace; no shared type library |
| **OVERALL** | **6.4/10** | ⚠️ |

**CRITICAL: 2 | WARNING: 4 | INFO: 4**

---

## 1. CURRENT BACKEND STRUCTURE

### Top-Level Layout

```
API/src/
├── main.ts                      ✅ correct
├── app.module.ts                ✅ correct
├── core/                        ✅ framework core (not modules)
│   ├── auth/                    JWT, login, platform bootstrap
│   ├── permissions/             RBAC engine, guards, decorators
│   ├── prisma/                  Prisma service (multi-tenant)
│   └── workflow/                Workflow action executor
├── common/                      ✅ shared infrastructure
│   ├── decorators/
│   ├── dto/
│   ├── errors/
│   ├── filters/
│   ├── guards/
│   ├── interfaces/
│   ├── request/
│   ├── response/
│   ├── result/
│   └── utils/
└── modules/                     ⚠️ 76 modules FLAT at root
    ├── marketplace/             ✅ V4 category (1 module inside)
    ├── plugins/                 ✅ V4 category (1 module inside)
    ├── accounts/                🔄 needs → customer/accounts/
    ├── activities/              🔄 needs → customer/activities/
    ├── ai/                      🔄 needs → softwarevendor/ai/
    ├── ... (73 more at root)
```

### `tsconfig.json` Path Aliases
```json
"paths": {
  "@/*":        ["src/*"],
  "@shared/*":  ["src/shared/*"],
  "@core/*":    ["src/core/*"],
  "@modules/*": ["src/modules/*"]
}
```
⚠️ `@modules/customer/*`, `@modules/core/*` aliases missing — these need to be added when V4 categorization is done.

---

## 2. V4 CATEGORY COMPLIANCE

### Current State vs Target

| V4 Category | Target Modules | Currently Categorized | Status |
|-------------|---------------|----------------------|--------|
| `core/` | 22 modules | 0 | 🔴 MISSING |
| `customer/` | 42 modules | 0 | 🔴 MISSING |
| `softwarevendor/` | 10 modules | 0 | 🔴 MISSING |
| `marketplace/` | 1 module | 1 (folder exists, 1 module) | ✅ Done |
| `plugins/` | ~6 modules | 1 (only the plugins wrapper) | ⚠️ Partial |
| `vertical/` | 5 (future) | 0 | ➕ Not yet needed |

### 76 Modules at Root — Needs Migration

#### → `core/` (22 modules — shared by all portals)
```
menus              tenant              notifications       organizations
contacts           custom-fields       comments            lookups
entity-filters     raw-contacts        contact-organizations communications
audit              settings            documents           email
help               search              user-overrides      verification
keyboard-shortcuts recurrence
```

#### → `customer/` (42 modules — CRM portal)
```
leads              products            quotations          inventory
tasks              calendar            calendar-highlights bulk-import
bulk-export        ownership           workflows           approval-requests
approval-rules     follow-ups          reminders           brands
manufacturers      document-templates  activities          demos
tour-plans         support             mis-reports         product-pricing
product-tax        product-units       customer-price-groups departments
designations       entity-verification sales               payment
procurement        accounts            amc-warranty        recycle-bin
table-config       task-logic          cron-engine         dashboard
api-gateway        self-hosted-ai
```

#### → `softwarevendor/` (10 modules — vendor portal)
```
module-manager     packages            ai                  wallet
subscription-package business-type     business-locations  control-room
tenant-config
```

#### → `plugins/` (3 currently at root)
```
google             offline-sync        whatsapp
(razorpay, tally, gst — not yet implemented)
```

#### → `marketplace/` (already correct)
```
marketplace  ✅
```

---

## 3. DDD LAYER COMPLIANCE

### Summary

| Pattern | Modules | % |
|---------|---------|---|
| **Full DDD** (domain + application + infrastructure + presentation) | **8** | 10.4% |
| **Partial CQRS** (application only — no domain/infrastructure) | **26** | 33.8% |
| **Service Pattern** (no application/domain) | **43** | 55.8% |

### Full DDD Modules (8) ✅
These 8 are the gold standard reference for Phase 3 migration:

| Module | Domain | App | Infra | Pres | Tests |
|--------|--------|-----|-------|------|-------|
| `activities` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `communications` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `contact-organizations` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `contacts` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `leads` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `organizations` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `raw-contacts` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `settings` | ✅ | ✅ | ✅ | ✅ | ✅ |

### Partial CQRS Modules (26) — Have `application/` but missing `domain/` + `infrastructure/`
```
approval-requests   audit               bulk-export         bulk-import
comments            custom-fields       dashboard           demos
documents           email               entity-filters      follow-ups
lookups             menus               notifications       ownership
product-pricing     products            quotations          recurrence
reminders           tenant              tour-plans          user-overrides
whatsapp            workflows
```
These have CommandHandlers/QueryHandlers but lack:
- `domain/entities/` — rich domain models
- `domain/interfaces/` — repository interfaces
- `infrastructure/repositories/` — Prisma implementations

### Service Pattern Modules (43) — Fully pending CQRS+DDD migration
```
accounts        ai              amc-warranty    api-gateway     approval-rules
brands          business-locations business-type calendar        calendar-highlights
control-room    cron-engine     customer-price-groups departments designations
document-templates entity-verification google      help            inventory
keyboard-shortcuts manufacturers   marketplace     mis-reports     module-manager
offline-sync    packages        payment         plugins         procurement
product-tax     product-units   recycle-bin     sales           search
self-hosted-ai  subscription-package support     table-config    task-logic
tenant-config   verification    wallet
```

---

## 4. INTERNAL FOLDER PATTERNS

### Expected CQRS+DDD Structure (per module)
```
[module-name]/
├── domain/
│   ├── entities/               ← Rich domain model
│   ├── value-objects/          ← Immutable types
│   ├── events/                 ← Domain events
│   └── interfaces/             ← Repository contract (port)
├── application/
│   ├── commands/               ← Write operations
│   ├── queries/                ← Read operations
│   └── events/                 ← Event handlers
├── infrastructure/
│   ├── repositories/           ← Prisma implementation (adapter)
│   └── mappers/                ← Entity ↔ DB mapping
├── presentation/
│   ├── [module].controller.ts  ← HTTP layer
│   └── dto/                    ← Input/output DTOs
└── __tests__/
    ├── unit/
    └── integration/
```

### Non-Standard Patterns Found
Some modules have non-standard internal folders:

| Module | Non-Standard Folders | Assessment |
|--------|---------------------|------------|
| `api-gateway` | `guards/`, `interceptors/`, `middleware/`, `decorators/`, `handlers/` | ⚠️ Mix — should go into domain/application/infrastructure |
| `audit` | `interceptors/`, `decorators/` | ⚠️ Interceptors → infrastructure/ |
| `calendar` | `adapters/` | ✅ Acceptable — calendar sync adapters |
| `business-locations` | `data/` | ⚠️ Seed data → separate `seeds/` folder |
| `marketplace` | standard (services + presentation) | ⚠️ Needs migration |

---

## 5. FRONTEND STRUCTURE

### CRM Admin (`UI/crm-admin/src/`)

```
src/
├── app/                         ✅ Next.js App Router (367 pages)
│   ├── (auth)/                  ← Auth route group (3 pages)
│   └── (main)/                  ← Protected route group (364 pages)
├── components/
│   ├── ui/                      ✅ 69 AIC-prefixed wrappers (Golden Rule #1)
│   └── common/                  ✅ 55 shared components
├── features/                    ✅ 81 feature modules (DDD-style)
├── hooks/                       ✅ 137 hooks
├── stores/                      ✅ Zustand stores
├── services/                    ✅ API service layer
├── lib/                         ✅ Utilities
├── styles/                      ✅ CSS
├── types/                       ✅ TypeScript types
├── config/                      ✅ App config
├── providers/                   ✅ React providers
├── mocks/                       ✅ Test mocks
└── test-utils.tsx               ✅ Testing utilities
```

**Frontend feature structure (81 features) correctly mirrors backend domains:**

| Frontend Feature | Backend Module | Alignment |
|-----------------|---------------|-----------|
| `features/leads/` | `modules/leads/` | ✅ |
| `features/contacts/` | `modules/contacts/` | ✅ |
| `features/quotations/` | `modules/quotations/` | ✅ |
| `features/workflows/` | `modules/workflows/` | ✅ |
| `features/whatsapp/` | `modules/whatsapp/` | ✅ |
| `features/inventory/` | `modules/inventory/` | ✅ |
| `features/accounts/` | `modules/accounts/` | ✅ |
| `features/bulk-import/` | `modules/bulk-import/` | ✅ |

**Frontend-only features (no direct backend module — correct):**
`dev-panel`, `report-designer`, `quotation-ai`, `quotation-analytics`, `form-config`, `shortcuts`, `saved-filters`, `product-media`, `onboarding`, `registration`, `discount-master`, `price-groups`

### Vendor Panel (`UI/vendor-panel/src/`)

```
src/
├── app/         ✅ Next.js App Router (57 pages)
├── components/  ✅ 16 components
├── features/    ✅ vendor-specific features
├── hooks/       ✅ hooks
├── lib/         ✅ utilities
├── stores/      ✅ Zustand stores
├── types/       ✅ TypeScript types
└── config/      ✅ app config
```

---

## 6. MISSING STRUCTURAL ELEMENTS

### 🔴 No Shared Packages Workspace
```
/packages/            ← DOES NOT EXIST
  shared-types/       ← TypeScript types shared between API + UI
  api-client/         ← Generated API client
  ui-kit/             ← CoreUI wrapper library (currently as git submodule)
```

Currently:
- Types are duplicated between API DTOs and UI service files
- No generated API client (types hand-maintained)
- CoreUI as git submodule at `lib/coreui/` — works but `packages/` is cleaner

### No `vertical/` Category
Expected but not yet needed. Template available in `NEW_MODULE_TEMPLATE.md`.

### `src/core/` Has Only 4 Modules
```
src/core/
├── auth/           ✅
├── permissions/    ✅
├── prisma/         ✅
└── workflow/       ✅
```
Per V4 target, `menus/`, `users/` (from settings), and `audit/` should also be in `core/` — currently in `modules/`. The `src/core/` separation from `src/modules/` is architecturally correct; just needs completion.

---

## 7. FINDINGS — PRIORITIZED

### 🔴 CRITICAL (2)

| # | Area | Finding | Recommendation |
|---|------|---------|----------------|
| C1 | **V4 Category Structure** | 76 of 77 modules sit at root level. Only `marketplace/` and `plugins/` are categorized. The V4 folder structure (`core/`, `customer/`, `softwarevendor/`) is the extraction boundary for Phase 6 microservices. | Execute Phase 3 restructure: move 76 modules into 5 categories. Update `tsconfig.json` paths (`@modules/core/*`, `@modules/customer/*`, etc.). Automated: use `scripts/migrate-folder-structure.sh`. |
| C2 | **No Shared Package Workspace** | Types duplicated between API (DTOs) and UI (service types). No `packages/` monorepo workspace for shared TypeScript types. SDK cannot be auto-generated. | Create `packages/shared-types/` workspace. Generate types from Prisma schema + OpenAPI. Add to `package.json` workspaces. |

### ⚠️ WARNING (4)

| # | Area | Finding | Recommendation |
|---|------|---------|----------------|
| W1 | **DDD Layer Gaps** | Only 8/77 modules (10.4%) have full DDD layers. 26 have partial CQRS. 43 are pure service pattern. | Phase 3 migration plan: add `domain/` + `infrastructure/` to 26 partial modules first (lower effort), then tackle 43 service-pattern modules. |
| W2 | **Missing `tsconfig.json` Path Aliases** | Paths `@modules/core/*`, `@modules/customer/*`, `@modules/softwarevendor/*` don't exist yet. All imports use `@modules/*` flat path. | Add V4 category aliases to `tsconfig.json` before migration. Allows progressive adoption without breaking existing imports. |
| W3 | **Non-Standard Internal Folders** | `api-gateway` has `guards/`, `interceptors/`, `middleware/`, `handlers/`, `decorators/` scattered without DDD layer grouping. `audit` has similar pattern. `business-locations` has `data/` for seed. | Group as: guards → `infrastructure/`, interceptors → `infrastructure/`, decorators → `presentation/`, seed data → `prisma/seeds/`. |
| W4 | **`src/core/` Incomplete** | `src/core/` has only 4 modules (auth, permissions, prisma, workflow). `menus` and `audit` belong in core but are in `modules/`. | Move `modules/menus/` → `core/menus/` and `modules/audit/` → `core/audit/` during Phase 3 restructure. |

### ℹ️ INFO (4)

| # | Finding | Status |
|---|---------|--------|
| I1 | `src/common/` is well-structured with 11 sub-folders (decorators, filters, guards, utils, etc.) ✅ | Good |
| I2 | No spec files found outside `__tests__/` folders ✅ | Clean |
| I3 | Frontend 81 features correctly mirror backend domains — good alignment ✅ | Good |
| I4 | Only `main.ts` and `app.module.ts` at `src/` root ✅ | Clean |

---

## 8. V4 MIGRATION PLAN

### Phase 3 Folder Reorganization Steps

```
STEP 1 — Add tsconfig path aliases (no code changes):
  Add: @modules/core/*, @modules/customer/*, @modules/softwarevendor/*

STEP 2 — Create category folders:
  mkdir API/src/modules/core
  mkdir API/src/modules/customer
  mkdir API/src/modules/softwarevendor
  mkdir API/src/modules/vertical

STEP 3 — Move modules (use git mv to preserve history):
  git mv API/src/modules/leads API/src/modules/customer/leads
  git mv API/src/modules/contacts API/src/modules/core/contacts
  ... (76 git mv commands)

STEP 4 — Update all imports:
  sed -i 's|@modules/leads|@modules/customer/leads|g' (all files)
  (or use: npx ts-morph to do AST-safe renaming)

STEP 5 — Update app.module.ts imports

STEP 6 — Run tests to verify nothing broken
```

### Estimated Impact
- **76 git mv operations** (one per module)
- **~500 import path updates** (all inter-module imports)
- **0 logic changes** — pure structural reorganization
- **0 API contract changes** — endpoints unchanged
- **Recommended:** Do in a single PR with automated import rewriting

---

## 9. RECOMMENDATIONS (Prioritized)

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| P1 | Add V4 tsconfig path aliases (`@modules/core/*` etc.) | Very low | Enables progressive migration |
| P1 | Move 76 flat modules to V4 categories via `git mv` + import rewrite | Medium (automation) | CRITICAL for Phase 3 |
| P2 | Create `packages/shared-types/` workspace with Prisma-generated types | Medium | HIGH — eliminates type duplication |
| P2 | Add `domain/` + `infrastructure/` layers to 26 partial CQRS modules | High | HIGH — completes DDD adoption |
| P3 | Move `modules/menus/` + `modules/audit/` → `core/` | Low | MEDIUM — architectural correctness |
| P3 | Normalize `api-gateway` and `audit` internal folder structure to DDD layers | Medium | MEDIUM |
| P3 | Move seed data from `business-locations/data/` → `prisma/seeds/` | Very low | LOW |
| P4 | Create `vertical/` category with empty sub-folders for future verticals | Very low | LOW |

---

## OVERALL ASSESSMENT

**Score: 6.4 / 10**

**Strengths:**
- ✅ `src/core/` correctly isolated from `src/modules/` (auth, permissions, prisma, workflow)
- ✅ `src/common/` well-structured (11 sub-folders)
- ✅ 8 modules are already full DDD — these are the migration template
- ✅ `marketplace/` and `plugins/` V4 categories exist
- ✅ No misplaced spec files; clean root structure
- ✅ Frontend 81 features align with backend modules
- ✅ No orphan files detected

**Critical Gaps:**
- 🔴 76/77 modules at flat root level — V4 category structure not implemented
- 🔴 No shared `packages/` workspace — types duplicated across API and UI
- ⚠️ Only 10.4% of modules have full DDD layers

**Risk Level:** LOW-MEDIUM — The flat structure works functionally today. The risk is in Phase 6 (microservice extraction) where module boundaries must be clear. Restructuring 76 modules is mechanical but must be done carefully to avoid breaking imports.

---

_Generated by Claude Code | CRMSoft Phase 0 Audit | 2026-03-18_
