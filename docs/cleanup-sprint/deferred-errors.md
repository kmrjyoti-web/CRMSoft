# Cleanup Sprint — Deferred tsc Errors

**Date:** 2026-04-22
**Branch:** chore/cleanup-sprint-2026-04-22

## Summary

| Stage | Count |
|---|---|
| Baseline (develop before sprint) | 328 |
| After creating ApiKeyList | 327 |
| After cleanup sprint | 327 |
| Net change | -1 |

**Primary success criterion met:** `pnpm build` in crm-admin now exits 0 (was failing on `api-gateway/keys` and `settings/verifications`).

The 327 remaining errors are all pre-existing implicit-any and related TypeScript issues that do NOT block the production build. They are deferred per the sprint plan's explicit guidance:

> - DEFER to Phase 0: @shared-types errors
> - DEFER to separate sprint: features/whatsapp / features/workflows errors

## Category Breakdown

### TS7006 — implicit 'any' on parameters (110 errors)

Callbacks like `.map((x) => ...)` without explicit type annotation. Dominant across most feature modules.

Representative sample:
- `features/contacts/components/ContactDetail.tsx` — 4 occurrences
- `features/organizations/components/OrganizationDetail.tsx` — 3 occurrences
- `features/customer-portal/components/PortalUsers.tsx` — 7 occurrences

**Action:** Defer to a dedicated typing sprint. Low risk per-instance but large combined surface. Each fix requires knowing the upstream type (often comes from API response types not yet declared at the consumer).

### TS2322 — "Type X is not assignable to type Y" (117 errors)

Type mismatches, often in `setState(...)` calls where the runtime value is `string | Date | null` but state was typed as `string`.

Representative sample:
- `features/api-gateway/components/ApiUsageDashboard.tsx` — 2 occurrences
- `features/api-gateway/components/WebhookList.tsx` — 1 occurrence
- Various date-input handlers across forms

**Action:** Defer. Usually fixable by widening state types to `string | null` or coercing inputs, but requires per-file audit.

### TS2345 / TS2339 / TS7053 — argument/property/index issues (~68 errors)

Property access on narrowed unions, index signatures on untyped objects, argument type mismatches.

**Action:** Defer. Each fix typically requires understanding the upstream type flow.

### TS2307 — Cannot find module '@shared-types' (3 errors)

- `src/types/api-response.ts` (2 imports)
- `src/features/customer-portal/types/customer-portal.types.ts` (1 import)

**Action:** **Defer to Phase 0.** The V5 restructure adds `@crmsoft/*` path aliases to `tsconfig.base.json` which replaces the broken `@shared-types` path. Fixing this now and then rewriting it during Phase 0 is wasted work.

## Module Breakdown (top 15)

| Module | Errors |
|---|---|
| features/settings | 44 |
| features/whatsapp | 34 |
| features/contacts | 21 |
| features/leads | 19 |
| features/vendor | 14 |
| features/customer-portal | 11 |
| features/email | 10 |
| features/wallet | 9 |
| features/procurement | 9 |
| features/campaigns | 9 |
| features/quotations | 8 |
| features/product-pricing | 8 |
| features/reports | 7 |
| features/raw-contacts | 7 |
| features/bulk-import | 7 |

## Recommended Plan

1. **Phase 0 (V5 restructure)** — resolves the 3 `@shared-types` errors automatically via the new `@crmsoft/*` tsconfig paths.
2. **Typing sprint (separate)** — module-by-module pass to add explicit types. Best done after Phase 0 when `packages-shared/types` is populated and provides source-of-truth types to import from.
3. **features/whatsapp + features/workflows** — flagged separately because they require domain knowledge of those flows. Schedule as their own subsprint.
