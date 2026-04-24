# Stage 4 Smoke Test — V5 develop (merged state)

**Date:** 2026-04-22 (execution)
**Branch:** `develop` @ `6860c33b` (V5 merge `c8e4cded` + Tier 1 cleanup `6860c33b`)
**Trigger:** First end-to-end validation post V5 merge. Gap flagged in V5 PR #12 description.
**Goal:** Determine if `develop` is safe to hand to 5 new devs tomorrow + one arriving tonight.

## TL;DR Verdict

⚠️ **CONDITIONAL PASS.** The frontend side is fine. The backend side compiles with 41 errors and **does not actually start serving traffic** — `nest start --watch` stays alive in watch mode but NestJS never initializes. New devs cloning develop today and running `pnpm start:dev` will see *"Found 41 errors. Watching for file changes."* and no working API.

Two cleanup tickets from `docs/v5/BASELINE_GATE.md` need landing before devs can run the backend locally:

1. Seed files importing `PrismaClient` from the bare-stub `@prisma/client` (ticket #1)
2. Missing `form-data` dep in `apps-backend/api/package.json` (ticket #2)

Both are ~1 hour total to fix. Until they land, new-dev onboarding works for frontend work but not backend work.

## Phase 1: Fresh Install (new-dev simulation)

Cleaned all `node_modules` (15 dirs pre-existing), ran `pnpm install` from scratch:

| Check | Result |
|---|---|
| Exit code | ✅ 0 |
| Duration | 9.3s |
| Workspace packages recognized | 24 (root + 23 workspace members — matches V5 Phase 4 count) |

## Phase 2: Prisma 7 Clients

`pnpm --filter crm-backend run prisma:generate`:

| Client | Location | Status |
|---|---|---|
| identity | `apps-backend/api/node_modules/@prisma/identity-client` | ✅ 194ms |
| platform | `apps-backend/api/node_modules/@prisma/platform-client` | ✅ 242ms |
| working | `apps-backend/api/node_modules/@prisma/working-client` | ✅ 894ms |
| marketplace | `apps-backend/api/node_modules/@prisma/marketplace-client` | ✅ 72ms |
| platform-console | `apps-backend/api/node_modules/.prisma/platform-console-client` | ✅ 66ms |
| global-reference | `apps-backend/api/node_modules/.prisma/global-reference-client` | ✅ 47ms |
| demo | `apps-backend/api/node_modules/.prisma/demo-client` | ✅ 776ms |

**Total: 7/7 clients generated in 9.2s.**

## Phase 3: Backend tsc

| Measurement | Result |
|---|---|
| `pnpm exec tsc --noEmit` in `apps-backend/api` | **41 errors** |
| BASELINE_GATE.md baseline | 41 |
| Gate | ✅ Exact match |
| Duration | 11.7s |

Error composition matches V5 Phase 0 verification report exactly:

- `prisma/seed.ts` + 9 seed files + `scripts/reseed-menus.ts` → 40 errors: `Module '"@prisma/client"' has no exported member 'PrismaClient'`
- `src/modules/customer/whatsapp/services/wa-api.service.ts(132,36)` → 1 error: `Cannot find module 'form-data'`

## Phase 4: 7 Portal tsc

| Portal | Today's count | V5 Phase 4 baseline | Delta | Status |
|---|---:|---:|---|---|
| crm-admin | **332** | 331 | +1 | ⚠️ Documented drift |
| vendor-panel | **1** | 0 | +1 | ⚠️ Documented drift |
| customer-portal | 0 | 0 | 0 | ✅ |
| marketplace | **11** | 10 | +1 | ⚠️ Documented drift |
| wl-admin | 0 | 0 | 0 | ✅ |
| wl-partner | 0 | 0 | 0 | ✅ |
| platform-console | 0 | 0 | 0 | ✅ |

### The three +1 drifts are all the same known issue

All three +1 errors are in `jest.config.ts` at various lines with the same signature:

```
TS2345: Argument of type '{ ... 97 more ...; }' is not assignable to parameter of type
'InitialProjectOptions | (() => Promise<InitialProjectOptions>) | undefined'.
... Type 'string' is not assignable to type 'string[]'.
```

This is the **same jest type-tree quirk** documented in:

- V5 Phase 6.5 (first surfaced in vendor-panel CI; marked non-blocking there)
- V5.1 worktree baseline (crm-admin drifted 331 → 332 on fresh install)
- Cleanup ticket #7 in `docs/v5/BASELINE_GATE.md`

Pnpm resolves jest transitives slightly differently on fresh installs. **Not a V5 regression** — same code, same commit; different type-tree resolution.

Recommendation: **update `BASELINE_GATE.md` baselines to 332 / 1 / 11** for these three portals to reflect post-fresh-install reality. Done separately, not in this task.

## Phase 5: Backend Boot (`pnpm run start:dev`)

**❌ FAIL** — with important nuance.

First attempt: `nest start --watch` crashed with `ENOTEMPTY: directory not empty, rmdir '.../dist/src/common/ddd'` — stale `dist/` from a previous build. Cleared with `rm -rf dist`.

Second attempt: process stayed alive at PID 944, but the log ended at:

```
Found 41 errors. Watching for file changes.
```

No `Nest application successfully started`, no `Application is running on`, no `listening on`. The process is alive because it's in watch mode, but NestJS never initialized.

**Why this matters for onboarding:** the 41 baseline tsc errors include `src/modules/customer/whatsapp/services/wa-api.service.ts` (missing `form-data` — ticket #2). That's not a seed file; it's in production code path. Even though the seeds are the majority of the 41 errors, the one in `wa-api.service.ts` is what prevents the actual boot.

A new dev cloning develop today and running `pnpm install && pnpm prisma:generate && pnpm start:dev` will see:

1. Install succeeds ✅
2. Prisma generates 7 clients ✅
3. `nest start --watch` begins
4. TypeScript finds 41 errors
5. Process stays running (watch mode) but API never listens on any port
6. `curl localhost:3001` → connection refused

This is a **non-starter for backend work** without mitigation.

## Phase 6: Frontend Boot (`pnpm dev` in crm-admin)

✅ **PASS** — cleanly.

```
> crm-admin@0.1.0 dev
> rm -rf .next && next dev -p 3005

   ▲ Next.js 15.5.15
   - Local:        http://localhost:3005
   - Network:      http://192.168.1.36:3005
   - Environments: .env

 ✓ Starting...
 ✓ Ready in 3s
```

Full boot in 3 seconds. Port 3005 serving. The 332 tsc errors in source don't block Next.js dev mode (it compiles lazily per-route). Frontend onboarding works out of the box.

## Mitigations for Team Onboarding Tomorrow

Three options, ordered from best to worst:

### Option A — Land the 2 cleanup tickets before devs arrive (~1 hour of work)

1. **Fix seed imports** (ticket #1): change all `import { PrismaClient } from '@prisma/client'` to the appropriate per-DB client (`@prisma/working-client`, `@prisma/identity-client`, etc.) in:
   - `prisma/seed.ts`
   - `prisma/seeds/workflow-*.seed.ts` (7 files)
   - `prisma/seeds/tenant-configs.seed.ts`
   - `prisma/seeds/task-engine.seed.ts`
   - `prisma/seeds/sync-policies.seed.ts`
   - `prisma/seeds/shortcut-definitions.seed.ts`
   - `prisma/seeds/self-hosted-ai.seed.ts`
   - `scripts/reseed-menus.ts`
2. **Add `form-data`** (ticket #2) to `apps-backend/api/package.json` dependencies (`pnpm --filter crm-backend add form-data`).

After both: `pnpm start:dev` will compile cleanly and NestJS will initialize. Team can do backend work day 1.

**Recommended.**

### Option B — Give new devs a mitigation note for day 1

Tell each new dev:

> "The backend has 41 known-and-documented tsc errors in seeds/scripts and one missing dep in `wa-api.service.ts`. Tickets are filed. Until they land:
>
> 1. For frontend work: `cd apps-frontend/<portal> && pnpm dev` — works cleanly.
> 2. For backend work: either pair with someone who has a pre-V5 local, OR temporarily rename `prisma/seed.ts` and the seed files to `.seed.ts.disabled` to skip them, AND comment out the `form-data` import in `wa-api.service.ts`. Do not commit these changes."

Functional but fragile. Easy to forget; confusing for someone who doesn't already understand the codebase.

### Option C — Onboard devs to frontend-only for day 1

Point everyone at a frontend ticket for their first day. Fix backend tickets on day 2.

Gives a day to land the fixes without pressure. Works if the new devs are at least partially frontend-competent.

## Phase Durations (for future reference)

| Phase | Duration |
|---|---:|
| Fresh install | 9.3s |
| Prisma 7-client regen | 9.2s |
| Backend tsc | 11.7s |
| All 7 frontend tsc | ~90s (parallel — would be ~12 min sequential) |
| Backend boot (failed) | ~20s to determine result |
| Frontend boot | 3s |
| **Total smoke test** | **~3 min actual work** |

(Not the 1.5 hours the prompt budgeted — the tests run fast. Most of the budget was for writing this report.)

## Files Captured

- `/tmp/smoke-install.log` — fresh install output
- `/tmp/smoke-prisma.log` — Prisma generate output
- `/tmp/smoke-backend-tsc.log` — 41 errors
- `/tmp/smoke-backend-boot.log` — `nest start --watch` output (stuck at "Found 41 errors")
- `/tmp/smoke-crmadmin-boot.log` — Next.js ready in 3s
- This report.

## Recommendation

**Land the two cleanup tickets (#1 seed imports, #2 form-data) before tomorrow's team onboarding.** They're the #1 and #2 items on `docs/v5/BASELINE_GATE.md` — this smoke test demonstrates they're not hypothetical tech debt but concrete blockers for new-dev onboarding.

After fix: the 41 errors drop to 0 and `nest start --watch` will actually initialize NestJS. Backend boot becomes a ✅ like the frontend already is.
