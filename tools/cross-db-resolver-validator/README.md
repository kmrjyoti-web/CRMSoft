# tools/cross-db-resolver-validator

**Status:** PLACEHOLDER

## Purpose

Static-analysis tool that scans handler/service code for the two-step resolver pattern violations:

- Direct cross-DB Prisma `include:` calls (impossible at runtime, blocked here at build time)
- N+1 resolver calls inside loops
- Missing batch resolution (calling `resolveUsers([id])` per row instead of once with all IDs)

See `docs/db/v5/09_CROSS_DB_PATTERNS.md` (on `develop`) for the patterns this tool enforces.
