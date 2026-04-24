# tools/db-schema-auditor

**Status:** PLACEHOLDER

## Purpose

Validates the Prisma schemas against project conventions:

- Naming conventions (PascalCase models, camelCase fields, `_` prefix for shared bases)
- Detects forbidden `include:` across DB boundaries (cross-DB joins must use `CrossDbResolverService`)
- FK orphan detection (references to deleted entities)
- Required indexes (e.g., every tenant-scoped model must have `@@index([tenantId, ...])`)

Logic exists today inside `Application/backend/`. Will be extracted here in a future phase.
