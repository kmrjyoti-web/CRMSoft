# TSC Error Discovery Scan — Pre-Sprint B

**Date:** 2026-04-13
**Total tsc errors:** 76

---

## Root cause

**Case B** — tsc already includes test files. Errors genuinely exist in two categories:

### Category 1: Task 0.5 arity mismatches (12 errors, 10 test files)

Task 0.5 added `CrossDbResolverService` as constructor parameter to 9 services/handlers. Tests that directly instantiate these classes now fail because the mock constructor calls don't pass the resolver.

| File | Error | Expected args |
|------|-------|---------------|
| `calendar/__tests__/calendar-service.spec.ts:27` | Expected 2, got 1 | +resolver |
| `calendar/__tests__/scheduling-service.spec.ts:81` | Expected 5, got 4 | +resolver |
| `mis-reports/__tests__/lead-reports.spec.ts:23` | Expected 3, got 2 | +resolver |
| `mis-reports/__tests__/quotation-reports.spec.ts:21,51` | Expected 3, got 2 (2x) | +resolver |
| `mis-reports/__tests__/sales-reports.spec.ts:103` | Expected 3, got 2 | +resolver |
| `ownership/__tests__/ownership.spec.ts:71` | Expected 2, got 1 | +resolver |
| `ownership/__tests__/unit/assign-owner.handler.spec.ts:26` | Expected 2, got 1 | +resolver |
| `ownership/__tests__/unit/bulk-operations.spec.ts:29` | Expected 2, got 1 | +resolver |
| `ownership/__tests__/unit/rule-engine.service.spec.ts:28` | Expected 4, got 3 | +resolver |
| `ownership/__tests__/unit/transfer-owner.handler.spec.ts:26` | Expected 2, got 1 | +resolver |
| `quotations/__tests__/unit/quotation-prediction.spec.ts:48` | Expected 2, got 1 | +resolver |

### Category 2: Pre-existing production code issues (60 errors, 14 files)

- **4x TS2307** — app.module.ts imports 4 modules that don't exist yet (verification-invite, reference-data, system-field, ai-apps)
- **18x TS7006** — implicit `any` parameters in marketplace analytics/reviews
- **30x TS2339** — property access on typed objects in platform-console modules
- **8x TS2322** — type assignment mismatches in platform-console vertical-manager/cicd

These are NOT from Task 0.5 — they predate the current sprint.

### Category 3: Already fixed (0 remaining)

The activity-handlers.spec.ts and get-task-by-id.handler.spec.ts arity errors were fixed during Task 0.5 itself.

---

## Scope for this fix

- **Fix:** All 12 Category 1 arity errors (Task 0.5 regressions)
- **Fix:** All 60 Category 2 pre-existing errors (clean baseline for Sprint B)
- **Total target: 0 tsc errors**
