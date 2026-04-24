# Vertical System — Complete Schema Reference

## Overview

CRMSoft uses a 4-level vertical system:

```
PcVerticalV2
├── PcVerticalModule[]        (CRM, ACCOUNTING, INVENTORY, …)
│   ├── PcVerticalFeature[]   (AI Lead Scoring, GST Compliance, …)
│   └── PcVerticalMenu[]      (Leads, Contacts, Dashboard, …)
└── PcBrandVerticalConfig[]   (per-brand overrides)
```

---

## 4 Verticals Defined

| Code | Name | Modules | Menus | Features | Price/mo | Status |
|------|------|---------|-------|----------|----------|--------|
| CRM_GENERAL | General Business CRM | 5 | 18 | 19 | ₹999 + ₹99/user | ACTIVE |
| TRAVEL | Travel Industry | 8 | 14 | 8 | ₹1499 + ₹149/user | COMING SOON |
| ELECTRONIC | Electronic Retail & Service | 8 | 13 | 7 | ₹1299 + ₹129/user | COMING SOON |
| SOFTWARE | Software Vendor / SaaS | 8 | 13 | 10 | ₹1999 + ₹199/user | COMING SOON |

---

## Prisma Models

### `PcVerticalV2` → `pc_vertical_v2`
Main vertical entity. Fields: verticalCode, verticalName, displayName, folderPath, packageName, databaseSchemas, apiPrefix, pricing, lifecycle flags, defaultSettings.

### `PcVerticalModule` → `pc_vertical_module`
Modules within a vertical. Fields: moduleCode, moduleName, isRequired, isDefaultEnabled, packagePath, apiNamespace, dbTables, dependsOn.
Unique: `(verticalId, moduleCode)`

### `PcVerticalMenu` → `pc_vertical_menu`
Tree-structured menus. Fields: menuCode, menuLabel, route, iconName, parentMenuId, sortOrder, rolesAllowed, permissionsRequired.
Unique: `(verticalId, menuCode)`

### `PcVerticalFeature` → `pc_vertical_feature`
Feature flags per module. Fields: featureCode, featureName, category (core/premium/beta/experimental), isDefaultEnabled, isPremium, isBeta, configSchema.
Unique: `(verticalId, featureCode)`

### `PcBrandVerticalConfig` → `pc_brand_vertical_config`
Per-brand overrides. Fields: brandCode, enabledModules, disabledModules, hiddenMenus, enabledFeatures, disabledFeatures, featureConfigs, customPrice.
Unique: `(brandCode, verticalId)`

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/platform-console/vertical-config` | List all verticals with counts |
| GET | `/platform-console/vertical-config/:code` | Full vertical (modules+menus+features) |
| GET | `/platform-console/vertical-config/:code/modules` | Modules for a vertical |
| GET | `/platform-console/vertical-config/:code/menus` | Menu tree (nested) |
| GET | `/platform-console/vertical-config/:code/features` | Features grouped by module |
| GET | `/platform-console/vertical-config/:code/brand/:brandCode` | Brand override config |
| POST | `/platform-console/vertical-config/:code/brand/:brandCode` | Upsert brand override |

---

## Module Breakdown

### CRM_GENERAL
| Module | Required | Tables |
|--------|----------|--------|
| DASHBOARD | ✅ | — |
| CRM | ✅ | leads, contacts, organizations, activities, tasks |
| ACCOUNTING | — | invoices, payments, quotations, sales_orders, chart_of_accounts |
| INVENTORY | — | products, pricing, stock, units, taxes |
| COMMUNICATION | — | — |

### TRAVEL (adds over CRM_GENERAL)
TOUR_PACKAGES · BOOKINGS · ITINERARY · SUPPLIERS · COMMISSION

### ELECTRONIC (adds over CRM_GENERAL)
PRODUCT_CATALOG · SERVICE_CENTER · DISTRIBUTION · WARRANTY

### SOFTWARE (adds over CRM_GENERAL)
LICENSING · SUBSCRIPTIONS · SUPPORT_DESK · RELEASES · PARTNER_PROGRAM

---

## Seed Files

```
apps-backend/api/prisma/seed/
├── verticals-master.ts           # Orchestrator — runs all 4
└── verticals/
    ├── 01-crm-general.ts
    ├── 02-travel.ts
    ├── 03-electronic.ts
    └── 04-software.ts
```

Run: `npx ts-node -r tsconfig-paths/register prisma/seed/verticals-master.ts`

---

## Next Steps

- **WAR #11**: Module-wise config UI (edit modules/features per vertical in Platform Console)
- **WAR #12**: Brand-Vertical config UI (override menus/features per brand)
- **WAR #13**: Menu builder with drag-drop tree
