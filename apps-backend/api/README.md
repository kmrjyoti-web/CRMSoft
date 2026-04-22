# apps-backend/api

**Status:** PLACEHOLDER — populated in Phase 2

The NestJS backend API will be moved here from `Application/backend/` during Phase 2.

- **Port:** 3001
- **Stack:** NestJS 10 + Prisma 5.22 + PostgreSQL (Railway / Supabase)

## Database Clients

The backend uses 7 per-DB Prisma clients with custom output paths. Phase 2 will preserve these paths exactly:

| DB | Client output |
|---|---|
| identity | `node_modules/@prisma/identity-client` |
| working | `node_modules/@prisma/working-client` |
| platform | `node_modules/@prisma/platform-client` |
| marketplace | `node_modules/@prisma/marketplace-client` |
| demo | `node_modules/.prisma/demo-client` |
| global | `node_modules/.prisma/global-reference-client` |
| platform-console | `node_modules/.prisma/platform-console-client` |

Note: `@prisma/client` itself is a bare stub — never import from it directly. See `docs/db/v5/00_DATABASE_ARCHITECTURE_MASTER.md` (on `develop`).
