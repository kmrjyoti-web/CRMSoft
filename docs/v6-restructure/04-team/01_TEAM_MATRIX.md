# Team Task Matrix — 72 Hour Sprint

**Status:** Ready for Kumar's morning review at 9:30 AM standup
**Start:** 2026-04-24 (Day 2)
**Target demo:** 2026-04-26 (Day 4)

---

## Dev Allocation

### Kumar — Architecture + AI + Reviews

- **Owns:** core/ai-engine/, overall architecture decisions, PR approvals
- **Day 2:** Morning standup, external project access, architecture reviews
- **Day 3:** AI engine skeleton, customer demo prep
- **Day 4:** Customer demo presentation

---

### Dev 1 — Backend Specialist (Core Platform)

- **Branch:** `feat/backend-core-platform-migration`
- **Owns:** core/platform/, core/base-modules/

**Day 2 Tasks:**
- [ ] Read 01_TARGET_ARCHITECTURE.md and 02_BACKEND_MODULES.md
- [ ] Move identity module → core/platform/auth/
  ```bash
  ./scripts/v6-migration/move-backend-module.sh \
    apps-backend/api/src/modules/core/identity core/platform/auth
  ```
- [ ] Move rbac module → core/platform/rbac/
- [ ] Move multiTenant module → core/platform/tenant/
- [ ] Update all imports using update-imports-bulk.sh
- [ ] Verify: verify-migration-health.sh passes
- [ ] PR: `feat/backend-core-platform-migration`

**Day 3 Tasks:**
- [ ] Move crm-core modules → core/base-modules/crm-core/
- [ ] Move accounting modules → core/base-modules/accounting-core/
- [ ] Move inventory modules → core/base-modules/inventory-core/
- [ ] Verify tsc stays at 0 errors for backend
- [ ] PR update

---

### Dev 2 — Frontend Specialist 1

- **Branch:** `feat/frontend-migration-batch-1`
- **Owns:** apps/frontend/crm-admin-new/, apps/frontend/vendor-panel-new/

**Day 2 Tasks:**
- [ ] Run: `./scripts/v6-migration/move-frontend-portal.sh crm-admin crm-admin-new`
- [ ] Update pnpm-workspace.yaml
- [ ] `pnpm install` from root
- [ ] Verify crm-admin boots: `cd apps/frontend/crm-admin-new && pnpm dev`
- [ ] Repeat for vendor-panel-new
- [ ] PR: `feat/frontend-migration-batch-1`

**Day 3 Tasks:**
- [ ] Brand theme injection proof of concept in brands/crmsoft/
- [ ] Create `brands/crmsoft/theme/variables.css` with current color tokens
- [ ] Demo: build crm-admin with BRAND=crmsoft env

---

### Dev 3 — Frontend Specialist 2

- **Branch:** `feat/frontend-migration-batch-2`
- **Owns:** apps/frontend/customer-portal-new/, apps/frontend/marketplace-new/

**Day 2 Tasks:**
- [ ] Run: `./scripts/v6-migration/move-frontend-portal.sh customer-portal customer-portal-new`
- [ ] Run: `./scripts/v6-migration/move-frontend-portal.sh marketplace marketplace-new`
- [ ] Update pnpm-workspace.yaml
- [ ] Verify both portals boot
- [ ] PR: `feat/frontend-migration-batch-2`

**Day 3 Tasks:**
- [ ] Move remaining portals: wl-admin-new, wl-partner-new, platform-console-new
- [ ] Verify all 7 portals boot from apps/frontend/

---

### Dev 4 — Integration Specialist

- **Branch:** `feat/verticals-travel-merge`
- **Owns:** verticals/travel/, verticals/electronic/

**Day 2 Pre-requisite:** Kumar provides Travel project git URL at morning standup

**Day 2 Tasks:**
- [ ] Receive Travel project URL from Kumar
- [ ] Run: `./scripts/v6-migration/import-travel-project.sh <URL> main travel`
- [ ] Review imported content in verticals/travel/
- [ ] Reorganize into modules/, data-models/, ai-customization/
- [ ] Remove duplicate package.json / node_modules from vertical
- [ ] PR: `feat/verticals-travel-merge`

**Day 3 Tasks:**
- [ ] Same for Electronic project
- [ ] Integration tests for both verticals
- [ ] Demo: verticals/travel/ shows real Travel project modules

---

### Dev 5 — QA/DevOps

- **Branch:** `feat/ci-cd-v6-rules`
- **Owns:** core/governance/ci-rules/, test infrastructure

**Day 2 Tasks:**
- [ ] Add folder boundary lint rule (partner-A cannot import from partner-B)
- [ ] Create GitHub Actions job for boundary enforcement
- [ ] Update existing CI to cover new `apps/` folder paths
- [ ] Smoke test matrix for all portals

**Day 3 Tasks:**
- [ ] E2E test setup covering new structure
- [ ] Brand-specific build CI (BRAND=crmsoft pnpm build)
- [ ] Performance benchmarks baseline

---

## Daily Sync Points

| Time | Duration | Format |
|---|---|---|
| 9:30 AM | 15 min | Standup: yesterday / today / blockers |
| 2:00 PM | 15 min | Mid-day progress check |
| 6:00 PM | 15 min | EOD status + PR review queue |

## Escalation Path

1. Blocked → check docs/v6-restructure/ first
2. Still blocked → Slack #crmsoft-team
3. 30+ min blocked → DM Kumar
4. Merge conflicts → Kumar arbitrates

## PR Review SLA (War Mode)

| PR size | Review within |
|---|---|
| < 100 lines | 1 hour |
| 100-500 lines | 2 hours |
| 500+ lines | 4 hours |

## Success Gates

### End of Day 2 (Apr 24)
- [ ] 5 devs working in parallel branches
- [ ] Backend core migrated (Dev 1)
- [ ] 4 frontends moved to apps/frontend/ (Dev 2, 3)
- [ ] Travel project imported (Dev 4)
- [ ] CI rules skeleton added (Dev 5)

### End of Day 3 (Apr 25)
- [ ] All backend modules migrated to core/
- [ ] All frontends working in new location
- [ ] Travel + Electronic integrated in verticals/
- [ ] Brand inheritance demo ready
- [ ] Customer demo slides ready

### End of Day 4 (Apr 26)
- [ ] Customer demo delivered
- [ ] Feedback incorporated
- [ ] Remaining migration plan for Week 2-3
