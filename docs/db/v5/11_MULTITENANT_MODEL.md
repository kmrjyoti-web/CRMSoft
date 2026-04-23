# V5 Multi-Tenant Data Model

## Tenant Scope Levels

CRMSoft has **three** tenancy levels stacked on top of each other:

```
┌────────────────────────────────────────────────────┐
│  Platform (CRMSoft + WL Partners)                  │
│  ┌──────────────────────────────────────────────┐  │
│  │  Partner (WL)                                │  │
│  │  ┌────────────────────────────────────────┐  │  │
│  │  │  Tenant (B2B/B2C customer)             │  │  │
│  │  │  ┌──────────────────────────────────┐  │  │  │
│  │  │  │  User(s) inside the tenant        │  │  │  │
│  │  │  └──────────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

- **Platform level** — CRMSoft's own ops (PlatformDB, PlatformConsoleDB).
- **Partner level** — White Label partners who resell CRMSoft (WhiteLabelDB).
- **Tenant level** — end customer organizations (IdentityDB, WorkingDB, MarketplaceDB).

Every data row in the business databases lives at the Tenant level or below.

---

## Per-DB Tenant Scoping

| DB | Tenant-scoped? | Scoping field | Notes |
|---|:-:|---|---|
| IdentityDB | Partial | `tenantId` on most rows; `Tenant` itself is the top-level row | Users can belong to multiple tenants via `UserCapacity` |
| WorkingDB | **Every row** | `tenantId` | Primary transactional DB |
| DemoDB | **Every row** | `tenantId` | Same as Working — just isolated |
| GlobalDB | No — shared reference | — | Read-only per tenant |
| MarketplaceDB | **Every row** | `tenantId` | Listings/posts owned by a tenant |
| PlatformDB | Mixed | `tenantId` on tenant-specific rows (`TenantModule`, `TenantUsageDetail`, `Wallet`, etc.); platform-wide rows have no tenantId | — |
| PlatformConsoleDB | Mostly cross-tenant | — | Aggregates across tenants for ops |
| WhiteLabelDB | No tenantId; uses `partnerId` | `partnerId` → Tenant row in IdentityDB | Partner-scoped, not tenant-scoped |

---

## The `tenantId` Scoping Rule

**Every query against a tenant-scoped DB MUST include `tenantId` in its `WHERE` clause.**

### ✅ Correct

```typescript
const leads = await workingDb.lead.findMany({
  where: { tenantId: ctx.tenantId, status: 'OPEN' },
});
```

### ❌ Wrong — leaks cross-tenant data

```typescript
const leads = await workingDb.lead.findMany({
  where: { status: 'OPEN' },
});
```

### ❌ Subtler wrong — missing tenantId on a nested filter

```typescript
const leads = await workingDb.lead.findMany({
  where: {
    tenantId: ctx.tenantId,
    createdBy: { id: userId },   // If userId belongs to a different tenant, still returns rows
  },
});
```

The correct pattern for nested filters is:

```typescript
where: {
  tenantId: ctx.tenantId,
  createdById: userId,   // the plain FK
}
```

### Enforcement

Three layers defend against tenant leaks:

1. **Request middleware** extracts `tenantId` from the JWT, attaches to request context.
2. **Handler layer** passes `ctx.tenantId` into every query.
3. **Row-Level Security (optional, future)** — Postgres RLS policies on `tenantId` for defense in depth.

There's no ORM-level enforcement today. Code review and a lint rule (e.g., "prisma query missing tenantId filter") are the primary defenses.

---

## Tenant Activation Lifecycle

### 1. Signup

- Creates a `Tenant` row in IdentityDB with status `TRIAL`.
- Creates an initial admin `User` + `CustomerProfile`.
- Writes seed config (`TenantConfig`, `TenantBranding`, `MenuConfig`).
- Business DB writes land in **DemoDB**, not WorkingDB, for trial tenants.

### 2. Trial to paid

- `Subscription` is created linking the tenant to a `Package` (IdentityDB + PlatformDB).
- `Tenant.status` moves `TRIAL` → `ACTIVE`.
- Migration job copies tenant's rows from DemoDB to WorkingDB.
- Future writes go to WorkingDB.

### 3. Tenant suspension

- `Tenant.status` → `SUSPENDED`.
- Session token rejected at authentication; existing data untouched.

### 4. Tenant cancellation

- `Tenant.status` → `CANCELLED`.
- Data retained per `DataRetentionPolicy` (IdentityDB).
- After retention window: hard delete via cleanup job.

---

## Shared vs. Dedicated DB Strategy

`Tenant.dbStrategy` (`SHARED` | `DEDICATED`) controls physical DB placement:

- **SHARED** — tenant rows live in the common WorkingDB alongside other shared tenants.
- **DEDICATED** — an enterprise-tier tenant gets its own Postgres instance. Same schema, just a different `DATABASE_URL` at runtime.

The backend uses a connection factory that picks the right client based on `Tenant.dbStrategy`. The schema is identical — only the physical database differs.

---

## WL Partner as a Special Tenant

A White Label partner is modeled as a `Tenant` row in IdentityDB with a flag (or `TenantType` enum value) marking it as a partner. The partner's end-user tenants carry `Tenant.parentPartnerId` pointing to the partner's Tenant row.

When resolving tenancy for a WL end-user request:

1. Request hits a partner domain (e.g. `app.partner.com`).
2. Middleware looks up `PartnerDomain` in WhiteLabelDB → gets `partnerId`.
3. JWT's `tenantId` is cross-checked against `Tenant.parentPartnerId` to ensure the user belongs to a tenant under this partner.
4. Branding (`PartnerBranding`) is applied for this request.

---

## Cross-Tenant Operations (Rare but Valid)

Some operations are explicitly cross-tenant. These must be authorized at the Platform level, not the Tenant level:

| Operation | Who | Where |
|---|---|---|
| Aggregate error log | Platform ops | PlatformConsoleDB `GlobalErrorLog` |
| Marketplace enquiry between tenants | Any tenant user | MarketplaceDB — requires explicit cross-tenant edge via `MktEnquiry` |
| Billing aggregation for a WL partner | Partner admin | WhiteLabelDB `PartnerUsageLog` aggregates end-user tenant usage |
| Platform analytics | CRMSoft team only | PlatformConsoleDB |

Every cross-tenant read requires either a `PLATFORM_ADMIN`/`PARTNER_ADMIN` role, or an explicit cross-tenant edge (like MarketplaceDB's enquiry model) that both parties have opted into.

---

## User ↔ Tenant Relationship

A `User` (human) can belong to multiple tenants via `UserCapacity` rows (IdentityDB). The JWT carries **one active tenantId at a time** — the user chooses which tenant they're operating as. Switching tenants means a new JWT.

```
User (id: u_123, email: anita@example.com)
  ├─ UserCapacity (tenantId: t_aaa, roleId: admin)
  ├─ UserCapacity (tenantId: t_bbb, roleId: viewer)
  └─ UserCapacity (tenantId: t_ccc, roleId: editor)
```

When Anita logs in, she picks one of `t_aaa/t_bbb/t_ccc`; the JWT encodes that choice; every subsequent query filters by that `tenantId`.

---

## Testing Multi-Tenancy

A common class of bug is "query works in dev because only one tenant exists, breaks in prod because it returns cross-tenant rows." Mitigations:

- **Every integration test seeds two tenants** — the scenario tenant and a noise tenant.
- **Every test assertion** that counts rows or fetches records has a matching assertion that the noise-tenant rows are NOT returned.
- **Code review checklist** includes "every new Prisma query filters by tenantId."

See `apps-backend/api/src/modules/customer-portal/__tests__/activate-portal.handler.spec.ts` for examples of tenant-isolation assertions.
