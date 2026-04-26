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
| `count`              | ⏳     | PARKED — Phase 2                                   |
| `aggregate`          | ⏳     | PARKED — Phase 2                                   |
| `groupBy`            | ⏳     | PARKED — Phase 2                                   |
| `upsert`             | ⏳     | PARKED — Phase 2                                   |
| `$queryRaw`          | ⏳     | PARKED — Phase 2 (use with extreme care)           |
| `$executeRaw`        | ⏳     | PARKED — Phase 2 (use with extreme care)           |
| `$transaction`       | ⏳     | Inner operations covered; outer TX itself not wrapped |

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
| `infrastructure/tenant-scoped-models.ts` | Documentation registry (TENANT_SCOPED_MODELS, TENANT_EXEMPT_MODELS) |
| `infrastructure/tenant.guard.ts` | Guards against requests with no tenant context |
| `application/tenant-context.interceptor.ts` | Sets ALS context from JWT claims |
| `__tests__/tenant-isolation.spec.ts` | 13 unit tests covering all isolation rules |

---

## Kumar Morning Handoff — Phase 2 Checklist

### Aggregations (PARKED)
- [ ] Extend `$allModels` to cover `count`, `aggregate`, `groupBy`
- [ ] Same `injectWhere` pattern applies — add `where = injectWhere(args.where, tenantId)` before calling `query(args)`
- [ ] Add 3 tests: `count` with no where, `count` with existing where, `groupBy` cross-tenant override

### Upsert (PARKED)
- [ ] `upsert` has both `where` and `create`/`update` blocks — inject tenantId into all three
- [ ] Watch for unique constraint conflicts if tenantId is part of the unique key

### Raw SQL (PARKED)
- [ ] `$queryRaw` and `$executeRaw` cannot be auto-scoped — they must be audited manually
- [ ] Create a lint rule or grep-based CI check: no `$queryRaw` without an inline `tenantId` bind param

### $transaction (PARKED)
- [ ] Interactive transactions (`$transaction(async (tx) => {...})`) pass a raw client — the extension is NOT applied to `tx`
- [ ] Options: (a) wrap the callback to re-apply extension on `tx`, or (b) document as "use `prisma.model.*` not `tx.model.*` when tenant isolation matters"

### Per-Tenant Dedicated DB Clients (PARKED)
- [ ] `PrismaService.getWorkingClient(tenantId)` creates NEW `WorkingClient` instances
- [ ] New instances bypass `$extends` — they must call `.$extends(createTenantAwareExtension(this.tenantContext))` at creation time
- [ ] Or: pre-extend the base client and cache the extended version per tenantId

### TENANT_SCOPED_MODELS Audit
- [ ] Run `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'` on workingdb
- [ ] Cross-reference against `TENANT_SCOPED_MODELS` in `tenant-scoped-models.ts`
- [ ] Add any missing model names (documentation set only — runtime uses `$allModels`)

### Performance Benchmarking
- [ ] Measure `$extends` overhead vs baseline for `findMany` on a 100k-row table
- [ ] Expected: < 0.5ms overhead per query (pure JS object wrapping, no extra DB round-trip)
- [ ] Run: `apps-backend/api/scripts/test-tenant-isolation.ts` (smoke test below)

### Edge Cases
- [ ] Empty string tenantId in JWT → passthrough (confirmed by code, add regression test)
- [ ] Nested `OR` clauses — `injectWhere` wraps with `AND [{tenantId}, ...]` which overrides OR correctly
- [ ] Async context propagation through BullMQ queue processors (ALS does NOT cross process boundary — queue jobs need explicit tenantId parameter)
- [ ] Async context propagation through `setTimeout`/`setInterval` — ALS propagates correctly within same process
- [ ] Test with Prisma `$transaction` interactive mode (see above)

---

## Demo Readiness

| Check | Status |
|-------|--------|
| Working DB tenant isolation | ✅ M8a done |
| Demo DB tenant isolation | ✅ M8a done |
| Identity DB tenant isolation | ✅ M8a done (via `$use` middleware) |
| Cross-tenant detection logging | ✅ Both clients |
| Unit tests (13 cases) | ✅ All passing |
| Aggregations | ⏳ Phase 2 |
| Raw SQL audit | ⏳ Phase 2 |
| Dedicated DB clients | ⏳ Phase 2 |
