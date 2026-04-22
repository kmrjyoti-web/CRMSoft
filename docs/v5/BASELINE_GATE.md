# V5 Restructure — Baseline Gate (UPDATED Phase 4)

**Originally set:** 2026-04-22 (Phase 1, after worktree verification)
**Updated:** 2026-04-22 (Phase 4 — fresh unified install exposed dep drift)
**Branch:** `chore/v5-restructure`

## Accepted Baselines (Tech Debt — DO NOT INCREASE)

| Check | Original | Current | Source of change |
|---|---:|---:|---|
| Backend tsc (`apps-backend/api`) | 41 | **41** | unchanged |
| crm-admin tsc (source files only, after `rm -rf .next`) | 327 | **331** | +4 from `react-hook-form` 7.71.2 → 7.73.1 type narrowing |
| `vendor-panel` tsc | n/a | **0** | first measurable in Phase 4 |
| `customer-portal` tsc | n/a | **0** | first measurable in Phase 4 |
| `marketplace` tsc | n/a | **10** | first measurable in Phase 4 |
| `wl-admin` tsc | n/a | **0** | first measurable in Phase 4 |
| `wl-partner` tsc | n/a | **0** | first measurable in Phase 4 |
| `platform-console` tsc | n/a | **0** | first measurable in Phase 4 |
| Prisma clients generated | 7 | **7** | unchanged |

## Why Each Baseline Is What It Is

### Backend = 41 (carried over from worktree verification)

Same source code as `develop@f2dacf53`, different `node_modules` content:

- Main checkout has a stale `node_modules/.prisma/client/` left over from a past `prisma generate` against a default-output schema. Worktree's fresh install does not.
- Seed files (`prisma/seed.ts`, `prisma/seeds/workflow-*.seed.ts`, `scripts/reseed-menus.ts`, etc.) import `PrismaClient` from `@prisma/client` (the bare stub) and rely on the legacy artifact. They are technically broken everywhere; main only "works" by accident.
- One additional error: `src/modules/customer/whatsapp/services/wa-api.service.ts` imports `form-data`, hoisted on main but not on worktree.

### crm-admin = 331 (was 327, +4 in Phase 4)

The +4 errors are all in `src/features/quotations/components/QuotationForm.tsx` (lines 751, 835, 842, 849), all `Control<{...}>` not assignable to `AnyControl`. Root cause: `react-hook-form` resolved to **7.73.1** in the V5 worktree's fresh install vs **7.71.2** on main (caret range `^7.71.2` allowed the bump). The 7.73.x line narrowed the `Control<>` type, exposing real type bugs that the older version was lenient about.

**This is a dependency-resolution artifact, not a V5 regression.** The same 4 errors would surface on main if anyone ran `rm -rf node_modules && pnpm install`.

The other 327 errors are unchanged from the PR #10 cleanup-sprint baseline. Composition:

- 3 `@shared-types` "Cannot find module" errors — see "@shared-types" section below
- 324 implicit-any / type-mismatch errors across ~30 modules — deferred to a dedicated typing sprint after Phase 0

### marketplace = 10

First-time measurement in Phase 4. Small contained set; easy candidate for a follow-up cleanup PR.

### Other portals = 0

vendor-panel, customer-portal, wl-admin, wl-partner, platform-console all measured 0 errors on first install in Phase 4. These are the new gates going forward.

## On `@shared-types` (NOT auto-fixed by V5 aliases)

The crm-admin code imports from `@shared-types`:

- `apps-frontend/crm-admin/src/types/api-response.ts` (2 imports)
- `apps-frontend/crm-admin/src/features/customer-portal/types/customer-portal.types.ts` (1 import)

The crm-admin `tsconfig.json` paths these to `../shared-types/src` — relative to the tsconfig directory. That resolves to `apps-frontend/shared-types/src/`, which doesn't exist. Originally the path pointed at `UI/shared-types/` (now deleted long before V5 work). The alias has been broken since.

**Phase 5 does NOT fix this.** Adding `@crmsoft/*` aliases to `tsconfig.base.json` provides future paths, but doesn't change the source code's `@shared-types` imports. Those 3 errors stay in the 331 count until either (a) the imports migrate to `@crmsoft/types`, or (b) `@shared-types` gets repointed at a real location (e.g., `Shared/common/types/`, but the current shape there doesn't export the same names — `ApiErrorBody`, `Paginated`, `ResultType`, `isApiSuccess`, etc. all missing).

## Gate Rule

After every phase:

```bash
# Backend
(cd apps-backend/api && pnpm exec tsc --noEmit 2>&1 | grep -c "error TS")
# Must be ≤ 41

# crm-admin
(cd apps-frontend/crm-admin && rm -rf .next && pnpm exec tsc --noEmit 2>&1 | grep -c "error TS")
# Must be ≤ 331

# Each other portal
for p in vendor-panel customer-portal marketplace wl-admin wl-partner platform-console; do
  (cd apps-frontend/$p && rm -rf .next && pnpm exec tsc --noEmit 2>&1 | grep -c "error TS")
  # Each must be ≤ its baseline above
done

# Prisma
ls apps-backend/api/node_modules/@prisma/*-client | wc -l   # must be 4
ls apps-backend/api/node_modules/.prisma/*-client | wc -l    # must be 3
```

If any count INCREASES → STOP, investigate, rollback if needed.
If a count DECREASES → bonus, document but don't celebrate prematurely.

## Cleanup Tickets (separate from V5 restructure)

These should land on their own branches against `develop`, not on the V5 restructure branch:

1. **Seed import fix (P2):** Change `import { PrismaClient } from '@prisma/client'` to per-DB clients (`@prisma/working-client`, etc.) in `prisma/seed.ts`, `prisma/seeds/workflow-*.seed.ts`, `prisma/seeds/tenant-configs.seed.ts`, `prisma/seeds/task-engine.seed.ts`, `prisma/seeds/sync-policies.seed.ts`, `prisma/seeds/shortcut-definitions.seed.ts`, `prisma/seeds/self-hosted-ai.seed.ts`, `scripts/reseed-menus.ts`.
2. **`form-data` explicit dep (P2):** Add `"form-data"` to `apps-backend/api/package.json` dependencies.
3. **Legacy `.prisma/client/` cleanup (P3):** After V5 merged, delete the stale artifact in main's `node_modules/.prisma/client/` so seeds genuinely break and force the fix.
4. **`QuotationForm.tsx` Control<> type errors (P2):** Lines 751, 835, 842, 849. Fix properly for `react-hook-form` 7.73.x — do not pin to 7.71.2. The narrower type is correct; the form code needs a tighter generic.
5. **`marketplace` tsc cleanup (P3):** 10 errors, contained. Quick follow-up PR.
6. **`@shared-types` migration (P2 or P3):** Either (a) repoint the alias to a real location and update `Shared/common/types/` to export the missing names, or (b) migrate imports to a proper `@crmsoft/types` package (Phase 5 created the alias slot).

## Tooling Notes Affecting Future Work

- **`npx prisma` pulls Prisma 7.7.0 (latest)** which dropped `url` from datasource blocks. Always use `pnpm exec prisma` or the `pnpm prisma:generate` script (which uses local 5.22.0).
- **Per-app `pnpm install` no longer needed** — Phase 4 added `pnpm-workspace.yaml`. A single `pnpm install` at the root populates all workspaces.
- **Pnpm 10 skips build scripts by default** for security. `prisma:generate` must be run explicitly after install (or `pnpm approve-builds` to opt the prisma packages in).
