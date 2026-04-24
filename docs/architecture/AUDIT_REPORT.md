# CRMSoft Project Audit Report — 2026-03-17

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 8 |
| 🟠 High | 12 |
| 🟡 Medium | 10 |
| 🟢 Low | 7 |
| **Total** | **37 issues** |

---

## 🔴 CRITICAL — Fix Before Production

### C1. `limit: 10000` across 47 files — defeats pagination

Every list page fetches up to 10,000 records client-side. With Railway remote DB, this causes 30s+ timeouts.

**Files (47 total):**

| Category | Files |
|----------|-------|
| List pages | ContactList, LeadList, OrganizationList, RawContactList, ActivityList, QuotationList, InvoiceList, PaymentList, ProformaList, UserList, DepartmentList, DesignationList, RecycleBinList, TourPlanList, DocumentList, DemoList, TicketList, InstallationList, TrainingList |
| AMC/Warranty | WarrantyList, AMCScheduleCalendar, WarrantyClaimList, ServiceVisitList, AMCContractList, WarrantyTemplateList, AMCPlanList |
| Mass ops | mass-delete (5 pages), mass-update (4 pages) |
| Selects | LeadSelect, ProductSelect, ProductPickerModal |
| Forms | DesignationForm, DepartmentForm, UserForm |
| Dashboard | CRMDashboard |

**Fix:** Replace `limit: 10000` with `limit: 50` for list pages. For select/picker components, use server-side search instead of loading all.

---

### C2. 80+ unpaginated `findMany` calls in backend

Backend services and query handlers that return unbounded result sets.

**Worst offenders:**

| File | Risk |
|------|------|
| `tenant/services/page-menu-sync.service.ts` | Loads ALL tenants × ALL pages with N+1 |
| `core/workflow/sla-monitor.service.ts` | Loads ALL active workflow instances |
| `calendar/services/unified-calendar.service.ts` | 7 unbounded findMany in one service |
| `calendar/services/availability.service.ts` | 6 unbounded findMany |
| `tenant/services/vendor-dashboard.service.ts` | 6 unbounded findMany |
| `dashboard/services/target-calculator.service.ts` | Unbounded + N+1 loop |

**Fix:** Add `take: 1000` safety cap to all findMany. Add proper pagination to query handlers exposed via API.

---

### C3. N+1 query in `page-menu-sync.service.ts`

Nested `for (tenant)` → `for (page)` → 2× `findFirst` + `update/create` per combination. With 4 tenants × 50 pages = 400 DB round-trips.

**Fix:** Batch with `createMany`/`updateMany` or use `$transaction` with bulk operations.

---

### C4. 3-level nested includes in list queries

| Handler | Nested Path |
|---------|-------------|
| `get-leads-list.handler.ts` | `filters → lookupValue → lookup` (3 levels) + `contact → communications` |
| `get-organizations-list.handler.ts` | `filters → lookupValue → lookup` (3 levels) |
| `get-contacts-list.handler.ts` | `filters → lookupValue` + `contactOrganizations → organization` + `communications` + `createdByUser` + `_count` |

**Fix:** Use `select` instead of `include` for list views. Only load fields the frontend actually displays.

---

### C5. 34 MB page chunk (raw-contacts) — causes browser timeout

Heavy static imports bundle DataImport (xlsx), VerifyFlowModal, BulkEditPanel into every list page.

**Status:** ✅ Partially fixed — RawContactList, ContactList, LeadList, OrganizationList now use `lazy()`.

**Still static:**

| File | Static Import |
|------|--------------|
| `ActivityList.tsx` | `BulkEditPanel` (not lazy) |
| `reports/designer/page.tsx` | `ReportDesigner` |
| `reports/designer/[id]/page.tsx` | `ReportDesigner` |
| `settings/templates/[id]/designer/page.tsx` | `ReportDesigner` |
| `workflows/[id]/visual/page.tsx` | `WorkflowCanvas` (@xyflow/react) |
| `workflows/visual/new/page.tsx` | `WorkflowCanvas` |

**Fix:** Use `next/dynamic` or `lazy()` for ReportDesigner, WorkflowCanvas, and remaining BulkEditPanel.

---

### C6. `password.txt` tracked in git

Contains all credentials in plain text. Shows as modified in `git status`.

**Fix:** Add to `.gitignore`, remove from tracking with `git rm --cached password.txt`.

---

### C7. 28 Prisma models without `@@index`

Concentrated in sales/purchase/accounting modules:

| Models | Module |
|--------|--------|
| PurchaseRFQ, PurchaseRFQItem, PurchaseQuotation, PurchaseQuotationItem, QuotationComparison, GoodsReceipt, GoodsReceiptItem, PurchaseInvoice, PurchaseInvoiceItem | Procurement |
| SaleReturn, SaleReturnItem, DebitNote, DebitNoteItem, SaleMaster, PurchaseMaster, AccountGroup | Sales/Accounts |
| LedgerMaster, BankAccount, BankReconciliation, GSTReturn | Finance |
| UnitMaster, UnitConversion | Products |
| ListingAnalytics, PostAnalytics, PackageModule | Marketplace |

**Fix:** Add `@@index([tenantId])` + relevant query indexes to all models.

---

### C8. N+1 in target-calculator and SLA monitor (cron jobs)

| Service | Pattern |
|---------|---------|
| `target-calculator.service.ts` | `for (target)` → `calculateMetric()` (count queries) + `update` per target |
| `sla-monitor.service.ts` | `for (instance)` → `processInstance()` with findFirst + create |
| `campaign-executor.service.ts` | `for (recipient)` → `findUnique` per iteration |
| `bulk-transfer.handler.ts` | `for (o)` → `transfer()` per entity |
| `bulk-assign.handler.ts` | `for (entityId)` → `assign()` per entity |

**Fix:** Batch operations. Use `updateMany`, `createMany`, or `$transaction` with arrays.

---

## 🟠 HIGH — Fix This Week

### H1. 24 duplicate `formatCurrency` definitions

24 files define their own local `formatCurrency()` instead of importing from a shared utility.

**Fix:** Create `src/lib/format-currency.ts` with canonical implementation, replace all 24 local copies.

---

### H2. 37+ duplicate `formatDate` definitions

Canonical `formatDate` exists at `src/lib/format-date.ts`, but 35+ feature files define local copies.

**Fix:** Search-and-replace all local `formatDate` with import from `@/lib/format-date`.

---

### H3. 13 files bypass `useEntityPanel`/`useContentPanel` (Rule #8)

| File | Usage |
|------|-------|
| `AccountGroupList.tsx` | raw `openPanel` |
| `SaleMasterList.tsx` | raw `openPanel` |
| `PurchaseMasterList.tsx` | raw `openPanel` |
| `LedgerList.tsx` | raw `openPanel` |
| `JournalEntryList.tsx` | raw `openPanel` |
| `ContraList.tsx` | raw `openPanel` |
| `CalendarPage.tsx` | raw `openPanel` |
| `AgencyDiscountPage.tsx` | raw `openPanel` |
| `PricingListPage.tsx` | raw `openPanel` |
| `LeadDashboard.tsx` | raw `openPanel` |
| `LookupDetail.tsx` | raw `openPanel` |
| `ContactList.tsx` | raw `openPanel` (ledger convert) |
| `OrganizationList.tsx` | raw `openPanel` (ledger convert) |

**Fix:** Migrate each to `useEntityPanel` or `useContentPanel` hook.

---

### H4. 7 recharts static imports (~200KB)

| File |
|------|
| `DashboardOverview.tsx` |
| `AnalyticsPage.tsx` |
| `MyDashboard.tsx` |
| `ReportChartRenderer.tsx` |
| `CRMDashboard.tsx` |
| `WaDashboard.tsx` |
| `VerificationReportPage.tsx` |

**Fix:** Use `next/dynamic` with `{ ssr: false }` for chart components.

---

### H5. 13 @xyflow/react static imports (workflow module)

WorkflowCanvas.tsx alone has 31 imports from `@xyflow/react`. All workflow files load this heavy graph library eagerly.

**Fix:** Use `next/dynamic` for WorkflowCanvas in route pages.

---

### H6. 7 @dnd-kit static imports

Used in LeadKanban, WorkflowDetail, MenuEditor, table-config column/filter lists.

**Fix:** Lazy-load KanbanColumn/KanbanCard only when LeadKanban view is active.

---

### H7. Barrel export defeats tree-shaking

`entity-verification/index.ts` re-exports VerifyFlowModal (1274 lines) + VerifyModal (896 lines). Importing `type { VerifyFlowEntityData }` from the barrel may pull in both modules.

**Fix:** Import types directly from the types file: `@/features/entity-verification/types/entity-verification.types`.

---

### H8. 14 hardcoded localhost URLs in production code

**Frontend (5):** ForceUpdateBanner, entity-verification service (3), useNotificationSSE
**Backend (8):** wa-media.service, google.service (2), ollama.service, tracking.service, email-account.controller (2), entity-verification.service

**Fix:** Replace with `process.env.NEXT_PUBLIC_API_URL` / `process.env.APP_URL` constants.

---

### H9. 85 component files over 400 lines

Top offenders:

| Lines | File |
|-------|------|
| 1302 | `QuotationForm.tsx` |
| 1290 | `WorkflowDetail.tsx` |
| 1274 | `VerifyFlowModal.tsx` |
| 1052 | `InvoiceForm.tsx` |
| 1034 | `LeadDashboard.tsx` |
| 1021 | `ProformaForm.tsx` |
| 999 | `InvoiceDetail.tsx` |
| 907 | `CompanyLocationsTree.tsx` |
| 896 | `VerifyModal.tsx` |

**Fix:** Extract sub-components. Target: no file over 600 lines.

---

### H10. Duplicate list service patterns (backend)

Payment, Sales, Marketplace modules each have 5-6 services with nearly identical paginated list methods.

**Fix:** Create a generic `PaginatedListService<T>` base class or shared `buildPaginatedQuery()` utility.

---

### H11. Calendar services: 7 unbounded findMany in one method

`unified-calendar.service.ts` loads tasks, activities, demos, tour plans, reminders, follow-ups, events — each as a separate unbounded query.

**Fix:** Add date-range WHERE clause and `take` limit to each query.

---

### H12. 283/294 command handlers lack try/catch

May be partially mitigated by NestJS global exception filters, but multi-step commands risk partial state on intermediate failures.

**Fix:** Add try/catch to command handlers that perform multiple writes (create + update + log patterns).

---

## 🟡 MEDIUM — Fix This Month

| # | Issue | Count | Fix |
|---|-------|-------|-----|
| M1 | Console.log in frontend | 6 stmts (4 files) | Remove or replace with logger |
| M2 | Console.log in backend | 6 stmts (3 files) | Remove or replace with Logger |
| M3 | Duplicate `truncate` utility | 2 files | Extract to shared lib |
| M4 | TODO/FIXME in backend | 6 comments (5 files) | Resolve or create tickets |
| M5 | Rule #1 violation | 1 file (ImportPatternSection.tsx) | Remove direct @coreui import |
| M6 | Rule #2 violation | 1 file (ImportPatternSection.tsx) | Remove direct lucide-react import |
| M7 | ActivityList.tsx BulkEditPanel static | 1 file | Add lazy() import |
| M8 | Select components use limit:10000 | LeadSelect, ProductSelect, ProductPickerModal | Convert to server-side search |
| M9 | Mass operation pages load all records | 9 pages | Add pagination or streaming |
| M10 | Procurement/Sales models missing indexes | 28 models | Run prisma migration to add indexes |

---

## 🟢 LOW — Nice-to-Have

| # | Issue | Details |
|---|-------|---------|
| L1 | Unused `Button` import | 3+ list files import Button but don't use it |
| L2 | Unused `toggle` from useBulkSelect | 4+ list files destructure but never use |
| L3 | Unused `handleRowEdit` | Some list files have it from useEntityPanel but use inline edit |
| L4 | `RateLimitTier` model no @@index | Small table, low risk |
| L5 | `Permission` model no @@index | Has @@unique, sufficient |
| L6 | `PermissionTemplate` no @@index | Has @@unique, sufficient |
| L7 | Dev-panel ImportPatternSection intentional violations | Demo file, not user-facing |

---

## Golden Rule Violation Summary

| Rule | Violations | Details |
|------|-----------|---------|
| #1 — No @coreui outside ui/ | 1 | ImportPatternSection.tsx (dev demo) |
| #2 — No lucide-react outside Icon.tsx | 1 | ImportPatternSection.tsx (dev demo) |
| #3 — No editing lib/coreui/ | 0 | Clean |
| #4 — No inline SVGs | 0 | Clean |
| #5 — Features self-contained | 0 | Clean |
| #6 — Thin route pages | 0 | Clean |
| #8 — Sidebars via hooks only | 13 | Raw useSidePanelStore().openPanel() |
| #9 — SmartSearch for autocomplete | 0 | Clean |

---

## Recommended Fix Order (Priority Plan)

### Week 1 — Critical Performance
1. Replace all `limit: 10000` with `limit: 50` in list pages (47 files)
2. Add `select` instead of `include` in contacts/leads/orgs list handlers (3 files)
3. Fix N+1 in `page-menu-sync.service.ts`
4. Add `take` safety cap to all unbounded findMany in cron services
5. Lazy-load ReportDesigner and WorkflowCanvas in route pages
6. Remove `password.txt` from git

### Week 2 — Code Quality
7. Extract shared `formatCurrency` → `src/lib/format-currency.ts` (eliminate 24 dupes)
8. Replace local `formatDate` with shared import (eliminate 37 dupes)
9. Add `@@index([tenantId])` to 28 models + migration
10. Replace hardcoded localhost URLs with env constants (14 files)

### Week 3 — Architecture
11. Migrate 13 raw `openPanel` callers to `useEntityPanel`/`useContentPanel`
12. Convert select components (LeadSelect, ProductSelect) to server-side search
13. Batch N+1 patterns in target-calculator, SLA monitor, campaign executor
14. Create generic `PaginatedListService` for backend

### Week 4 — Polish
15. Split 9 files over 1000 lines into sub-components
16. Remove console.log statements (12 total)
17. Resolve 6 TODO comments
18. Clean unused imports
