# DemoDB — Deep Documentation

**Schema root:** `Application/backend/prisma/demo/v1/`
**Generator output:** `node_modules/.prisma/demo-client`
**Env var:** `DEMO_DATABASE_URL`
**Model count:** 228 (structural clone of WorkingDB)
**Migration policy:** `prisma migrate deploy` (formal migrations)

---

## Purpose

Isolation DB for trial and demo tenants. Any tenant with `Tenant.status = 'DEMO'` (or similar trial-flagged state) has its reads and writes routed here instead of WorkingDB. When a trial is abandoned, the data can be wiped without affecting real customers.

**Blast radius:** Low — losing all DemoDB data only loses trial data that is inherently throwaway.

**Why not just reuse WorkingDB with a flag?** Hard isolation prevents:

- Accidental cross-tenant queries during trial cleanup.
- Trial data polluting WorkingDB backups, analytics, and retention counters.
- Noisy-neighbor effects (a messy demo loading 100k fake leads) on real customers.

---

## Schema Files

Identical file layout to WorkingDB — 14 files, the same 228 models. See [`02_WORKING_DB.md`](./02_WORKING_DB.md) for domain grouping and key model detail.

| File | Lines (approx) | Models |
|---|---:|---:|
| `_base.prisma` | ~1,400 | 0 |
| `config.prisma` | ~1,650 | 50 |
| `crm.prisma` | ~1,550 | 44 |
| `inventory.prisma` | ~1,040 | 31 |
| `communication.prisma` | ~880 | 21 |
| `accounts.prisma` | ~710 | 16 |
| `sales.prisma` | ~645 | 17 |
| `documents.prisma` | ~470 | 12 |
| `workflow.prisma` | ~320 | 10 |
| `notifications.prisma` | ~296 | 7 |
| `audit.prisma` | ~252 | 7 |
| `payments.prisma` | ~193 | 5 |
| `reports.prisma` | ~163 | 5 |
| `tax.prisma` | ~102 | 3 |

---

## Sync with WorkingDB (maintenance rule)

**Whenever a model, field, or enum is added to WorkingDB schemas, the same change must be added to DemoDB schemas.** Otherwise a trial tenant that's later converted to an active customer will hit a schema drift when re-routed from DemoDB to WorkingDB.

Tooling to consider (currently manual):

- A CI check comparing `working/v1/*.prisma` vs `demo/v1/*.prisma` structurally.
- A shared base schema with DB-specific datasource overlays (Prisma doesn't natively support this well; a codegen script would be a workaround).

---

## Lifecycle

| Event | Effect on DemoDB |
|---|---|
| Trial tenant created | All rows written to DemoDB with `tenantId`. |
| Trial converts to paying customer | A migration job moves rows from DemoDB to WorkingDB under the same `tenantId`. |
| Trial expires / is abandoned | Rows are hard-deleted from DemoDB. |
| Nightly cleanup job | Prunes orphan rows for tenants that no longer exist in IdentityDB. |

---

## Cross-DB Touchpoints

Same as WorkingDB — see [`02_WORKING_DB.md`](./02_WORKING_DB.md#cross-db-touchpoints). DemoDB queries still resolve users/tenants from IdentityDB via `CrossDbResolverService`; the trial isolation is at the business-data layer only.

---

## Operational Notes

- **Backups:** Lower retention than WorkingDB (30 days vs 90+). A trial user's data does not justify the same cost profile.
- **Replication:** Primary only; no read replicas.
- **Quota:** `PlanLimit` values for trial plans cap DemoDB usage per tenant.
- **Resetting a demo:** `DELETE FROM <table> WHERE tenantId = ?` on every table (or use the `tenant-hard-delete` cron job in PlatformDB).
