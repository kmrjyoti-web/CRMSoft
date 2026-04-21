# CRMSoft V5 — Database Documentation

**Created:** 2026-04-22 (night shift)
**Author:** Night-shift team member (Kumar unavailable — on multiple projects)
**Scope:** Read-only schema analysis → markdown documentation. Zero code changes.

## Audience

Two readers:

1. **Kumar** — when supervising the V5 folder restructure. The master doc lists every Prisma generator's output path, every env var, and every migration-policy exception he has to preserve.
2. **New engineers joining the project** — a ground-truth description of what exists today, why there are 8 separate databases, and where to look.

## Document Map

| File | What it covers |
|---|---|
| [`00_DATABASE_ARCHITECTURE_MASTER.md`](./00_DATABASE_ARCHITECTURE_MASTER.md) | 8-DB inventory (verified counts), multi-client architecture, blast-radius rationale, migration policies, V5 restructure impact |
| [`01_IDENTITY_DB.md`](./01_IDENTITY_DB.md) | 43 models across 4 schema files — auth, RBAC, tenants, licensing, audit |
| [`02_WORKING_DB.md`](./02_WORKING_DB.md) | 228 models across 13 schema files — the main business DB (CRM, sales, purchase, inventory, communication, workflow, sync) |
| [`03_DEMO_DB.md`](./03_DEMO_DB.md) | 228 models — structural clone of WorkingDB for trial isolation |
| [`04_GLOBAL_DB.md`](./04_GLOBAL_DB.md) | 12 models — shared reference (countries, states, GST rates, HSN, lookup values) |
| [`05_MARKETPLACE_DB.md`](./05_MARKETPLACE_DB.md) | 13 models — listings, posts, offers, reviews, enquiries, analytics |
| [`06_PLATFORM_DB.md`](./06_PLATFORM_DB.md) | 64 models — CRMSoft's vendor-side ops (packages, coupons, plugins, verticals, testing, error catalog) — `db push` only |
| [`07_PLATFORM_CONSOLE_DB.md`](./07_PLATFORM_CONSOLE_DB.md) | 29 models — internal ops tooling (errors, alerts, deployments, DR) — `db push` only |
| [`08_WHITELABEL_DB.md`](./08_WHITELABEL_DB.md) | 21 models — WL partners, branding, domains, pricing, dev requests (lives in `WhiteLabel/wl-api/`) |
| [`09_CROSS_DB_PATTERNS.md`](./09_CROSS_DB_PATTERNS.md) | Why cross-DB `include:` is impossible; two-step resolver pattern; common edges; anti-patterns |
| [`10_DYNAMIC_FIELDS_V5.md`](./10_DYNAMIC_FIELDS_V5.md) | Hardcoded core types + `verticalData` JSON + lookup/terminology/brand-category overrides |
| [`11_MULTITENANT_MODEL.md`](./11_MULTITENANT_MODEL.md) | Three tenancy levels, `tenantId` scoping rule, activation lifecycle, shared vs. dedicated DB |

## Key Findings (Surprises From the Actual Code)

The sprint prompt had several inaccurate assumptions — reality verified from schema files at develop tip `f2dacf53`:

| Prompt said | Reality |
|---|---|
| DemoDB "NOT YET CREATED" | ✅ Exists — 228 models, same schema as WorkingDB |
| GlobalDB "NOT YET CREATED" | ✅ Exists — 12 models, all `GlCfg…`-prefixed |
| PlatformDB "37 models" | 64 models |
| PlatformConsoleDB "30 models" | 29 models |
| WhiteLabelDB "16 tables" | 21 models |
| IdentityDB "42 models" | 43 models |

**Total: 638 models across 8 databases** (7 in main backend + 1 in the WhiteLabel app).

## Critical Rule for V5 Restructure

This repo uses **`prismaSchemaFolder` + 7 custom client output paths**. `@prisma/client` itself is a bare stub. Every V5 move must:

1. Update `_base.prisma` `output` paths after folder moves.
2. Regenerate **each** of the 7 clients individually (`pnpm prisma generate --schema=…`).
3. Keep PlatformDB and PlatformConsoleDB on `db push` (never `migrate deploy`).

Full details in [`00_DATABASE_ARCHITECTURE_MASTER.md`](./00_DATABASE_ARCHITECTURE_MASTER.md#multi-client-prisma-architecture-critical).

## For Kumar's Review

- These are reference docs, not specs. They describe what **is**, not what **should be**.
- Several sections mark open questions (e.g. PlatformDB `LookupValue` vs GlobalDB `GlCfgLookupValue` — should they consolidate?). Those are decision points, not my recommendations.
- All model counts, file paths, env vars, and output paths were verified against the live schema files — not copy-pasted from the sprint prompt.

## Scope Confirmation

- ✅ Documentation only — zero code changes
- ✅ Zero schema modifications
- ✅ Zero DB operations (no migrate, no db push, no generate)
- ✅ Read-only exploration of schema files
- ❌ V5 restructure NOT executed (Kumar's supervised shift)
