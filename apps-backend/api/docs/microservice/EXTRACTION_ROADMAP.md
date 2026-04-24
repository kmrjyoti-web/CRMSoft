# CRMSoft — Microservice Extraction Roadmap

**Last updated:** 2026-03-20
**Branch:** `feature/microservice-boundary-prep`
**Status:** Monolith — boundaries clean, extraction is ready when needed

---

## Current State: Production-Ready Monolith

CRMSoft runs as a well-structured monolith with three clean service boundaries,
each using its own Prisma client and database schema.

| Boundary   | Modules | Source Files | Database      | Bootstrap | Business-Logic Cross-Deps |
|------------|:-------:|:------------:|---------------|:---------:|:-------------------------:|
| **Vendor** |   24    |    328       | PlatformDB    |    ✅     | 7 (→ Work), 0 (→ Identity)|
| **Identity**|   7    |    308       | IdentityDB    |    ✅     | 1 (→ Vendor, seed data)   |
| **Work**   |   50    |   1417       | WorkingDB     |    ✅     | 12 (→ Identity), 3 (→ Vendor)|

**Cross-service dependency totals (from `docs/microservice/cross-service-deps.json`):**
- Total dependencies scanned: **134**
- Infrastructure (shared decorators/guards — move to shared-lib): **111**
- Business-logic (must become API calls at extraction): **23**
- Annotation coverage: **100%** (all annotated with `@CrossService`)

Bootstrap test: `npm run test:microservice-bootstrap` → **3/3 ✅**

---

## Extraction Triggers

**Do NOT extract a service unless at least one trigger is met.**
Premature extraction adds operational complexity without user-visible benefit.

| Trigger | Metric | Threshold | Which Service |
|---------|--------|-----------|---------------|
| Concurrent users | Active sessions | > 10,000 | Identity first |
| Deployment frequency | Team deploys/week | > 3 independent teams | Any |
| Working DB size | Total rows across customer tables | > 10M | Work |
| AI compute cost | GPU inference hours/month | > $500 | Vendor (AI module) |
| Team size | Backend developers | > 8 with separate ownership | Split by boundary |
| Compliance requirement | Auth/identity isolation mandate | Regulatory requirement | Identity |

---

## Extraction Order

### 1. Identity Service (extract first)

**Why first:**
- Lowest inbound business-logic deps (other services only READ from it)
- Smallest source footprint (7 modules, 308 files)
- Highest security benefit — isolates auth and permission logic
- Enables GDPR/compliance isolation of user PII

**Scope:**
`src/core/auth/`, `src/core/permissions/`, `src/modules/core/identity/`

**Steps:**
1. Create new repository `crm-identity-service`
2. Copy boundary source + `prisma/schema.identity.prisma`
3. Expose REST/gRPC endpoints for `IIdentityService` contract
4. In Work/Vendor services: swap `IdentityServiceMonolith` → `IdentityServiceHttpClient`
5. Remove `PermissionsCoreModule` from Work/Vendor (replace APP_GUARD with JWT validation calls)
6. Deploy Identity service, update env vars, run bootstrap test
7. Remove identity modules from monolith

**Stubs already in place:**
`WorkServiceModule`, `VendorServiceModule` — `MakerCheckerEngine`, `UbacEngine`, `RbacEngine` stubbed

---

### 2. Vendor Service (extract second)

**Why second:**
- Read-heavy — tenants mostly read config, not write
- Separate release cycle from CRM features
- Small team owns it (platform/admin team)

**Scope:**
`src/modules/softwarevendor/`, `src/modules/plugins/`, `src/modules/marketplace/`, `src/modules/core/platform/`

**Steps:**
1. Create new repository `crm-vendor-service`
2. Copy boundary source + `prisma/schema.platform.prisma`
3. Expose REST/gRPC endpoints for `IVendorService` contract
4. Refactor `CronEngineModule` — replace `CalendarModule` + `NotificationsModule` imports with event subscriptions
5. In Work service: swap `VendorServiceMonolith` → `VendorServiceHttpClient`
6. Deploy Vendor service, update env vars, run bootstrap test
7. Remove vendor modules from monolith

**Modules requiring refactoring before extraction:**
- `CronEngineModule` → imports `CalendarModule` (Work) + `NotificationsModule` (Work) at module level
- Recommendation: convert to event-driven (subscribe to `CalendarEventDue` integration event)

**Stubs already in place:**
`WorkServiceModule` — `TableConfigModule`, `TenantConfigModule`, `ControlRoomModule` included only for test

---

### 3. Work Service (extract last — or split)

**Why last:**
- Largest boundary (50 modules, 1417 files)
- Highest internal coupling across customer modules
- Most cross-service business-logic inbound deps

**Scope:**
`src/core/workflow/`, `src/modules/core/work/`, `src/modules/customer/`

**If the team grows, consider splitting Work into sub-services:**

| Sub-service | Modules |
|-------------|---------|
| CRM Core | contacts, organizations, leads, raw-contacts, communications |
| Transactions | quotations, sales, procurement, accounts, payment, wallet, inventory |
| Feature Modules | activities, calendar, tasks, follow-ups, tour-plans, demos, reminders |
| Analytics | dashboard, mis-reports, bulk-import, bulk-export |
| Support | support, amc-warranty, entity-verification, documents |

**Steps:**
1. Resolve cross-boundary module imports:
   - `PaymentModule` → remove `SettingsModule` import, inject via `IIdentityService`
   - Contact/Leads/Orgs/Activities → remove `TableConfigModule` import, inject via `IVendorService`
   - `EmailModule` → remove `TenantConfigModule` import, inject via `IVendorService`
   - `RawContactsModule` → remove `ControlRoomModule` import, inject via `IVendorService`
2. Replace `AutoNumberService` direct injection with `IIdentityService.getNextSequence()`
3. Replace `CompanyProfileService` direct injection with `IIdentityService.getCompanyProfile()`
4. Create new repository `crm-work-service`
5. Deploy, test, cut over

**Modules requiring refactoring before extraction:**
- `PaymentModule` → imports `SettingsModule` (Identity)
- `LeadsModule`, `ContactsModule`, `OrganizationsModule`, `ActivitiesModule` → import `TableConfigModule` (Vendor)
- `EmailModule` → imports `TenantConfigModule` (Vendor)
- `RawContactsModule` → imports `ControlRoomModule` (Vendor)

---

## What's Already Done (as of 2026-03-20)

| Item | Status | Reference |
|------|--------|-----------|
| 3-database architecture (identity, platform, working) | ✅ | `prisma/schema.prisma` |
| 3 Prisma clients with clean isolation | ✅ | `src/core/prisma/prisma.service.ts` |
| CQRS + DDD on all 81 modules | ✅ | all `*.module.ts` files |
| `@CrossService` decorator — 100% annotation coverage | ✅ | `MS1` commit |
| Cross-service dependency report | ✅ | `npm run report:cross-service` |
| Dependency-cruiser boundary rules (4 rules, severity warn) | ✅ | `.dependency-cruiser.js` |
| Independent bootstrap test — 3/3 ✅ | ✅ | `npm run test:microservice-bootstrap` |
| `IIdentityService` interface + monolith implementation | ✅ | `src/common/cross-service/` |
| `IVendorService` interface + monolith implementation | ✅ | `src/common/cross-service/` |
| Integration event types (6 events) | ✅ | `src/common/cross-service/events/` |
| `CrossServiceModule` — @Global, registered in AppModule | ✅ | `X6-3` commit |
| Service module test files (vendor/identity/work) | ✅ | `src/*-service.module.ts` |

---

## Infrastructure Requirements (when extracting)

| Component | Current (Monolith) | Needed for Microservices |
|-----------|-------------------|--------------------------|
| Message Broker | None (EventBus in-process) | RabbitMQ / Redis Streams |
| API Gateway | NestJS `@nestjs/serve-static` | Kong / AWS API Gateway / Nginx |
| Service Discovery | N/A | Consul / K8s DNS / AWS Cloud Map |
| Distributed Tracing | None | Jaeger / OpenTelemetry |
| Config Management | `.env` files | Vault / AWS SSM Parameter Store |
| Container Orchestration | Docker Compose | Kubernetes / AWS ECS |
| Service Mesh | N/A | Istio / AWS App Mesh (optional) |

---

## Extraction Cost Estimate

| Phase | Effort | Risk |
|-------|--------|------|
| Identity extraction | 3–5 sprints | Low (7 modules, 0 business-logic stubs needed) |
| Vendor extraction | 3–5 sprints | Medium (CronEngineModule refactor required) |
| Work extraction | 6–10 sprints | High (50 modules, cross-module imports to resolve) |
| Infrastructure setup | 2–4 sprints | Medium |
| **Total** | **14–24 sprints** | — |

**Recommendation: extract only if at least one trigger metric is breached.**
A well-structured monolith is operationally simpler and costs less to run than microservices for most CRM deployments up to ~50K tenants or ~500 concurrent users.
