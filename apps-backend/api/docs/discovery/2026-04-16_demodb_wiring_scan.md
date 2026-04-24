# DemoDB Wiring — Discovery Scan

**Date:** 2026-04-16

---

## 1. Demo model in WorkingDB

`prisma/working/v1/crm.prisma:380`

```prisma
model Demo {
  id            String     @id
  tenantId      String
  mode          DemoMode
  status        DemoStatus @default(SCHEDULED)
  scheduledAt   DateTime
  leadId        String
  lead          Lead       @relation(...)
  conductedById String
  ...
  @@map("gv_crm_demos")
}
```

**This is CRM demo scheduling** (scheduling product demos with leads), NOT a demo tenant DB.
The conceptual mismatch: `prisma.demo` today = a WorkingDB MODEL accessor. After wiring, `prisma.demo` = the DemoDB CLIENT.

---

## 2. Code references to `prisma.demo`

### Backward-compat `get demo()` shortcut (routes to `this._globalWorking.demo`)
| File | Line | Usage |
|------|------|-------|
| `src/modules/core/identity/audit/services/audit-snapshot.service.ts` | 48 | `this.prisma.demo.findUnique(...)` |

**Action:** Change to `this.prisma.working.demo.findUnique(...)` and remove backward-compat getter.

### `this.prisma.working.demo.*` (correct, no change needed)
30+ files in `src/modules/customer/` — all already use `prisma.working.demo.*`, no conflict.

---

## 3. PrismaService structure

- **Pattern:** private `_clientName`, instantiated in constructor, `$connect` in `onModuleInit`, `$disconnect` in `onModuleDestroy`
- **Clients:** identity (IdentityClient), platform (PlatformClient), globalWorking (WorkingClient), globalReference (GlobalReferenceClient)
- **Import paths:** `@prisma/identity-client`, `@prisma/platform-client`, `@prisma/working-client`, `.prisma/global-reference-client`
- **New DemoDB client** will import from `.prisma/demo-client` (same pattern as globalReference)
- **Pool limit:** `withPoolLimit()` applied in prod — will apply to demo client too
- **Soft-delete middleware:** registered on globalWorking only — will register on demo client too
- **Startup:** `Promise.allSettled` — demo client added to the array

---

## 4. subscriptionType — Case B (field does not exist)

`TenantStatus` enum currently: `ACTIVE | INACTIVE | SUSPENDED | TRIAL | CANCELLED`

**Decision:** Add `DEMO` to `TenantStatus`. When `tenant.status === 'DEMO'`, route to DemoDB.

`TRIAL` = limited free trial on WorkingDB (normal tenant with restrictions).
`DEMO` = full demo environment with demo data, isolated to DemoDB.

**No new field needed** — use existing `Tenant.status` field with new DEMO value.

---

## 5. Routing approach

**PrismaService-level router** (not middleware):

```ts
async getWorkingOrDemoClient(tenantId: string): Promise<WorkingClient | DemoClient>
```

Reasons for preferring PrismaService-level:
- Only 1 DB query overhead (tenant lookup already cached in most handlers)
- Zero disruption to existing `this.prisma.working.*` calls (services opt-in)
- Middleware approach would require refactoring 100+ services to use `req['dbClient']`

---

## 6. Schema approach — Approach A (symlinks)

Symlinks from `prisma/demo/v1/` → `prisma/working/v1/` domain files (except `_base.prisma`).
Test before committing: `npx prisma generate --schema=prisma/demo/v1/`
If symlinks fail on CI: fall back to Approach B (copy script).

---

## 7. Naming conflict resolution

| Before | After |
|--------|-------|
| `get demo() { return this._globalWorking.demo; }` (backward-compat) | **REMOVED** |
| `this.prisma.demo.findUnique` in audit-snapshot.service.ts | → `this.prisma.working.demo.findUnique` |
| *(new)* `get demo(): DemoClient` | DemoDB client accessor |

---

## 8. Decisions

| Item | Decision |
|------|----------|
| Schema approach | Approach A (symlinks), fallback B |
| subscriptionType | Use `TenantStatus.DEMO` (add to enum) |
| Routing | `PrismaService.getWorkingOrDemoClient(tenantId)` |
| DemoDB accessor name | `prisma.demo` (reclaim from backward-compat) |
| isDemoTenant boolean | NOT added — use existing `status` field |
