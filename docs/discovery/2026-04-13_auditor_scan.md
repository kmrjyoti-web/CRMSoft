# Discovery Report — DB Schema Auditor Scan
**Date:** 2026-04-13  
**Sprint:** Week 1 Task 2 — DB Schema Auditor + Entity Inspector v0

---

## 1. Existing Audit/Lint Scripts

| Path | Purpose |
|---|---|
| `scripts/audit/cross-service-report.ts` | Cross-service dependency analysis |
| `scripts/architecture-guard.sh` | Pre-commit architecture guard (Husky) |

No dedicated DB schema audit tool exists. Safe to create.

## 2. NPM Dependencies

- `@mrleebo/prisma-ast` — **not installed** (will need to add)
- `ts-morph` — **not installed** (needed for Check 2: cross-DB include detection)
- `prisma` — v5.19.0 installed

## 3. FK Orphan Patterns

None found. `prisma/seed.ts` has basic orphan menu cleanup (data-level, not FK validation).

## 4. Cross-DB Resolver

- `src/core/prisma/cross-db-resolver.service.ts` — **EXISTS**
  - Batch-resolves User, Role, LookupValue relations from IdentityDB/PlatformDB
  - Used by WorkingDB services that have FK columns to IdentityDB

## 5. Prisma Schema Model Counts

| Schema | Models |
|---|---|
| identity.prisma | 43 |
| platform.prisma | 64 |
| working.prisma | 229 |
| marketplace.prisma | 13 |
| platform-console.prisma | 30 |
| global-reference.prisma | 12 |
| **Total** | **391** |

## 6. Existing db-auditor Module

**Does not exist** — safe to create at `src/modules/softwarevendor/db-auditor/`.

## 7. Related: db-maintenance Module

`src/modules/ops/db-maintenance/` exists (index stats, table stats, vacuum). Does NOT do FK orphan detection.

## 8. Vertical Registry State

`gv_cfg_vertical`: 2 rows (gv, soft) — seeded in Task 1.
`gv_cfg_vertical_module`: 23 rows — module mappings.

## Decision: PROCEED

No pre-existing auditor found. Create new module at `src/modules/softwarevendor/db-auditor/`.
