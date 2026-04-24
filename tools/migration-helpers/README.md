# tools/migration-helpers

**Status:** PLACEHOLDER

## Purpose

Utility scripts for database migrations:

- `provision-tenant-working-db.ts` — creates a dedicated WorkingDB instance for an enterprise tenant on `Tenant.dbStrategy = DEDICATED`
- `seed-global-reference.ts` — bootstraps GlobalDB from authoritative sources (countries, GST rates, HSN codes, pincodes)
- `migrate-trial-to-paid.ts` — copies a tenant's rows from DemoDB to WorkingDB on trial conversion
- `audit-cross-db-fk-integrity.ts` — verifies foreign-key references across DBs after major schema changes
