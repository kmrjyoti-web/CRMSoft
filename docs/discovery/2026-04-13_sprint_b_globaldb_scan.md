# Sprint B — GlobalDB MVP Discovery Scan

**Date:** 2026-04-13

---

## CRITICAL FINDING: Scope adjustment required

The prompt assumed 4 models exist in PlatformDB (LookupValue, Country, State, City) and need migration. **Discovery reveals a different reality:**

### What exists

| Model | DB | Table | Tenant-scoped? | Nature |
|-------|-----|-------|----------------|--------|
| `MasterLookup` | PlatformDB | `master_lookups` | YES (`tenantId`) | Tenant config |
| `LookupValue` | PlatformDB | `lookup_values` | YES (`tenantId`, unique `[tenantId, lookupId, value]`) | Tenant config |
| `CompanyCountry` | WorkingDB | `company_countries` | YES (`tenantId`) | Company operations |
| `CompanyState` | WorkingDB | `company_states` | YES (`tenantId`) | Company operations |
| `CompanyCity` | WorkingDB | `company_cities` | YES (`tenantId`) | Company operations |

### What does NOT exist

- No standalone `Country`, `State`, `City` models (ISO reference data)
- No global (non-tenant) reference tables for geography
- No Pincode, Currency, Timezone, HSN, GST rate reference tables

### Implications

1. **LookupValue + MasterLookup are tenant-scoped** — they have `tenantId`, `@@unique([tenantId, ...])`. These are NOT global reference data. Each tenant has their own lookup values. Moving them to GlobalDB would break the tenant isolation model.

2. **CompanyCountry/State/City are operational** — they represent where a company operates (with coverage types, GSTIN numbers, etc.). These are NOT ISO reference tables.

3. **GlobalDB needs to be created with fresh reference data**, not migrated from PlatformDB. The prompt's §5 migration script (pg_dump from PlatformDB → GlobalDB) doesn't apply — there's nothing to migrate.

---

## Revised scope recommendation

### Sprint B MVP should:

1. **Create GlobalDB** with fresh schema (global.prisma, `DATABASE_URL_GLOBAL`)
2. **Create 4 new global reference models** (not migrations):
   - `GlCfgCountry` — ISO-3166 countries (seeded, ~250 rows)
   - `GlCfgState` — Indian states + UTs with GST codes (seeded, ~36 rows)
   - `GlCfgCity` — Major Indian cities (seeded, ~500+ rows)
   - `GlCfgLookupType` + `GlCfgLookupValue` — System-level lookup types (GENDER, MARITAL_STATUS, etc.) that are truly global, NOT tenant lookups
3. **Keep existing PlatformDB LookupValue/MasterLookup as-is** — they're tenant config, not global reference
4. **Keep WorkingDB CompanyCountry/State/City as-is** — they reference operational coverage, not ISO data

### What this means for FK strategy

- No FKs need dropping (nothing moves between DBs)
- `CompanyCountry` can optionally get a `glCountryId` field later to link to global ISO data
- No resolver refactoring needed for existing call sites

---

## Consumer count (for reference)

| Model | Call sites (non-test) |
|-------|----------------------|
| `LookupValue` / `MasterLookup` (PlatformDB) | 44 |
| `CompanyCountry/State/City` (WorkingDB) | 29 |
| Standalone `Country/State/City` (PlatformDB) | 0 (don't exist) |

---

## Decision needed from Kumar

**Q1:** Proceed with revised scope (create fresh GlobalDB with ISO reference + system lookups)?
**Q2:** Or insist on moving tenant-scoped LookupValue to GlobalDB (would require splitting: system lookups → GlobalDB, tenant lookups → stay in PlatformDB)?
**Q3:** Confirm `gl_` prefix for GlobalDB tables.
