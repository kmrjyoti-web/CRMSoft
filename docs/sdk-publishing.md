# @crmsoft/* SDK — Publishing Guide

## Package Registry
GitHub Packages (`https://npm.pkg.github.com`) — private, restricted access.

## Package Map

| Package | Location | Version | Status | Description |
|---------|----------|---------|--------|-------------|
| `@crmsoft/common` | `Shared/common/` | 1.0.0 | ✅ Ready | Types, enums, constants (Indian states, UserRole, ApiResponse) |
| `@crmsoft/ui-kit` | `Shared/frontend/` | 1.0.0 | ✅ Ready | AIC components: GSTInput, PANInput, StateSelect |
| `@crmsoft/prisma-schemas` | `Shared/prisma-schemas/` | 1.0.0 | ✅ Ready | 4 Prisma schema references (read-only) |
| `@crmsoft/identity` | `Shared/backend/identity/` | 0.1.0 | ⏳ Stub | Auth, JWT, session, guards, role decorators |
| `@crmsoft/tenant` | `Shared/backend/tenant/` | 0.1.0 | ⏳ Stub | Multi-tenant isolation, DB routing |
| `@crmsoft/errors` | `Shared/backend/errors/` | 0.1.0 | ⏳ Stub | Result<T>, AppError, error codes |
| `@crmsoft/notifications` | `Shared/backend/notifications/` | 0.1.0 | ⏳ Stub | Email, SMS, push, SSE, templates |
| `@crmsoft/storage` | `Shared/backend/storage/` | 0.1.0 | ⏳ Stub | Cloudflare R2, file upload, signed URLs |
| `@crmsoft/audit` | `Shared/backend/audit/` | 0.1.0 | ⏳ Stub | Audit log service, decorators |
| `@crmsoft/cache` | `Shared/backend/cache/` | 0.1.0 | ⏳ Stub | Redis cache, TTL management |
| `@crmsoft/encryption` | `Shared/backend/encryption/` | 0.1.0 | ⏳ Stub | Field-level encryption, key rotation |
| `@crmsoft/global-data` | `Shared/backend/global-data/` | 0.1.0 | ⏳ Stub | Global data providers, app singletons |
| `@crmsoft/prisma` | `Shared/backend/prisma/` | 0.1.0 | ⏳ Stub | Prisma client utilities, multi-schema |
| `@crmsoft/queue` | `Shared/backend/queue/` | 0.1.0 | ⏳ Stub | BullMQ job definitions, decorators |

> **Stub** = package.json + tsconfig + empty `src/index.ts` scaffold. Code extraction from `Application/backend/` pending.

---

## One-time Setup

```bash
# 1. Authenticate with GitHub Packages
export GITHUB_TOKEN=ghp_your_token_here   # needs packages:write scope

# 2. Install workspace dependencies
npm install
```

---

## Build All Packages

```bash
npm run build:sdk
# Runs `npm run build` in every workspace package that has a build script
```

Build individual package:
```bash
cd Shared/common && npm run build
cd Shared/frontend && npm run build
```

---

## Publish to GitHub Packages

```bash
# Bump patch version across all packages
npm run version:sdk

# Publish all packages
npm run publish:sdk
```

---

## Consuming Packages (in other services)

**1. Add `.npmrc` to the consuming project:**
```
@crmsoft:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

**2. Install:**
```bash
npm install @crmsoft/common @crmsoft/ui-kit
```

**3. Import:**
```typescript
import { UserRole, ApiResponse, INDIAN_STATES } from '@crmsoft/common';
import { GSTInput, PANInput, StateSelect } from '@crmsoft/ui-kit';
```

---

## Existing Path Aliases (unchanged)

Current code in `Application/backend/` uses `@shared/*` path aliases that point to `src/shared/` (internal). These are **NOT affected** by SDK packaging.

The SDK packages are for:
- WhiteLabel partner deployments (install via npm instead of symlinks)
- Future microservice extraction (each service installs only what it needs)
- External partner developer integrations

---

## Extracting Backend Stubs → Real Packages

For each stub package (`@crmsoft/identity`, etc.), the workflow is:
1. Copy relevant service/module from `Application/backend/src/modules/` → `Shared/backend/<name>/src/`
2. Update `src/index.ts` to export all public APIs
3. Remove internal NestJS app dependencies (keep only NestJS interfaces)
4. Run `npm run build` to verify
5. Bump version: `npm version minor`
6. Publish: `npm publish --registry https://npm.pkg.github.com`
