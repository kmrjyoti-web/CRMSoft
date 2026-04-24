# Cross-DB Include Cleanup v2 — Discovery Scan

**Date:** 2026-04-13
**Auditor run:** post-fix baseline (Task 0 complete)
**Total findings:** 11 cross-DB include errors, 0 regressions from Task 2.5

---

## Findings (11 sites, 9 unique files)

### Pattern A: `createdByUser` include (3 sites, 3 files)

| # | File | Line | Entity | Cross-DB field | Hot path? |
|---|------|------|--------|----------------|-----------|
| 1 | customer/activities/application/commands/complete-activity/complete-activity.handler.ts | 24 | activity.update | `createdByUser` (IdentityDB) | No — command handler |
| 2 | customer/activities/application/commands/update-activity/update-activity.handler.ts | 22 | activity.update | `createdByUser` (IdentityDB) | No — command handler |
| 3 | customer/mis-reports/reports/quotations/quotation-summary.report.ts | 145 | quotation.findMany (drillDown) | `createdByUser` (IdentityDB) | No — report |

Note: quotation-summary.report.ts line 42 (generate method) also has `createdByUser` include but was not flagged by checker (multi-line). Will fix both in same pass.

### Pattern B: Nested `lookupValue` in `filters` include (6 sites, 6 files)

| # | File | Line | Entity | Cross-DB field | Hot path? |
|---|------|------|--------|----------------|-----------|
| 4 | customer/mis-reports/reports/leads/lead-funnel.report.ts | 45 | lead.findMany | `filters.lookupValue` (PlatformDB) | No — report |
| 5 | customer/mis-reports/reports/leads/lead-source-analysis.report.ts | 45 | lead.findMany | `filters.lookupValue` (PlatformDB) | No — report |
| 6 | customer/mis-reports/reports/sales/revenue.report.ts | 47 | lead.findMany | `filters.lookupValue` (PlatformDB) | No — report |
| 7 | customer/mis-reports/reports/sales/win-loss-analysis.report.ts | 50 | lead.findMany | `filters.lookupValue` (PlatformDB) | No — report |
| 8 | customer/ownership/services/rule-engine.service.ts | 142 | lead.findUnique (loadEntityData) | `filters.lookupValue` (PlatformDB) | Yes — assignment eval |
| 9 | customer/quotations/services/quotation-prediction.service.ts | 33 | lead.findUnique | `filters.lookupValue` (PlatformDB) | No — prediction |

### Pattern C: Nested `user` in include (2 sites, 2 files)

| # | File | Line | Entity | Cross-DB field | Hot path? |
|---|------|------|--------|----------------|-----------|
| 10 | customer/calendar/services/scheduling.service.ts | 197 | scheduledEvent.findFirst | `participants.user` (IdentityDB) | No — event detail |
| 11 | customer/tasks/application/queries/get-task-by-id/get-task-by-id.handler.ts | 20 | task.findUnique | `watchers.user` (IdentityDB) | No — single fetch |

---

## Task 2.5 regression check

Original 7 sites (4 files) from Task 2.5 — all clean, no regressions:
- calendar/calendar.service.ts ✅
- ownership/services/ownership-core.service.ts ✅
- watchers/application/handlers/add-watcher.handler.ts ✅
- table-config/services/data-masking.service.ts ✅

---

## Resolver method availability

| Method | Exists? | Used for sites |
|--------|---------|----------------|
| `resolveUsers(records, fkFields, userSelect?)` | ✅ | 1, 2, 3, 10, 11 |
| `resolveUser(userId)` | ✅ | Single-record alternatives |
| `resolveRoles(records, fkField?)` | ✅ | Not needed |
| `resolveLookupValues(records, fkField?, includeCategory?)` | ✅ | 4–9 |

No new resolver methods needed.
