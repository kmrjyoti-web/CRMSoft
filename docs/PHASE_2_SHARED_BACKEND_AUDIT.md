# Phase 2 — Shared/backend/ Migration Audit
Date: 2026-05-04
Branch: development/wl-platform-v2
Auditor: Claude Code (session 1d48ca5e)

---

## TL;DR

**11 packages, 0 imports. All are orphaned.**

Every package in `Shared/backend/` has zero usage across the entire codebase. None are declared as dependencies in any `package.json`. None are imported in any source file. The apps-backend re-implemented all the same patterns inline.

---

## Package Inventory

| Package | Path | Files | Lines | Exports |
|---|---|---|---|---|
| `@crmsoft/audit` | `Shared/backend/audit/` | 6 | ~63 | Auditable, AuditSkip, AuditEntity decorators, IAuditService interface |
| `@crmsoft/cache` | `Shared/backend/cache/` | 4 | ~103 | CacheService (in-memory Map), @Cacheable decorator |
| `@crmsoft/encryption` | `Shared/backend/encryption/` | 3 | ~111 | EncryptionService (AES-256-GCM), key rotation |
| `@crmsoft/errors` | `Shared/backend/errors/` | 6 | ~1479 | AppError, CatalogException, GlobalExceptionFilter, ERROR_CODES registry |
| `@crmsoft/global-data` | `Shared/backend/global-data/` | 4 | ~117 | INDIAN_STATES, ApiResponse types, UserRole/EntityType enums, formatINR |
| `@crmsoft/identity` | `Shared/backend/identity/` | 7 | ~86 | JwtAuthGuard, RolesGuard, @CurrentUser, @Roles, @Public, JwtPayload |
| `@crmsoft/notifications` | `Shared/backend/notifications/` | 3 | ~50 | NotificationPayload interface, empty NotificationsModule |
| `@crmsoft/prisma` | `Shared/backend/prisma/` | 4 | ~65 | Base PrismaService (single-DB), soft-delete middleware, PrismaModule |
| `@crmsoft/queue` | `Shared/backend/queue/` | 5 | ~88 | QUEUE_NAMES constants, BaseProcessor, IMessageQueueService |
| `@crmsoft/storage` | `Shared/backend/storage/` | 3 | ~83 | R2StorageService (Cloudflare R2), StorageModule |
| `@crmsoft/tenant` | `Shared/backend/tenant/` | 3 | ~44 | TenantContextService (AsyncLocalStorage), TenantModule |
| **TOTAL** | | **48** | **~2,329** | |

---

## Usage Map

```
grep -rn "@crmsoft/" apps-backend/api/src/   → 0 matches
grep -rn "@crmsoft/" apps-frontend/          → 0 matches
grep -rn "@crmsoft/" WhiteLabel/wl-api/      → 0 matches
```

**Zero usages. Zero imports. Zero dependencies declared.**

Checked:
- All `package.json` files in the workspace: none list `@crmsoft/*` as dependency or devDependency
- All `.ts` files in `apps-backend/api/src/`: no import statements referencing `@crmsoft/`
- All `.ts` files in `apps-frontend/`: no imports
- All `.ts` files in `WhiteLabel/wl-api/src/`: no imports

---

## Verdict Per Package

### `@crmsoft/errors` — KEEP AS REFERENCE (do not delete yet)
**Lines:** ~1,479 (largest package by far)
**Why keep:** Contains the most complete version of the error catalog pattern — `AppError`, `CatalogException`, `GlobalExceptionFilter`, and a full `ERROR_CODES` registry. apps-backend has its own error handling but this is the most fully-fleshed reference implementation in the repo.
**Action:** Mark as read-only reference. Do not import. Migrate patterns if/when apps-backend error handling needs an upgrade.

### `@crmsoft/identity` — SUPERSEDED
**Lines:** ~86
**Why superseded:** apps-backend has inline `JwtAuthGuard`, `@CurrentUser`, `@Roles`, `@Public` decorators in `src/modules/core/auth/`. The patterns are identical but implemented in-place.
**Action:** Safe to delete. No migration needed.

### `@crmsoft/tenant` — SUPERSEDED
**Lines:** ~44
**Why superseded:** apps-backend has inline `TenantContextService` using AsyncLocalStorage in `src/modules/core/tenant/`. Same pattern, same approach.
**Action:** Safe to delete. No migration needed.

### `@crmsoft/prisma` — SUPERSEDED (architecture changed)
**Lines:** ~65
**Why superseded:** apps-backend moved to a 7-client Prisma architecture (one client per DB schema). The `@crmsoft/prisma` package wraps a single-DB PrismaService — that model no longer applies.
**Action:** Safe to delete. The multi-client pattern in apps-backend is the canonical approach.

### `@crmsoft/global-data` — PARTIALLY SUPERSEDED
**Lines:** ~117
**Why partially superseded:** `INDIAN_STATES` may overlap with data now in `apps-backend/api/prisma/global/v1/` (GlCfgState). `UserRole`/`EntityType` enums may overlap with auth module enums. `formatINR` is a utility function that may be useful.
**Action:** Check for overlap with global DB data before deleting. Low priority.

### `@crmsoft/cache` — UNUSED PATTERN
**Lines:** ~103
**Why unused:** apps-backend doesn't use the in-memory `CacheService`. If caching is needed, it would use Redis (not in-memory Map).
**Action:** Safe to delete.

### `@crmsoft/encryption` — UNUSED PATTERN
**Lines:** ~111
**Why unused:** AES-256-GCM encryption utility. apps-backend doesn't call it. If field-level encryption is added, this could be a reference.
**Action:** Keep as reference or delete — low value either way.

### `@crmsoft/audit` — UNUSED PATTERN
**Lines:** ~63
**Why unused:** Audit decorators with no implementation behind them. apps-backend has its own audit logging approach.
**Action:** Safe to delete.

### `@crmsoft/notifications` — STUB
**Lines:** ~50
**Why stub:** Contains only a `NotificationPayload` interface and an empty `NotificationsModule`. apps-backend has a full notifications module.
**Action:** Safe to delete.

### `@crmsoft/queue` — UNUSED PATTERN
**Lines:** ~88
**Why unused:** BullMQ wrapper with `QUEUE_NAMES` constants and `BaseProcessor`. apps-backend doesn't use BullMQ queues (yet).
**Action:** Keep as reference if BullMQ is planned. Otherwise delete.

### `@crmsoft/storage` — UNUSED (R2 used elsewhere)
**Lines:** ~83
**Why unused:** Cloudflare R2 via S3 SDK. apps-backend uses R2 directly via `wrangler.toml` + raw S3 SDK calls — not via this package.
**Action:** Safe to delete once verified apps-backend R2 usage is stable.

---

## pnpm-workspace.yaml Status

These 11 packages are declared in `pnpm-workspace.yaml` (lines 14–26). They are discoverable by pnpm but NOT depended on by any workspace package.

**Impact of keeping them in workspace.yaml:** pnpm installs their dependencies (if any) and makes them linkable — wasted work, adds noise.

**Impact of removing them from workspace.yaml:** No breakage (zero imports). Cleaner workspace.

---

## Migration Decision Required

Three options:

### Option A: Delete all 11 packages
- Cleanest outcome
- No migration effort
- Permanent loss of reference implementations
- **Recommended for:** packages that are clearly superseded (identity, tenant, prisma, audit, notifications, cache)

### Option B: Migrate to packages-backend/
- V5 target structure: `packages-backend/` is the intended home for extracted backend packages
- No code changes needed — just move + update workspace.yaml
- **Recommended for:** `@crmsoft/errors` (the only one worth keeping long-term)
- Risk: adds maintenance surface for unused code

### Option C: Archive (keep in git, remove from workspace)
- Remove from `pnpm-workspace.yaml` → stops pnpm from including them
- Code stays in git history for reference
- **Recommended if:** team wants the code as reference without it being active

---

## Recommended Action Plan

```
Phase 3A (safe deletions — no reference value):
  DELETE Shared/backend/audit/
  DELETE Shared/backend/cache/
  DELETE Shared/backend/identity/
  DELETE Shared/backend/notifications/
  DELETE Shared/backend/prisma/
  DELETE Shared/backend/tenant/

Phase 3B (keep short-term as reference):
  KEEP   Shared/backend/errors/       ← most complete, reference value
  KEEP   Shared/backend/encryption/   ← may be useful if field encryption needed
  KEEP   Shared/backend/global-data/  ← verify overlap with global DB first
  KEEP   Shared/backend/queue/        ← if BullMQ planned
  KEEP   Shared/backend/storage/      ← verify R2 coverage first

Phase 3C (workspace cleanup):
  REMOVE all 11 entries from pnpm-workspace.yaml
  UPDATE Shared/prisma-schemas/ — mark as stale or delete (canonical = apps-backend/api/prisma/)
```

---

## Stat Summary

```
Packages audited:          11
Packages with any import:   0
Packages with any dep:      0
Total lines of dead code:  ~2,329
Largest package:           @crmsoft/errors (~1,479 lines)
Smallest package:          @crmsoft/notifications (~50 lines)
Safe to delete now:         6
Worth keeping as ref:       5
```
