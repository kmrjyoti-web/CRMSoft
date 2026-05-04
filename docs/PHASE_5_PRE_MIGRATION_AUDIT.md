# Phase 5 — Pre-Migration Audit
Date: 2026-05-04
Migration: apps-frontend/* → apps/*
Branch: development/wl-platform-v2
Status: AUDIT ONLY — no changes made

---

## TL;DR

**Simpler than Phase 4.** Zero cross-app imports, zero tsconfig references, zero next.config references. Every frontend app is a fully standalone Next.js app.

`pnpm-workspace.yaml` already has `apps/*` from Phase 4 — after migration, just REMOVE the `apps-frontend/*` line.

Only 2 of 7 apps have CI workflows. The other 5 are CI-less (move with zero config changes needed).

---

## Inventory

| App | Size | Files (excl. node_modules) | CI workflow |
|---|---|---|---|
| `crm-admin` | 706MB | 2,426 | `ci-crm-admin.yml` (4 refs) |
| `customer-portal` | 692KB | 42 | None |
| `marketplace` | 24MB | 90 | None |
| `platform-console` | 62MB | 144 | None |
| `vendor-panel` | 24MB | 222 | `ci-vendor-panel.yml` (3 refs) |
| `wl-admin` | 1.2MB | 51 | None |
| `wl-partner` | 1.1MB | 38 | None |

**Total:** 7 apps, ~3,013 files, ~820MB

**Naming collisions:** Zero — `apps/` currently has only `api`.

---

## Special: crm-admin lib/coreui

`apps-frontend/crm-admin/lib/coreui/` is a **full internal monorepo**:
- Has its own `pnpm-workspace.yaml`, `turbo.json`, `package.json`, `pnpm-lock.yaml`
- Turborepo-based design system / component library
- Has its own isolated `node_modules` (not managed by root pnpm)
- CI handles it with a dedicated `cd coreui && pnpm install && pnpm build` step
- The CI references it as `COREUI_DIR: 'apps-frontend/crm-admin/lib/coreui'`

**Risk:** LOW — it's self-contained. Only the CI path string needs updating.
After migration: `COREUI_DIR: 'apps/crm-admin/lib/coreui'`

---

## Reference Count by File

| File | Count | Risk | Notes |
|---|---|---|---|
| `apps/api/prisma/seeds/data/pages-inventory.json` | 153 | Low | Static audit snapshot from M0a sprint (Apr 26). Historical data, not functional. |
| `.github/workflows/ci-crm-admin.yml` | 4 | **High** | Path triggers + APP_DIR + COREUI_DIR |
| `.github/workflows/ci-vendor-panel.yml` | 3 | **High** | Path triggers + APP_DIR |
| `scripts/v6-migration/move-frontend-portal.sh` | 2 | Medium | Dev tooling |
| `scripts/v6-migration/verify-migration-health.sh` | 1 | Medium | Dev tooling |
| `pnpm-workspace.yaml` | 1 | **High** | Workspace pattern |
| `package.json` (root) | 1 | Medium | `build:all-frontend` pnpm filter script |

**Total functional references:** 12 (excluding the 153 in seed data JSON)

---

## Detailed Impact

### HIGH RISK — Must update before rename

#### `pnpm-workspace.yaml` (1 occurrence)
```yaml
- 'apps-frontend/*'   ← REMOVE this line
```
`'apps/*'` already exists from Phase 4 — it will cover all apps once they're moved.
**Fix:** Delete the `- 'apps-frontend/*'` line. That's it.

#### `.github/workflows/ci-crm-admin.yml` (4 occurrences)
```yaml
paths:
  - 'apps-frontend/crm-admin/**'    → apps/crm-admin/**
env:
  APP_DIR: 'apps-frontend/crm-admin'     → apps/crm-admin
  COREUI_DIR: 'apps-frontend/crm-admin/lib/coreui'  → apps/crm-admin/lib/coreui
```

#### `.github/workflows/ci-vendor-panel.yml` (3 occurrences)
```yaml
paths:
  - 'apps-frontend/vendor-panel/**'  → apps/vendor-panel/**
env:
  APP_DIR: 'apps-frontend/vendor-panel'  → apps/vendor-panel
```

---

### MEDIUM RISK — Functional but non-critical

#### `package.json` — `build:all-frontend` script (1 occurrence)
```json
"build:all-frontend": "pnpm --filter './apps-frontend/*' build"
```
After migration, `apps-frontend/*` no longer exists. The `--filter` glob must change.
Options:
- `pnpm --filter './apps/{crm-admin,customer-portal,marketplace,platform-console,vendor-panel,wl-admin,wl-partner}'` — explicit
- `pnpm --filter './apps/*' --filter '!./apps/api' build` — exclude api from `apps/*`

**Recommended:** Use explicit list — clearest intent, no accidental future inclusions.

#### `scripts/v6-migration/move-frontend-portal.sh` (2 occurrences)
```bash
SOURCE="apps-frontend/$SOURCE_NAME"
```
Dev tooling, safe to update.

#### `scripts/v6-migration/verify-migration-health.sh` (1 occurrence)
```bash
crm_errors=$(cd apps-frontend/crm-admin && ...
```
Dev tooling, safe to update.

---

### LOW / IGNORE

#### `apps/api/prisma/seeds/data/pages-inventory.json` (153 occurrences)
Static audit snapshot — `folderPath` and `filePath` strings recording page locations
as of April 26, 2026 (M0a sprint). Not read by any runtime code. Can be left as-is
or updated in a separate pass. Does not affect build, tests, or deploy.

---

## tsconfig Status

**Zero tsconfig references to `apps-frontend`.** Same as the backend — each Next.js
app is fully isolated in its own TypeScript project.

---

## Cross-App Dependency Status

- **Frontend → Backend imports:** Zero
- **Frontend → Frontend imports:** Zero
- **Frontend → Shared/packages:** Zero
- **next.config.* references to apps-frontend:** Zero

Each of the 7 apps is completely self-contained.

---

## Migration Checklist (When Ready)

```
STEP 1 — git mv (7 moves):
  git mv apps-frontend/crm-admin        apps/crm-admin
  git mv apps-frontend/customer-portal  apps/customer-portal
  git mv apps-frontend/marketplace      apps/marketplace
  git mv apps-frontend/platform-console apps/platform-console
  git mv apps-frontend/vendor-panel     apps/vendor-panel
  git mv apps-frontend/wl-admin         apps/wl-admin
  git mv apps-frontend/wl-partner       apps/wl-partner
  rmdir apps-frontend/    (if empty)

STEP 2 — pnpm-workspace.yaml (1 line DELETE):
  Remove: - 'apps-frontend/*'
  Keep:   - 'apps/*'    ← already covers everything

STEP 3 — CI workflows (2 files):
  ci-crm-admin.yml:     4 replacements (apps-frontend → apps)
  ci-vendor-panel.yml:  3 replacements (apps-frontend → apps)

STEP 4 — root package.json (1 script):
  build:all-frontend: update --filter pattern

STEP 5 — scripts/v6-migration/ (2 files):
  move-frontend-portal.sh:         2 replacements
  verify-migration-health.sh:      1 replacement

OPTIONAL:
  pages-inventory.json: 153 historical path strings (no functional impact)
```

---

## Risk Assessment

| Category | Rating | Reason |
|---|---|---|
| TypeScript compilation | **Zero risk** | Zero tsconfig references |
| pnpm workspace | **Low** | Remove 1 line — `apps/*` already covers everything |
| CI/CD (crm-admin) | **High** | Must update atomically or CI stops triggering |
| CI/CD (vendor-panel) | **High** | Must update atomically or CI stops triggering |
| Next.js build | **Zero** | No next.config.* references to apps-frontend |
| Runtime code | **Zero** | No source imports reference the path |
| Cross-app deps | **Zero** | All 7 apps are fully standalone |

---

## Stat Summary

```
Frontend apps:             7
With CI workflows:         2 (crm-admin, vendor-panel)
Without CI:                5 (customer-portal, marketplace, platform-console, wl-admin, wl-partner)
Total files (non-node):    ~3,013
Largest app:               crm-admin (706MB, has internal lib/coreui monorepo)

Files needing updates:     6 functional + 1 optional data file
Total functional changes:  ~12 occurrences
tsconfig references:        0
cross-app imports:          0
naming collisions:          0

pnpm-workspace.yaml:       SIMPLEST case — just DELETE 1 line
```
