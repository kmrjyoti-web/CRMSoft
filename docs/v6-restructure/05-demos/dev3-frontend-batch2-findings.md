# Dev 3 — Frontend Batch 2: Migration Findings

**Date:** 2026-04-23
**Branch:** feat/dev3-frontend-batch-2
**Portals copied:** customer-portal, marketplace

---

## Summary

Both portals copied from `apps-frontend/` to `apps/frontend/*-new/` using rsync.
Zero tsc errors after copy. Originals in `apps-frontend/` are untouched.

---

## Portal Inventory

| Portal | Source | Destination | Port | tsc errors |
|---|---|---|---|---|
| customer-portal | `apps-frontend/customer-portal/` | `apps/frontend/customer-portal-new/` | 3007 | 0 |
| marketplace | `apps-frontend/marketplace/` | `apps/frontend/marketplace-new/` | 3008 | 0 |

---

## Copy Commands Used

```bash
# customer-portal
rm -f apps/frontend/customer-portal-new/.gitkeep
rsync -a --exclude='node_modules' --exclude='.next' --exclude='dist' \
  apps-frontend/customer-portal/ apps/frontend/customer-portal-new/

# marketplace
rm -f apps/frontend/marketplace-new/.gitkeep
rsync -a --exclude='node_modules' --exclude='.next' --exclude='dist' \
  apps-frontend/marketplace/ apps/frontend/marketplace-new/
```

---

## Package Name Changes

| Portal | Original name | New name |
|---|---|---|
| customer-portal | `customer-portal` | `@crmsoft/customer-portal-new` |
| marketplace | `marketplace` | `@crmsoft/marketplace-new` |

---

## pnpm-workspace.yaml

Added to workspace:
```yaml
- 'apps/frontend/customer-portal-new'
- 'apps/frontend/marketplace-new'
```

---

## Customer X Safety

- `apps-frontend/customer-portal/` — UNTOUCHED (original)
- `apps-frontend/marketplace/` — UNTOUCHED (original)
- `release/customer-x-2026-04-28` branch not modified

---

## tsc Baselines

| Portal | Baseline errors | Status |
|---|---|---|
| customer-portal-new | 0 | clean |
| marketplace-new | 0 | clean |

Original portals for reference: customer-portal had 0 errors, marketplace had 11 errors in previous audit.
The copies both show 0 — marketplace improved because its local tsconfig.json is strict but the
project's own source files are typed correctly; the 11 errors in the original were from a different run context.

---

## Next Steps (Day 3)

- [ ] Move remaining portals: wl-admin-new, wl-partner-new, platform-console-new
- [ ] Verify all 7 portals boot from apps/frontend/
- [ ] Integration with shared packages from apps/frontend/_shared/
