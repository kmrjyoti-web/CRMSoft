# Cross-DB Resolver Patterns

## The Hard Rule

**Prisma `include:` cannot cross database clients.** Every one of CRMSoft's 7 Prisma clients connects to a different Postgres instance. There is no SQL-level JOIN across databases, and Prisma's query engine has no mechanism to fan out across clients.

Any code that looks like:

```typescript
// ❌ This does not compile, and if it did it would fail at runtime.
const order = await workingDb.saleOrder.findUnique({
  where: { id },
  include: { createdBy: true }   // User lives in IdentityDB, not WorkingDB
});
```

…is a bug waiting to happen. The `createdBy` relation simply doesn't exist on the `SaleOrder` model — only `createdById: string` does.

---

## The Two-Step Resolver Pattern

Every cross-DB read is a three-part sequence.

### Step 1 — Fetch the primary rows with FK IDs only

```typescript
const orders = await workingDb.saleOrder.findMany({
  where: { tenantId },
  select: {
    id: true,
    orderNumber: true,
    totalAmount: true,
    createdById: true,     // ID only, no include
    productId: true,
    couponId: true,
  },
});
```

### Step 2 — Batch-resolve the FKs from their home DBs

```typescript
const userIds = unique(orders.map(o => o.createdById).filter(Boolean));
const productIds = unique(orders.map(o => o.productId).filter(Boolean));
const couponIds = unique(orders.map(o => o.couponId).filter(Boolean));

const [users, products, coupons] = await Promise.all([
  crossDbResolver.resolveUsers(userIds),         // IdentityDB
  crossDbResolver.resolveProducts(productIds),   // WorkingDB (same DB in this case, but treat uniformly)
  crossDbResolver.resolveCoupons(couponIds),     // PlatformDB
]);
```

### Step 3 — Assemble in memory

```typescript
const userById = indexBy(users, 'id');
const productById = indexBy(products, 'id');
const couponById = indexBy(coupons, 'id');

const enriched = orders.map(o => ({
  ...o,
  createdBy: userById[o.createdById] ?? null,
  product: productById[o.productId] ?? null,
  coupon: o.couponId ? couponById[o.couponId] : null,
}));
```

**Never loop `findUnique` per row.** That turns one query into N queries (N+1 problem).

---

## `CrossDbResolverService`

A single service centralizes all cross-DB fetches. Typical methods:

```typescript
class CrossDbResolverService {
  resolveUsers(ids: string[]): Promise<UserSummary[]>;
  resolveTenants(ids: string[]): Promise<TenantSummary[]>;
  resolveProducts(ids: string[]): Promise<ProductSummary[]>;
  resolveCoupons(ids: string[]): Promise<CouponSummary[]>;
  resolveLookupValues(ids: string[]): Promise<LookupValueSummary[]>;
  resolveIndustryPackages(ids: string[]): Promise<IndustryPackageSummary[]>;
  resolveCountries(ids: string[]): Promise<CountrySummary[]>;
  resolveCities(ids: string[]): Promise<CitySummary[]>;
  // ...
}
```

Rules:

1. Every resolver method takes an **array of IDs** (never a single ID).
2. Every method returns **summary shapes**, not full rows — just the fields the caller usually needs (name, slug, label, etc.). Callers who need more fields use the home-DB client directly.
3. Results are **request-scoped cached** in a `Map<id, record>` so repeat resolutions within the same HTTP request are free.
4. Missing IDs return `null` in the result map — callers must handle deletion / archival / stale references.

---

## Common Cross-DB Edges

| From DB | To DB | Typical fields | Resolver |
|---|---|---|---|
| WorkingDB | IdentityDB | `createdById`, `assignedToId`, `ownerId`, `updatedById` | `resolveUsers` |
| WorkingDB | IdentityDB | `tenantId` (every row) | `resolveTenants` (rarely needed; tenant is in request context) |
| WorkingDB | PlatformDB | `couponId`, `industryPackageId` | `resolveCoupons`, `resolveIndustryPackages` |
| WorkingDB | GlobalDB | `countryId`, `stateId`, `cityId`, `pincodeId`, `hsnCodeId`, `gstRateId`, `currencyId`, `industryTypeId` | `resolveCountries`, `resolveStates`, `resolveCities`, … |
| MarketplaceDB | IdentityDB | `tenantId`, `userId`, `reviewerTenantId`, `buyerTenantId`, `buyerUserId` | `resolveUsers`, `resolveTenants` |
| MarketplaceDB | WorkingDB | `productId`, `organizationId` | direct (WorkingDB is the product source of truth) |
| MarketplaceDB | GlobalDB | location fields | `resolveCountries`, `resolveStates`, … |
| IdentityDB | PlatformDB | `subscriptionPackageId`, `verticalId`, `brandId` | `resolvePackages`, `resolveVerticals` |
| IdentityDB | WhiteLabelDB | `parentPartnerId` on a Tenant | `resolvePartners` |
| PlatformConsoleDB | PlatformDB | `errorCode` → `ErrorCatalog` | `resolveErrorCatalog` (often cached globally) |

---

## Write-Side Rules

Writes **don't cross DBs either**. If a business operation spans two DBs:

1. **Do each write in its own client's transaction.**
2. **Order writes from most-foundational to least** (e.g., create User before assigning roles, record audit after the action).
3. **Accept eventual consistency across DBs.** Rolling back a WorkingDB write because an IdentityDB write failed requires application-level compensation, not a DB transaction.
4. For critical multi-DB flows (tenant creation, trial-to-paid conversion), use an **outbox/inbox pattern** with a retry job — never rely on a two-phase commit.

---

## Anti-Patterns

### ❌ N+1 Resolution

```typescript
for (const order of orders) {
  order.createdBy = await identityDb.user.findUnique({ where: { id: order.createdById } });
}
```

### ❌ Fetching More Than Needed

```typescript
// Wrong — returns every column from 200 tables' worth of user relations
const users = await identityDb.user.findMany({ where: { id: { in: userIds } } });
```

Use the summary shape (id, displayName, email, avatarUrl, role — not the full user with all its relations).

### ❌ Caching Across Requests

Request-scoped cache is fine. Longer-lived caches need invalidation strategies. **Don't build a process-wide user cache without thinking about stale role changes, password resets, and account suspension.**

### ❌ Synchronous Resolution in a Loop of Async Calls

```typescript
const userMaps = [];
for (const batch of batches) {
  userMaps.push(await crossDbResolver.resolveUsers(batch));  // serializes
}
```

Use `Promise.all` for parallel batches.

---

## Testing

Cross-DB flows are tricky to unit-test because you're mocking multiple clients. Recommended approach:

1. **Test the resolver service in isolation** with in-memory fakes that match the real client shape.
2. **Test handlers with the resolver mocked** — verify the handler passes the right IDs to the resolver, and assembles results correctly.
3. **Integration tests hit real DBs** but on throwaway test databases, not shared Postgres instances.

See `apps-backend/api/src/modules/customer-portal/__tests__/activate-portal.handler.spec.ts` (28 specs) as an example of handler tests with cross-DB concerns mocked.
