# PlatformConsoleDB — Deep Documentation

**Schema root:** `Application/backend/prisma/platform-console/v1/`
**Generator output:** `node_modules/.prisma/platform-console-client`
**Env var:** `PLATFORM_CONSOLE_DATABASE_URL`
**Model count:** 29
**Migration policy:** ⚠️ **`prisma db push` only** (no formal migrations)

---

## Purpose

The internal-tools database for CRMSoft's Platform Console (the `platform-console` frontend on port 3012). Holds DR plans, error trends, alert history, deployment logs, vertical registry health, menu configs, and test coverage — the metadata an ops team uses to run the SaaS, not the SaaS itself.

**Blast radius:** Internal-only. Losing this DB doesn't affect customers but blinds the ops team.

**Why separate from PlatformDB:** Different access pattern (admin-only UI), different security boundary (read-write for ops team only, never exposed to tenants), and different data retention policy.

---

## ⚠️ Migration Policy

**PlatformConsoleDB uses `prisma db push` only.** Same rationale as PlatformDB — admin-facing schema iterates fast and migration files add friction without benefit.

---

## Schema Files (3 files, 473 lines)

| File | Lines | Models | Domain |
|---|---:|---:|---|
| `_base.prisma` | 15 | 0 | Datasource + generator (enums defined inline with models) |
| `devops.prisma` | 383 | 25 | DR, errors, alerts, deployments, verticals, menu config |
| `testing.prisma` | 75 | 4 | Platform Console's own test tracking |

---

## Full Model List

### devops.prisma (25 models)

Organized by theme:

**Error management (5):**

- `GlobalErrorLog` — Aggregated error logs across all tenants
- `CustomerErrorReport` — Customer-reported bugs/issues
- `ErrorEscalation` — Escalation chains (tier 1 → tier 2 → engineering)
- `ErrorAutoReport` — Auto-generated error reports
- `ErrorTrend` — Trending error signatures over time

**Alerts + incidents (3):**

- `AlertRule` — Declarative alert rules (when error rate > X, page oncall)
- `AlertHistory` — Past alert firings
- `IncidentLog` — Incident timeline records

**Deployments + versions (6):**

- `VersionRelease` — Released CRMSoft versions
- `VerticalVersion` — Per-vertical version tracking
- `RollbackLog` — Rollback events
- `DeploymentLog` — Deployment run log
- `PipelineRun` — CI/CD pipeline runs
- `BuildLog` — Build step logs

**Vertical management (3):**

- `VerticalRegistry` — Platform Console's view of verticals
- `VerticalAudit` — Audit log of vertical config changes
- `VerticalHealth` — Health status per vertical

**Brand management (3):**

- `BrandModuleWhitelist` — Module whitelist per brand
- `BrandFeatureFlag` — Feature flags per brand
- `BrandErrorSummary` — Error summary per brand

**Observability (2):**

- `HealthSnapshot` — Periodic health snapshot of the platform
- `NotificationLog` — Log of notifications sent to ops team

**Disaster Recovery (1):**

- `DRPlan` — Disaster recovery plan definitions

**Menu config (2):**

- `GlobalMenuConfig` — Platform-wide menu baseline
- `BrandMenuOverride` — Per-brand menu overrides

### testing.prisma (4 models)

`PcTestPlan`, `PcTestSchedule`, `PcTestExecution`, `PcTestCoverage` — Platform Console's own test infrastructure (distinct from PlatformDB's testing models, which track the SaaS as a whole).

---

## Key Models (Deeper Detail)

### `GlobalErrorLog`

Cross-tenant error aggregation. When an error happens in backend or any frontend, the error-reporting pipeline drops a record here (via a background job, not in the request path). Schema includes:

- Error code (references `ErrorCatalog` in PlatformDB)
- Tenant ID + user ID (nullable, may be anonymous)
- Stack trace
- Request correlation ID
- Grouping signature (for trending)

Used by the Platform Console UI to show the "error fire hose" to the ops team.

### `ErrorTrend`

Rolling aggregation over `GlobalErrorLog` — error signature + count + first/last seen. Drives the "top errors this week" dashboard and feeds `AlertRule` thresholds.

### `AlertRule` + `AlertHistory`

Declarative rules (e.g., "if error count for signature X > 100/hour, page oncall"). When fired, creates `AlertHistory` row and an `IncidentLog` if promoted to incident.

### `IncidentLog`

Human-facing incident tracker — start time, severity, affected tenants, timeline of events, resolution notes.

### `DRPlan`

Disaster recovery playbooks — stored in the DB for quick access during an incident (as opposed to relying on Confluence which might be the thing that's down).

### `VersionRelease` + `VerticalVersion` + `RollbackLog`

Deployment tracking. `VerticalVersion` allows per-vertical versioning (so Restaurant tenants can run v5.2 while Retail runs v5.3 during phased rollouts).

### `GlobalMenuConfig` + `BrandMenuOverride`

The base menu schema lives in `GlobalMenuConfig`; per-brand deltas live in `BrandMenuOverride`. Combined with `PageRegistry` + `TenantModule` (PlatformDB) and `RoleMenuPermission` (IdentityDB), drives the final rendered menu for each user.

---

## Cross-DB Touchpoints

PlatformConsoleDB **references but is rarely referenced from**:

| From | To | Field |
|---|---|---|
| `GlobalErrorLog` | IdentityDB | `tenantId`, `userId` (resolve for display) |
| `GlobalErrorLog` | PlatformDB | `errorCode` → `ErrorCatalog` |
| `VerticalRegistry`, `BrandModuleWhitelist` | PlatformDB | `verticalId` → `GvCfgVertical` |
| `BrandMenuOverride` | PlatformDB | `brandId` → brand registry |
| `DeploymentLog`, `PipelineRun` | — | Self-contained |

---

## Ops Access Boundary

**Only Platform Console (port 3012) reads/writes PlatformConsoleDB.** Tenant-facing backends (`crm-admin` / `vendor-panel`) do not connect to this DB. This is enforced by network policy and by the fact that only the platform-console backend has the `PLATFORM_CONSOLE_DATABASE_URL` env var.

---

## Notes for V5 Restructure

- Naming discipline: every model here is prefixed with enough context (`Global…`, `Brand…`, `Pc…`) to distinguish from PlatformDB counterparts. Don't consolidate without a migration plan.
- `VerticalRegistry` in PlatformConsoleDB duplicates some of `GvCfgVertical` in PlatformDB. They serve different access patterns (PlatformConsole = ops tooling; PlatformDB = runtime registry). Keep both.
