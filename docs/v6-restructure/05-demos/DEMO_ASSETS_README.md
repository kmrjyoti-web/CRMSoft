# Demo Assets Preparation — Apr 26, 2026

## 1. Brand Demo (Run This First)

```bash
./scripts/brand-demo.sh
```

Expected output:
- 3 HTML files built at `dist/brands/*/index.html`
- 3 browser tabs open automatically (CRMSoft, TravelCRM, ElectroHub CRM)
- Isolation check: PASSED (3 distinct primary colors)

| Brand | Primary Color |
|-------|--------------|
| CRMSoft | `#6366f1` (indigo) |
| TravelCRM | `#0ea5e9` (sky blue) |
| ElectroHub CRM | `#e11d48` (crimson) |

## 2. Live Terminal Commands for Demo

```bash
# Real file count (show this on screen)
find verticals/general/modules -name "*.ts" | wc -l
# Expected: 1,725+

# Line count
find verticals/general/modules -name "*.ts" -exec wc -l {} + | tail -1
# Expected: 108,000+

# Show module structure
find verticals/general/modules -maxdepth 3 -type d | sort

# Show a real NestJS module
head -20 verticals/general/modules/crm/src/modules/leads/leads.module.ts
```

## 3. VS Code — Files to Pre-Open

| Tab | Path | What to Show |
|-----|------|-------------|
| Sidebar | Project root | Clean 5-category structure |
| Explorer | `verticals/general/modules/` | Expand crm/, accounting/, inventory/ |
| File | `verticals/general/modules/crm/src/modules/leads/leads.module.ts` | Real NestJS code |
| File | `verticals/general/modules/crm/package.json` | `@crmsoft/gv-crm` package |
| File | `verticals/general/package.json` | Root vertical package |
| File | `.github/CODEOWNERS` | Access control rules |
| File | `brands/partner-travel-1-brand/theme/variables.css` | Brand CSS variables |
| File | `brands/partner-electronic-1-brand/theme/variables.css` | Different brand |

## 4. Browser Tabs to Pre-Open

1. https://github.com/kmrjyoti-web/CRMSoft — repo home
2. https://github.com/kmrjyoti-web/CRMSoft/pulls — 13 PRs
3. https://github.com/kmrjyoti-web/CRMSoft/pull/30 — real code merge (1,725 files)
4. `dist/brands/crmsoft/index.html` — CRMSoft brand
5. `dist/brands/partner-travel-1-brand/index.html` — Travel brand
6. `dist/brands/partner-electronic-1-brand/index.html` — Electronic brand

## 5. Statistics to Memorize

| Stat | Value |
|------|-------|
| Sprint duration | 72 hours |
| PRs opened | 13 |
| Files migrated | 1,725+ |
| Lines of code | 108,000+ |
| Workspace packages | 11 |
| Documentation files | 25+ |
| Integration tests | 65 |
| CI workflows | 4 |
| Root dirs (before → after) | 21 → 13 |
| Production breaks | 0 |

## 6. Documents to Have Ready

- `CUSTOMER_DEMO_ONEPAGER.md` — share via email/chat before or after demo
- `docs/v6-restructure/05-demos/DEMO_WALKTHROUGH_SCRIPT.md` — your script
- `docs/v6-restructure/05-demos/SPRINT_STATUS_FINAL.md` — detailed stats
