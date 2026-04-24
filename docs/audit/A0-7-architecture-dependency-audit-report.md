# A0-7: Architecture Dependency Audit Report
## CRMSoft — Phase 0 Audit

**Date:** 2026-03-18
**Auditor:** Claude Code (automated scan)
**Scope:** `API/src/` — module dependency graph, circular deps, DDD layer violations, god objects

---

## SCORECARD

| Dimension | Score | Status |
|-----------|-------|--------|
| Circular Dependencies | 10/10 | ✅ Zero circular deps detected |
| DDD Layer Isolation | 6/10 | ⚠️ 28 presentation→infrastructure violations |
| Module Coupling | 7/10 | ⚠️ Mostly decoupled; `tenant` is a hub |
| God Object Density | 5/10 | 🔴 15 god services (>400 LOC), 6 god controllers (>300 LOC) |
| DDD Adoption Progress | 6/10 | ⚠️ 8 full DDD / 66 partial CQRS / 4 flat |
| Architecture Consistency | 5/10 | 🔴 Wildly inconsistent module structures |
| **OVERALL** | **6.5/10** | ⚠️ |

**CRITICAL: 2 | WARNING: 4 | INFO: 3**

---

## 1. CIRCULAR DEPENDENCY ANALYSIS

### ✅ Zero Circular Dependencies

Madge static analysis processed **2,367 TypeScript files** across the entire backend codebase and found **zero circular imports**.

```
Tool: madge --circular --ts-config tsconfig.json src/
Result: Processed 2367 files (3.8s) — NO circular dependencies reported
```

This is a strong positive signal: the module graph has no circular dependency issues that would cause initialization order problems or testing complexity.

---

## 2. DDD MODULE ADOPTION

### Module Classification (78 total modules)

| Category | Count | Description |
|----------|-------|-------------|
| **Full DDD** (all 4 layers) | **8** | `domain/`, `application/`, `infrastructure/`, `presentation/` all present |
| **Partial CQRS** (some layers) | **66** | Mix of service, application, and presentation layers |
| **Flat Service-Pattern** | **4** | Traditional NestJS flat structure |

### Full DDD Modules (8)
```
activities          contacts             leads
communications      organizations        raw-contacts
contact-organizations  settings
```
These are the target architecture exemplars for Phase 3 migration.

### Partial CQRS Modules (66) — Key examples
| Module | Layers Present | Gap |
|--------|---------------|-----|
| `accounts` | `presentation/` | Missing `application/`, `domain/`, `infrastructure/` |
| `bulk-import` | `application/`, `presentation/` | Missing `domain/`, `infrastructure/` |
| `quotations` | `application/`, `presentation/` | Missing `domain/`, `infrastructure/` |
| `mis-reports` | `application/`, `infrastructure/`, `presentation/` | Missing `domain/` |
| `tenant` | `application/`, `infrastructure/`, `presentation/` | Missing `domain/` |
| `workflows` | `application/`, `presentation/` | Missing `domain/`, `infrastructure/` |
| `payment` | `presentation/` + services | Missing all CQRS layers |
| `procurement` | `presentation/` + services | Missing all CQRS layers |
| `inventory` | `presentation/` + services | Missing all CQRS layers |

### Flat Service-Pattern (4)
```
calendar-highlights    google    recycle-bin    search
```

---

## 3. LAYER VIOLATION ANALYSIS

### 🔴 CRITICAL: 28 Presentation → Infrastructure Direct Imports

DDD mandates: Presentation layer must NOT import from Infrastructure. Controllers should depend on Application commands/queries/services — not repositories directly.

#### Violations by Module

| Module | Violations | Severity |
|--------|-----------|----------|
| `tenant` | 25 | 🔴 CRITICAL — All vendor controllers import repos directly |
| `mis-reports` | 3 | ⚠️ WARNING — Report controllers import infra directly |

#### Tenant Module Violations (25 files)
```
presentation/vendor-dashboard.controller.ts
presentation/vendor-modules.controller.ts
presentation/vendor-dev-requests.controller.ts
presentation/vendor-tenants.controller.ts
presentation/vendor-wallet.controller.ts
presentation/tenant-profile.controller.ts
presentation/license.controller.ts
presentation/software-offer.controller.ts
presentation/vendor-audit-logs.controller.ts
presentation/plan-admin.controller.ts
... (15 more)
```

All `tenant/presentation/` controllers import `infrastructure/` repositories directly, bypassing the application layer entirely. This negates the DDD architecture for the tenant module.

#### MIS Reports Violations (3 files)
```
presentation/reports.controller.ts
presentation/daily-digest.controller.ts
presentation/custom-report.controller.ts
```

---

## 4. GOD OBJECT ANALYSIS

### 🔴 CRITICAL: God Services (15 services > 400 LOC)

| Service | LOC | Module | Problem |
|---------|-----|--------|---------|
| `entity-verification.service.ts` | **730** | entity-verification | Monolithic verification engine |
| `auth.service.ts` | **666** | core/auth | 10+ responsibilities in one class |
| `workflow-ai.service.ts` | **628** | workflows | AI+workflow logic combined |
| `menu-permission.service.ts` | **577** | menus | Menu + RBAC + rendering mixed |
| `module-registry.service.ts` | **507** | tenant | Module management monolith |
| `control-room.service.ts` | **468** | control-room | Mixed admin concerns |
| `ai-chat.service.ts` | **463** | self-hosted-ai | Chat + LLM + context combined |
| `crm-data-agent.service.ts` | **448** | self-hosted-ai | Data agent monolith |
| `proforma-invoice.service.ts` | **442** | payment | PDF + GST + email mixed |
| `availability.service.ts` | **441** | calendar | Calendar availability monolith |
| `invoice.service.ts` | **434** | payment | Invoice + PDF + tax mixed |
| `package-builder.service.ts` | **433** | tenant | Package assembly monolith |
| `ledger.service.ts` | **419** | accounts | Accounting ledger monolith |
| `ai-training.service.ts` | **409** | self-hosted-ai | Training pipeline monolith |
| `credential-schema.service.ts` | **401** | tenant-config | Schema validation monolith |

**Total: 15 god services**, all violations of Single Responsibility Principle.

### ⚠️ God Controllers (6 controllers > 300 LOC)

| Controller | LOC | Module | Problem |
|------------|-----|--------|---------|
| `accounts.controller.ts` | **707** | accounts | 57 endpoints in one controller |
| `procurement.controller.ts` | **605** | procurement | 41 endpoints in one controller |
| `sales.controller.ts` | **419** | sales | 30 endpoints in one controller |
| `self-hosted-ai.controller.ts` | **414** | self-hosted-ai | 36 endpoints in one controller |
| `inventory.controller.ts` | **365** | inventory | 26 endpoints in one controller |
| `marketplace-feed.controller.ts` | **301** | marketplace | 24 endpoints in one controller |

Controllers above 200 LOC are a maintenance red flag — they typically indicate missing command/query decomposition.

---

## 5. MODULE COUPLING ANALYSIS

### Dependency Graph Summary

Static analysis (module.ts imports across `src/modules`):
- Cross-module imports are low — most modules are self-contained
- `tenant` module is the most imported hub (referenced by multiple infrastructure layers)
- `menus` and `business-type` are secondary hubs
- No deeply nested import chains detected

### Module Cohesion Issues

| Module | Issue |
|--------|-------|
| `tenant` | 174 endpoints across 15+ controllers — should be split into `vendor-management`, `subscription`, `licensing`, `platform-admin` |
| `payment` | Invoice + Proforma + Refund + Payment gateway mixed in one module |
| `self-hosted-ai` | AI chat + Training + Data agent + RAG in one module |
| `accounts` | Full accounting (ledger, GST, reconciliation, journal) in one module |
| `calendar` | Events + Reminders + Availability + Sync in one module |

---

## 6. SHARED KERNEL / COMMON LAYER

### ✅ `src/common/` Well-Structured

```
src/common/
├── decorators/       # @Public, @CurrentUser, @TenantId
├── dto/              # StandardResponseDto, PaginationDto
├── errors/           # ErrorModule with presentation layer
├── filters/          # GlobalExceptionFilter
├── interceptors/     # ResponseMapperInterceptor, LoggingInterceptor
├── middleware/        # TenantMiddleware
├── pipes/            # ValidationPipe config
├── prisma/           # PrismaService (shared)
└── utils/            # Pagination helpers
```

### ✅ `src/core/` Correctly Isolated

```
src/core/
├── auth/             # JWT, guards, platform-bootstrap
├── permissions/      # RBAC engine, PermissionPolicyGuard
├── prisma/           # Prisma multi-tenant service
└── workflow/         # Workflow engine (actions, triggers)
```

No violations of `src/core/` isolation were detected — only `src/modules/` files import from core, not vice versa.

---

## 7. FINDINGS — PRIORITIZED

### 🔴 CRITICAL (2)

| # | Area | Finding | Recommendation |
|---|------|---------|----------------|
| C1 | **Layer Violation** | 28 controllers in `presentation/` import `infrastructure/` directly — especially all 25 `tenant/presentation/` controllers | Introduce Application services/commands as intermediaries. Controllers must not import repos. |
| C2 | **God Services** | 15 services >400 LOC violate SRP. `entity-verification.service.ts` (730 LOC) and `auth.service.ts` (666 LOC) are extreme cases | Decompose into domain-specific services during Phase 3 migration |

### ⚠️ WARNING (4)

| # | Area | Finding | Recommendation |
|---|------|---------|----------------|
| W1 | **DDD Adoption** | Only 8/78 modules have full 4-layer DDD structure. 66 are partial. Migration effort is large. | Prioritize completing DDD for high-traffic modules: `quotations`, `payment`, `accounts` |
| W2 | **God Controllers** | 6 controllers >300 LOC (accounts 707, procurement 605). These are essentially monolithic API surfaces | Split into resource-specific controllers (e.g., `LedgerController`, `GSTController`, `JournalController`) |
| W3 | **Tenant Module Size** | `tenant` module has 174 endpoints across 15+ controllers — largest in codebase | Split into: `vendor-management`, `platform-subscription`, `licensing`, `platform-admin` |
| W4 | **Missing Domain Layer** | Even "partial CQRS" modules (66) lack `domain/` — no entities, value objects, or domain events | Phase 3 priority: add domain layer to all modules before migrating to commands/queries |

### ℹ️ INFO (3)

| # | Finding | Status |
|---|---------|--------|
| I1 | Zero circular dependencies ✅ | Excellent — maintain with madge CI check |
| I2 | `src/core/` and `src/common/` correctly isolated ✅ | No violations found |
| I3 | 8 full DDD modules serve as migration templates ✅ | Use `contacts`, `leads`, `activities` as reference implementations |

---

## 8. RECOMMENDATIONS (Prioritized)

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| P1 | Fix 28 presentation→infrastructure violations in `tenant` + `mis-reports` | Medium | 🔴 CRITICAL — Architecture integrity |
| P1 | Add madge circular dep check to CI pipeline | Very Low | HIGH — Prevent future regressions |
| P2 | Decompose top 5 god services (entity-verification, auth, workflow-ai, menu-permission, module-registry) | High | HIGH — Maintainability |
| P2 | Split `tenant` module into 4 bounded contexts | High | HIGH — Cohesion |
| P2 | Split god controllers: accounts, procurement, sales | Medium | HIGH — REST compliance |
| P3 | Complete DDD structure for `quotations`, `payment`, `accounts` (add `domain/` + `infrastructure/`) | High | MEDIUM — Phase 3 readiness |
| P3 | Add `domain/` layer to all 66 partial-CQRS modules | Very High | HIGH — Foundation for Phase 3 |
| P4 | Document bounded contexts and module ownership in `docs/architecture/` | Low | MEDIUM — Team onboarding |

---

## OVERALL ASSESSMENT

**Score: 6.5 / 10**

**Strengths:**
- Zero circular dependencies across 2,367 files — excellent
- `src/core/` and `src/common/` cleanly separated from `src/modules/`
- 8 full DDD modules as proven migration templates
- Module boundaries are meaningful (no random cross-cutting)

**Critical Gaps:**
- 28 layer violations (presentation imports infrastructure directly)
- 15 god services violating SRP — these are migration blockers
- Only 8/78 modules have complete DDD structure — Phase 3 will require significant structural work
- `tenant` module is a monolith within the monolith (174 endpoints, 15+ controllers)

**Phase 3 Risk:** The architecture migration will require decomposing ~66 partial-CQRS modules simultaneously. Without careful sequencing, this risks breaking cross-module dependencies. Recommend migrating bounded contexts in waves: CRM core → Finance → Operations → Platform.

---

_Generated by Claude Code | CRMSoft Phase 0 Audit | 2026-03-18_
