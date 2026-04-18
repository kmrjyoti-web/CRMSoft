# Sprint E — test_plans Collision Discovery Scan

**Date:** 2026-04-13

---

## Collision confirmed

| DB | Schema file | Line | @@map |
|----|-------------|------|-------|
| PlatformDB | platform.prisma | 2550 | `@@map("test_plans")` |
| PlatformConsoleDB | platform-console.prisma | 196 | `@@map("test_plans")` |

## PlatformConsoleDB test models (4 tables)

| Model | @@map | FKs to TestPlan? |
|-------|-------|------------------|
| `TestPlan` | `test_plans` | — (root) |
| `TestSchedule` | `test_schedules` | `planId` (no explicit relation) |
| `TestExecution` | `test_executions` | `planId` → `TestPlan` (explicit relation) |
| `TestCoverage` | `test_coverages` | none |

## PlatformConsole code references (all in `src/modules/platform-console/test-center/`)

| File | Prisma accessors used |
|------|----------------------|
| `test-center.service.ts` | `db.testPlan` (6x), `db.testExecution` (5x), `db.testSchedule` (4x), `db.testCoverage` (1x) |
| `test-runner.service.ts` | `db.testExecution` (4x) |
| `test-coverage.service.ts` | `db.testCoverage` (3x) |
| `test-schedule.cron.ts` | `db.testSchedule` (2x) |
| `seed-schedules.ts` | TBD |

## Scope of rename

- **Rename:** `TestPlan` → `PcTestPlan`, `@@map("test_plans")` → `@@map("pc_test_plans")`
- **Relation update only:** `TestExecution.plan` type changes from `TestPlan?` → `PcTestPlan?`
- **No @@map change:** `test_schedules`, `test_executions`, `test_coverages` (no collision)
- **Code:** `this.db.testPlan` → `this.db.pcTestPlan` in test-center.service.ts
