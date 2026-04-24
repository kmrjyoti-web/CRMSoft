# DemoDB Discovery Scan — CRM_V1 Migration

**Date:** 2026-04-16
**Sprint:** 7-DB migration to CRM_V1 (step 7 of 7)

---

## Finding: Architectural Gap

DemoDB is defined in Architecture v2 as a separate isolation layer for demo/trial tenants. However, **no code wiring exists yet.**

### What was found

| Check | Result |
|-------|--------|
| `prisma/schemas/demo.prisma` exists? | ❌ No |
| `DEMO_DATABASE_URL` env var in code? | ❌ No references anywhere |
| `demoPrisma` / `DemoDB` client in PrismaService? | ❌ No |
| `prisma.demo` in PrismaService (line 304)? | ✅ Yes — but this is the **`Demo` model in WorkingDB**, not a separate DB client |

### Root cause

`prisma.service.ts:304`: `get demo() { return this._globalWorking.demo; }`

This is a Prisma model accessor for the `Demo` table (model at `working.prisma:1778`) inside WorkingDB.
It is NOT a separate database connection. The name collision ("demo getter" vs "DemoDB") is misleading.

### Current architecture vs intended

| | Current | Intended (Architecture v2) |
|--|---------|---------------------------|
| Demo data location | `Demo` table in `workingdb` | Separate `demodb` database |
| Isolation | None — demo rows sit in prod WorkingDB | Full DB-level isolation |
| Routing | N/A | `subscriptionType='demo'` → DemoDB |
| Schema | `working.prisma` (shared) | Mirror of `working.prisma` pushed to demodb |

---

## Action taken

- `demodb` database created in CRM_V1 Postgres (empty — no schema pushed)
- No `.env` update (no `DEMO_DATABASE_URL` env var expected by code)
- Schema push skipped — would have no consumer in current codebase

---

## Recommendation

DemoDB wiring is a **future sprint task** with the following steps:

1. Add `DEMO_DATABASE_URL` env var to `.env` pointing to `demodb`
2. Push `working.prisma` schema to `demodb` (same schema, separate DB)
3. Add `_demo: WorkingClient` to `PrismaService`, initialized with `DEMO_DATABASE_URL`
4. Add routing logic: requests from `subscriptionType='demo'` tenants use `prisma.demo.*` via the demo client
5. Migrate current `Demo` table rows out of WorkingDB (if any) into DemoDB

**Priority:** Low for MVP. WorkingDB with a `Demo` model is a valid short-term approach.

---

## demodb status on CRM_V1

- Database exists: ✅ (empty, created 2026-04-16)
- Tables: 0 (schema not pushed — no wiring in code)
- Reserved for future sprint
