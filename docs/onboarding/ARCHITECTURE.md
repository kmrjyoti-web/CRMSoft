# Codebase Architecture (V5)

## Folder Structure

```
CrmProject/
├── apps-backend/
│   └── api/                      NestJS monolith — port 3001
│       ├── src/
│       │   ├── core/             Auth, JWT, bootstrap, guards
│       │   └── modules/
│       │       ├── core/         Tenants, roles, menus, packages
│       │       ├── customer/     CRM business logic (leads, contacts, etc.)
│       │       ├── softwarevendor/  Vendor portal logic
│       │       ├── marketplace/  MarketHub
│       │       ├── ops/          Operations
│       │       ├── customer-portal/  Customer portal logic
│       │       ├── platform-console/ Platform ops
│       │       └── plugins/      Plugin system
│       └── prisma/
│           ├── identity/         IdentityDB schema
│           ├── platform/         PlatformDB schema
│           ├── working/          WorkingDB schema (229 tables)
│           ├── marketplace/      MarketplaceDB schema
│           ├── platform-console/ PlatformConsoleDB schema
│           ├── global-reference/ GlobalReferenceDB schema
│           └── demo/             DemoDB schema
│
├── apps-frontend/
│   ├── crm-admin/                Main CRM portal — port 3005
│   ├── vendor-panel/             Vendor/admin portal — port 3006
│   ├── customer-portal/          End-customer portal — port 3007
│   ├── marketplace/              MarketHub — port 3008
│   ├── wl-admin/                 White label admin — port 3009
│   ├── wl-partner/               White label partner — port 3011
│   └── platform-console/         Platform ops — port 3012
│
├── Shared/
│   ├── backend/                  11 shared NestJS packages
│   ├── common/                   Types, enums, validators
│   ├── frontend/                 Shared React components
│   └── prisma-schemas/           Base schema fragments
│
├── WhiteLabel/
│   └── wl-api/                   White label backend API
│
└── docs/
    ├── v5/                       V5 restructure docs + BASELINE_GATE.md
    ├── security/                 Security incident docs
    └── onboarding/               This folder
```

## Tech Stack

### Backend
- **Framework:** NestJS 10.4 (TypeScript)
- **ORM:** Prisma 5.22 (7 per-DB clients — never use the bare `@prisma/client`)
- **Auth:** JWT (access 15m + refresh 7d)
- **Queue:** BullMQ + Redis
- **Compiler:** tsc target ES2021, `src/**/*` only (seeds excluded)

### Frontend
- **Framework:** Next.js 15.5 (App Router)
- **UI:** React 18 + Tailwind CSS + shadcn/ui
- **Forms:** react-hook-form 7.73
- **State:** React Context + server state (no Redux/Zustand)

### Database
- **Engine:** PostgreSQL (Railway-hosted)
- **7 databases** — each with its own Prisma client:

| DB | Client import | Tables | Purpose |
|---|---|---|---|
| IdentityDB | `@prisma/identity-client` | 43 | Users, auth, roles, tenants |
| PlatformDB | `@prisma/platform-client` | 64 | Modules, menus, packages |
| WorkingDB | `@prisma/working-client` | 229 | Core CRM data |
| MarketplaceDB | `@prisma/marketplace-client` | 13 | MarketHub |
| PlatformConsoleDB | `.prisma/platform-console-client` | 29 | Platform ops |
| GlobalReferenceDB | `.prisma/global-reference-client` | 12 | Countries, GST, HSN |
| DemoDB | `.prisma/demo-client` | 228 | Demo tenant isolation |

**Critical rule:** Never import from `@prisma/client` (it's a bare stub). Always use the per-DB client.

## Key Concepts

### 7 Business Types (hardcoded)
The platform supports exactly 7 core business types: B2B, B2C, CUSTOMER, MANUFACTURER, SERVICE_PROVIDER, INDIVIDUAL_SERVICE_PROVIDER, EMPLOYEE. Only the platform owner (Kumar) can add new types — never hardcode a new one in a PR.

### 3 Layer Model
1. **Core Platform** — Kumar owns, not touched by feature work
2. **Vertical Modules** — industry-specific (restaurant, software, tourism, retail)
3. **Tenant Customizations** — per-tenant configuration

### pnpm Workspace
23 workspace packages managed by root `pnpm-workspace.yaml`. One `pnpm install` at root covers everything. Never run per-app installs.

## Module Ownership Map

| Module area | Folder | Who can touch |
|---|---|---|
| Auth / JWT | `src/core/auth/` | Senior + Kumar review |
| Tenant management | `src/modules/core/identity/tenant/` | Senior + Kumar review |
| CRM business logic | `src/modules/customer/` | Any dev |
| Vendor logic | `src/modules/softwarevendor/` | Dev assigned to vendor portal |
| Marketplace | `src/modules/marketplace/` | Dev assigned to marketplace |
| Prisma schemas | `prisma/*/` | Kumar review required |

## Current State (Apr 23, 2026)

| Check | Status |
|---|---|
| Backend tsc | 0 errors ✅ |
| Backend boot | NestJS initializes, port 3001 ✅ |
| crm-admin tsc | 332 errors (known baseline, non-blocking) |
| customer-portal tsc | 0 errors ✅ |
| wl-admin, wl-partner, platform-console | 0 errors ✅ |
| vendor-panel tsc | 1 error (jest type quirk, non-blocking) |
| marketplace tsc | 11 errors (known baseline, cleanup ticket open) |
| Prisma clients | 7/7 generated ✅ |

## Open Cleanup Tickets

From `docs/v5/BASELINE_GATE.md` — good starter tasks for new devs:

| # | Title | Priority | Good for |
|---|---|---|---|
| #4 | QuotationForm `Control<>` type errors | P2 | Frontend dev learning the codebase |
| #5 | Marketplace 11 tsc errors | P3 | Any dev |
| #7 | jest.config.ts type-tree quirk | P2 | Any dev |

## Important Files to Read First

- `docs/v5/BASELINE_GATE.md` — tsc baselines and cleanup debt
- `apps-backend/api/tsconfig.json` — why seeds are excluded from tsc scope
- `apps-backend/api/prisma/seeds/identity/seed-identity.ts` — how seeding works
- `.gitignore` — what must never be committed
