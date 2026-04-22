# Dev 1 – Day 3: Help + Lookups Extraction into @crmsoft/core-platform

**Branch:** `feat/dev1-backend-day3-help-lookups`
**Base:** `sprint/v6-skeleton-2026-04-23`
**Date:** 2026-04-23

---

## What Was Extracted

### `core/platform/src/help/` (4 source files, no tests)
- `help.module.ts` — NestJS module with HelpController + HelpService
- `presentation/help.controller.ts` — REST endpoints (list, get, create, update, markHelpful, seed)
- `presentation/dto/help.dto.ts` — Request DTOs (ListHelpArticlesQueryDto, ContextualHelpQueryDto, CreateHelpArticleDto, UpdateHelpArticleDto)
- `services/help.service.ts` — Full service with Prisma queries against `platform.helpArticle`
- `services/help-seed-data.ts` — Seed data constants (no external deps)

### `core/platform/src/lookups/` (25 source files, no tests)
- `lookups.module.ts` — CqrsModule + 8 command handlers + 3 query handlers
- `presentation/lookups.controller.ts` — REST controller using CommandBus/QueryBus
- `presentation/dto/*.dto.ts` — 5 DTO files (add-value, create-lookup, reorder-values, update-lookup, update-value)
- `application/commands/*/` — 8 command + handler pairs (create, update, deactivate lookup; add, update, reorder, deactivate value; reset defaults)
- `application/queries/*/` — 3 query + handler pairs (get-all, get-by-id, get-by-category)
- `data/lookup-seed-data.ts` — Seed data (no external deps)

### Shared infra added to `core/platform/src/shared/`
- `prisma.token.ts` — `PLATFORM_PRISMA` Symbol + `IPlatformPrisma` interface
- `api-response.ts` — Copied ApiResponse class (avoids cross-package import from api/src/common)

---

## Dependency Complexity Encountered

### PrismaService Usage (Heavy)
- **Help**: `HelpService` calls `this.prisma.platform.helpArticle.*` (7 methods)
- **Lookups**: Every single handler (11 files) calls `this.prisma.platform.*` 
  - Commands use: `masterLookup`, `lookupValue` (including `aggregate`, `updateMany`, `upsert`, `$transaction`)
  - Queries use: `masterLookup.findMany/findFirst/findUnique` with `include`

PrismaService has Prisma-generated type imports (`@prisma/identity-client`, `@prisma/platform-client`, etc.) which cannot be installed in a workspace package without the full Prisma setup. Hard-importing `PrismaService` would create a circular dependency and require all Prisma clients in `core/platform`.

### ApiResponse Usage
Both `HelpController` and `LookupsController` imported `ApiResponse` from `apps-backend/api/src/common/utils/api-response`. This local path cannot be referenced from an external package.

---

## How Imports Were Resolved

### PrismaService → Injection Token Pattern
Created `PLATFORM_PRISMA = Symbol('PLATFORM_PRISMA')` and `IPlatformPrisma` interface in `core/platform/src/shared/prisma.token.ts`.

All 12 provider classes (HelpService + 11 handlers) were rewritten to use:
```typescript
constructor(
  @Optional() @Inject(PLATFORM_PRISMA) private readonly prisma?: IPlatformPrisma,
) {}
```

The host app (`apps-backend/api/src/app.module.ts`) registers the binding:
```typescript
{ provide: PLATFORM_PRISMA, useExisting: PrismaService }
```

`IPlatformPrisma` is a structural interface covering only the methods actually used, avoiding any `@prisma/*` package dependency in `core/platform`.

### ApiResponse → Shared Copy
`ApiResponse` class was copied verbatim into `core/platform/src/shared/api-response.ts`. Both controllers now import from `../../shared/api-response` (relative within the package).

### @nestjs/cqrs + class-validator Resolution
The `core/platform` source is included in `apps-backend/api/tsconfig.json` via the `include` array. TypeScript resolves modules relative to the compiler's `baseUrl`. Added explicit `paths` entries in `apps-backend/api/tsconfig.json` for `@nestjs/cqrs`, `class-validator`, and `class-transformer` pointing to `node_modules/` within `apps-backend/api/`.

---

## TypeScript Error Count

| Phase | Error Count |
|-------|-------------|
| Before Day 3 (sprint/v6-skeleton-2026-04-23 baseline) | 0 |
| After initial copy with PrismaService imports | ~21 errors |
| After injection token + path fixes | **0** |

---

## Files Modified in apps-backend/api

| File | Change |
|------|--------|
| `tsconfig.json` | Added `@crmsoft/core-platform`, `@nestjs/cqrs`, `class-validator`, `class-transformer` path mappings; added `../../core/platform/src/**/*` to `include` |
| `src/app.module.ts` | Replaced local `LookupsModule` and `HelpModule` imports with `@crmsoft/core-platform`; added `PLATFORM_PRISMA` provider |
| `package.json` | Added `"@crmsoft/core-platform": "workspace:*"` dependency |

---

## Pattern Reference for Future Modules
This extraction establishes the complete CQRS extraction pattern:
1. Copy command/query plain classes unchanged (no external deps)
2. Replace `PrismaService` constructor injection with `@Optional() @Inject(PLATFORM_PRISMA)`
3. Replace `this.prisma.foo` with `this.prisma!.foo` (non-null assertion)
4. Copy shared utilities (ApiResponse) into `core/platform/src/shared/`
5. Add path mappings to host app `tsconfig.json` for any new peer deps
6. Wire `{ provide: PLATFORM_PRISMA, useExisting: PrismaService }` in the host `AppModule`
