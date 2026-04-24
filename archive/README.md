# Archive — Temporary Storage During V6 Migration

**Created:** 2026-04-26
**Status:** TRANSIENT — Will be deleted after full V6 code merge (Week of May 5)

## Contents

### old-v5-structure/

V5 package directories that contained vertical-specific packages before the V6
monorepo restructure. These are being replaced by the `verticals/` and `core/`
structure.

| Folder | Was | Now |
|---|---|---|
| packages-backend/ | NestJS vertical packages | → verticals/*/modules/ |
| packages-frontend/ | Frontend vertical packages | → verticals/*/frontend/ |
| packages-shared/ | Shared constants/enums/types | → core/shared-libraries/ |

### legacy-folders/

Pre-V5 code that predates the current architecture.

| Folder | Notes |
|---|---|
| Customer/ | V3/V4 customer backend — superseded by apps-backend/ |
| Vendor/ | V3/V4 vendor backend — superseded by apps-backend/ |
| Shared/ | Pre-V5 shared packages (common, backend/*) — workspace deps removed |
| WhiteLabel/ | wl-api service — being migrated to apps/backend/ |

## Why Archive Instead of Delete

- Code preserved (nothing lost)
- Reference material during migration
- Rollback possible if needed
- Git history maintained via `git mv`

## DO NOT

- Do not import from archive/ into V6 code
- Do not modify files in archive/
- Do not deploy from archive/

## Deletion Plan

Delete this folder after:
1. All V6 modules populated from source
2. Backend + frontends verified working from V6 paths
3. Customer X release (Apr 28) safely launched
4. Kumar explicitly approves deletion

## Note on apps-backend/ and apps-frontend/

These directories are NOT archived because CI/CD workflows have hardcoded
references to them (`apps-backend/api/**` triggers in `ci-backend.yml`,
`apps-frontend/**` triggers in `ci-crm-admin.yml` and `ci-vendor-panel.yml`).
They will be archived after CI workflows are updated to reference `apps/backend/api`.
