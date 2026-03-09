# UI Discovery & Gap Analysis — CRM-SOFT

Generated: 2026-03-08

---

## PHASE 1: FRONTEND PROJECT INVENTORY

```
+-------------------------------------------------------------------------+
| FRONTEND PROJECT: crm-admin                                             |
+-------------------------------------------------------------------------+
| Framework:     Next.js 14.2.35 (App Router) + TypeScript strict         |
| Location:      UI/crm-admin/                                           |
| UI Library:    CoreUI (custom fork, AIC-prefixed, Git submodule)        |
| State:         Zustand (client) + TanStack React Query (server)         |
| Forms:         react-hook-form + zod                                    |
| Dev Port:      3005   |   API Port: 3001 (NestJS)                      |
+-------------------------------------------------------------------------+
| STATISTICS:                                                             |
|   Total Page Routes:      153                                           |
|   Feature Modules:        31                                            |
|   UI Wrapper Components:  59                                            |
|   Common Components:      28                                            |
|   Feature Components:     ~452                                          |
|   Total Components:       ~539                                          |
|   Services:               61                                            |
|   Zustand Stores:         7                                             |
|   Custom Hooks:           ~45                                           |
|   Tests:                  341 (64 suites)                               |
+-------------------------------------------------------------------------+
```

### Feature Modules (31)

| Module | Pages | Services | Description |
|--------|-------|----------|-------------|
| activities | 6 | 1 | Activity/Follow-up CRUD |
| audit-logs | 1 | 1 | Audit trail viewer |
| auth | 3 | 1 | Login, Register, Forgot Password |
| calendar | 1 | 1 | Event calendar |
| communication | 5 | 1 | Email templates & signatures |
| contacts | 6 | 1 | Contact CRM |
| dashboard | 1 | 2 | KPIs, charts, analytics |
| demos | 4 | 1 | Demo scheduling |
| dev-panel | 1 | 0 | Developer debugging tools |
| documents | 4 | 3 | Document management |
| finance | 10 | 2 | Invoices, payments, proforma, credit notes |
| form-config | 0 | 0 | Form customization (utility) |
| leads | 6 | 1 | Lead management + Kanban |
| onboarding | 1 | 1 | Tenant onboarding |
| organizations | 6 | 1 | Organization CRM |
| post-sales | 12 | 1 | Installations, trainings, tickets |
| products | 7 | 1 | Products, packages, units |
| quotations | 4 | 1 | Quote/estimation |
| raw-contacts | 6 | 1 | Unstructured contact intake |
| recycle-bin | 1 | 1 | Soft-delete recovery |
| registration | 0 | 1 | Tenant registration |
| reports | 4 | 2 | MIS reports, templates, schedules |
| settings | 19 | 12 | Users, roles, lookups, menus, config |
| subscription | 1 | 1 | Subscription management |
| table-config | 0 | 1 | Table column/density config |
| tasks | 3 | 1 | Task management |
| tour-plans | 4 | 1 | Tour/visit planning |
| vendor | 10 | 2 | Vendor admin panel |
| wallet | 2 | 2 | Wallet & token management |
| whatsapp | 14 | 7 | WA templates, conversations, broadcasts |
| workflows | 4 | 1 | Workflow builder |

---

## PHASE 2: BACKEND API INVENTORY

```
+-------------------------------------------------------------------------+
| BACKEND API INVENTORY                                                   |
+-------------------------------------------------------------------------+
| Total Modules:              67                                          |
| Total Controller Files:     155                                         |
| Total API Endpoints:        ~1,116                                      |
| Public Endpoints:           11                                          |
| Admin-Only Endpoints:       8+                                          |
| Authenticated Endpoints:    ~1,097                                      |
+-------------------------------------------------------------------------+
```

### Backend Modules by Category

**CRM Core (65 endpoints)**
| Module | Endpoints | Key Routes |
|--------|-----------|------------|
| contacts | 9 | CRUD + lifecycle (deactivate/reactivate/soft-delete/restore/permanent) |
| organizations | 9 | CRUD + lifecycle |
| leads | 17 | CRUD + quick-create, allocate, status transitions, workflow |
| activities | 13 | CRUD + complete, lifecycle |
| contact-organizations | 8 | Link/unlink contact-org relationships |
| raw-contacts | 13 | CRUD + verify/reject/mark-duplicate/reopen |

**Sales & Quotations (32 endpoints)**
| Module | Endpoints | Key Routes |
|--------|-----------|------------|
| quotations | 19 | CRUD + items, recalculate, send, accept/reject/revise, clone |
| quotation-ai | 3 | predict, generate, questions |
| quotation-analytics | 6 | overview, conversion, industry, products |
| quotation-templates | 4 | CRUD + create-from-template |

**Finance (39 endpoints)**
| Module | Endpoints | Key Routes |
|--------|-----------|------------|
| invoices | 8 | generate, CRUD, send, cancel |
| proforma-invoices | 8 | generate, CRUD, send, convert, cancel |
| payments | 8 | record, gateway (order/verify), analytics |
| credit-notes | 6 | issue, apply, cancel |
| receipts | 4 | generate, retrieve |
| refunds | 3 | CRUD |
| payment webhooks | 2 | Razorpay/Stripe handlers |

**Products & Catalog (64 endpoints)**
| Module | Endpoints | Key Routes |
|--------|-----------|------------|
| products | 15 | CRUD + tree, search, deactivate, images, relations |
| product-pricing | 9 | Price lists, group/slab pricing, effective price |
| product-tax | 4 | Tax details, calculation, HSN lookup |
| product-units | 5 | Unit conversions |
| brands | 11 | CRUD + org/contact linking |
| manufacturers | 11 | CRUD + org/contact linking |
| customer-price-groups | 8 | CRUD + member management |

**Communication (93 endpoints)**
| Module | Endpoints | Key Routes |
|--------|-----------|------------|
| emails | 15 | compose, reply, send, schedule, star, threading |
| email-accounts | 8 | OAuth, connect/disconnect, sync |
| email-campaigns | 11 | CRUD + recipients, lifecycle |
| email-signatures | 4 | CRUD |
| email-templates | 6 | CRUD + preview |
| email-tracking | 3 | open/click/bounce |
| whatsapp | 23 | WABA, conversations, messaging, analytics |
| whatsapp/broadcasts | 8 | CRUD + lifecycle |
| whatsapp/chatbot | 5 | CRUD + toggle |
| whatsapp/templates | 6 | CRUD + sync |
| whatsapp/quick-replies | 2 | CRUD |
| whatsapp/webhook | 2 | handlers |

**Dashboard & Analytics (45 endpoints)**
| Module | Endpoints | Key Routes |
|--------|-----------|------------|
| dashboard | 4 | executive, pipeline, funnel, personal |
| analytics | 6 | revenue, lead-sources, lost-reasons, heatmap, aging, velocity |
| performance | 7 | team, leaderboard, targets CRUD |
| mis-reports | 25 | definitions, generate, export, drill-down, templates, bookmarks, schedules |

**Settings & Administration (~80 endpoints)**
| Module | Endpoints | Key Routes |
|--------|-----------|------------|
| users | 8+ | CRUD + activate/deactivate/lifecycle |
| roles | 5+ | CRUD |
| permissions | 3+ | matrix, role permissions |
| departments | 8 | CRUD + tree, head assignment |
| designations | 7 | CRUD + tree |
| lookups | 11 | categories, values, reorder, defaults |
| menus | 8 | CRUD + tree, reorder, seed |
| menu-permissions | 15 | role permissions, matrix, templates, bulk |
| auto-numbering | 6+ | CRUD + preview, reset |
| custom-fields | 8 | field defs CRUD, values, form schemas |
| business-type | 11 | type management, terminology |
| business-locations | 10 | CRUD + tree, countries, org linking |
| tenant-config | 15+ | config keys, credentials, rotation |
| branding/company-profile/etc. | 12+ | various settings controllers |

**Advanced Features (~130 endpoints)**
| Module | Endpoints | Key Routes |
|--------|-----------|------------|
| notifications | 28 | configs, preferences, CRUD, SSE gateway |
| workflows | 27 | CRUD + states, transitions, approvals, execution |
| approval-requests | 6 | submit, approve/reject, pending |
| approval-rules | 4 | CRUD |
| bulk-import | 26 | upload, mapping, validation, commit, profiles |
| bulk-export | 4 | jobs, download |
| ownership | 28 | assign, transfer, delegate, rules, workload |
| follow-ups | 10 | CRUD + overdue, snooze, reassign |
| reminders | 5 | CRUD |
| comments | 5 | threaded entity comments |

**Platform & Integration (~100 endpoints)**
| Module | Endpoints | Key Routes |
|--------|-----------|------------|
| marketplace | 42 | listings, engagement, vendors, orders |
| plugins | 11 | catalog, install, credentials, logs |
| api-gateway | 41 | API keys, webhooks, public REST endpoints |
| verification | 8 | email/mobile/GST verification |
| offline-sync | 27 | pull/push, device management, policies |
| google | 9 | OAuth, sync, calendar/contacts settings |
| ai | 9 | generate, improve, translate, summarize, settings |
| cron-engine | 14 | job management, history, dashboard |

**Tenant Management (~50 endpoints)**
| Module | Endpoints | Key Routes |
|--------|-----------|------------|
| tenant (admin) | 11 | billing, license, module-access, vendor-dashboard |
| plan-admin | 8+ | CRUD + limits, module-access |
| subscription | 8+ | CRUD + plans, usage, cancel |
| wallet | 7 | balance, transactions, recharge, coupons |
| wallet-admin | 20 | wallets, recharge plans, coupons, service rates, analytics |

---

## PHASE 3: UI-TO-API MAPPING MATRIX

### LEGEND
- **FULL** = Frontend service + pages exist, endpoints covered
- **PARTIAL** = Some endpoints covered, others missing
- **PAGE ONLY** = Route page exists but no service/API integration
- **MISSING** = No frontend coverage at all

### CRM Core

| Backend Module | Frontend Coverage | Status | Action |
|----------------|-------------------|--------|--------|
| auth (14) | auth.service.ts, LoginForm, RegisterForm | **FULL** | SKIP |
| contacts (9) | contacts.service.ts, 6 pages | **FULL** | SKIP |
| organizations (9) | organizations.service.ts, 6 pages | **FULL** | SKIP |
| leads (17) | leads.service.ts, 6 pages + Kanban | **FULL** | SKIP |
| activities (13) | activities.service.ts, 6 pages | **FULL** | SKIP |
| raw-contacts (13) | raw-contacts.service.ts, 6 pages | **FULL** | SKIP |
| contact-organizations (8) | -- | **MISSING** | CREATE service (relationship UI in contact/org detail) |

### Sales & Finance

| Backend Module | Frontend Coverage | Status | Action |
|----------------|-------------------|--------|--------|
| quotations (19) | quotations.service.ts, 4 pages | **FULL** | SKIP |
| quotation-ai (3) | -- | **MISSING** | CREATE (AI assist in quotation form) |
| quotation-analytics (6) | -- | **MISSING** | CREATE (analytics tab/dashboard) |
| quotation-templates (4) | -- | **MISSING** | CREATE (template picker in quotation form) |
| invoices (8) | finance.service.ts, 4 pages | **FULL** | SKIP |
| proforma-invoices (8) | proforma.service.ts, 4 pages | **FULL** | SKIP |
| payments (8) | finance.service.ts, 2 pages | **FULL** | SKIP |
| credit-notes (6) | finance.service.ts | **FULL** | SKIP |
| receipts (4) | -- | **MISSING** | CREATE (receipt view/download in payment detail) |
| refunds (3) | finance.service.ts | **PARTIAL** | UPDATE (add refund flow) |

### Products & Catalog

| Backend Module | Frontend Coverage | Status | Action |
|----------------|-------------------|--------|--------|
| products (15) | products.service.ts, 3 pages | **PARTIAL** | UPDATE (add image mgmt, relations) |
| product-pricing (9) | -- | **MISSING** | CREATE (price lists, group/slab pricing) |
| product-tax (4) | -- | **MISSING** | CREATE (HSN/SAC lookup in product form) |
| product-units (5) | products.service.ts (types only) | **PARTIAL** | UPDATE (add conversion management) |
| brands (11) | -- | **MISSING** | CREATE (brand CRUD + product linking) |
| manufacturers (11) | -- | **MISSING** | CREATE (manufacturer CRUD + product linking) |
| customer-price-groups (8) | -- | **MISSING** | CREATE (price group CRUD in settings) |

### Communication

| Backend Module | Frontend Coverage | Status | Action |
|----------------|-------------------|--------|--------|
| email-templates (6) | communication.service.ts, 4 pages | **FULL** | SKIP |
| email-signatures (4) | communication.service.ts, 1 page | **FULL** | SKIP |
| email-accounts (8) | email-config.service.ts, 2 pages | **FULL** | SKIP |
| emails (15) | -- | **MISSING** | CREATE (email compose/inbox within entity detail) |
| email-campaigns (11) | -- | **MISSING** | CREATE (campaign builder + management) |
| email-tracking (3) | -- | **MISSING** | CREATE (tracking dashboard) |
| whatsapp (23) | wa-*.service.ts, 14 pages | **FULL** | SKIP |
| whatsapp/broadcasts (8) | wa-broadcasts.service.ts | **FULL** | SKIP |
| whatsapp/chatbot (5) | wa-chatbot.service.ts | **FULL** | SKIP |
| whatsapp/templates (6) | wa-templates.service.ts | **FULL** | SKIP |

### Dashboard & Reports

| Backend Module | Frontend Coverage | Status | Action |
|----------------|-------------------|--------|--------|
| dashboard (4) | dashboard.service.ts, 1 page | **FULL** | SKIP |
| analytics (6) | analytics.service.ts | **FULL** | SKIP |
| performance (7) | -- | **MISSING** | CREATE (team performance, targets, leaderboard) |
| mis-reports (25) | report.service.ts, 4 pages | **FULL** | SKIP |

### Settings & Configuration

| Backend Module | Frontend Coverage | Status | Action |
|----------------|-------------------|--------|--------|
| users | users.service.ts, 4 pages | **FULL** | SKIP |
| roles | roles.service.ts, 3 pages | **FULL** | SKIP |
| permissions | permissions.service.ts, 1 page | **FULL** | SKIP |
| departments | departments.service.ts, 3 pages | **FULL** | SKIP |
| designations | designations.service.ts, 3 pages | **FULL** | SKIP |
| lookups | lookups.service.ts, 3 pages | **FULL** | SKIP |
| menus | menus.service.ts, 1 page | **FULL** | SKIP |
| menu-permissions | permissions.service.ts, 1 page | **PARTIAL** | UPDATE (add matrix view) |
| auto-numbering | auto-numbering.service.ts, 1 page | **FULL** | SKIP |
| custom-fields (8) | -- | **PAGE ONLY** | CREATE service + connect to page |
| business-type (11) | -- | **MISSING** | CREATE (business type settings) |
| business-locations (10) | -- | **PAGE ONLY** | CREATE service + connect to page |
| table-config | table-config.service.ts | **FULL** | SKIP |
| data-masking | data-masking.service.ts, 1 page | **FULL** | SKIP |
| tenant-config | integrations.service.ts, 1 page | **FULL** | SKIP |

### Advanced Features

| Backend Module | Frontend Coverage | Status | Action |
|----------------|-------------------|--------|--------|
| workflows (27) | workflows.service.ts, 4 pages | **FULL** | SKIP |
| tasks | tasks.service.ts, 3 pages | **FULL** | SKIP |
| calendar | calendar.service.ts, 1 page | **PARTIAL** | UPDATE (add event CRUD, availability) |
| documents (27) | documents.service.ts, 4 pages | **FULL** | SKIP |
| tour-plans | tour-plans.service.ts, 4 pages | **FULL** | SKIP |
| demos | demos.service.ts, 4 pages | **FULL** | SKIP |
| audit | audit.service.ts, 1 page | **FULL** | SKIP |
| recycle-bin | recycle-bin.service.ts, 1 page | **FULL** | SKIP |
| notifications (28) | -- | **MISSING** | CREATE (notification center, preferences, SSE) |
| approval-requests (6) | -- | **MISSING** | CREATE (approval inbox/actions) |
| approval-rules (4) | -- | **MISSING** | CREATE (rule builder in settings) |
| bulk-import (26) | -- | **MISSING** | CREATE (import wizard) |
| bulk-export (4) | -- | **MISSING** | CREATE (export actions on list pages) |
| ownership (28) | -- | **MISSING** | CREATE (assignment/transfer/workload UI) |
| follow-ups (10) | -- | **MISSING** | CREATE (follow-up management + reminders) |
| reminders (5) | -- | **MISSING** | CREATE (reminder settings/management) |
| comments (5) | -- | **MISSING** | CREATE (comment thread on entity detail pages) |
| entity-filters (6) | -- | **MISSING** | CREATE (saved filter management) |
| user-overrides (5) | -- | **MISSING** | CREATE (permission overrides in user settings) |
| recurrence (5) | -- | **MISSING** | CREATE (recurrence picker for activities/tasks) |
| help (8) | -- | **MISSING** | CREATE (contextual help panel) |

### Platform & Vendor

| Backend Module | Frontend Coverage | Status | Action |
|----------------|-------------------|--------|--------|
| vendor-dashboard | vendor.service.ts, 1 page | **FULL** | SKIP |
| tenant-admin | vendor.service.ts, 2 pages | **FULL** | SKIP |
| plan-admin | plan-admin.service.ts, 1 page | **FULL** | SKIP |
| subscription | subscription.service.ts, 1 page | **FULL** | SKIP |
| wallet | wallet.service.ts, 2 pages | **FULL** | SKIP |
| wallet-admin | wallet-admin.service.ts | **FULL** | SKIP |
| marketplace (42) | -- | **MISSING** | CREATE (marketplace UI — separate app or section) |
| plugins (11) | -- | **MISSING** | CREATE (plugin store + configuration) |
| api-gateway (41) | -- | **MISSING** | CREATE (API key management, webhook config) |
| verification (8) | -- | **MISSING** | CREATE (verification flows in profile/settings) |
| offline-sync (27) | -- | **MISSING** | CREATE (sync settings + admin dashboard) |
| google | google-integration.service.ts, 2 pages | **FULL** | SKIP |
| ai | ai.service.ts + ai-settings.service.ts, 1 page | **FULL** | SKIP |
| cron-engine | cron-config.service.ts, 1 page | **FULL** | SKIP |

---

## PHASE 4: GAP ANALYSIS SUMMARY

```
+=========================================================================+
|                     UI GAP ANALYSIS SUMMARY                              |
+=========================================================================+
|                                                                          |
|  BACKEND:                                                                |
|    Total Modules:             67                                         |
|    Total Endpoints:           ~1,116                                     |
|                                                                          |
|  FRONTEND:                                                               |
|    Total Feature Modules:     31                                         |
|    Total Pages:               153                                        |
|    Total Services:            61                                         |
|                                                                          |
|  COVERAGE:                                                               |
|    FULL coverage:             36 modules  (54%)                          |
|    PARTIAL coverage:          5 modules   (7%)                           |
|    PAGE ONLY (no service):    2 modules   (3%)                           |
|    MISSING (no UI):           24 modules  (36%)                          |
|                                                                          |
|  ENDPOINT COVERAGE:                                                      |
|    Endpoints with UI:         ~710 / 1,116  (64%)                        |
|    Endpoints without UI:      ~406 / 1,116  (36%)                        |
|                                                                          |
+=========================================================================+
```

---

## PHASE 5: PRIORITY ACTION LIST

### P0 — Critical (Major feature gaps, high user impact)

| # | Component/Feature | Action | Endpoints | Notes |
|---|-------------------|--------|-----------|-------|
| 1 | **Notification Center** | CREATE | 28 | Bell icon + dropdown + preferences + SSE real-time |
| 2 | **Bulk Import Wizard** | CREATE | 26 | File upload, column mapping, validation, commit |
| 3 | **Ownership & Assignment** | CREATE | 28 | Assign/transfer/delegate, workload balancing |
| 4 | **Email Compose & Inbox** | CREATE | 15 | Compose dialog, thread view, within entity detail |
| 5 | **Email Campaigns** | CREATE | 11 | Campaign builder, recipients, lifecycle, stats |
| 6 | **Approval Workflows UI** | CREATE | 10 | Approval inbox, rule builder, pending actions |

### P1 — High (Important features with backend ready)

| # | Component/Feature | Action | Endpoints | Notes |
|---|-------------------|--------|-----------|-------|
| 7 | **Comments System** | CREATE | 5 | Threaded comments on entity detail pages |
| 8 | **Follow-ups Manager** | CREATE | 10 | Overdue tracking, snooze, reassign |
| 9 | **Performance & Targets** | CREATE | 7 | Team leaderboard, target CRUD, tracking |
| 10 | **Custom Fields Settings** | CREATE | 8 | Field definition CRUD, form schema preview |
| 11 | **Bulk Export** | CREATE | 4 | Export buttons on list pages, job tracking |
| 12 | **Product Pricing** | CREATE | 9 | Price lists, group/slab pricing |
| 13 | **Brands Management** | CREATE | 11 | Brand CRUD + product linking |
| 14 | **Manufacturers Mgmt** | CREATE | 11 | Manufacturer CRUD + product linking |
| 15 | **Saved Filters** | CREATE | 6 | Save/load entity filters on list pages |

### P2 — Medium (Enhancements to existing UI)

| # | Component/Feature | Action | Endpoints | Notes |
|---|-------------------|--------|-----------|-------|
| 16 | **Quotation AI Assist** | CREATE | 3 | AI predict/generate in quotation form |
| 17 | **Quotation Analytics** | CREATE | 6 | Analytics tab on quotations |
| 18 | **Quotation Templates** | CREATE | 4 | Template picker in quotation create |
| 19 | **Calendar Enhancement** | UPDATE | 20+ | Add event CRUD, availability, iCal sync |
| 20 | **Product Enhancements** | UPDATE | 5+ | Image management, relations, tax (HSN) |
| 21 | **Customer Price Groups** | CREATE | 8 | Price group CRUD in settings |
| 22 | **Business Locations** | CREATE | 10 | Connect to existing locations page |
| 23 | **Business Types** | CREATE | 11 | Business type settings |
| 24 | **Contact-Org Links** | CREATE | 8 | Relationship management in detail pages |
| 25 | **Receipts** | CREATE | 4 | Receipt view/download in payments |
| 26 | **Reminders** | CREATE | 5 | Reminder widget/management |
| 27 | **Recurrence Picker** | CREATE | 5 | Recurrence pattern selector for activities |

### P3 — Low (Platform/advanced features, future scope)

| # | Component/Feature | Action | Endpoints | Notes |
|---|-------------------|--------|-----------|-------|
| 28 | **Marketplace UI** | CREATE | 42 | Listings, orders, enquiries (may be separate app) |
| 29 | **Plugin Store** | CREATE | 11 | Plugin catalog, install, configure |
| 30 | **API Gateway Admin** | CREATE | 41 | API key mgmt, webhooks, logs |
| 31 | **Offline Sync Admin** | CREATE | 27 | Sync policies, device management |
| 32 | **Verification Service** | CREATE | 8 | Email/mobile/GST verification flows |
| 33 | **User Overrides** | CREATE | 5 | Permission overrides in user settings |
| 34 | **Help System** | CREATE | 8 | Contextual help articles |
| 35 | **Email Tracking** | CREATE | 3 | Open/click/bounce dashboard |
| 36 | **Menu Permissions Matrix** | UPDATE | 5+ | Full matrix view for role permissions |

---

## EXECUTION ORDER

### Sprint 1: Core User Experience (P0)
```
[ ] 1. Notification Center (bell icon, dropdown, preferences, SSE)
[ ] 2. Bulk Import Wizard (upload, map, validate, commit)
[ ] 3. Email Compose & Inbox (compose dialog, threads, entity context)
[ ] 4. Ownership & Assignment (assign, transfer, workload)
[ ] 5. Email Campaigns (builder, recipients, lifecycle)
[ ] 6. Approval Workflows UI (inbox, rule builder)
```

### Sprint 2: Productivity Features (P1)
```
[ ] 7. Comments System (threaded, on entity detail pages)
[ ] 8. Follow-ups Manager (overdue, snooze, reassign)
[ ] 9. Performance & Targets (leaderboard, targets, tracking)
[ ] 10. Custom Fields Settings (field CRUD, form preview)
[ ] 11. Bulk Export (buttons on list pages)
[ ] 12. Saved Filters (save/load on list pages)
```

### Sprint 3: Product Catalog (P1)
```
[ ] 13. Product Pricing (price lists, group/slab pricing)
[ ] 14. Brands Management (CRUD + linking)
[ ] 15. Manufacturers Management (CRUD + linking)
```

### Sprint 4: Sales Enhancements (P2)
```
[ ] 16. Quotation AI Assist
[ ] 17. Quotation Analytics
[ ] 18. Quotation Templates
[ ] 19. Receipts (view/download)
[ ] 20. Contact-Organization Linking
```

### Sprint 5: Settings & Config (P2)
```
[ ] 21. Calendar Enhancement (events, availability, iCal)
[ ] 22. Product Enhancements (images, relations, HSN)
[ ] 23. Customer Price Groups
[ ] 24. Business Locations (connect to page)
[ ] 25. Business Types
[ ] 26. Reminders & Recurrence
```

### Sprint 6: Platform Features (P3)
```
[ ] 27. Marketplace UI
[ ] 28. Plugin Store
[ ] 29. API Gateway Admin
[ ] 30. Offline Sync Admin
[ ] 31. Verification Service
[ ] 32-36. User Overrides, Help, Email Tracking, Menu Permissions
```

---

## SUMMARY

| Metric | Value |
|--------|-------|
| **Total CREATE actions** | 31 new services/components |
| **Total UPDATE actions** | 5 existing components |
| **Total SKIP** | 36 modules (already complete) |
| **Missing endpoints to cover** | ~406 |
| **Current endpoint coverage** | 64% |
| **Target after all sprints** | 95%+ |
