# V5 Dynamic Field Architecture

V5 needs to support **vertical-specific fields**, **brand-specific category labels**, and **tenant-specific terminology overrides** — all without redeploying schema changes for each customer or vertical. The system achieves this via three cooperating mechanisms.

---

## The Three Pillars

| Pillar | Where | What it enables |
|---|---|---|
| **Hardcoded core enum** | Code (`@crmsoft/core-business-types` after V5 restructure); mirrored in PlatformDB `BusinessTypeRegistry` | 7 fixed core business types — the spine everything else hangs off |
| **`verticalData: Json?`** | WorkingDB entity columns | Vertical-specific fields without schema churn |
| **Lookup + Terminology** | GlobalDB `GlCfgLookupValue` + IdentityDB `TerminologyOverride` + PlatformDB `GvCfgBrandCategory` | User-facing labels differ per tenant/brand while core identifiers stay stable |

---

## Pillar 1 — Hardcoded Core Business Types

Seven types, and only seven:

```
B2B, B2C, CUSTOMER, MANUFACTURER, SERVICE_PROVIDER,
INDIVIDUAL_SERVICE_PROVIDER, EMPLOYEE
```

### Governance

| Role | Can add? | Can modify? | Can delete? |
|---|:-:|:-:|:-:|
| Software Provider (CRMSoft) | ✅ | ✅ | ✅ |
| Brand | ❌ | ❌ | ❌ |
| Customer (B2B / B2C tenants) | ❌ | ❌ | ❌ |
| WL Partner | ❌ | ❌ | ❌ |

Enforcement:

- Backend guard (`CoreBusinessTypeGuard`) blocks POST/PUT/DELETE on `BusinessTypeRegistry` unless the requester role is `PLATFORM_ADMIN`.
- Database rows carry an `isSystem: true` flag; even a rogue SQL writer has to explicitly override.
- The V5 package `@crmsoft/core-business-types` exports the enum as the single source of truth — importable from anywhere in the backend.

### Future extensions (CRMSoft-only)

If/when CRMSoft adds a type (e.g. `WHOLESALER`, `GOVERNMENT`, `NGO`), the process is:

1. Add enum member in `@crmsoft/core-business-types` source.
2. Add row in PlatformDB `BusinessTypeRegistry`.
3. Deploy backend.
4. Update vertical configs that map to the new type.

---

## Pillar 2 — `verticalData: Json?`

Every industry has fields that the core CRM doesn't know about. Restaurants care about cuisine and spice level; tourism cares about departure dates and group sizes; retail cares about shelf SKU and reorder point.

Rather than adding columns per vertical (which would bloat the schema and couple verticals together), WorkingDB entities carry a nullable JSON column:

```prisma
model Product {
  id           String   @id
  name         String
  price        Decimal

  // Core columns every vertical cares about
  // ... (sku, unit, category, etc.)

  // Vertical-specific fields, keyed and validated at the application layer
  verticalData Json?
}
```

### Example payloads

Restaurant:

```json
{
  "cuisine": "italian",
  "spiceLevel": 3,
  "dietary": ["vegetarian", "gluten-free"],
  "prepTimeMinutes": 20
}
```

Tourism:

```json
{
  "departureDate": "2026-05-15",
  "groupSize": 12,
  "pickupLocation": "Mumbai Airport",
  "itineraryUrl": "https://..."
}
```

### Validation

The JSON is **schema-validated at the application layer** — not by Postgres — using per-vertical Zod schemas. Schemas live in `packages-backend/vertical-<name>-backend/` (after V5 restructure).

### Querying

Postgres's JSONB index support allows efficient queries:

```sql
CREATE INDEX idx_product_cuisine ON "Product" ((verticalData ->> 'cuisine'));
```

Index creation is part of each vertical's migration bundle. The core WorkingDB schema stays vertical-agnostic.

### Rules

1. **Never store PII in `verticalData`** — PII goes in dedicated columns for GDPR/DPDP compliance.
2. **Never store cross-row relations in `verticalData`** — FKs go in dedicated columns.
3. **Never vary the shape per tenant** — the shape is per-vertical, consistent across all tenants on that vertical.

---

## Pillar 3 — Lookup + Terminology + Brand Category

### 3a — `GlCfgLookupValue` (GlobalDB)

Shared lookup registry. Every `<select>` in the CRM that isn't an enum pulls from here.

```prisma
model GlCfgLookupValue {
  id          String   @id
  category    String   // "industry", "payment_method", "lead_source"
  key         String   // "retail", "cod", "whatsapp-ad"
  label       String   // "Retail", "Cash on Delivery"
  labelHi     String?  // "खुदरा", "कैश ऑन डिलीवरी"
  isActive    Boolean  @default(true)
  sortOrder   Int
  metadata    Json?    // category-specific extras

  @@unique([category, key])
  @@index([category, isActive])
}
```

Adding values to a category is a platform-level operation (PlatformConsole UI). Tenants **never** create lookup values directly — they only pick from the curated list.

### 3b — `TerminologyOverride` (IdentityDB)

Per-tenant label rewrites. A tenant might call "Lead" → "Inquiry", or "Contact" → "Guest" (common for restaurants and hotels). The override affects UI only; database field names and API contracts stay stable.

```prisma
model TerminologyOverride {
  id         String   @id
  tenantId   String
  termKey    String   // "lead", "contact", "quotation"
  labelEn    String   // "Inquiry"
  labelHi    String?
  // ...

  @@unique([tenantId, termKey])
}
```

### 3c — `GvCfgBrandCategory` (PlatformDB, conceptual)

Brand-scoped alias of core business types. For example, an Electronics brand might label `INDIVIDUAL_SERVICE_PROVIDER` as "Electrician", while a Tourism brand calls it "DMC" (Destination Management Company) or "Tour Operator".

```prisma
model GvCfgBrandCategory {
  id          String   @id
  brandId     String
  categoryKey String   // brand-facing label key: "electrician", "dmc", "stockist"
  coreTypeId  String   // FK to BusinessTypeRegistry (one of the 7 core types)
  isActive    Boolean  @default(true)

  @@unique([brandId, categoryKey])
}
```

This gives brands their own user-facing vocabulary without fragmenting the underlying core-type system. Queries, analytics, and cross-brand reports all roll up to the 7 core types.

---

## Label Resolution Order

When rendering a label in the UI, the frontend asks the backend for a resolved label, which is computed as:

```
1. TerminologyOverride (per-tenant)       — highest precedence
2. GvCfgBrandCategory (per-brand)
3. GlCfgLookupValue (platform-wide)
4. Hardcoded fallback in code             — lowest precedence
```

---

## Dynamic Field Rules — Summary

| Decision | Answer |
|---|---|
| Add a new core business type | Only CRMSoft, via code deploy + `BusinessTypeRegistry` row |
| Add a new vertical | CRMSoft-curated; requires backend package + registry row in `GvCfgVertical` |
| Add a new lookup value (e.g., new lead source) | Platform ops via PlatformConsole UI; writes to GlobalDB |
| Add a new vertical-specific field | Add to the vertical's Zod schema + migration that creates a JSONB index; schema deploy |
| Rename "Lead" to "Inquiry" for one tenant | `TerminologyOverride` row — no deploy |
| Brand-specific category name | `GvCfgBrandCategory` row |
| Tenant wants an arbitrary custom field on a Contact | `CustomFieldDefinition` + `EntityConfigValue` in WorkingDB — no schema change |

---

## What NOT to Do

- **Don't store vertical fields as new columns.** The whole point is avoiding schema fragmentation across verticals.
- **Don't let tenants add categories to `GlCfgLookupType`.** That registry is platform-owned.
- **Don't bypass the label resolver in frontend code.** If the UI hardcodes "Lead" somewhere and the tenant has a terminology override, the UI will lie to the user.
- **Don't allow brands to create their own core business types.** That defeats the 3-axis architecture.

---

## For the V5 Restructure

- `@crmsoft/core-business-types` package (in `packages-backend/`) is the new source of truth for the enum. Reshape the import in backend modules that currently read the enum from a local file.
- Vertical packages (`packages-backend/vertical-<name>-backend/`) each own their Zod schemas for `verticalData` + their own migration bundles.
- Brand-scoped category data (`GvCfgBrandCategory`) is currently conceptual — may need to be added to PlatformDB schema as part of V5 brand work.
