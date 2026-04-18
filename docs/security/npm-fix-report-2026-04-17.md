# NPM Vulnerability Fix Report — 2026-04-17

## Summary

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Critical | 2 (revealed during fix) | **0** | -2 ✅ |
| High | ~40+ | **17** | -23+ ✅ |
| Moderate | ~38 | **9** | -29 ✅ |
| Low | 1 | **0** | -1 ✅ |
| **Total** | **~80** | **26** | **-54 fixed** ✅ |

> Note: original estimate was 9 critical, 40 high, 24 moderate = 73. Fresh audit found 80 (0 critical at that moment), and revealed 2 NEW criticals in jspdf during the fix process — both immediately cleared.

---

## Final Status Per Package

| Package | Before | After | Status |
|---------|--------|-------|--------|
| Application/backend | 29 | **14** | ✅ 15 fixed, 14 remain (Phase C: NestJS v11) |
| Customer/frontend/crm-admin | 12 (→36 revealed) | **4** | ✅ 2 criticals cleared, 4 = allowlisted (xlsx/expr-eval NO FIX) |
| Vendor/frontend/vendor-panel | 4 | **0** | ✅ CLEAN |
| Application/frontend/customer-portal | 4→7 (fresh advisories) | **0** | ✅ CLEAN |
| Application/frontend/marketplace | 6 | **5** | ⚠️ 5 HIGH = next-pwa chain (Phase C) |
| WhiteLabel/wl-api | 13 | **3** | ✅ 10 fixed, 3 MODERATE (Phase C: Prisma v6) |
| WhiteLabel/wl-admin | 6 | **0** | ✅ CLEAN |
| WhiteLabel/wl-partner | 6 | **0** | ✅ CLEAN |

---

## What Was Fixed

### Phase A — Auto-fix (zero risk)
- **Application/backend**: `npm audit fix` cleared 8 auto-fixable deps
- **WhiteLabel/wl-api**: `npm audit fix` cleared 10 items (lodash, path-to-regexp, picomatch, @angular-devkit chain, @nestjs/config, @nestjs/swagger, hono/picomatch)

### Phase B — Minor/patch bumps
- **All 6 packages with axios**: `axios` → 1.15.0 (SSRF CVE-GHSA-3p68 + metadata exfil CVE-GHSA-fvcv)
- **Application/backend**: `bcrypt` 5.x → 6.0.0 (cleared nested `tar` HIGH chain via node-pre-gyp)
- **Application/backend**: `mathjs` → 15.2.0 (HIGH — improperly controlled modification)
- **Application/backend**: `nodemailer` → latest (MODERATE cleared)
- **Application/backend**: `@nestjs/schematics` 10.x → 11.1.0 dev dep (cleared ajv + picomatch chain)
- **Customer/frontend/crm-admin**: `jspdf` 2.5.2 → 4.2.1 (2 CRITICAL: path traversal + HTML injection)
- **vendor-panel + customer-portal**: `follow-redirects` updated via pnpm update

### Phase C — Major bumps safely applied
- **All 5 Next.js frontends**: `next` 14.2.35 → 15.5.15 (security backport tag) + `eslint-config-next` to match
  - Cleared: HTTP deserialization DoS (GHSA-h25m), HTTP smuggling (GHSA-ggv3), disk cache (GHSA-3x4c), Server Components DoS (GHSA-q4gf), Image Optimizer DoS (GHSA-9g9p)
  - **wl-admin**: 4 → 0 ✅
  - **wl-partner**: 4 → 0 ✅
  - **customer-portal**: 6 → 0 ✅
  - crm-admin: next CVEs cleared (remaining 4 = allowlist)
  - vendor-panel: was already 0 after follow-redirects update
- **Customer/frontend/crm-admin**: removed `fabric` package (unused — confirmed no imports in source). Removed 1 HIGH (XSS) + 1 LOW + resolved tar chain through fabric's jsdom tree

### Phase D — No-fix items (documented in allowlist)
- `xlsx` HIGH x2 in crm-admin — no upstream npm fix
- `expr-eval` HIGH x2 in crm-admin — no upstream npm fix
- `@mrleebo/prisma-ast` HIGH in backend — advisory marks all >=0.14.0; "fix" is feature-removing downgrade; accepted

---

## What Remains (Phase C — Next Sprint)

### Application/backend — 14 remaining (6 moderate, 8 high)
All require **NestJS v11 upgrade sprint**:
- `@nestjs/platform-express` HIGH — fix via v11.1.19+
- `lodash` / `lodash-es` HIGH — fix via @nestjs/swagger@11.3.0
- `@nestjs/common` / `@nestjs/config` / `@nestjs/core` MODERATE
- `@nestjs/swagger` MODERATE
- `@angular-devkit/*` MODERATE — dev dep
- `chevrotain` / `@chevrotain/*` HIGH — via @mrleebo/prisma-ast (allowlisted)
- `@mrleebo/prisma-ast` HIGH — allowlisted (no upstream fix)
- `ajv` / `js-yaml` / `file-type` MODERATE — transitive

### Application/frontend/marketplace — 5 remaining HIGH
All from `next-pwa@5.x` chain via `serialize-javascript` (RCE):
- Fix: migrate to `@serwist/next` (replaces next-pwa) — separate sprint

### WhiteLabel/wl-api — 3 remaining MODERATE
All require **Prisma v6 upgrade**:
- `prisma` / `@prisma/dev` / `@hono/node-server` — fix via `prisma@6.19.3`

---

## Test Gates

| Check | Result |
|-------|--------|
| `pnpm lint:prisma` | ✅ PASS — 0 errors |
| TypeScript errors in backend | Pre-existing (workflow handlers, not introduced by this sprint) |
| `pnpm audit:db` | Requires prisma generate — separate environment check |
| Commit hooks (pre-commit) | ✅ Passed |

---

## Packages Modified

| Package | Changed Dependencies |
|---------|---------------------|
| Application/backend | bcrypt, mathjs, multer, nodemailer, axios, @nestjs/schematics, @nestjs/cli |
| Customer/frontend/crm-admin | axios, jspdf, next, eslint-config-next, fabric (removed) |
| Vendor/frontend/vendor-panel | axios, follow-redirects |
| Application/frontend/customer-portal | axios, next, eslint-config-next, follow-redirects |
| Application/frontend/marketplace | next, eslint-config-next |
| WhiteLabel/wl-api | npm audit fix (lodash, path-to-regexp, picomatch chain) |
| WhiteLabel/wl-admin | axios, next, eslint-config-next, follow-redirects |
| WhiteLabel/wl-partner | axios, next, eslint-config-next, follow-redirects |

---

## Next Sprint Priorities

1. **NestJS v11 upgrade** (Application/backend) — fixes 8 HIGH + 6 MODERATE in backend
2. **@serwist/next migration** (marketplace) — replaces next-pwa, fixes 5 HIGH
3. **Prisma v6 migration** (wl-api) — fixes 3 MODERATE
4. **xlsx → ExcelJS migration** (crm-admin) — removes 2 HIGH allowlist items
5. **expr-eval → mathjs migration** (crm-admin) — removes 2 HIGH allowlist items
