# Sprint G — CI Lint Scan

**Date:** 2026-04-16
**Purpose:** Pre-implementation discovery for Sprint G (Prisma file organisation CI lint)

---

## 1. Prisma folder structure (post Sprint F)

```
Application/backend/prisma/
├── identity/v1/          5 files (_base + users + config + audit + licensing)
├── platform/v1/          7 files (_base + modules + marketplace + testing + subscriptions + vendors + audit)
├── working/v1/          14 files (_base + crm + inventory + communication + sales + accounts + documents + workflow + notifications + audit + config + reports + payments + tax)
├── marketplace/v1/       2 files (_base + marketplace)
├── platform-console/v1/  3 files (_base + devops + testing)
├── global/v1/            2 files (_base + reference)
└── schema.prisma        ← STRAY: 13578-line legacy monolith, pre-Sprint-F artifact. TO DELETE.
```

**Stray file:** `prisma/schema.prisma` — 13578 lines, uses generic `DATABASE_URL`,
no `prismaSchemaFolder`. This is a pre-Sprint-F legacy file. No functional code imports it;
the build/generate scripts reference it only via `npx prisma generate` without `--schema`
(which defaults to `prisma/schema.prisma`). Sprint G deletes this file and updates all
generate commands to explicit `--schema=prisma/*/v1` folder paths.

---

## 2. Old `prisma/schemas/` references found

### In CI workflows (functional — will break in CI)
| File | Lines | Description |
|------|-------|-------------|
| `.github/workflows/pr-check.yml` | 92-95, 264-267 | `npx prisma generate --schema=prisma/schemas/*.prisma` in check-api + db-audit jobs |
| `.github/workflows/release-gate.yml` | 43-46, 95-98 | Same in 2 jobs |
| `.github/workflows/release.yml` | 50-53 | Same in 1 job |
| `.github/workflows/nightly-tests.yml` | 48-51 | Same in 1 job |

### In shell scripts (functional — will fail silently on next run)
| File | Lines | Description |
|------|-------|-------------|
| `scripts/architecture-guard.sh` | 16, 48 | `prisma/schemas/*.prisma` glob for model checks |
| `scripts/weekly-health-check.sh` | 73, 131, 143 | Same glob in 3 places |

### In package.json (functional — `npm run build` broken)
| File | Field | Description |
|------|-------|-------------|
| `Application/backend/package.json` | `scripts.build` | 5 `--schema=prisma/schemas/*.prisma` references |

### In TypeScript comments (non-functional — cosmetic)
| Count | Location | Description |
|-------|----------|-------------|
| 8 | `src/modules/marketplace/*/infrastructure/mkt-prisma.service.ts` | `@ts-ignore` comment references `prisma/schemas/marketplace.prisma` |
| 1 | `src/modules/ops/test-runner/infrastructure/runners/integration-test.runner.ts` | Comment only (code already fixed in Sprint F Task 51) |

### In stale JSON report (non-functional — historical artifact)
| File | Description |
|------|-------------|
| `docs/health-reports/latest-audit.json` | Old audit output referencing pre-rename schema paths. Will self-overwrite on next audit run. |

---

## 3. Package.json scripts

Current lint scripts: `lint`, `lint:fix` (both ESLint only).
No `lint:prisma` script exists yet — Sprint G adds it.

```json
"lint:prisma": "bash scripts/lint/prisma-structure-lint.sh"
```

---

## 4. CI workflow structure

`pr-check.yml` jobs (all triggered by `api` path filter or unconditionally):
- `detect-changes` → `check-api`, `db-audit`, `any-type-check` (api-gated)
- `commit-lint`, `architecture-lint` (always run)

Sprint G adds `prisma-lint` job: no Node.js or DB needed, pure bash/grep, runs unconditionally
(same as `architecture-lint`). No `detect-changes` dependency required.

---

## 5. Stale `--soft-fail` flag in db-audit

The `db-audit` job in `pr-check.yml` has:
```yaml
run: npm run audit:db -- --skip=fkOrphan --format=json --soft-fail
```
Comment says: `TODO: Remove --soft-fail after Week 2 renames complete (target: 2026-04-27)`.
Renames are complete (0 violations since 2026-04-16). Sprint G removes `--soft-fail`.

---

## 6. Sprint G scope

**Create:**
- `Application/backend/scripts/lint/prisma-structure-lint.sh` (7 rules)

**Update:**
- `Application/backend/package.json` — fix `build` script + add `lint:prisma`
- `.github/workflows/pr-check.yml` — fix generate commands, remove `--soft-fail`, add `prisma-lint` job
- `.github/workflows/release-gate.yml` — fix generate commands (×2)
- `.github/workflows/release.yml` — fix generate commands
- `.github/workflows/nightly-tests.yml` — fix generate commands
- `scripts/architecture-guard.sh` — fix schema path refs (×2)
- `scripts/weekly-health-check.sh` — fix schema path refs (×3)
- 8 `mkt-prisma.service.ts` files — update `@ts-ignore` comments

**Delete:**
- `Application/backend/prisma/schema.prisma`
