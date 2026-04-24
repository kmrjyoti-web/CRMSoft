# Brand-Vertical Mapping Design

## Information Architecture

/brand-config (index)
├── Lists all brands with: colored avatar, name, code, domain, enabled verticals count, active/default badges
└── "Create Brand" button → /brand-config/new

/brand-config/new (creation wizard)
├── Step 1: Identity — brandCode, brandName, displayName, description, primaryColor, secondaryColor
├── Step 2: Domain — domain, subdomain, contactEmail, logoUrl
└── Step 3: Review + Create → redirects to /brand-config/[brandId]

/brand-config/[brandId] (brand detail — 4 tabs)
├── Overview: identity metadata, branding colors, summary stats
├── Verticals: toggle enable/disable per vertical; link to override editor when enabled
├── Pricing: table of enabled verticals with base/per-user/brand-override pricing
└── Preview: styled gradient card + enabled vertical chips

/brand-config/[brandId]/vertical/[verticalCode] (override editor — 4 tabs)
├── Modules: list all modules, disable/enable per brand (required modules locked)
├── Menus: list all menus, show/hide per brand (depth-aware indentation)
├── Features: grid of features, on/off per brand (premium/beta badges)
└── Pricing: custom base price + custom per-user price fields

## Data Flow

BrandProfile (brandCode)
  └── pc_brand_vertical_config (brand_code + vertical_id) → enabled/overrides
        └── pc_vertical_v2 (base vertical data)
              ├── pc_vertical_module[]
              ├── pc_vertical_menu[]
              └── pc_vertical_feature[]

## API Endpoints Used

All from BrandConfigController (`platform-console/brand-config`):

- GET    /platform-console/brand-config                              → listBrands()
- POST   /platform-console/brand-config                              → createBrand()
- GET    /platform-console/brand-config/:brandId                     → getBrand()
- PATCH  /platform-console/brand-config/:brandId                     → updateBrand()
- GET    /platform-console/brand-config/:brandId/verticals           → getVerticalsForBrand()
- POST   /platform-console/brand-config/:brandId/verticals/:code/enable  → enableVertical()
- POST   /platform-console/brand-config/:brandId/verticals/:code/disable → disableVertical()
- PATCH  /platform-console/brand-config/:brandId/verticals/:code/overrides → updateBrandVerticalOverrides()
- GET    /platform-console/brand-config/:brandId/verticals/:code/effective → getEffectiveConfig()

## Customer Demo Flow

1. /brand-config → See all brands with vertical counts
2. "Create Brand" → 3-step wizard (identity + domain + review)
3. Create → auto-redirect to brand detail
4. Verticals tab → Toggle CRM_GENERAL enabled
5. "Configure Overrides" → Disable 2 modules, hide 1 menu
6. Pricing tab → Set custom price ₹799 vs default ₹999
7. Preview tab → See branded gradient card
