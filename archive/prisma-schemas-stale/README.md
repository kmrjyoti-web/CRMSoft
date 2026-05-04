# Stale Prisma Schemas — READ-ONLY ARCHIVE

**Archived:** 2026-05-04 (Phase 3B cleanup)
**Do NOT use these files for code generation.**

## Why archived

These are outdated monolithic Prisma schemas from before the `prismaSchemaFolder` migration.
They were originally placed in `Shared/prisma-schemas/` as "read-only snapshots" (per their
own `package.json` description) but never kept in sync with the canonical schemas.

The generator `output` paths in these files conflict with the canonical schemas:
- Both target `apps-backend/api/node_modules/@prisma/*-client`
- Running `prisma generate` from this folder would **silently overwrite** production
  Prisma clients with stale schemas (43 identity models vs 56 canonical, etc.)

## Canonical location (USE THIS)

```
apps-backend/api/prisma/
├── identity/v1/         ← IdentityDB (56 models)
├── platform/v1/         ← PlatformDB (66 models)
├── working/v1/          ← WorkingDB (228 models)
├── marketplace/v1/      ← MarketplaceDB (13 models)
├── platform-console/v1/ ← PlatformConsoleDB (48 models)
├── global/v1/           ← GlobalDB (12 models)
└── demo/v1/             ← DemoDB (228 models)
```

Generate clients: `npx prisma generate --schema=prisma/<db>/v1` (directory path)

## Git history reference

Last real state of these files: commit `210170c5` (Apr 24 2026)

## If you need to extract a model from here

1. Open the file you need in this archive
2. Compare with canonical at `apps-backend/api/prisma/`
3. Copy specific schema lines into the canonical file
4. Run `prisma generate` from canonical location only — never from this archive
