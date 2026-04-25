# Frontend tsc Baselines Before Phase 3 Move

Captured 2026-04-22 (worktree at `chore/v5-restructure`).

## Per-Portal State

| Portal | Source path | `package.json`? | `node_modules`? | tsc errors |
|---|---|:-:|:-:|---:|
| crm-admin | `Customer/frontend/crm-admin/` | ✅ | ✅ | **327** |
| vendor-panel | `Vendor/frontend/vendor-panel/` | ✅ | ❌ | (skipped — no install) |
| customer-portal | `Application/frontend/customer-portal/` | ✅ | ❌ | (skipped — no install) |
| marketplace | `Application/frontend/marketplace/` | ✅ | ❌ | (skipped — no install) |
| wl-admin | `WhiteLabel/wl-admin/` | ✅ | ❌ | (skipped — no install) |
| wl-partner | `WhiteLabel/wl-partner/` | ✅ | ❌ | (skipped — no install) |
| platform-console | `PlatformConsole/frontend/platform-console/` | ✅ | ❌ | (skipped — no install) |

## Gate Rule

Only `crm-admin` has a measured baseline (**327** from `BASELINE_GATE.md`). After move, re-running tsc in `apps-frontend/crm-admin/` must produce ≤ 327 errors.

The other 6 portals will get their first measurable tsc baseline in Phase 5 after the unified `pnpm-workspace.yaml` is in place and `pnpm install` runs across all portals. Phase 3 verifies them only structurally (`package.json` + `tsconfig.json` + `src/` present).
