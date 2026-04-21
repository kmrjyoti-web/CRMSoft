# GlobalDB — Deep Documentation

**Schema root:** `Application/backend/prisma/global/v1/`
**Generator output:** `node_modules/.prisma/global-reference-client`
**Env var:** `GLOBAL_REFERENCE_DATABASE_URL`
**Model count:** 12
**Migration policy:** `prisma migrate deploy` (formal migrations)

---

## Purpose

Read-heavy, **tenant-agnostic** reference data that every tenant shares and reads many times per request: countries, states, currencies, GST rates, HSN codes, pincodes, language codes, timezones, industry taxonomy, and the platform-wide lookup-value registry.

**Blast radius:** Medium — unavailability breaks dropdowns everywhere (GST picker, country picker, industry picker), but there's no business data to lose. The DB is cacheable and rebuildable from seed files.

**Why separate:** Writes happen almost never (maybe on a GST-rate change after a government update). Reads are extreme. Keeping this data in its own DB lets us:

- Aggressively cache in Redis / app memory without tenant-scoping complications.
- Avoid bloating WorkingDB backups with static reference data.
- Allow read-only replicas per region for latency.

---

## Schema Files (4 files, 281 lines)

| File | Lines | Purpose | Models |
|---|---:|---|---:|
| `_base.prisma` | 29 | Datasource + generator (no enums) | 0 |
| `reference.prisma` | 98 | Geography + lookup registry | 5 |
| `system-reference.prisma` | 85 | System-level reference (currency, tz, industry, language) | 4 |
| `indian-reference.prisma` | 69 | India-specific (pincode, GST rate, HSN) | 3 |

All models are prefixed `GlCfg…` to mark them as Global Config data.

---

## Full Model List

### `reference.prisma` (5 models)

| Model | Purpose |
|---|---|
| `GlCfgCountry` | ISO-coded country list (IN, US, UK, …) |
| `GlCfgState` | States/provinces, FK to Country |
| `GlCfgCity` | Cities, FK to State |
| `GlCfgLookupType` | Registry of lookup categories (e.g. `industry`, `payment_method`, `lead_source`) |
| `GlCfgLookupValue` | The actual lookup entries (e.g. `{category: 'industry', key: 'retail', label: 'Retail', labelHi: 'खुदरा'}`) |

### `system-reference.prisma` (4 models)

| Model | Purpose |
|---|---|
| `GlCfgCurrency` | ISO-4217 currencies with symbol, decimals, display format |
| `GlCfgTimezone` | IANA timezones (Asia/Kolkata, UTC, …) |
| `GlCfgIndustryType` | Industry taxonomy (used to classify tenants / contacts / leads) |
| `GlCfgLanguage` | Supported UI languages (en, hi, …) |

### `indian-reference.prisma` (3 models)

| Model | Purpose |
|---|---|
| `GlCfgPincode` | India pincode → city/state mapping; powers address autofill |
| `GlCfgGstRate` | GST rate slabs (0%, 5%, 12%, 18%, 28%, compensation cess) with effective-from dates |
| `GlCfgHsnCode` | HSN (Harmonized System of Nomenclature) codes for product tax classification |

---

## Key Models (Deeper Detail)

### `GlCfgLookupValue`

The single most important model in this DB. It is the **V5 dynamic-field backbone**.

Shape (as declared):

```prisma
model GlCfgLookupValue {
  id          String   @id
  category    String   // "industry", "payment_method", "lead_source", ...
  key         String   // "retail", "cod", "whatsapp-ad"
  label       String   // "Retail", "Cash on Delivery", "WhatsApp Ad"
  labelHi     String?  // Hindi translation
  isActive    Boolean  @default(true)
  sortOrder   Int
  metadata    Json?    // category-specific extras

  @@unique([category, key])
  @@index([category, isActive])
}
```

Every dropdown in the CRM that is not one of the 7 hardcoded core business types or a vertical-specific enum pulls from here.

### `GlCfgGstRate`

Indian GST rates are time-versioned (`effectiveFrom`, `effectiveTo`) so historical invoices can be re-rendered with the rate that applied at the time.

### `GlCfgPincode`

Used to auto-populate city/state from a pincode during address entry. ~150k rows.

### `GlCfgHsnCode`

Indian tax product classification — required on every invoice line item for GST-compliant returns. Linked from WorkingDB `ProductTaxDetail`.

### `GlCfgLookupType`

Registry of what lookup categories exist. Preventing unregistered categories from being created is the guard against lookup-value chaos.

---

## Cross-DB Touchpoints

GlobalDB is **referenced by everyone, references no one**.

| Consumer DB | Field(s) | Resolved via |
|---|---|---|
| WorkingDB | `industryTypeId` on Organization, `hsnCodeId` on Product, `gstRateId` on tax details, `countryId`/`stateId`/`cityId` on addresses, `pincodeId` on addresses, `currencyId` on transactions | `CrossDbResolverService.resolveCountries/resolveStates/resolveLookupValues/...` |
| MarketplaceDB | `countryId`, `stateId`, `cityId` on listings | same |
| IdentityDB | `countryId`, `stateId`, `cityId`, `pincodeId` on Tenant profiles | same |
| PlatformDB | referenced by industry packages (`GvCfgVertical.industryTypeId` if used) | same |

**Cache policy:** Most GlobalDB reads are cached aggressively (Redis / in-process LRU). Invalidation events fire on admin edits via a central bus.

---

## Seeding

GlobalDB is **seed-driven**. The seed files in `Application/backend/prisma/seeds/` (or wherever seeds live post-V5) populate this DB at provisioning time:

- Countries / states / cities from an official source list.
- Indian pincodes from the India Post dataset.
- GST rates from the CBIC schedules.
- HSN codes from the GST council's master list.
- Currencies from ISO-4217.
- Timezones from IANA tzdata.
- Industry types from the NIC 2008 classification (India) or equivalent.

**Never write to GlobalDB from tenant-facing code.** Writes are admin-only and happen through PlatformConsole tooling.

---

## Migration Guidelines

- Treat schema changes as careful — every field change forces a cache-wide invalidation.
- Always backfill new non-null columns with a data migration (don't rely on defaults).
- When deprecating a lookup category, soft-delete via `isActive = false`, don't hard-delete (breaks historical rows).

---

## V5 Dynamic Field Integration

The three pillars of V5 dynamic fields all involve GlobalDB:

1. **`verticalData: Json`** on WorkingDB entities uses `GlCfgLookupValue` keys as field values, so lookups remain shared.
2. **`TerminologyOverride`** (IdentityDB) rewrites the `label` shown in UI per tenant.
3. **Brand-specific category aliases** (PlatformDB `GvCfgBrandCategory`) map branded names to core business types while preserving the core `GlCfgIndustryType` mapping.

See [`10_DYNAMIC_FIELDS_V5.md`](./10_DYNAMIC_FIELDS_V5.md).
