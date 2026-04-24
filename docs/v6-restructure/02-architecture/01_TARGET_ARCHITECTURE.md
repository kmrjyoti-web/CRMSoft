# Target Architecture V6 (Vision Doc Aligned)

**Date:** 2026-04-23
**Status:** Skeleton created, migration pending
**Alignment:** CRMSoft Master Vision Document

## 1. Executive Summary

CRMSoft is a Partnership-Based Platform. The V6 architecture implements:

- **70-30 Inheritance:** 70% shared core, 30% brand/vertical customization
- **Folder-Based Access Control:** Partner devs isolated to their folders
- **Multi-Claude Development:** Each partner dev team on own session
- **AI as First-Class Citizen:** AI engine part of core

## 2. High-Level Structure

```
CrmProject/
├── 🔒 core/                          KUMAR'S DOMAIN
├── 🔓 verticals/                     KUMAR BUILDS
├── 🔓 partner-customizations/        PARTNER DOMAIN
├── 🔓 brands/                        WHITE LABEL
└── apps/                             EXECUTABLE
```

## 3. Detailed Folder Specification

### core/

```
core/
├── platform/
│   ├── auth/              ← From: apps-backend/api/src/modules/core/identity
│   ├── tenant/            ← From: apps-backend/api/src/modules/core/multiTenant
│   ├── rbac/              ← From: apps-backend/api/src/modules/core/rbac
│   └── api-gateway/       ← New: unified API gateway config
├── ai-engine/
│   ├── llm-integration/   ← New: LLM providers (Anthropic, OpenAI)
│   ├── prompt-library/    ← New: reusable prompts per feature
│   ├── ai-customization/  ← New: per-vertical AI tuning
│   └── model-abstraction/ ← New: model-agnostic interface
├── base-modules/
│   ├── crm-core/          ← From: apps-backend/api/src/modules/customer/crm
│   ├── accounting-core/   ← From: apps-backend/api/src/modules/accounting
│   ├── inventory-core/    ← From: apps-backend/api/src/modules/inventory
│   └── shared-entities/   ← From: apps-backend/api/src/modules/core/shared
├── shared-libraries/
│   ├── utils/             ← From: packages-shared/utils (if exists)
│   ├── types/             ← From: @crmsoft/types alias target
│   ├── validators/        ← From: packages-shared/validators (if exists)
│   └── constants/         ← New: shared constants
└── governance/
    ├── ci-rules/          ← New: folder boundary enforcement
    ├── audit-logs/        ← From: audit module
    ├── compliance/        ← New: GST/regulatory compliance
    └── policies/          ← New: access policies
```

### verticals/

```
verticals/
├── travel/
│   ├── modules/           ← From Travel project merge
│   ├── ai-customization/  ← Travel-specific AI
│   └── data-models/       ← Travel-specific Prisma extensions
├── electronic/
│   ├── modules/           ← From Electronic project merge
│   ├── ai-customization/
│   └── data-models/
├── software/              ← Planned
├── restaurant/            ← Planned
├── tourism/               ← Planned
└── retail/                ← Planned
```

### partner-customizations/

```
partner-customizations/
├── partner-travel-1/
│   ├── modules/           ← Partner-specific NestJS modules
│   ├── ui-overrides/      ← React component overrides
│   └── config/            ← Partner feature flags
└── partner-electronic-1/
```

### brands/

```
brands/
├── crmsoft/               ← Default brand (Kumar's own product)
│   ├── theme/
│   ├── config/
│   └── overrides/
├── _template/             ← Copy for new brands
└── partner-travel-1-brand/
```

### apps/

```
apps/
├── backend/
│   └── api/               ← NestJS monolith (from apps-backend/api)
└── frontend/
    ├── crm-admin-new/     ← From apps-frontend/crm-admin (port 3002)
    ├── vendor-panel-new/  ← From apps-frontend/vendor-panel (port 3003)
    ├── customer-portal-new/  ← port 3004
    ├── marketplace-new/   ← port 3005
    ├── wl-admin-new/      ← port 3006
    ├── wl-partner-new/    ← port 3007
    └── platform-console-new/ ← port 3008
```

## 4. Migration Mapping Table

| Current Path | Target Path | Status |
|---|---|---|
| apps-backend/api/ | apps/backend/api/ | Pending |
| apps-backend/api/src/modules/core/identity/ | core/platform/auth/ | Pending |
| apps-backend/api/src/modules/core/multiTenant/ | core/platform/tenant/ | Pending |
| apps-backend/api/src/modules/core/rbac/ | core/platform/rbac/ | Pending |
| apps-backend/api/src/modules/customer/crm/ | core/base-modules/crm-core/ | Pending |
| apps-backend/api/src/modules/accounting/ | core/base-modules/accounting-core/ | Pending |
| apps-backend/api/src/modules/inventory/ | core/base-modules/inventory-core/ | Pending |
| apps-backend/api/src/modules/vertical/gv/ | verticals/general/ | Pending |
| apps-backend/api/src/modules/marketplace/ | core/platform/marketplace/ | Pending |
| apps-backend/api/src/modules/plugins/ | core/platform/plugins/ | Pending |
| apps-frontend/crm-admin/ | apps/frontend/crm-admin-new/ | Pending |
| apps-frontend/vendor-panel/ | apps/frontend/vendor-panel-new/ | Pending |
| apps-frontend/customer-portal/ | apps/frontend/customer-portal-new/ | Pending |
| apps-frontend/marketplace/ | apps/frontend/marketplace-new/ | Pending |
| apps-frontend/wl-admin/ | apps/frontend/wl-admin-new/ | Pending |
| apps-frontend/wl-partner/ | apps/frontend/wl-partner-new/ | Pending |
| apps-frontend/platform-console/ | apps/frontend/platform-console-new/ | Pending |
| WhiteLabel/wl-api/ | core/platform/white-label-api/ | Pending |
| Travel project (external repo) | verticals/travel/ | Awaiting access |
| Electronic project (external repo) | verticals/electronic/ | Awaiting access |

## 5. 70-30 Inheritance Example

### Example: Quotation Module

```
core/base-modules/crm-core/quotation/
└── Base implementation (70% — all industries use this)

verticals/travel/modules/quotation/
└── Travel-specific overrides (e.g., itinerary line items)

verticals/electronic/modules/quotation/
└── Electronic-specific overrides (e.g., warranty terms field)

partner-customizations/partner-travel-1/modules/quotation/
└── Partner-specific overrides (e.g., branded PDF template)

brands/partner-travel-1-brand/overrides/quotation-page/
└── Brand-specific UI (colors, logos, layout)
```

Runtime resolution order:
1. Load base from `core/base-modules/crm-core/quotation`
2. Apply `verticals/travel/modules/quotation` overrides
3. Apply `partner-customizations/partner-travel-1` overrides
4. Render with `brands/partner-travel-1-brand` theme

## 6. Database Strategy

### Current (V5)
- 7 databases: Identity, Working, Demo, Global, Marketplace, Platform, PlatformConsole
- Separate Prisma clients per database (7 generated clients)

### Target (V6)
- Same 7 databases (no DB changes in this sprint)
- Prisma schemas moved to: `core/platform/prisma/`
- Per-vertical schema extensions: `verticals/{vertical}/data-models/`
- Partner-specific tables: `partner-customizations/{partner}/data-models/`

### Database Isolation
- Core tables: existing core databases (Identity, Working, etc.)
- Vertical-specific: same DB, vertical-prefixed tables (e.g., `trv_*`)
- Partner-specific: same DB, partner-prefixed tables (e.g., `p1_*`)

## 7. CI/CD Changes Required

### Current CI
- pnpm monorepo checks
- tsc per workspace
- jest per workspace
- lint per workspace

### New CI Additions (V6)
- **Folder boundary enforcement:** CI blocks `partner-customizations/partner-A` modifying `partner-customizations/partner-B`
- **Brand-specific build CI:** `BRAND=X pnpm build` per brand
- **Per-vertical test runs:** Vertical-specific jest config
- **Cross-boundary import detection:** Lint rule blocking `import from '../../../core'` in partner folders (must use package alias)
- **Import alias enforcement:** All cross-folder imports must use `@crmsoft/*` aliases

## 8. API Architecture

### Current
Single NestJS app at `apps-backend/api` serving all modules.

### Target (V6 — gradual)
Same single NestJS app, but modules now live in `core/` and `verticals/`.
The NestJS app in `apps/backend/api/` imports from `core/` and `verticals/`
via workspace aliases. No microservices split yet.

Microservices remain a **Phase 7+ consideration** after monolith is
well-organized.
