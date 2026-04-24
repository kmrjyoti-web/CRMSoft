# V6 Migration Scripts

## Order of Operations

1. **Backup first:** `git tag backup/before-migration-N`
2. **Run script:** `./scripts/v6-migration/<script>.sh <args>`
3. **Verify:** `./scripts/v6-migration/verify-migration-health.sh`
4. **Commit:** `git add -A && git commit -m "migration: <description>"`
5. **Test:** Manual smoke test

## Scripts

### move-backend-module.sh

Move a backend NestJS module from old V5 location to new V6 core/ location.
Uses `git mv` to preserve history.

```bash
./scripts/v6-migration/move-backend-module.sh \
  apps-backend/api/src/modules/core/identity \
  core/platform/auth
```

### move-frontend-portal.sh

Move a frontend portal from `apps-frontend/` to `apps/frontend/`.

```bash
./scripts/v6-migration/move-frontend-portal.sh crm-admin crm-admin-new
```

### import-travel-project.sh

Git subtree import of an external project into `verticals/{name}/`.

```bash
./scripts/v6-migration/import-travel-project.sh \
  https://github.com/kmrjyoti-web/travel.git main travel
```

### update-imports-bulk.sh

Bulk find-and-replace import paths across all TS/TSX files.

```bash
./scripts/v6-migration/update-imports-bulk.sh '@shared-types' '@crmsoft/types'
```

### verify-migration-health.sh

Run all health checks (tsc, Prisma) to verify a migration step is safe.

```bash
./scripts/v6-migration/verify-migration-health.sh
```

## Safety Rules

- NEVER run on `develop` directly — always in a sprint or feature branch
- ALWAYS create a backup tag before a major step
- ALWAYS run `verify-migration-health.sh` after each step
- If something breaks: `git reset --hard <backup-tag>`
- Customer X is protected — it's on a separate release branch
