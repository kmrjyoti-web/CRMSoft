# V5 Restructure — Baseline Gate

**Set on:** 2026-04-22 (executing plan dated 2026-04-23)
**Source:** Worktree verification report (`/tmp/v5-worktree-readiness-2026-04-22.md`)
**Branch:** `chore/v5-restructure` at `f2dacf53`

## Accepted Baselines (Tech Debt)

| Check | Baseline | Policy |
|---|---:|---|
| Backend tsc errors | **41** | MUST NOT INCREASE during restructure |
| Frontend tsc errors (source files only) | **327** | MUST NOT INCREASE during restructure |
| Prisma clients generated | **7** | MUST remain 7 |

## Why These Baselines Are Higher Than Main's

### Backend: 41 errors on worktree vs. 0 on main

Same source code, different `node_modules` content. This is **environmental drift in main**, not a real divergence.

- **Main** has a stale `node_modules/.prisma/client/` left over from a past `prisma generate` against a default-output schema. The bare-stub `@prisma/client` package re-exports from `.prisma/client/default`, which exists there.
- **Worktree** got a fresh install. None of the 7 current schemas generate to the default `.prisma/client/` location, so there's nothing for `@prisma/client` to re-export.
- Seed files (`prisma/seed.ts`, `prisma/seeds/workflow-*.seed.ts`, `prisma/seeds/tenant-configs.seed.ts`, `scripts/reseed-menus.ts`, etc.) import `PrismaClient` from `@prisma/client` and rely on the legacy artifact. They are **technically broken everywhere** — main only "works" by accident.
- One additional error: `src/modules/customer/whatsapp/services/wa-api.service.ts` imports `form-data`, which is hoisted on main but not on worktree.

### Frontend: 327 errors

This is the documented baseline from PR #10 (cleanup sprint), unchanged. Composition:

- **3** `@shared-types` "Cannot find module" errors — will auto-resolve once V5 introduces `@crmsoft/*` tsconfig path aliases (Phase 5)
- **324** mostly TS7006 implicit-any errors and TS2322 type-mismatch errors across ~30 modules — deferred to a dedicated typing sprint after Phase 0

## Gate Rule

After every phase of the V5 restructure, run:

```bash
cd Application/backend && pnpm exec tsc --noEmit 2>&1 | grep -c "error TS"
# Must be <= 41

cd Customer/frontend/crm-admin && rm -rf .next && pnpm exec tsc --noEmit 2>&1 | grep -c "error TS"
# Must be <= 327 (only run if frontend touched)
```

**If either count INCREASES → STOP the phase, investigate, rollback if needed.**
**If either count DECREASES → bonus (not required, document in commit).**

## Cleanup Tickets to File (Separate from V5 Restructure)

These should land on their own branches against `develop`, not on the V5 restructure branch:

1. **Seed import fix (P2):** Change `import { PrismaClient } from '@prisma/client'` to per-DB clients (`@prisma/working-client`, etc.) in:
   - `prisma/seed.ts`
   - `prisma/seeds/workflow-*.seed.ts` (7 files)
   - `prisma/seeds/tenant-configs.seed.ts`
   - `prisma/seeds/task-engine.seed.ts`
   - `prisma/seeds/sync-policies.seed.ts`
   - `prisma/seeds/shortcut-definitions.seed.ts`
   - `prisma/seeds/self-hosted-ai.seed.ts`
   - `scripts/reseed-menus.ts`
2. **`form-data` explicit dep (P2):** Add `"form-data"` to `Application/backend/package.json` dependencies.
3. **Legacy `.prisma/client/` cleanup (P3):** After V5 merged, delete the stale artifact in main's `node_modules/.prisma/client/` so seeds genuinely break and force the fix.

## Tooling Notes Affecting V5 Phases

- **`npx prisma` pulls Prisma 7.7.0 (latest)** which dropped `url` from datasource blocks. Always use `pnpm exec prisma` or the `pnpm prisma:generate` script (which uses local 5.22.0).
- **Root `package.json` has npm-style `workspaces` field but no `pnpm-workspace.yaml`** — pnpm ignores the npm field, so root-level `pnpm install` doesn't install app deps. Each app needs its own install. **V5 Phase 4 plans to add `pnpm-workspace.yaml`** which fixes this.
