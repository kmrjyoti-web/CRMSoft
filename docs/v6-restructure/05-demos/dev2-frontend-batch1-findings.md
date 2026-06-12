# Dev 2 Day 2 Findings — Frontend Migration Batch 1

**Author:** Dev 2 (Frontend Specialist)
**Date:** 2026-04-24

---

## Summary

Both portals successfully copied to new V6 locations. Originals untouched.
tsc baselines match the originals exactly.

---

## Portals Migrated

### crm-admin-new

| Property | Value |
|---|---|
| Source | apps-frontend/crm-admin/ |
| Target | apps/frontend/crm-admin-new/ |
| Package name | @crmsoft/crm-admin-new |
| Port | 3005 (unchanged) |
| Next.js | 15.5.15 |
| Files | 2352 |
| tsc baseline | 332 errors (matches original) |
| Method | rsync copy (node_modules/.next excluded) |

### vendor-panel-new

| Property | Value |
|---|---|
| Source | apps-frontend/vendor-panel/ |
| Target | apps/frontend/vendor-panel-new/ |
| Package name | @crmsoft/vendor-panel-new |
| Port | 3006 (unchanged) |
| Next.js | 14.2.35 |
| Files | 222 |
| tsc baseline | 1 error (jest type quirk — matches original, ticket #7) |
| Method | rsync copy (node_modules/.next excluded) |

---

## Customer X Protection

- apps-frontend/crm-admin/ — UNTOUCHED ✅
- apps-frontend/vendor-panel/ — UNTOUCHED ✅
- Copy approach (not git mv) ensures originals remain for Apr 28 launch

---

## Why Copy Not Move

WAR PROMPT said "copy" — correct decision because:
1. Customer X launches Apr 28 from existing apps-frontend/ paths
2. V6 locations are for NEXT version of the portals
3. Once V6 is verified in production, originals can be deleted
4. The -new suffix makes clear these are parallel tracks

---

## pnpm-workspace.yaml Update

Added:
```yaml
- 'apps/frontend/crm-admin-new'
- 'apps/frontend/vendor-panel-new'
```

Both portals install deps via `pnpm install --filter '@crmsoft/<name>'`.

---

## Day 3 Next Steps

### Brand theme injection (Dev 2's Day 3 task)

Create `brands/crmsoft/theme/variables.css` with current CRM Admin color tokens:
- Extract CSS variables from crm-admin-new's tailwind.config.js / globals.css
- Add brand switching logic to next.config.js

### Port conflict resolution

Both -new portals run on same ports as originals (3005, 3006).
For parallel development, team can:
- Run only the -new versions (kill originals)
- OR change -new ports to 3015/3016 temporarily

Recommended: Keep 3005/3006 — only one version runs at a time.

---

## Day 2 Delivery Status

- [x] crm-admin copied to apps/frontend/crm-admin-new/
- [x] vendor-panel copied to apps/frontend/vendor-panel-new/
- [x] pnpm-workspace.yaml updated
- [x] Both portals install + tsc verified
- [x] tsc baselines match originals
- [x] Customer X originals untouched
- [x] PR opened
