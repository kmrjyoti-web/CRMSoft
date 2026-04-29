# Customer Module Deep Audit

**Date:** 2026-04-29  
**Branch:** development/wl-platform-v2  
**Scope:** `apps-backend/api/src/modules/customer/`  
**Type:** Documentation Only — No Code Changes

---

## Summary Stats

| Metric | Value |
|---|---|
| Sub-modules | 49 |
| Total LOC | 77,826 |
| Total files | 1,402 |
| Controllers | 103 |
| Endpoints | **871** |
| CQRS Commands | 235 |
| CQRS Queries | 117 |
| CQRS Events | 17 |
| Domain Entities | 7 (formal DDD) |
| DTOs/Interfaces/Enums | ~346 across backend |
| % of total backend LOC | **43%** |

---

## Phase 1: Sub-module Breakdown (sorted by LOC)

| Sub-module | Files | LOC | Endpoints | Services | Cluster |
|---|---|---|---|---|---|
| `mis-reports` | 87 | 12,085 | 23 | 8 | D-Reporting |
| `email` | 111 | 4,341 | 47 | 12 | E-Comms |
| `whatsapp` | 114 | 3,978 | 46 | 11 | E-Comms |
| `bulk-import` | 68 | 3,590 | 27 | 10 | F-Docs |
| `payment` | 27 | 3,289 | 39 | 14 | A-Sales |
| `calendar` | 26 | 3,229 | 43 | 8 | C-Ops |
| `quotations` | 74 | 3,195 | 32 | 5 | A-Sales |
| `inventory` | 18 | 2,884 | 47 | 12 | B-Products |
| `documents` | 76 | 2,869 | 27 | 9 | F-Docs |
| `accounts` | 13 | 2,664 | 57 | 10 | A-Sales |
| `document-templates` | 14 | 2,358 | 28 | 7 | F-Docs |
| `ownership` | 64 | 2,320 | 28 | 6 | G-Cross |
| `procurement` | 11 | 2,125 | 42 | 8 | A-Sales |
| `dashboard` | 52 | 2,090 | 20 | 7 | D-Reporting |
| `tasks` | 48 | 2,020 | 18 | 3 | C-Ops |
| `leads` | 44 | 1,893 | 17 | 0 | A-Sales |
| `sales` | 8 | 1,751 | 30 | 5 | A-Sales |
| `raw-contacts` | 45 | 1,678 | 13 | 0 | A-Sales |
| `contacts` | 35 | 1,436 | 10 | 0 | A-Sales |
| `wallet` | 17 | 1,404 | 27 | 6 | A-Sales |
| `products` | 27 | 1,320 | 15 | 0 | B-Products |
| `activities` | 35 | 1,295 | 13 | 0 | C-Ops |
| `organizations` | 33 | 1,182 | 9 | 0 | A-Sales |
| `product-pricing` | 16 | 999 | 9 | 0 | B-Products |
| `entity-verification` | 5 | 944 | 16 | 1 | G-Cross |
| `communications` | 29 | 900 | 8 | 0 | E-Comms |
| `tour-plans` | 30 | 858 | 12 | 0 | C-Ops |
| `amc-warranty` | 15 | 856 | 34 | 7 | A-Sales |
| `contact-organizations` | 28 | 844 | 8 | 0 | A-Sales |
| `demos` | 27 | 673 | 9 | 0 | C-Ops |
| `follow-ups` | 29 | 666 | 10 | 1 | C-Ops |
| `support` | 6 | 634 | 12 | 2 | E-Comms |
| `reminders` | 24 | 616 | 9 | 1 | C-Ops |
| `comments` | 15 | 503 | 5 | 1 | G-Cross |
| `price-lists` | 24 | 489 | 8 | 0 | A-Sales |
| `performance` | 20 | 487 | 8 | 0 | D-Reporting |
| `recurrence` | 17 | 425 | 5 | 1 | C-Ops |
| `saved-filters` | 16 | 356 | 5 | 0 | G-Cross |
| `approval-requests` | 16 | 338 | 0 | 0 | G-Cross |
| `manufacturers` | 5 | 310 | 11 | 0 | B-Products |
| `product-units` | 4 | 296 | 5 | 1 | B-Products |
| `brands` | 5 | 286 | 11 | 0 | G-Cross |
| `bulk-export` | 4 | 274 | 4 | 1 | F-Docs |
| `customer-price-groups` | 3 | 243 | 8 | 0 | A-Sales |
| `product-tax` | 4 | 240 | 4 | 1 | B-Products |
| `recycle-bin` | 2 | 193 | 1 | 0 | G-Cross |
| `approval-rules` | 3 | 134 | 4 | 0 | G-Cross |
| `calendar-highlights` | 3 | 118 | 3 | 1 | C-Ops |
| `task-logic` | 4 | 101 | 4 | 1 | C-Ops |

---

## Phase 2: Domain Entity Coverage

### Formal DDD Entities (7 total)

Only 7 sub-modules have proper DDD domain entities. The rest use direct Prisma queries.

| Entity File | Sub-module |
|---|---|
| `activity.entity.ts` | activities |
| `communication.entity.ts` | communications |
| `contact-organization.entity.ts` | contact-organizations |
| `contact.entity.ts` | contacts |
| `lead.entity.ts` | leads |
| `organization.entity.ts` | organizations |
| `raw-contact.entity.ts` | raw-contacts |

**Observation:** 42 of 49 sub-modules skip the entity layer and query Prisma directly. This is consistent — not a partial migration. The 7-entity cluster (contacts/leads/orgs/activities) forms the DDD core of the CRM.

---

## Phase 3: Dependency Analysis

### Internal Coupling (Within customer/)

**Total cross-sub-module import lines: 1,253**

Breaking down what those 1,253 imports actually are:

| Import Target | Count | Type | Notes |
|---|---|---|---|
| `core/prisma/prisma.service` | ~481 | Framework | Working DB client — not business logic coupling |
| `common/utils/api-response` | 83 | Framework | Response wrapper utility |
| `core/permissions/decorators/require-permissions` | 66 | Framework | Auth decorator |
| `common/decorators/current-user` | 64 | Framework | Auth decorator |
| `mis-reports/interfaces/report*.interface` | 112 | Internal | Self-contained within mis-reports |
| `mis-reports/infrastructure/drill-down.service` | 52 | Internal | Self-contained within mis-reports |
| `common/guards/jwt-auth.guard` | 29 | Framework | Auth guard |
| `common/dto/pagination.dto` | 22 | Framework | Pagination utility |
| `shared/domain/domain-event` | 17 | Framework | DDD event base class |
| **Actual business cross-sub-module** | **~30** | **Business** | See table below |

### Actual Business Logic Cross-Module Imports (~30 total)

| Importing Sub-module | Imports From | What |
|---|---|---|
| `tasks` | `task-logic` | `TaskLogicModule` (sibling module) |
| `tasks` | `services/task-assignment` | Shared task assignment service |
| `tasks` | `services/task-visibility` | Shared task visibility service |
| `contacts` | `softwarevendor/table-config` | Column config (external) |
| `contacts` | `domain/interfaces/contact-repository` | Own DDD interface |
| `leads` | `domain/entities/lead` | Own DDD entity |
| `leads` | `domain/events/lead-created` | Own DDD event |
| `organizations` | `domain/entities/organization` | Own DDD entity |
| `raw-contacts` | `domain/interfaces/raw-contact-repository` | Own DDD interface |
| `raw-contacts` | `domain/events/raw-contact-created` | Own DDD event |
| `contact-organizations` | `domain/entities/contact-organization` | Own DDD entity |
| `email` | `core/work/notifications` | Notifications (external) |
| `payment` | `services/task-recurrence` | Shared service |
| `procurement` | `services/comment-visibility` | Shared visibility service |

**Key insight:** Most "cross" imports within the customer module are framework utilities (Prisma, guards, decorators), not real business coupling between sub-modules. **The actual business logic cross-coupling is ~30 imports out of 1,253 (2.4%).** This is extraordinarily low.

### Sub-modules by Cross-Sub-module Import Count

**ZERO cross imports (30 sub-modules — highly isolatable):**
accounts, amc-warranty, approval-requests, approval-rules, brands, bulk-export, bulk-import, calendar-highlights, customer-price-groups, dashboard, demos, document-templates, documents, entity-verification, follow-ups, inventory, manufacturers, ownership, performance, price-lists, product-pricing, product-tax, product-units, products, recurrence, recycle-bin, reminders, saved-filters, support, wallet, whatsapp

**FEW cross imports (most isolatable with minor adjustments):**

| Sub-module | Cross imports | Notes |
|---|---|---|
| `mis-reports` | 165 | All internal to mis-reports' own infra/interfaces — NOT coupling to other sub-modules |
| `raw-contacts` | 8 | Own domain interfaces/events only |
| `leads` | 7 | Own domain entities/events only |
| `organizations` | 6 | Own domain entities only |
| `contacts` | 6 | Own domain interfaces + softwarevendor/table-config |
| `tasks` | 6 | task-logic module + 2 shared services |
| `contact-organizations` | 3 | Own domain entities only |
| `communications` | 3 | Own domain entities only |
| `comments` | 3 | comment-visibility service |
| `activities` | 3 | Own domain entities only |
| `calendar` | 2 | Shared services |

### External Dependencies (customer → outside modules)

| External Module | Import Count | From Sub-module | Why |
|---|---|---|---|
| `softwarevendor/table-config` | 5 | contacts | Custom column config |
| `core/work/notifications` | 2 | email | Send notifications |
| `softwarevendor/tenant-config` | 1 | (various) | Tenant settings |
| `softwarevendor/control-room` | 1 | (various) | Control room access |
| **TOTAL external** | **9** | | |

**The customer module has only 9 external imports. It is near-completely self-contained.**

---

## Phase 4: Database Coupling

### Working DB Schema — What customer module uses

The customer module operates primarily against `prisma.working` (multi-tenant working DB):
- **2,263 `prisma.working` calls** — the dominant DB pattern
- **486 `prisma.service` calls** — direct Prisma client access

### Top 30 Prisma Models Used

| Model | Calls | Schema File | Cluster |
|---|---|---|---|
| `working` (multi-tenant accessor) | 2,263 | working/ | All |
| `quotation` | 63 | sales.prisma | A-Sales |
| `communication` | 52 | communication.prisma | E-Comms |
| `user` | 48 | identity | Core |
| `lead` | 46 | crm.prisma | A-Sales |
| `activity` | 45 | crm.prisma | C-Ops |
| `saleOrder` | 42 | sales.prisma | A-Sales |
| `product` | 33 | inventory.prisma | B-Products |
| `demo` | 31 | crm.prisma | C-Ops |
| `tourPlan` | 30 | crm.prisma | C-Ops |
| `reminder` | 28 | notifications.prisma | C-Ops |
| `contactOrganization` | 27 | crm.prisma | A-Sales |
| `calendarEvent` | 26 | crm.prisma | C-Ops |
| `wallet` | 24 | crm.prisma | A-Sales |
| `scheduledEvent` | 23 | crm.prisma | C-Ops |
| `entityOwner` | 22 | config.prisma | G-Cross |
| `userCapacity` | 20 | config.prisma | C-Ops |
| `waConversation` | 19 | communication.prisma | E-Comms |
| `contact` | 18 | crm.prisma | A-Sales |
| `walletTransaction` | 17 | crm.prisma | A-Sales |
| `task` | 15 | crm.prisma | C-Ops |
| `recurringEvent` | 15 | crm.prisma | C-Ops |
| `salesTarget` | 14 | sales.prisma | A-Sales |
| `saleReturn` | 14 | sales.prisma | A-Sales |
| `email` | 13 | communication.prisma | E-Comms |
| `coupon` | 13 | crm.prisma | A-Sales |
| `waMessage` | 12 | communication.prisma | E-Comms |
| `deliveryChallan` | 12 | sales.prisma | A-Sales |
| `waTemplate` | 11 | communication.prisma | E-Comms |

### Working DB Schema Domain Split

| Schema | Models | Cluster Mapping |
|---|---|---|
| `crm.prisma` | 44 | A-Sales (contacts/leads/orgs) + C-Ops (tasks/calendar) |
| `config.prisma` | 50 | G-Cross (ownership, custom fields) + A-Sales (brands) |
| `inventory.prisma` | 31 | B-Products |
| `communication.prisma` | 21 | E-Comms |
| `accounts.prisma` | 16 | A-Sales (invoices, credit notes) |
| `sales.prisma` | 17 | A-Sales (quotations, orders) |
| `documents.prisma` | 12 | F-Docs |
| `workflow.prisma` | 10 | G-Cross (approvals, workflows) |
| `notifications.prisma` | 7 | C-Ops (reminders) |
| `audit.prisma` | 7 | Core |
| `payments.prisma` | 5 | A-Sales (payments) |
| `reports.prisma` | 5 | D-Reporting |
| `tax.prisma` | 3 | A-Sales (GST, TDS) |

---

## Phase 5: Cluster Map (Separation Candidates)

### CLUSTER A — Sales Pipeline
**Sub-modules (14):** contacts, raw-contacts, contact-organizations, organizations, leads, quotations, sales, accounts, wallet, payment, procurement, amc-warranty, price-lists, customer-price-groups

| Metric | Value |
|---|---|
| **LOC** | **23,049** (30%) |
| **Endpoints** | **334** (38%) |
| Internal cross-coupling | LOW — DDD entities only |
| External deps | softwarevendor/table-config (contacts) |
| DB schemas | crm, sales, accounts, payments, tax |
| Separability | HIGH |

---

### CLUSTER B — Product Catalog
**Sub-modules (6):** products, product-pricing, product-tax, product-units, manufacturers, inventory

| Metric | Value |
|---|---|
| **LOC** | **6,049** (8%) |
| **Endpoints** | **91** (10%) |
| Internal cross-coupling | ZERO |
| External deps | NONE |
| DB schemas | inventory |
| Separability | VERY HIGH |

---

### CLUSTER C — Operations (Tasks & Calendar)
**Sub-modules (10):** tasks, task-logic, activities, calendar, calendar-highlights, reminders, recurrence, follow-ups, tour-plans, demos

| Metric | Value |
|---|---|
| **LOC** | **10,001** (13%) |
| **Endpoints** | **126** (14%) |
| Internal cross-coupling | LOW (tasks→task-logic, shared services) |
| External deps | core/notifications (reminders) |
| DB schemas | crm (tasks/calendar), notifications |
| Separability | HIGH |

---

### CLUSTER D — Reporting & Analytics
**Sub-modules (3):** mis-reports, dashboard, performance

| Metric | Value |
|---|---|
| **LOC** | **14,662** (19%) |
| **Endpoints** | **51** (6%) |
| Internal cross-coupling | HIGH within mis-reports (internal only) |
| External deps | DrillDownService reads ALL other Prisma models |
| DB schemas | ALL (reports aggregate from every domain) |
| Separability | LOW — mis-reports reads across all domains |

**Warning:** mis-reports (12,085 LOC) has 165 internal imports of its own shared interfaces (`report.interface.ts`, `report-class.interface.ts`, `drill-down.service`). Its `DrillDownService` likely reads from ALL schemas. This cluster **cannot be independently deployed** without a data aggregation API layer.

---

### CLUSTER E — Communications
**Sub-modules (4):** email, whatsapp, communications, support

| Metric | Value |
|---|---|
| **LOC** | **9,853** (13%) |
| **Endpoints** | **113** (13%) |
| Internal cross-coupling | ZERO across sub-modules |
| External deps | core/notifications (2 imports) |
| DB schemas | communication (21 models) |
| Separability | VERY HIGH — own DB schema already |

---

### CLUSTER F — Documents & Data Management
**Sub-modules (4):** documents, document-templates, bulk-import, bulk-export

| Metric | Value |
|---|---|
| **LOC** | **9,091** (12%) |
| **Endpoints** | **86** (10%) |
| Internal cross-coupling | ZERO |
| External deps | NONE detected |
| DB schemas | documents (12 models) |
| Separability | VERY HIGH — own DB schema already |

---

### CLUSTER G — Cross-cutting Concerns
**Sub-modules (8):** ownership, comments, approval-requests, approval-rules, entity-verification, saved-filters, recycle-bin, brands

| Metric | Value |
|---|---|
| **LOC** | **5,074** (7%) |
| **Endpoints** | **70** (8%) |
| Internal cross-coupling | LOW |
| External deps | NONE |
| DB schemas | config, workflow |
| Separability | MEDIUM — consumed by all other clusters |

---

## Phase 6: Separation Strategies

### Option 1: Single @crmsoft/crm-sdk

Extract the entire customer module as one package.

```
@crmsoft/crm-sdk
  └── all 49 sub-modules (77,826 LOC)
```

| Dimension | Value |
|---|---|
| **Effort** | 10-14 days |
| **Risk** | LOW |
| **Benefit** | Simple — no inter-SDK dependency management |
| **Team scaling** | Poor — one team owns entire 77K LOC package |
| **Recommendation** | Good for short-term; doesn't solve team ownership |

---

### Option 2: 4 SDKs (Recommended)

Split by domain cluster, keeping reporting in the core package.

```
@crmsoft/sales-sdk         (A + B)  — 29,098 LOC, 425 endpoints
@crmsoft/operations-sdk    (C + G)  — 15,075 LOC, 196 endpoints
@crmsoft/comms-docs-sdk    (E + F)  — 18,944 LOC, 199 endpoints
@crmsoft/crm-reports-sdk   (D)      — 14,662 LOC,  51 endpoints
                                       + depends on all 3 others
```

| SDK | Clusters | LOC | Endpoints | Risk | Days |
|---|---|---|---|---|---|
| `@crmsoft/sales-sdk` | A + B | 29,098 | 425 | LOW | 7-9 |
| `@crmsoft/operations-sdk` | C + G | 15,075 | 196 | LOW | 4-5 |
| `@crmsoft/comms-docs-sdk` | E + F | 18,944 | 199 | LOW | 5-7 |
| `@crmsoft/crm-reports-sdk` | D | 14,662 | 51 | HIGH | 7-10 |
| **TOTAL** | | **77,779** | **871** | | **23-31 days** |

**Risk notes:**
- sales-sdk, ops-sdk, comms-docs-sdk all have ZERO inter-SDK dependencies
- reports-sdk must read from all other SDKs' DBs — solve via read-only DB views or aggregation service
- reports-sdk extraction is highest risk and lowest urgency (not consumed externally)

---

### Option 3: 6 Microservices (Full Domain Separation)

Deploy each cluster as an independent service.

```
crm-sales-service      (A)  23,049 LOC — contacts, leads, orders, payments
crm-products-service   (B)   6,049 LOC — products, inventory
crm-ops-service        (C)  10,001 LOC — tasks, calendar, activities
crm-reports-service    (D)  14,662 LOC — mis-reports, dashboard
crm-comms-service      (E)   9,853 LOC — email, whatsapp
crm-docs-service       (F)   9,091 LOC — documents, bulk-import
```

| Dimension | Value |
|---|---|
| **Effort** | 40-60 days |
| **Risk** | HIGH |
| **Benefit** | Independent scaling, deployment, team ownership |
| **Drawback** | Distributed transactions, service mesh required, ~3-5× operational overhead |
| **Recommendation** | Only if teams need truly independent deployment SLAs |

---

## Phase 7: Final Recommendation

### Recommended Path: Option 2 (4 SDKs), Phased

**Phase 2a — @crmsoft/comms-docs-sdk (5-7 days, FIRST)**
- Clusters E + F (email, whatsapp, documents, bulk-import)
- ZERO internal cross-coupling, own communication.prisma + documents.prisma schemas
- Lowest risk, proves the extraction pattern
- Teams can ship this independently

**Phase 2b — @crmsoft/sales-sdk (7-9 days)**
- Clusters A + B (contacts through accounts, products through inventory)
- Low coupling (DDD entities internally self-contained)
- Highest endpoint count (425) — most user-visible, highest business value
- External dep: contacts imports softwarevendor/table-config (1 adapter needed)

**Phase 2c — @crmsoft/operations-sdk (4-5 days, parallel with 2b)**
- Clusters C + G (tasks, calendar, activities, ownership, approvals)
- Low coupling (task-logic is already a sub-module of tasks)
- External dep: reminders → core/notifications (1 adapter)

**Phase 2d — @crmsoft/crm-reports-sdk (7-10 days, LAST)**
- Cluster D (mis-reports, dashboard, performance)
- Depends on all other SDKs' DB schemas — do LAST
- DrillDownService needs an aggregation strategy first (read-only views or CQRS projections)

---

## Critical Findings Summary

```
┌─────────────────────────────────────────────────────────────────┐
│ CUSTOMER MODULE DEEP AUDIT SUMMARY                              │
├─────────────────────────────────────────────────────────────────┤
│ Total: 49 sub-modules | 77,826 LOC | 871 endpoints             │
├─────────────────────────────────────────────────────────────────┤
│ Cluster         │ LOC    │ Endpoints │ Separability             │
│ A. Sales        │ 23,049 │ 334       │ HIGH                     │
│ B. Products     │  6,049 │  91       │ VERY HIGH                │
│ C. Operations   │ 10,001 │ 126       │ HIGH                     │
│ D. Reporting    │ 14,662 │  51       │ LOW (reads everything)   │
│ E. Comms        │  9,853 │ 113       │ VERY HIGH                │
│ F. Docs         │  9,091 │  86       │ VERY HIGH                │
│ G. Cross-cut    │  5,074 │  70       │ MEDIUM                   │
├─────────────────────────────────────────────────────────────────┤
│ Internal coupling:  2.4% actual business (rest = framework)     │
│ External imports:   ONLY 9 total (near-zero deps on outside)    │
│ DDD entities:       7 (contacts/leads/orgs/activities cluster)  │
│ DB schemas:         13 domain files in working DB               │
│ DB access pattern:  String-based multi-tenant (prisma.working)  │
├─────────────────────────────────────────────────────────────────┤
│ BIGGEST SURPRISE:                                               │
│ 30 of 49 sub-modules have ZERO cross-sub-module business deps.  │
│ This module is FAR MORE extractable than its 77K LOC suggests.  │
├─────────────────────────────────────────────────────────────────┤
│ RECOMMENDATION:  Option 2 — 4 SDKs, phased                     │
│ Total extraction effort:  23-31 days                            │
│ Start with: comms-docs-sdk (5-7 days, lowest risk)              │
│ Highest value: sales-sdk (7-9 days, 425 endpoints)              │
│ Do last: reports-sdk (depends on all others)                    │
└─────────────────────────────────────────────────────────────────┘
```

---

*Generated: 2026-04-29 | Branch: development/wl-platform-v2 | No code was modified*
