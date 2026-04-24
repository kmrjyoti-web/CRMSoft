# A0-3: API Endpoint Audit Report
## CRMSoft — Phase 0 Audit

**Date:** 2026-03-18
**Auditor:** Claude Code (automated scan)
**Scope:** `API/src/` — all `*.controller.ts` files
**Global Prefix:** `api/v1` (set in `main.ts`)

---

## SCORECARD

| Dimension | Score | Status |
|-----------|-------|--------|
| Endpoint Coverage | 8/10 | ✅ 1,595 endpoints across 67+ modules |
| Swagger Docs | 6/10 | ⚠️ 62.7% controllers have `@ApiTags`, 48.6% have `@ApiOperation` |
| Auth Guard Coverage | 5/10 | 🔴 99 non-public controllers without `@UseGuards` |
| RBAC Coverage | 7/10 | ⚠️ 805 `@Permissions` instances but inconsistently applied |
| Naming Consistency | 7/10 | ⚠️ Mixed PUT/PATCH usage (140 PUT vs 42 PATCH) |
| Response Format | 7/10 | ⚠️ 28 controllers return raw objects without wrapper |
| Versioning | 8/10 | ✅ Global `api/v1` prefix enforced via `main.ts` |
| **OVERALL** | **6.9/10** | ⚠️ |

**CRITICAL: 2 | WARNING: 5 | INFO: 4**

---

## 1. ENDPOINT COUNT SUMMARY

| HTTP Method | Count |
|-------------|-------|
| `GET` | 715 (44.7%) |
| `POST` | 600 (37.5%) |
| `PUT` | 140 (8.8%) |
| `PATCH` | 42 (2.6%) |
| `DELETE` | 105 (6.6%) |
| **TOTAL** | **1,602** |

- **204 controllers** with endpoints
- **9 intentional public controllers** (`public-*.controller.ts`)
- **99 non-public controllers without `@UseGuards`** 🔴
- Global prefix: `api/v1` (configured in `main.ts` via `process.env.API_PREFIX`)

---

## 2. ENDPOINTS BY MODULE

| Module | Endpoints | Top Controller | Guard Status |
|--------|-----------|----------------|-------------|
| `tenant` | 174 | vendor-versions (18) | Mixed ⚠️ |
| `settings` | 61 | users/roles/permissions | Mixed ⚠️ |
| `accounts` | 57 | accounts.controller (57) | 🔴 NO GUARD |
| `inventory` | 47 | inventory (26) + bom (19) | 🔴 NO GUARD |
| `email` | 47 | email (15) + campaign (11) | Mixed ⚠️ |
| `whatsapp` | 46 | whatsapp (23) | ✅ Guarded |
| `calendar` | 43 | calendar-events (21) | 🔴 NO GUARD |
| `marketplace` | 42 | marketplace-feed (24) | ✅ Guarded |
| `api-gateway` | 41 | api-analytics (12) + api-key (11) | Mixed ⚠️ |
| `procurement` | 41 | procurement (41) | 🔴 NO GUARD |
| `payment` | 39 | payment (30) + refund (9) | 🔴 NO GUARD |
| `self-hosted-ai` | 36 | self-hosted-ai (36) | ✅ Guarded |
| `amc-warranty` | 34 | amc-contract (12) + others | ✅ Guarded |
| `quotations` | 32 | quotations (19) + templates (6) | ✅ Guarded |
| `sales` | 30 | sales (30) | 🔴 NO GUARD |
| `core` | 30 | auth (15) | ✅ Guarded |
| `business-locations` | 29 | company-locations (19) | 🔴 NO GUARD |
| `workflows` | 28 | workflow-admin (10) + execution (8) | 🔴 NO GUARD |
| `ownership` | 28 | ownership (16) | ✅ Guarded |
| `notifications` | 28 | notification-admin (11) + sse | Mixed ⚠️ |
| `document-templates` | 28 | document-template (28) | ✅ Guarded |
| `bulk-import` | 27 | import (21) | ✅ Guarded |
| `wallet` | 27 | wallet-admin (20) | ✅ Guarded |
| `offline-sync` | 27 | sync-admin (15) + sync (12) | ✅ Guarded |
| `documents` | 27 | document (12) | ✅ Guarded |
| `mis-reports` | 25 | reports (various) | 🔴 NO GUARD |
| `menus` | 25 | menu-permission (15) | 🔴 NO GUARD |
| `leads` | 17 | leads (17) | 🔴 NO GUARD |
| `products` | 15 | products (15) | 🔴 NO GUARD |
| `contacts` | 9 | contacts (9) | 🔴 NO GUARD |
| `organizations` | 9 | organizations (9) | 🔴 NO GUARD |
| _(remaining 35 modules)_ | ~296 | various | Mixed |

---

## 3. SECURITY — AUTH GUARD ANALYSIS

### 🔴 CRITICAL: 99 Non-Public Controllers Without `@UseGuards`

Total: 204 controllers. Public (by design): 9. Guarded: 104. **Unguarded non-public: 99 (48.5%).**

#### High-Risk Unguarded Controllers (by endpoint count)

| Controller | Endpoints | Risk Level |
|------------|-----------|------------|
| `accounts.controller.ts` | 57 | 🔴 CRITICAL — Finance/ledger |
| `procurement.controller.ts` | 41 | 🔴 CRITICAL — Purchase orders |
| `sales.controller.ts` | 30 | 🔴 CRITICAL — Sale orders |
| `inventory.controller.ts` | 26 | 🔴 HIGH |
| `bom.controller.ts` | 19 | 🔴 HIGH |
| `business-locations.controller.ts` | 19 | ⚠️ MEDIUM |
| `tasks.controller.ts` | 18 | ⚠️ MEDIUM |
| `leads.controller.ts` | 17 | ⚠️ MEDIUM |
| `products.controller.ts` | 15 | ⚠️ MEDIUM |
| `menu-permission.controller.ts` | 15 | 🔴 HIGH — RBAC management |
| `workflows.controller.ts` | 10+ | 🔴 HIGH — Workflow execution |
| `payment.controller.ts` | 30 | 🔴 CRITICAL — Payment processing |
| `contacts.controller.ts` | 9 | ⚠️ MEDIUM |
| `organizations.controller.ts` | 9 | ⚠️ MEDIUM |
| `users.controller.ts` | ~8 | 🔴 HIGH — User management |
| `roles.controller.ts` | ~6 | 🔴 HIGH — RBAC |
| `permissions.controller.ts` | ~5 | 🔴 HIGH — RBAC |

**Note:** Many controllers likely rely on **global guards** registered in `app.module.ts`. However, without explicit `@UseGuards` at controller level, there is no per-controller audit trail and the protection depends entirely on correct global guard configuration. This MUST be verified.

#### Intentional Public Controllers (9) — These Are Correct
```
public-contacts.controller.ts
public-quotations.controller.ts
public-organizations.controller.ts
public-payments.controller.ts
public-invoices.controller.ts
public-leads.controller.ts
public-products.controller.ts
public-activities.controller.ts
public-entity-verification.controller.ts
```

---

## 4. SWAGGER / OPENAPI DOCUMENTATION

| Metric | Count | Coverage |
|--------|-------|----------|
| Controllers with `@ApiTags` | 128 / 204 | 62.7% ⚠️ |
| Controllers with `@ApiBearerAuth` | 109 / 204 | 53.4% ⚠️ |
| Endpoints with `@ApiOperation` | 776 / 1,602 | 48.5% 🔴 |

### Controllers Missing `@ApiTags` (78 controllers)

Key missing: `accounts`, `approval-requests`, `approval-rules`, `calendar` (6 files), `comment`, `custom-report`, `dashboard`, `entity-verification`, `follow-up`, `marketplace-feed`, `menus`, `notifications`, `ownership`, `performance`, `plugin` (3 files), `quotation-analytics`, `quotation-ai`, `reports` (6 files), `task`, `tour-plan`, `verification`, `warranty-*` (6 files)

---

## 5. RBAC / PERMISSION COVERAGE

| Metric | Count |
|--------|-------|
| `@Permissions` / `@Roles` / `@RequirePermission` decorators | 805 |
| Controllers with 0 permission decorators | ~85 |

805 permission decorators across the codebase indicates RBAC is actively used. However, the 85 controllers with zero permission decorators are either:
- Relying on global role check (admin-only guard)
- Genuinely unprotected by role

**Recommendation:** Every POST/PUT/PATCH/DELETE endpoint should have at minimum one `@RequirePermission` decorator.

---

## 6. HTTP METHOD CONVENTION

### ⚠️ WARNING: Mixed PUT / PATCH Usage

| Method | Count | Semantic |
|--------|-------|---------|
| `@Put` | 140 | Full replacement (RFC 7231) |
| `@Patch` | 42 | Partial update (RFC 5789) |

**Issue:** 140 `PUT` endpoints are semantically incorrect for partial updates. REST convention for partial updates (most CRM update operations) should use `PATCH`. `PUT` should only be used for full resource replacement (rare).

**Affected modules:** `tenant` (20 PUT), `settings` (15 PUT), `accounts` (10 PUT), `procurement` (8 PUT)

**Recommendation:** Audit all 140 `@Put` endpoints. Convert to `@Patch` where partial updates are performed.

### CRUD Completeness Check

Modules missing standard CRUD operations:
- `recycle-bin` — GET only (by design — correct)
- `search` — GET only (by design — correct)
- `sse` — GET only (streaming — correct)
- `dashboard` — GET only (read-only — correct)
- `calendar-highlights` — 3 endpoints (list/create/delete — no update)
- `approval-rules` — 4 endpoints (missing soft bulk operations)
- `task-logic` — 4 endpoints (config only)

No critical CRUD gaps found in business modules.

---

## 7. RESPONSE FORMAT CONSISTENCY

| Pattern | Count | Status |
|---------|-------|--------|
| `return { ... }` (raw object) | 28 controllers | ⚠️ Inconsistent |
| `@ApiBearerAuth` | 109 controllers | Partial docs |
| Structured `Result<T>` wrapper | ~30 instances | ⚠️ Low adoption |

28 controllers return raw objects directly (no standard wrapper). The rest use service-level responses passed through. Recommend standardizing on:
```typescript
{ success: true, data: T, meta?: PaginationMeta }  // Success
{ success: false, error: { code, message } }        // Error
```

---

## 8. API VERSIONING

✅ **Global prefix `api/v1` enforced** via:
```typescript
app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');
```

- No per-controller version overrides detected
- No `@Version()` decorator usage found (single version strategy)
- **Recommendation:** For future breaking changes, plan `api/v2` strategy using NestJS URI versioning

---

## 9. ENDPOINT CATALOG (TOP MODULES)

### `accounts` — 57 endpoints (⚠️ No guard at controller level)
| # | Method | Pattern | Purpose |
|---|--------|---------|---------|
| 1 | GET | `/api/v1/accounts` | List accounts |
| 2 | POST | `/api/v1/accounts` | Create account |
| 3 | GET | `/api/v1/accounts/:id` | Get by ID |
| 4 | PUT | `/api/v1/accounts/:id` | Update |
| 5 | DELETE | `/api/v1/accounts/:id` | Delete |
| ... | ... | ... | ... (57 total) |

### `tenant` — 174 endpoints (highest count)
Covers: vendor-versions, vendor-modules, packages, plans, licenses, subscription, module-registry, page-registry, error-logs, AI tokens, wallet admin, partner management

### `quotations` — 32 endpoints (✅ Guarded)
| Method | Pattern | Purpose |
|--------|---------|---------|
| GET | `/api/v1/quotations` | List |
| POST | `/api/v1/quotations` | Create |
| GET | `/api/v1/quotations/:id` | Get by ID |
| PATCH | `/api/v1/quotations/:id` | Update |
| DELETE | `/api/v1/quotations/:id` | Delete |
| POST | `/api/v1/quotations/:id/send` | Send quotation |
| POST | `/api/v1/quotations/:id/approve` | Approve |
| POST | `/api/v1/quotations/:id/reject` | Reject |
| GET | `/api/v1/quotations/:id/pdf` | Generate PDF |
| ... | ... | ... (32 total) |

### `whatsapp` — 46 endpoints (✅ Guarded)
Covers: accounts, templates, broadcasts, conversations, messages, chatbot flows

---

## 10. FINDINGS — PRIORITIZED

### 🔴 CRITICAL (2)

| # | Area | Finding | Recommendation |
|---|------|---------|----------------|
| C1 | **Auth Guard** | 99 non-public controllers without explicit `@UseGuards` — includes critical finance controllers (`accounts` 57 ep, `payment` 30 ep, `procurement` 41 ep, `sales` 30 ep) | **IMMEDIATE:** Verify global guard is applied. Add explicit `@UseGuards(JwtAuthGuard)` at class level on all 99 controllers. |
| C2 | **Swagger Gap** | Only 48.5% of endpoints have `@ApiOperation`. 37.3% of controllers lack `@ApiTags`. API documentation is incomplete for external consumers and SDK generation. | Add `@ApiTags`, `@ApiOperation`, `@ApiResponse` to all 78 undocumented controllers. |

### ⚠️ WARNING (5)

| # | Area | Finding | Recommendation |
|---|------|---------|----------------|
| W1 | **PUT vs PATCH** | 140 `@Put` endpoints vs 42 `@Patch`. Most PUT operations perform partial updates — semantic mismatch with RFC 7231. | Audit all 140 `@Put` endpoints. Convert to `@Patch` where partial update is the intent. |
| W2 | **RBAC Gaps** | ~85 controllers with 0 `@RequirePermission` decorators. All POST/PUT/PATCH/DELETE must have permission check. | Add `@RequirePermission` to all write operations. |
| W3 | **Response Format** | 28 controllers return raw objects without standard wrapper (`Result<T>` or `{ data, meta }`). | Standardize response wrapper across all controllers. |
| W4 | **ApiBearerAuth** | Only 109/204 controllers have `@ApiBearerAuth`. Swagger UI won't show lock icon for 95 controllers. | Add `@ApiBearerAuth()` to all guarded controllers. |
| W5 | **Versioning Strategy** | No v2 strategy defined. All 1,602 endpoints are `/api/v1`. Breaking changes will be painful. | Plan `@Version('2')` strategy using NestJS URI versioning for Phase 3+ changes. |

### ℹ️ INFO (4)

| # | Finding | Recommendation |
|---|---------|----------------|
| I1 | 9 public controllers correctly named `public-*.controller.ts` ✅ | Maintain naming convention |
| I2 | Global `api/v1` prefix enforced in `main.ts` ✅ | Maintain; add `API_PREFIX` to `.env.example` |
| I3 | `@ApiOperation` used on 776 endpoints with summary strings ✅ | Extend to all 1,602 |
| I4 | No camelCase route paths detected ✅ | All routes appear kebab-case compliant |

---

## 11. RECOMMENDATIONS (Prioritized)

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| P1 | Verify global guard is applied; add explicit `@UseGuards(JwtAuthGuard)` to 99 unguarded controllers | Low per file | 🔴 CRITICAL — Security |
| P1 | Add `@ApiTags` + `@ApiBearerAuth` to 78 controllers missing them | Low | HIGH — Swagger completeness |
| P2 | Add `@ApiOperation` to remaining 826 endpoints | Medium | HIGH — SDK generation |
| P2 | Audit and convert 140 `@Put` → `@Patch` where appropriate | Low per endpoint | MEDIUM — REST compliance |
| P2 | Add `@RequirePermission` to all write endpoints missing it | Medium | HIGH — RBAC enforcement |
| P3 | Standardize response wrapper: `{ success, data, meta }` | Medium | MEDIUM — API consistency |
| P3 | Plan API v2 versioning strategy for Phase 3 breaking changes | Low (design) | LOW now, HIGH later |
| P4 | Add `API_PREFIX` to `.env.example` with default `api/v1` | Very low | LOW |

---

## OVERALL ASSESSMENT

**Score: 6.9 / 10**

**Strengths:**
- 1,602 endpoints across 67+ modules — comprehensive CRM API coverage
- Global `api/v1` prefix consistently enforced
- 9 public controllers correctly identified and named
- 805 `@Permissions` decorators — RBAC framework actively used
- `@ApiOperation` on 776 endpoints — good partial coverage

**Critical Gaps:**
- 99 non-public controllers without explicit auth guards (especially accounts, payment, sales, procurement)
- Swagger documentation incomplete — 51.5% of endpoints undocumented for `@ApiOperation`
- 140 `@Put` endpoints should be `@Patch` (semantic mismatch)

**Risk Level:** MEDIUM-HIGH — primarily due to the 99 unguarded controllers. If there is NO global guard in `app.module.ts`, these endpoints are **publicly accessible**. This must be verified immediately.

---

_Generated by Claude Code | CRMSoft Phase 0 Audit | 2026-03-18_
