# Discovery Report — CI Hook for DB Auditor
**Date:** 2026-04-13

## 1. Existing Workflows
8 workflows in `.github/workflows/`: pr-check.yml, release-gate.yml, release.yml, deploy-staging.yml, deploy-split.yml, deploy-production.yml, nightly-tests.yml, weekly-health.yml

## 2. PR Check Workflow
`pr-check.yml` — the target for the db-audit job. Jobs:
- `detect-changes` — dorny/paths-filter (api, crm-admin, vendor-panel, etc.)
- `check-api` — npm ci, Prisma generate, tsc, lint, build, test (Postgres 15 + Redis)
- `check-crm-admin`, `check-vendor-panel`, etc. — frontend checks
- `commit-lint`, `any-type-check`, `architecture-lint`

Backend uses **npm** (not pnpm). Working directory: `./Application/backend`.

## 3. Audit Report Contract
`pnpm audit:db --format=json` writes to `docs/health-reports/latest-audit.json` (relative to CWD = backend dir). Confirmed working.

Current baseline: errors=0, warnings=0 ✅

## 4. FK Orphan Strategy
**Decision: Skip in CI, run in nightly.**
- Naming check + cross-DB include check: **no DB needed** (parse files only) → run in CI
- FK orphan check: **needs live DB with real data** → skip in CI, add to nightly-tests.yml later
- CLI needs `--skip=fkOrphan` flag → will add

## 5. README/CONTRIBUTING
No CONTRIBUTING.md exists. README.md is at monorepo root. Add "Database Governance" section.
