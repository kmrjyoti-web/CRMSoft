# SDK Restructure Audit

**Date:** 2026-04-29  
**Branch:** development/wl-platform-v2  
**Type:** Documentation Only — No Code Changes  
**Analyst:** Claude Code (Sonnet 4.6)

---

## Executive Summary

CRMSoft is a large NestJS monolith with 179,818 lines of TypeScript across 8 top-level modules. The codebase has natural domain boundaries already visible in folder structure and prisma schema splits, but the runtime coupling (especially PrismaService: 839 imports) makes SDK extraction non-trivial. A phased approach starting with marketplace-sdk (cleanest DB boundary) is recommended.

---

## Phase 1: Structure Map

### Module Overview

| Module | Files | LOC | % of Total | Notes |
|---|---|---|---|---|
| `customer` | 1,402 | 77,826 | 43% | The main monolith — 50 sub-modules |
| `core` | 441 | 30,173 | 17% | Auth, tenant, audit, cache, notifications |
| `softwarevendor` | 293 | 27,949 | 16% | SaaS config, API gateway, workflows |
| `ops` | 141 | 8,893 | 5% | Test infra, DB maintenance, backup |
| `marketplace` | 133 | 8,596 | 5% | Listings, feed, reviews, offers |
| `platform-console` | 73 | 7,386 | 4% | Brand config, CI/CD, vertical manager |
| `customer-portal` | 60 | 3,013 | 2% | B2C portal (separate auth) |
| `plugins` | 19 | 2,005 | 1% | Plugin handler system |
| **TOTAL** | **2,562** | **179,818** | **100%** | |

### WhiteLabel API (Separate Service)
| App | LOC | Modules |
|---|---|---|
| `WhiteLabel/wl-api` | 3,399 | 20 modules (auth, billing, branding, deployments, domains, partners, pricing, provisioning, scaling, webhooks…) |

> WL-API is already an independent NestJS service — proof the separation pattern works.

---

### Customer Module: Top 20 Sub-modules

| Sub-module | Files | LOC | SDK Target |
|---|---|---|---|
| `mis-reports` | 87 | 12,085 | crm-sdk |
| `email` | 111 | 4,341 | comms-sdk |
| `whatsapp` | 114 | 3,978 | comms-sdk |
| `bulk-import` | 68 | 3,590 | crm-sdk |
| `payment` | 27 | 3,289 | finance-sdk |
| `calendar` | 26 | 3,229 | crm-sdk |
| `quotations` | 74 | 3,195 | finance-sdk |
| `inventory` | 18 | 2,884 | crm-sdk |
| `documents` | 76 | 2,869 | crm-sdk |
| `accounts` | 13 | 2,664 | crm-sdk |
| `document-templates` | 14 | 2,358 | crm-sdk |
| `ownership` | 64 | 2,320 | crm-sdk |
| `procurement` | 11 | 2,125 | finance-sdk |
| `dashboard` | 52 | 2,090 | crm-sdk |
| `tasks` | 48 | 2,020 | crm-sdk |
| `leads` | 44 | 1,893 | crm-sdk |
| `sales` | 8 | 1,751 | finance-sdk |
| `raw-contacts` | 45 | 1,678 | crm-sdk |
| `contacts` | 35 | 1,436 | crm-sdk |
| `wallet` | 17 | 1,404 | finance-sdk |

### Softwarevendor Module: Key Sub-modules

| Sub-module | Files | LOC | SDK Target |
|---|---|---|---|
| `offline-sync` | 23 | 3,073 | platform-sdk |
| `api-gateway` | 36 | 2,819 | core-sdk (gateway layer) |
| `self-hosted-ai` | 9 | 2,761 | platform-sdk |
| `cron-engine` | 19 | 2,633 | core-sdk |
| `workflows` | 72 | 2,560 | platform-sdk |
| `tenant-config` | 19 | 2,272 | core-sdk |
| `control-room` | 6 | 1,913 | platform-sdk |
| `cfg-vertical` | 3 | 101 | core-sdk (config only) |

---

## Phase 2: Coupling Analysis

### Service Import Frequency (Top 10)

| Service | Import Count | Coupling Level | Notes |
|---|---|---|---|
| `PrismaService` | **839** | CRITICAL | Working-DB client — universal dependency |
| `DrillDownService` | 53 | HIGH | Reporting/analytics across modules |
| `MktPrismaService` | 48 | HIGH | Marketplace DB client |
| `PlatformConsolePrismaService` | 38 | HIGH | Platform-console DB client |
| `ConfigService` | 26 | MEDIUM | NestJS ConfigModule — easy to extract |
| `CrossService` | 18 | HIGH | Cross-module service calls |
| `CrossDbResolverService` | 18 | HIGH | Cross-DB query resolver |
| `OwnershipCoreService` | 16 | MEDIUM | Ownership checks throughout CRM |
| `EncryptionService` | 14 | MEDIUM | core-sdk candidate |
| `NotificationCoreService` | 13 | MEDIUM | core-sdk candidate |

### Core Module Coupling
- **48 files** across all modules import from `modules/core` directly
- Top imported paths from core: `cache`, `tenant-context`, `notifications`, `settings`, `menus`

### Cross-Module Import Map (Top paths)
```
modules/core/cache/cache                          ×5
modules/platform-console/prisma/...               ×4
modules/core/identity/tenant/infrastructure/...   ×4
modules/softwarevendor/tenant-config/...          ×3
modules/softwarevendor/control-room/...           ×3
modules/customer/tasks/...                        ×3
modules/customer/calendar/...                     ×3
modules/core/identity/menus/...                   ×3
modules/core/identity/settings/...                ×3
```

### Coupling Level: **HIGH**
Primary reason: PrismaService (839 imports) is the structural backbone — any SDK split requires solving DB client isolation first (already partially done via multi-client architecture).

---

## Phase 3: SDK Boundary Identification

### @crmsoft/core-sdk (Candidates)

**Auth & Security (apps-backend/api/src/common/):**
- Guards: `jwt-auth.guard`, `roles.guard`, `user-type.guard`, `plan.guard`, `business-mode.guard`
- Decorators: `current-user.decorator`, `roles.decorator`, `user-type.decorator`, `cross-service.decorator`
- Swagger helpers: `api-error.decorator`, `api-paginated.decorator`, `api-success.decorator`

**Permission System (apps-backend/api/src/core/permissions/):**
- Guards: `menu-permission.guard`, `ownership.guard`, `permission-policy.guard`
- Decorators: `require-approval`, `require-menu-permission`, `require-ownership`, `require-permissions`

**Tenant Infrastructure (modules/core/identity/tenant/infrastructure/):**
- Guards: `feature-flag.guard`, `module-access.guard`, `plan-limit.guard`, `super-admin.guard`, `tenant.guard`, `vendor.guard`
- Decorators: `check-limit`, `require-feature`, `require-module`, `super-admin-route`
- Context: `TenantContext` (11 consumers)

**Shared Services:**
- `CacheService` (modules/core/cache)
- `EncryptionService`
- `NotificationCoreService`
- `CrossDbResolverService` (critical — 18 consumers)
- `CrossService` (18 consumers)
- Health check (modules/core/health)

**Estimated size:** ~200 files extracted  
**LOC:** ~8,000-12,000 lines

---

### @crmsoft/crm-sdk (Candidates)

**Core CRM Entities:**
- `contacts`, `raw-contacts`, `organizations`, `contact-organizations`
- `leads`, `activities`, `tasks`, `task-logic`
- `calendar`, `calendar-highlights`, `follow-ups`, `reminders`, `recurrence`
- `products`, `product-pricing`, `product-tax`, `product-units`, `manufacturers`, `price-lists`, `customer-price-groups`
- `approval-requests`, `approval-rules`
- `ownership`

**Supporting CRM:**
- `accounts`, `dashboard`, `documents`, `document-templates`
- `bulk-import`, `bulk-export`, `saved-filters`, `recycle-bin`
- `entity-verification`, `demos`, `tour-plans`, `mis-reports`
- `brands` (CRM brand view, not platform brands)

**Finance (optional: carve out as @crmsoft/finance-sdk):**
- `quotations`, `sales`, `payment`, `procurement`, `wallet`, `inventory`

**Comms (optional: carve out as @crmsoft/comms-sdk):**
- `email`, `whatsapp`, `communications`, `support`

**Estimated size:** ~1,100 files  
**LOC:** ~60,000-65,000 lines  
**Risk:** HIGH (50 sub-modules with unknown internal coupling)

---

### @crmsoft/marketplace-sdk (Candidates)

All under `modules/marketplace/`:
- `listings`, `feed`, `reviews`, `offers`, `enquiries`, `requirements`
- `analytics`, `services`, `storage`

**Estimated size:** 133 files  
**LOC:** 8,596 lines  
**Risk:** LOW — has its own DB (marketplace.prisma, 13 models), separate Prisma client (MktPrismaService)

---

### @crmsoft/platform-sdk (Candidates)

From `modules/softwarevendor/`:
- `workflows`, `offline-sync`, `self-hosted-ai`, `control-room`
- `business-locations`, `business-type`, `subscription-package`
- `verification`, `version-control`, `db-auditor`, `ai`
- `keyboard-shortcuts`, `google`, `departments`, `designations`

From `modules/platform-console/`:
- `brand-config`, `brand-manager`, `cicd`, `health-monitor`
- `menu-management`, `security`, `test-center`, `version-manager`, `vertical-manager`

**Estimated size:** ~366 files  
**LOC:** ~35,335 lines

---

### Vertical Code: Already Config-Driven

**Finding:** No `vertical/` directory exists. Verticals are implemented via:
- `softwarevendor/cfg-vertical/` — only **101 lines**, configuration-only
- `platform-console/vertical-manager/` — vertical provisioning (platform side)
- The `verticalCode` string field appears in platform schemas as a foreign key alternative

**Implication:** Vertical isolation is **NOT a code-split problem** — it's already a runtime config problem. Each vertical gets its own DB schema + config. No vertical-specific code extraction needed.

---

## Phase 4: Database Coupling

### Database Architecture

| Database | Schema Location | Models | Purpose |
|---|---|---|---|
| **identity** | `prisma/identity/v1/*.prisma` | 56 models | Users, company, auth, licensing, profiles |
| **working** | `prisma/working/v1/*.prisma` | 228 models | All CRM/business data (per-tenant) |
| **marketplace** | `prisma/marketplace/v1/*.prisma` | 13 models | Marketplace (shared/cross-tenant) |
| **platform-console** | `prisma/platform-console/v1/*.prisma` | 48 models | Infra, devops, testing, vertical config |
| **platform** | `prisma/platform/v1/*.prisma` | 66 models | Modules, subscriptions, vendors, testing |
| **global** | `prisma/global/v1/*.prisma` | 12 models | Reference data (Indian states, ISO codes) |
| **wl-api** | `WhiteLabel/wl-api/prisma/schema.prisma` | 21 models | White-label partner/provisioning |

### Working DB Domain Split (228 models)

| Domain Schema | Models |
|---|---|
| `crm.prisma` | 44 |
| `config.prisma` | 50 |
| `inventory.prisma` | 31 |
| `communication.prisma` | 21 |
| `accounts.prisma` | 16 |
| `sales.prisma` | 17 |
| `documents.prisma` | 12 |
| `workflow.prisma` | 10 |
| `notifications.prisma` | 7 |
| `audit.prisma` | 7 |
| `payments.prisma` | 5 |
| `reports.prisma` | 5 |
| `tax.prisma` | 3 |

### Cross-DB Coupling Pattern
- **String codes** used for cross-DB references (no FK joins across DBs) — **GOOD for SDK split**
- `brandCode`, `verticalCode`, `partnerCode`, `tenantCode` fields act as soft foreign keys
- Each DB client is a separate Prisma client (per memory: 7 clients already)

### DB Coupling Level: **LOW** (already string-reference pattern)

---

## Phase 5: Effort Estimate

### SDK Extraction Phases

| Phase | Scope | Effort | Risk | Notes |
|---|---|---|---|---|
| Phase 1 | Audit + Plan | **DONE** | — | This document |
| Phase 2 | @crmsoft/core-sdk | **5-7 days** | MEDIUM | Unblocks all other phases; PrismaService isolation first |
| Phase 3 | @crmsoft/marketplace-sdk | **3-4 days** | LOW | Cleanest boundary; own DB already separate |
| Phase 4 | @crmsoft/crm-sdk | **10-14 days** | HIGH | Largest module; needs internal coupling audit |
| Phase 5 | @crmsoft/platform-sdk | **7-10 days** | MEDIUM | softwarevendor + platform-console |
| Phase 6 | Monorepo tooling (nx/turborepo) | **3-5 days** | MEDIUM | Required infrastructure for SDK publishing |
| Phase 7 | Vertical isolation | **0 days** | NONE | Already config-driven — no code split needed |

**TOTAL: 28–40 days**  
*(Parallelizable: Phase 3 + Phase 5 can run concurrently after Phase 2)*

---

## Full Audit Report

```
┌──────────────────────────────────────────────────────────────────┐
│ SDK RESTRUCTURE AUDIT REPORT                                     │
├──────────────────────────────────────────────────────────────────┤
│ Total top-level modules:    8 (+ WL-API as separate service)    │
│ Total LOC (backend):        179,818 lines                        │
│ Total files (backend):      2,562 TypeScript files               │
│ Total DTOs/enums/interfaces: 346 files                           │
├──────────────────────────────────────────────────────────────────┤
│ Verticals identified:       Config-driven (not code-split)       │
│                             cfg-vertical: 101 lines              │
│                             vertical-manager: platform-console   │
├──────────────────────────────────────────────────────────────────┤
│ Cross-module coupling:      HIGH                                 │
│   - PrismaService: 839 imports (critical path)                   │
│   - core module: 48 direct consumers                             │
│   - CrossService/CrossDbResolver: 35+ consumers                  │
├──────────────────────────────────────────────────────────────────┤
│ DB cross-references:        String-based (GOOD for SDK split)    │
│   - 7 separate Prisma clients already exist                      │
│   - 4 primary + 3 secondary databases                            │
│   - Marketplace already has own DB (cleanest split target)       │
├──────────────────────────────────────────────────────────────────┤
│ Phase 1 (audit + plan):           DONE today                    │
│ Phase 2 (core-sdk extraction):    5-7 days                       │
│ Phase 3 (marketplace-sdk):        3-4 days                       │
│ Phase 4 (crm-sdk extraction):     10-14 days                     │
│ Phase 5 (platform-sdk):           7-10 days                      │
│ Phase 6 (monorepo tooling):       3-5 days                       │
│ Phase 7 (vertical isolation):     0 days (already config-driven) │
├──────────────────────────────────────────────────────────────────┤
│ TOTAL EFFORT:     28–40 days (parallelizable to ~25-30)          │
│ RISK LEVEL:       HIGH (customer module = 43% of codebase)       │
│ RECOMMENDATION:   PHASED — marketplace first, crm-sdk last       │
└──────────────────────────────────────────────────────────────────┘
```

---

## Recommended Execution Order

### Step 1: Monorepo Tooling (Prerequisite, 3-5 days)
Set up nx or turborepo workspace. Define package boundaries. Configure shared tsconfig, build pipeline. Without this, SDK packages can't be published/consumed.

### Step 2: @crmsoft/marketplace-sdk (3-4 days)
**Why first:** Lowest risk. Already has its own DB (13 models), own PrismaService (MktPrismaService), isolated functionality. Proves the pattern for the team.  
**What:** Extract `modules/marketplace/` → `packages/marketplace-sdk/`

### Step 3: @crmsoft/core-sdk (5-7 days)
**Why second:** Unblocks all other extractions. All auth guards, decorators, TenantContext, CacheService, EncryptionService, NotificationCoreService, CrossDbResolverService.  
**What:** Extract `src/common/` + `src/core/permissions/` + core identity infrastructure → `packages/core-sdk/`

### Step 4: @crmsoft/crm-sdk (10-14 days)
**Why last:** Highest risk and biggest value. The 50 sub-modules likely have heavy internal cross-imports that need to be audited before extraction.  
**Prerequisite:** Run cross-import audit within customer module first (1 day sub-task).  
**What:** Extract `modules/customer/` (minus comms/finance sub-modules) → `packages/crm-sdk/`

### Step 5: @crmsoft/platform-sdk (7-10 days, parallel with Step 4)
Extract `modules/softwarevendor/` + `modules/platform-console/` → `packages/platform-sdk/`

---

## Key Risks

| Risk | Severity | Mitigation |
|---|---|---|
| PrismaService 839 imports — monolithic DB client | HIGH | Already partially solved (7 clients); finish client isolation before SDK split |
| Customer module internal coupling (50 sub-modules, 77k LOC) | HIGH | Run internal cross-import audit before crm-sdk extraction |
| No monorepo tooling yet (nx/turborepo) | MEDIUM | Phase 6 must be first actual implementation step |
| CrossDbResolverService touching 18 modules | MEDIUM | Extract to core-sdk first; all other SDKs depend on it |
| Ops module (test runner, backup) — belongs nowhere | LOW | Keep in main app; not SDK material |

---

## What Does NOT Need SDK Extraction

- `modules/ops/` — test infrastructure, belongs in the monorepo app only
- `modules/plugins/` — runtime plugin handlers, app-specific  
- `modules/customer-portal/` — separate auth context, keep as standalone module
- Vertical code — already config-driven, no split needed

---

*Generated: 2026-04-29 | Branch: development/wl-platform-v2 | No code was modified*
