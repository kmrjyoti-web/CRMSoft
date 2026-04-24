# Developer Roles and Allocation

## Team (6 Developers)

### Kumar — Founder / Architect / Platform Owner
- Architecture decisions, Prisma schema changes, core auth, platform module
- Reviews all PRs touching `src/core/`, `prisma/*/`, `Shared/`, CI/CD
- Primary point of contact for blockers

### Dev 1 — Backend (NestJS/API)
**Primary:** `apps-backend/api/src/modules/customer/`  
**Port:** 3001  
**Starter tasks:**
- API validation improvements
- Bug fixes in CRM business modules (leads, contacts, quotations)
- Unit test coverage for existing services

### Dev 2 — CRM Admin Frontend
**Primary:** `apps-frontend/crm-admin/`  
**Port:** 3005  
**Starter tasks:**
- UI polish and form validation improvements
- Cleanup ticket #4 (`QuotationForm.tsx` type errors)
- Page load performance

### Dev 3 — Vendor + Customer Portals
**Primary:** `apps-frontend/vendor-panel/` + `apps-frontend/customer-portal/`  
**Ports:** 3006, 3007  
**Starter tasks:**
- Auth flow verification
- Onboarding UI
- Jest type quirk fix (cleanup ticket #7)

### Dev 4 — Marketplace
**Primary:** `apps-frontend/marketplace/` + `apps-backend/api/src/modules/marketplace/`  
**Port:** 3008  
**Starter tasks:**
- Marketplace tsc cleanup (ticket #5, 11 errors)
- Marketplace feature work

### Dev 5 — QA / DevOps
**Primary:** CI workflows + E2E testing  
**Starter tasks:**
- Smoke test automation
- CI pipeline review
- Deployment runbook for Customer X (Apr 28)

## Boundaries

These require Kumar review before merging:
- Any file under `apps-backend/api/src/core/`
- Any Prisma schema file (`prisma/*/*.prisma`)
- Any file under `Shared/`
- Any change to `.github/workflows/`
- Any change to `pnpm-workspace.yaml` or root `package.json`

**If you're unsure whether something needs Kumar review — ask first.**

## First 2 Days

**Day 1:** Setup + orientation. Read `docs/onboarding/`. Run everything locally. Don't submit PRs.

**Day 2:** Pick ONE starter task from the table above. Submit a small PR. Get a review cycle under your belt before taking on anything larger.

## PR Rules

- Small PRs preferred (<200 lines of functional change)
- Include backend + frontend changes in the same PR when they're coupled
- All PRs target `develop` (never `main`)
- At least one approval required before merge
- Kumar must approve PRs touching core/shared/schema areas
