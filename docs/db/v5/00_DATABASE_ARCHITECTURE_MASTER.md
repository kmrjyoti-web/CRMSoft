# CRMSoft V5 — Database Architecture Master Reference

**Last Updated:** 2026-04-22 (night shift)
**Project:** CRMSoft V5 multi-tenant SaaS CRM
**Database count:** 8 (7 in main backend + 1 in WhiteLabel app)
**Hosting:** Railway / Supabase Postgres

---

## TL;DR — Actual Inventory

Values verified from live schema files on develop tip `f2dacf53`.

| # | DB | Schemas under | Models | Client output | Env var |
|---|---|---|---:|---|---|
| 1 | **IdentityDB** | `Application/backend/prisma/identity/v1/` | 43 | `node_modules/@prisma/identity-client` | `IDENTITY_DATABASE_URL` |
| 2 | **WorkingDB** | `Application/backend/prisma/working/v1/` | 228 | `node_modules/@prisma/working-client` | `GLOBAL_WORKING_DATABASE_URL` |
| 3 | **DemoDB** ✅ | `Application/backend/prisma/demo/v1/` | 228 | `node_modules/.prisma/demo-client` | `DEMO_DATABASE_URL` |
| 4 | **GlobalDB** ✅ | `Application/backend/prisma/global/v1/` | 12 | `node_modules/.prisma/global-reference-client` | `GLOBAL_REFERENCE_DATABASE_URL` |
| 5 | **MarketplaceDB** | `Application/backend/prisma/marketplace/v1/` | 13 | `node_modules/@prisma/marketplace-client` | `MARKETPLACE_DATABASE_URL` |
| 6 | **PlatformDB** | `Application/backend/prisma/platform/v1/` | 64 | `node_modules/@prisma/platform-client` | `PLATFORM_DATABASE_URL` |
| 7 | **PlatformConsoleDB** | `Application/backend/prisma/platform-console/v1/` | 29 | `node_modules/.prisma/platform-console-client` | `PLATFORM_CONSOLE_DATABASE_URL` |
| 8 | **WhiteLabelDB** | `WhiteLabel/wl-api/prisma/schema.prisma` | 21 | default `node_modules/.prisma/client` (separate app) | (WL app's own `DATABASE_URL`) |

**Total: 638 models** across 8 databases.

⚠️ The sprint prompt claimed DemoDB and GlobalDB are "NOT YET CREATED" — this is **incorrect**. Both are fully scaffolded with migrations and clients. Same for claims of "37 models" in PlatformDB (actual: 64) and "30 models" in PlatformConsoleDB (actual: 29).

---

## Multi-Client Prisma Architecture (CRITICAL)

This repo uses Prisma's `prismaSchemaFolder` preview feature plus **7 dedicated generated clients per DB** (plus an 8th in the standalone WhiteLabel app). There is no single `@prisma/client` — it is a bare stub. **Nothing imports from `@prisma/client` directly.**

### How code imports a client

```typescript
// Backend code never does: import { PrismaClient } from '@prisma/client'
import { PrismaClient as IdentityClient } from '@prisma/identity-client';
import { PrismaClient as WorkingClient } from '@prisma/working-client';
import { PrismaClient as PlatformClient } from '@prisma/platform-client';
import { PrismaClient as MarketplaceClient } from '@prisma/marketplace-client';
// Note: demo / global / platform-console clients live under .prisma/, not @prisma/:
import { PrismaClient as DemoClient } from '.prisma/demo-client';
import { PrismaClient as GlobalClient } from '.prisma/global-reference-client';
import { PrismaClient as PlatformConsoleClient } from '.prisma/platform-console-client';
```

### Why this matters for V5 restructure

Any folder move that changes `prisma/*/v1/` location must:

1. Update every `_base.prisma`'s `output = "../../../node_modules/@prisma/<name>-client"` path.
2. Re-run `pnpm prisma generate` for each schema individually (not a single global generate).
3. Ensure `tsconfig` path aliases or `paths` still resolve the client imports.
4. Regenerate all 7 clients — a single `prisma generate` at the repo root is insufficient.

---

## Why 8 Databases — Blast Radius Isolation

| DB | Why separate |
|---|---|
| **IdentityDB** | Auth/RBAC is security-critical. Different backup frequency, encryption-at-rest posture, and access-audit requirements than business data. |
| **WorkingDB** | Heavy write volume from hundreds of tenants. Sharding per-tenant (future) is easier with dedicated DB. |
| **DemoDB** | Trial / demo tenants must be trivially wipeable without affecting real customer data. Identical schema to Working so code paths are shared. |
| **GlobalDB** | Read-heavy reference data (countries, GST rates, HSN codes, industries). Cacheable across all tenants; no per-tenant writes. |
| **MarketplaceDB** | Different scaling profile (social feed, enquiries, reviews) than business CRM data. |
| **PlatformDB** | CRMSoft's own platform ops — plans, licenses, coupons, test infrastructure, vertical registry. Isolated so tenant incidents can't affect vendor operations. |
| **PlatformConsoleDB** | Internal admin tools — DR plans, error summaries, deployment logs. Admin-only, separate security boundary. |
| **WhiteLabelDB** | WL partners are a separate multi-tenant scope living in their own Next.js app (`wl-api`). Isolated because partner PII/billing must not co-mingle with the main SaaS. |

---

## Migration Policy

| DB | Migration strategy | Command | Why |
|---|---|---|---|
| IdentityDB | **Formal migrations** | `prisma migrate deploy` | Production-safe, version-controlled |
| WorkingDB | **Formal migrations** | `prisma migrate deploy` | Production-safe |
| DemoDB | **Formal migrations** | `prisma migrate deploy` | Identical schema to Working, same policy |
| GlobalDB | **Formal migrations** | `prisma migrate deploy` | Reference data; schema churn is low but audited |
| MarketplaceDB | **Formal migrations** | `prisma migrate deploy` | Production-safe |
| **PlatformDB** | ⚠️ **`db push` only** | `prisma db push` | Admin-owned; rapid iteration of vendor-side config without migration files |
| **PlatformConsoleDB** | ⚠️ **`db push` only** | `prisma db push` | Admin tooling; migrations add friction without safety benefit here |
| WhiteLabelDB | Formal migrations | `prisma migrate deploy` (in `wl-api`) | Production partner data |

**Never mix policies.** Running `migrate` on a `db push`-managed DB creates a migration baseline that diverges from reality. Running `db push` on a `migrate`-managed DB skips history tracking and breaks rollbacks.

---

## 3-Axis Architecture Mapping

CRMSoft V5 is factored on three orthogonal axes:

- **Brand** (CRMSoft Main, MargCRM, TallyPlus, WL partner brands)
- **Vertical** (Electronics, Travel, Restaurant, Retail, Software Vendor, …)
- **Core Business Type** (7 hardcoded: B2B, B2C, CUSTOMER, MANUFACTURER, SERVICE_PROVIDER, INDIVIDUAL_SERVICE_PROVIDER, EMPLOYEE)

Where each axis physically lives:

| Axis | Source of truth | Consumed by |
|---|---|---|
| **Brand** | WhiteLabelDB (`WhiteLabelPartner`, `PartnerBranding`) + IdentityDB (`TenantBranding`) | Frontend theme, domain routing, email templates |
| **Vertical** | PlatformDB (`GvCfgVertical`, `GvCfgVerticalModule`) registry; WorkingDB tenant rows reference `verticalId` | Module enablement, feature flags, industry packages |
| **Core Business Type** | PlatformDB (`BusinessTypeRegistry`) + IdentityDB (`User.userType`) | Hardcoded enum guards, UI branching |

---

## Cross-DB Relationships

**Prisma `include:` across database clients is architecturally impossible.** Every cross-DB traversal must go through the `CrossDbResolverService` two-step pattern. See [`09_CROSS_DB_PATTERNS.md`](./09_CROSS_DB_PATTERNS.md).

---

## Document Index

1. [Master (this file)](./00_DATABASE_ARCHITECTURE_MASTER.md)
2. [IdentityDB (43 models)](./01_IDENTITY_DB.md)
3. [WorkingDB (228 models)](./02_WORKING_DB.md)
4. [DemoDB (228 models — Working clone)](./03_DEMO_DB.md)
5. [GlobalDB (12 models — reference data)](./04_GLOBAL_DB.md)
6. [MarketplaceDB (13 models)](./05_MARKETPLACE_DB.md)
7. [PlatformDB (64 models)](./06_PLATFORM_DB.md)
8. [PlatformConsoleDB (29 models)](./07_PLATFORM_CONSOLE_DB.md)
9. [WhiteLabelDB (21 models)](./08_WHITELABEL_DB.md)
10. [Cross-DB resolver patterns](./09_CROSS_DB_PATTERNS.md)
11. [Dynamic field architecture](./10_DYNAMIC_FIELDS_V5.md)
12. [Multi-tenant model](./11_MULTITENANT_MODEL.md)

---

## V5 Restructure Impact Summary

When the V5 folder restructure moves `Application/backend/prisma/` to a repo-root `prisma/`, every item in this list must be updated:

1. **7 × `_base.prisma` files** — `output = "../../../node_modules/..."` relative paths.
2. **Every schema folder's `prismaSchemaFolder` preview feature** must keep working after the move.
3. **Every `PrismaService` or module that imports `@prisma/<name>-client`** — nothing to change if node_modules path stays the same, but the generator output paths have to resolve correctly after regeneration.
4. **Seed files** (`prisma/seeds/*.seed.ts`) reference clients — verify imports.
5. **WhiteLabel app stays put** unless explicitly restructured (it is a separate Next.js service with its own Prisma setup).
6. **Environment variables** stay the same; only disk paths change.
7. **Regenerate all 7 clients** after move: `pnpm prisma generate --schema=...` for each DB.

A global `pnpm prisma generate` at the root **will not work** — each schema needs its own `generate` because each has its own `output` location.
