# CRMSoft V6 — Repository Structure

## At a Glance

```
CRMPROJECT/
│
├── 📱 apps/                    Executable applications (V6)
│   ├── backend/api/           NestJS backend (migrating from apps-backend/)
│   └── frontend/              7 white-label portals
│       ├── crm-admin-new/
│       ├── vendor-panel-new/
│       ├── customer-portal-new/
│       ├── marketplace-new/
│       ├── wl-admin-new/
│       ├── wl-partner-new/
│       └── platform-console-new/
│
├── 🔒 core/                    Platform foundation (Kumar's domain)
│   ├── platform/              Auth, tenancy, RBAC, API gateway
│   ├── ai-engine/             AI-first framework
│   ├── base-modules/          Shared CRM/accounting/inventory primitives
│   ├── shared-libraries/      Utils, types, validators
│   └── governance/            CI enforcement, audit, compliance rules
│
├── 🏭 verticals/               Industry-specific extensions
│   ├── general/               Default vertical (CRM, accounting, inventory)
│   ├── travel/                Travel industry
│   ├── electronic/            Electronics retail
│   ├── software/              Software vendors
│   ├── restaurant/            Restaurant industry
│   ├── tourism/               Tourism industry
│   └── retail/                Retail industry
│
├── 🤝 partner-customizations/  Per-partner isolated code
│
├── 🎨 brands/                  White-label brand system
│   ├── crmsoft/               Default CRMSoft brand
│   ├── _template/             Starter kit for new partners
│   ├── partner-travel-1-brand/
│   └── partner-electronic-1-brand/
│
├── 📚 docs/                    Architecture + migration docs
├── 🛠  scripts/                 Migration and utility scripts
├── 🧪 tests/                   Integration tests
├── 🔧 tools/                   Dev tooling
├── 🏗  infra/                   Infrastructure configs
│
├── apps-backend/              V5 backend (active — being migrated to apps/)
├── apps-frontend/             V5 frontends (active — being migrated to apps/)
└── archive/                   Archived V5/legacy code (safe, not deleted)
```

## Architecture: 70-30 Inheritance

```
core/               ← 70% shared — auth, modules, AI, data models
  ↓
verticals/          ← industry extensions (travel, electronic, restaurant...)
  ↓
brands/             ← visual identity (colors, fonts, logos)
  ↓
partner-customizations/  ← per-partner business rules
```

Partners customize their 30% without touching the core 70%.

## Multi-Brand Deployment

One git push → many branded deployments:

```bash
# Live brand-switching demo
./scripts/brand-demo.sh

# Build a specific partner deployment
./scripts/v6-migration/build-brand.sh partner-travel-1-brand
./scripts/v6-migration/build-brand.sh partner-electronic-1-brand
```

## Migration Status (Sprint April 23-28)

| Track | Status |
|---|---|
| Foundation skeleton (core/, verticals/, brands/) | ✅ Done |
| 7 frontend portals copied to apps/frontend/ | ✅ Done |
| Core modules extracted (health, help, lookups) | ✅ Done |
| Brand inheritance system + 3 brands | ✅ Done |
| General vertical (50 modules mapped) | ✅ Structure done |
| Visual cleanup (archive legacy code) | ✅ Done |
| Travel + Electronic vertical merge | ⏳ Pending repo URLs |
| Physical code migration to V6 paths | 📋 Week of May 5 |

## Vertical Demo (Day 4)

```bash
# Show General Vertical structure
find verticals/general -maxdepth 3 | sort

# Show brand inheritance working
./scripts/v6-migration/demo-brand-inheritance.sh
```

## For Partners

Partner developers work ONLY in their isolated folder:
```
partner-customizations/{your-partner-name}/
```

No access to core/ is needed. The platform provides everything via APIs and
published SDK packages.

## Docs

See `docs/v6-restructure/` for:
- Target architecture (`02-architecture/01_TARGET_ARCHITECTURE.md`)
- Migration plan (`03-migration/`)
- Brand inheritance demo (`05-demos/brand-inheritance-demo.md`)
- General vertical audit (`01-audit/08_GV_VERTICAL_AUDIT.md`)
