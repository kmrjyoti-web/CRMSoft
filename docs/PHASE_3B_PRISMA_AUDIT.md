# Phase 3B — Prisma Canonical Location Audit
Date: 2026-05-04
Branch: development/wl-platform-v2
Auditor: Claude Code

---

## TL;DR

**apps-backend/api/prisma/ is canonical. Shared/prisma-schemas/ is stale and dangerous.**

The stale schemas point to the SAME generator output paths as the canonical schemas.
Running `prisma generate` from `Shared/prisma-schemas/` would silently overwrite the
correct runtime clients with outdated schemas. This is an active hazard, not just dead code.

---

## Locations Found

| Location | Files | Size | Type |
|---|---|---|---|
| `apps-backend/api/prisma/*/v1/` | 55 .prisma files | 1.9MB | **CANONICAL** — split multi-file (prismaSchemaFolder) |
| `Shared/prisma-schemas/` | 4 .prisma files | 520KB | **STALE** — monolithic single-file format |
| `WhiteLabel/wl-api/prisma/` | 1 .prisma file | — | Separate WL service (not part of this audit) |

---

## Active Location — Evidence

### 1. All generate commands point to apps-backend/api/prisma

`apps-backend/api/package.json` build script:
```
npx prisma generate --schema=prisma/identity/v1
npx prisma generate --schema=prisma/platform/v1
npx prisma generate --schema=prisma/working/v1
npx prisma generate --schema=prisma/marketplace/v1
npx prisma generate --schema=prisma/platform-console/v1
npx prisma generate --schema=prisma/global/v1
npx prisma generate --schema=prisma/demo/v1
```

Root `package.json` db:push scripts:
```
db:push:platform  → apps-backend/api/prisma/platform/v1/
db:push:identity  → apps-backend/api/prisma/identity/v1/
db:push:console   → apps-backend/api/prisma/platform-console/v1/
```

### 2. Recently modified (Golden Rule #16, May 4 2026)
```
2026-05-04  apps-backend/api/prisma/global/v1/system-reference.prisma
2026-05-04  apps-backend/api/prisma/global/v1/indian-reference.prisma
2026-05-04  apps-backend/api/prisma/global/v1/reference.prisma
2026-05-04  apps-backend/api/prisma/platform/v1/modules.prisma
2026-05-04  apps-backend/api/prisma/platform-console/v1/pc-config.prisma
2026-05-04  apps-backend/api/prisma/identity/v1/brand-vertical-config.prisma
```

### 3. Generated clients exist and are current
```
apps-backend/api/node_modules/.prisma/demo-client
apps-backend/api/node_modules/.prisma/global-reference-client
apps-backend/api/node_modules/.prisma/platform-console-client
apps-backend/api/node_modules/@prisma/identity-client
apps-backend/api/node_modules/@prisma/platform-client
apps-backend/api/node_modules/@prisma/working-client
apps-backend/api/node_modules/@prisma/marketplace-client
```

### 4. Model counts are larger (more schema evolution)
| DB | Shared (stale) | apps-backend (canonical) | Delta |
|---|---|---|---|
| identity | 43 models | 56 models | +13 |
| platform | 56 models | 66 models | +10 |
| working | 228 models | 228 models | 0 (same count, content differs) |
| marketplace | 13 models | 13 models | 0 |
| platform-console | — | 48 models | new DB, not in Shared |
| global | — | 12 models | new DB, not in Shared |
| demo | — | 228 models | new DB, not in Shared |

---

## Stale Location — Evidence

### 1. No script generates from here
Zero references to `Shared/prisma-schemas` in any `prisma generate` or `db push` command.
Only references:
- `pnpm-workspace.yaml:15` — still registered as workspace package (leftover from Phase 3A, not cleaned up)
- `pnpm-lock.yaml:68` — lockfile entry for the workspace package
- `scripts/npm-audit.js:41` — audit helper listing all workspace packages

### 2. Last real edit: Apr 24 2026
```
2026-04-29  Shared/prisma-schemas/platform.prisma   ← ACCIDENTAL EDIT (Rule #14 commit)
2026-04-24  Shared/prisma-schemas/working.prisma
2026-04-24  Shared/prisma-schemas/marketplace.prisma
2026-04-24  Shared/prisma-schemas/identity.prisma
```
The Apr 29 edit to `platform.prisma` was the Rule #14 golden rules fix — confirmed accidental (schemas were edited in two places simultaneously). Content is still stale vs apps-backend canonical.

### 3. Package describes itself as read-only snapshots
`Shared/prisma-schemas/package.json` description field:
> "CRMSoft Prisma schema references — identity, platform, working, marketplace **(read-only snapshots)**"

### 4. Git history: only 3 commits, last real change Apr 24
```
9ad3e849  fix(golden-rules): Rule #14 — accidental touch
210170c5  feat: restructure project (Apr 22 initial placement)
c3c6d980  feat: restructure project (initial)
```
Compare to apps-backend prisma: 8+ commits, most recent May 4 2026.

---

## CRITICAL HAZARD: Conflicting Generator Output Paths

Both locations target the **same output directories**:

| Schema | Stale output path | Canonical output path | Conflict? |
|---|---|---|---|
| platform | `../../node_modules/@prisma/platform-client` | `../../../node_modules/@prisma/platform-client` | **YES — same dir** |
| identity | `../../node_modules/@prisma/identity-client` | `../../../node_modules/@prisma/identity-client` | **YES — same dir** |
| working | `../../node_modules/@prisma/working-client` | `../../../node_modules/@prisma/working-client` | **YES — same dir** |
| marketplace | `../../node_modules/@prisma/marketplace-client` | `../../../node_modules/@prisma/marketplace-client` | **YES — same dir** |

Running `prisma generate` from `Shared/prisma-schemas/` would:
1. Generate clients from 43-model-stale identity vs 56-model canonical
2. Overwrite `apps-backend/api/node_modules/@prisma/identity-client` silently
3. Runtime would use stale client → missing columns, missing models, broken queries

This is a **trap** for any dev who runs generate from the wrong location.

---

## Verdict

| Item | Verdict |
|---|---|
| `apps-backend/api/prisma/*/v1/` | **CANONICAL** — the only active schemas, all tools point here |
| `Shared/prisma-schemas/` | **STALE + HAZARDOUS** — outdated snapshots with conflicting output paths |
| `Shared/prisma-schemas` in workspace.yaml | **LEFTOVER** — not removed in Phase 3A (missed), should be removed |

---

## Recommended Phase 3B Action

### Option A: Archive (conservative, same as Phase 3A)
- Move `Shared/prisma-schemas/` → `archive/prisma-schemas-stale/` (or `docs/archive/`)
- Remove `Shared/prisma-schemas` from `pnpm-workspace.yaml`
- Update `scripts/npm-audit.js` to remove the reference
- Zero deletions, just relocation away from active workspace

### Option B: Delete (aggressive, appropriate given the hazard)
- Delete `Shared/prisma-schemas/` entirely
- Remove from `pnpm-workspace.yaml`
- The content is a strict subset of apps-backend canonical (fewer models, older)
- Git history preserves it at commit `210170c5` if ever needed
- Eliminates the silent-overwrite hazard permanently

**Recommendation: Option B (delete)**
- The hazard (conflicting generator outputs) makes keeping it on disk risky
- Content is available in git history at Apr 24 2026 state
- The package.json itself calls it "read-only snapshots" — it was always a snapshot, never source of truth
- 520KB of outdated, misleading code that could corrupt the runtime build

---

## Stat Summary

```
Prisma locations found:         3
Canonical (actively used):      1  (apps-backend/api/prisma/*/v1/)
Stale (no generate/push):       1  (Shared/prisma-schemas/)
Separate service (WL):          1  (WhiteLabel/wl-api/prisma/)

Stale .prisma files:            4
Stale model count:            340  (vs 711 in canonical — 371 missing)
Stale size:                  520KB
Conflict risk:               HIGH  (same output paths as canonical)

Workspace cleanup needed:       1  (Shared/prisma-schemas still in workspace.yaml)
```
