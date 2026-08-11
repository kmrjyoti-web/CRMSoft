# Dev 1 Day 2 Findings — Core Platform Extraction

**Author:** Dev 1 (Backend Specialist)
**Date:** 2026-04-24

---

## Summary

POC successful. health module extracted to `@crmsoft/core-platform`. 
Backend tsc: 0 errors maintained throughout.

The WAR PROMPT assumed `rbac/` and `multiTenant/` as standalone dirs — they don't exist.
Actual structure documented below.

---

## Actual Module Structure (vs WAR PROMPT Assumptions)

### WAR PROMPT assumed:
```
apps-backend/api/src/modules/core/
├── identity/   (auth/identity)
├── rbac/       (role-based access control)
└── multiTenant/ (multi-tenancy)
```

### Actual structure:
```
apps-backend/api/src/modules/core/
├── identity/           (330 files — combines auth + tenant + RBAC + settings + menus)
│   ├── audit/          — audit logging module
│   ├── entity-filters/ — per-entity access filters
│   ├── menus/          — dynamic menu management
│   ├── settings/       — tenant settings module
│   └── tenant/         — multi-tenancy + billing + RBAC + subscription
├── platform/           (43 files)
│   ├── help/           — help/documentation module
│   └── lookups/        — lookup values module
├── work/               (102 files)
│   ├── custom-fields/  — custom field definitions
│   ├── notifications/  — real-time notifications (WebSocket)
│   └── search/         — smart search module
└── health/             (3 files) ← ✅ MIGRATED to core/platform/src/health/
```

### Also in apps-backend/api/src/core/ (separate from modules/core/):
```
apps-backend/api/src/core/
├── auth/       — JWT authentication (separate from identity module)
├── permissions/ — permissions core
├── prisma/     — PrismaService (all 7 DB clients)
└── workflow/   — workflow engine core
```

---

## Extraction Pattern (Proven by health/ POC)

### What we learned:
1. **path alias approach works**: Add `@crmsoft/core-platform` to backend tsconfig paths pointing to source
2. **include approach works**: Add `../../core/platform/src/**/*` to backend tsconfig include
3. **@nestjs/* paths needed**: Add `@nestjs/common`, `@nestjs/swagger` etc. to backend paths so tsc resolves them from backend's node_modules
4. **Injection token pattern**: For modules that depend on PrismaService, use `@Optional() @Inject(TOKEN)` instead of direct imports

### Per-module extraction cost:

| Module | Files | Cross-package deps | Estimated effort |
|---|---|---|---|
| health/ | 3 | PrismaService | ✅ DONE (4h) |
| platform/help/ | ~12 | PrismaService, AuthGuard | 2h |
| platform/lookups/ | ~22 | PrismaService, TenantContext | 4h |
| work/notifications/ | ~38 | PrismaService, Redis/Bull, WebSocket | 8h |
| work/custom-fields/ | ~40 | PrismaService, TenantContext | 6h |
| work/search/ | ~24 | PrismaService, ElasticSearch? | 4h |
| identity/audit/ | ~45 | PrismaService, TenantContext, Auth | 8h |
| identity/menus/ | ~35 | PrismaService, TenantContext | 6h |
| identity/settings/ | ~58 | PrismaService, TenantContext, Auth | 8h |
| identity/tenant/ | ~130 | PrismaService, Auth, Redis, Bull | 16h+ |
| identity/entity-filters/ | ~18 | PrismaService, TenantContext | 4h |

**Total estimated:** 66h+ for full core platform extraction

---

## Next Steps for Tomorrow (Day 3)

### Quick wins (low coupling, can migrate tomorrow):
1. `platform/help/` → `core/platform/src/help/` — ~2h
2. `platform/lookups/` → `core/platform/src/lookups/` — ~4h

### Requires PrismaService extraction first:
- All other modules use PrismaService directly
- Solution: Extract PrismaService to `@crmsoft/prisma-clients` package OR use injection token

### Recommended PrismaService extraction approach:
```typescript
// In core/platform/src/prisma/prisma.tokens.ts
export const PRISMA_IDENTITY = Symbol('PRISMA_IDENTITY');
export const PRISMA_WORKING = Symbol('PRISMA_WORKING');
// etc.

// In the NestJS app, provide these tokens:
{
  provide: PRISMA_IDENTITY,
  useFactory: (prisma: PrismaService) => prisma.identity,
  inject: [PrismaService]
}
```

---

## Day 2 Delivery Status

- [x] Workspace package `@crmsoft/core-platform` set up
- [x] `pnpm-workspace.yaml` updated with V6 package paths
- [x] `health/` module extracted (POC) — 3 files, git history preserved
- [x] Backend tsc: 0 errors maintained
- [x] Extraction pattern documented
- [x] Actual module structure documented (corrects WAR PROMPT assumptions)
- [x] Per-module extraction cost estimated

---

## Updated V6 Core Platform Mapping

| V6 Target | Current Location | Status |
|---|---|---|
| core/platform/src/health/ | ~~modules/core/health/~~ | ✅ MIGRATED |
| core/platform/src/help/ | modules/core/platform/help/ | Day 3 |
| core/platform/src/lookups/ | modules/core/platform/lookups/ | Day 3 |
| core/platform/src/auth/ | src/core/auth/ | Week 2 |
| core/platform/src/tenant/ | modules/core/identity/tenant/ | Week 2 |
| core/platform/src/settings/ | modules/core/identity/settings/ | Week 2 |
| core/platform/src/menus/ | modules/core/identity/menus/ | Week 2 |
| core/platform/src/audit/ | modules/core/identity/audit/ | Week 2 |
| core/platform/src/entity-filters/ | modules/core/identity/entity-filters/ | Week 2 |
| core/platform/src/custom-fields/ | modules/core/work/custom-fields/ | Week 2 |
| core/platform/src/notifications/ | modules/core/work/notifications/ | Week 2 |
| core/platform/src/search/ | modules/core/work/search/ | Week 2 |
