# Brand Inheritance Demo — Day 4 Customer Showcase

**Status:** Ready to run  
**Script:** `./scripts/v6-migration/demo-brand-inheritance.sh`  
**Interactive demo:** `./scripts/brand-demo.sh`

---

## What This Proves

> Same codebase → Different brands → Different deployments

One git repo. One set of React components. One NestJS backend. Partners get
completely different visual identities — no forks, no duplicated code.

---

## Brands Available

| Folder | Brand | Vertical | Primary Color |
|---|---|---|---|
| `brands/crmsoft/` | CRMSoft (default) | Platform | Blue `#2563eb` |
| `brands/partner-travel-1-brand/` | TravelPro CRM | Travel | Sky `#0ea5e9` |
| `brands/partner-electronic-1-brand/` | ElectroHub CRM | Electronic | Crimson `#e11d48` |

Each brand defines **62 CSS custom properties** in `theme/variables.css`:
colors, typography, sidebar, radii, shadows, and status tokens.

---

## Demo Script (Day 4 Customer Session)

### Option A — Interactive live switching (best for screen share)

```bash
./scripts/brand-demo.sh
```

Opens `brands/crmsoft/demo/index.html` in the browser. Click the brand buttons
to switch themes in real time (~16ms, no page reload). Right panel shows exactly
which tokens changed and their old values.

**Talking points:**
- "Click TravelPro — the sidebar, buttons, and font all change instantly."
- "Same HTML. Same React components. Different CSS file."
- "62 variables in one file. That's the entire brand."

### Option B — Separate static builds (best for showing deployments)

```bash
./scripts/v6-migration/demo-brand-inheritance.sh
```

Builds two independent HTML packages — one per brand — and opens them side by
side. Each output file is a fully self-contained deployment with CSS baked in.

```
dist/brands/partner-travel-1-brand/index.html   ← sky blue, Poppins, rounded
dist/brands/partner-electronic-1-brand/index.html ← crimson, Roboto, sharp
```

**Talking points:**
- "These are two separate deployments from one `git push`."
- "Travel partner sees their brand. Electronic partner sees theirs."
- "No rebuild needed when a partner updates their logo or colors — just swap
  the `variables.css` file and redeploy."

---

## Adding a New Partner Brand

```bash
# 1. Copy the starter kit
cp -r brands/_template brands/<partner-slug>-brand

# 2. Fill in the CSS design tokens
#    Edit: brands/<partner-slug>-brand/theme/variables.css
#    Edit: brands/<partner-slug>-brand/config/brand.json

# 3. Build and preview
./scripts/v6-migration/build-brand.sh <partner-slug>-brand
open dist/brands/<partner-slug>-brand/index.html
```

No code changes. No PR needed for brand-only updates.

---

## Architecture: How Inheritance Works

```
core/               ← 70% shared: auth, modules, AI engine, data models
│
brands/
├── crmsoft/        ← default brand (CRMSoft employees)
│   └── theme/variables.css   (62 tokens)
├── partner-travel-1-brand/
│   └── theme/variables.css   (same 62 tokens, travel palette)
└── partner-electronic-1-brand/
    └── theme/variables.css   (same 62 tokens, tech/crimson palette)

At build time:
  BRAND=partner-travel-1-brand → brands/partner-travel-1-brand/theme/variables.css injected
  BRAND=partner-electronic-1-brand → brands/partner-electronic-1-brand/theme/variables.css injected
  All other code identical.
```

---

## Scaling to 10+ Partners

| Partners | Effort |
|---|---|
| 1 new partner brand | ~30 min (copy template + fill CSS tokens) |
| 10 partner brands | ~5 hours (batch, no code involvement) |
| Brand update (logo/color change) | ~5 min (edit variables.css + redeploy) |

Developers are not in the critical path for partner brand updates.

---

## Files Added in This PR

```
brands/partner-electronic-1-brand/
├── theme/variables.css       ← 62 CSS custom properties (crimson-tech palette)
└── config/brand.json         ← feature flags + copy + portal config

scripts/v6-migration/
├── build-brand.sh            ← generates dist/brands/<brand>/index.html
└── demo-brand-inheritance.sh ← builds + verifies both partner brands, opens browser
```
