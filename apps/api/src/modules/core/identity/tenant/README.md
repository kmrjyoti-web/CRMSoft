# Tenant Isolation — Sprint M8a

Multi-tenant data isolation enforced at the Prisma ORM level. Every query against
the working DB and demo DB is automatically scoped to the requesting tenant's ID
with no code changes needed in individual services.

---

## Architecture

```
HTTP Request
  └─ JwtAuthGuard         (populates req.user)
  └─ TenantContextInterceptor  (calls tenantContext.run(tenantId, ...))
       └─ AsyncLocalStorage    (carries tenantId for the lifetime of the request)
            └─ PrismaService.$extends tenantFilter
                 └─ injectWhere / injectData on every ORM call
                      └─ Postgres query executes
```

Three clients are protected:

| Client           | Protection       | DB            |
|------------------|------------------|---------------|
| `_globalWorking` | `$extends`       | workingdb     |
| `_demo`          | `$extends`       | demodb        |
| `_identity`      | `$use` middleware| identitydb    |

The identity client uses a `$use` middleware with an explicit **exclusion list**
(`GLOBAL_MODELS`) because most identity models are cross-tenant by design (Tenant,
Plan, Subscription, SuperAdmin …).

The working/demo clients use `$extends` with `$allModels` because all 220 business
tables have a `tenant_id` column — fail-closed is the right default.

---

## Operations Coverage

| Operation            | Status | Behaviour                                          |
|----------------------|--------|----------------------------------------------------|
| `findMany`           | ✅     | Injects `WHERE tenantId = ?`                       |
| `findFirst`          | ✅     | Injects `WHERE tenantId = ?`                       |
| `findFirstOrThrow`   | ✅     | Injects `WHERE tenantId = ?`                       |
| `findUnique`         | ✅     | Post-query verify (PK lookup can't pre-filter)     |
| `findUniqueOrThrow`  | ✅     | Post-query verify; throws `Error('Record not found')` on mismatch |
| `create`             | ✅     | Sets `data.tenantId`                               |
| `createMany`         | ✅     | Sets `tenantId` on every row                       |
| `update`             | ✅     | Injects `WHERE tenantId = ?`                       |
| `updateMany`         | ✅     | Injects `WHERE tenantId = ?`                       |
| `delete`             | ✅     | Injects `WHERE tenantId = ?`                       |
| `deleteMany`         | ✅     | Injects `WHERE tenantId = ?`                       |
| `count`              | ✅     | Injects `WHERE tenantId = ?` (Phase 2)             |
| `aggregate`          | ✅     | Injects `WHERE tenantId = ?` (Phase 2)             |
| `groupBy`            | ✅     | Injects `WHERE tenantId = ?` (Phase 2)             |
| `upsert`             | ✅     | Inject `create.tenantId`, strip `update.tenantId`, post-verify (Phase 2) |
| `$transaction` array | ✅     | Each op is extended — no extra wrapping needed      |
| `$transaction` interactive | ✅ | Use `prisma.safeTransaction()` — wraps `tx` with extension (Phase 2) |
| `$queryRaw`          | 📋     | Cannot auto-intercept. Manual audit done: all 8 usages SAFE (see docs/audit/) |
| `$executeRaw`        | 📋     | Cannot auto-intercept. No usages found in working DB. |

---

## Passthrough Rules (Fail-Closed)

| Condition                               | Behaviour                        |
|-----------------------------------------|----------------------------------|
| `getTenantId()` returns `undefined`     | Passthrough (no ALS context set) |
| `getTenantId()` returns `''`            | Passthrough (shared-tenant legacy) |
| `getTenantId()` returns UUID            | Tenant isolation enforced        |
| `where.tenantId` differs from context  | Log `CROSS_TENANT_ATTEMPT`, override with context tenant |
| Super-admin request (no tenantId set)   | Passthrough (interceptor skips)  |
| Public route (no JWT)                   | Passthrough (interceptor skips)  |

---

## Cross-Tenant Detection

When a query arrives with `where.tenantId` or `data.tenantId` set to a value that
differs from the ALS context, the extension logs at `ERROR` level:

```
[TENANT_SECURITY] CROSS_TENANT_ATTEMPT where.tenantId=<requested> context=<actual>
```

The query is **not blocked** — it is re-written to use the context tenant. This
matches the fail-closed principle: silently override rather than expose data.

The identity client logs the same format from `detectCrossTenantAttempt()` in
`prisma-tenant.middleware.ts`.

---

## Key Files

| File | Purpose |
|------|---------|
| `infrastructure/tenant-aware-prisma.ts` | `$extends` factory for working/demo clients |
| `infrastructure/prisma-tenant.middleware.ts` | `$use` middleware for identity client |
| `infrastructure/tenant-context.service.ts` | AsyncLocalStorage wrapper |
| `infrastructure/tenant-scoped-models.ts` | Documentation registry — 220 models with tenantId |
| `infrastructure/tenant-job.helper.ts` | BullMQ context propagation helper (Phase 2) |
| `infrastructure/tenant.guard.ts` | Guards against requests with no tenant context |
| `application/tenant-context.interceptor.ts` | Sets ALS context from JWT claims |
| `__tests__/tenant-isolation.spec.ts` | 13 unit tests covering all isolation rules |
| `../../core/prisma/prisma.service.ts` | `safeTransaction()` for interactive tx (Phase 2) |
| `docs/audit/2026-04-27_RAW_SQL_AUDIT.md` | Raw SQL audit — all 8 usages verified SAFE |

---

## Kumar Morning Handoff — Remaining Tasks

### Performance Benchmarking
- [ ] Measure `$extends` overhead vs baseline for `findMany` on a 100k-row table
- [ ] Expected: < 0.5ms overhead per query (pure JS object wrapping, no extra DB round-trip)
- [ ] Run: `scripts/test-tenant-isolation.ts` smoke test against live workingdb

### Per-Tenant Dedicated DB Clients (STILL PARKED)
- [ ] `PrismaService.getWorkingClient(tenantId)` creates NEW `WorkingClient` instances
- [ ] New instances bypass `$extends` — they must call `.$extends(createTenantAwareExtension(this.tenantContext))` at creation time
- [ ] Fix: cache extended clients in `_tenantClients` map, keyed by tenantId

### Demo Prep
- [ ] Run all test scripts (smoke test, verify counts/notifications filter correctly)
- [ ] Walk through lead creation, notification list, workflow stats in the UI
- [ ] Verify CROSS_TENANT_ATTEMPT log appears when manually sending wrong tenantId in where

---

## Demo Readiness

| Check | Status |
|-------|--------|
| Working DB tenant isolation | ✅ M8a Phase 1 |
| Demo DB tenant isolation | ✅ M8a Phase 1 |
| Identity DB tenant isolation | ✅ M8a Phase 1 (via `$use` middleware) |
| Cross-tenant detection logging | ✅ Both clients |
| Unit tests (13 cases) | ✅ All passing |
| count / aggregate / groupBy | ✅ M8a Phase 2 |
| upsert | ✅ M8a Phase 2 |
| safeTransaction() for interactive tx | ✅ M8a Phase 2 (5 files updated) |
| Raw SQL audit | ✅ M8a Phase 2 (all 8 usages SAFE) |
| BullMQ context helper | ✅ M8a Phase 2 (TenantJobHelper) |
| TENANT_SCOPED_MODELS (220 models) | ✅ M8a Phase 2 |
| Per-tenant dedicated DB clients | ⏳ getWorkingClient() gap — Kumar morning |
| Performance benchmarking | ⏳ Kumar morning |
