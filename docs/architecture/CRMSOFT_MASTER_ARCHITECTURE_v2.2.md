# CRMSoft Architecture v2.2 — Final Refinement (Post-M0c)

**Version:** 2.2 (extends v2.0 + v2.1)
**Date:** April 26, 2026 (10:30 AM)
**Author:** Kumar (CRMSoft Founder) + AIJunction
**Status:** APPROVED — Ready for M1 implementation

**What's new in v2.2 (post-audit refinements):**
- ✅ Renamed: `vertical` → `crm_edition` (3 codes: SOFTWARE/TRAVEL/RETAIL)
- ✅ Renamed: `business_type_registry` → `pc_vertical` (15 industries)
- ✅ Hierarchical sub-types (parent-child in single table)
- ✅ Extend existing tables instead of creating new (save 1 week)
- ✅ Auto-derive module codes for 466 existing pages

---

## 1. NAMING CLARITY (THE BIG FIX)

```
BEFORE (confusing):
  gv_cfg_verticals (3 rows: SOFTWARE/TRAVEL/RETAIL)
    = CRM product variants (which version of the CRM?)

  gv_cfg_business_type_registry (15 rows: TRAVEL_TOURISM, IT_SERVICES...)
    = Industries (what business is the customer in?)

  Both called "vertical" — confusing!

AFTER (crystal clear):
  pc_crm_edition (3 rows: SOFTWARE/TRAVEL/RETAIL)
    = Which CRM product? (like Salesforce Editions: Pro/Enterprise/Unlimited)

  pc_vertical (15 rows: TRAVEL_TOURISM, IT_SERVICES, HEALTHCARE_CLINIC...)
    = What industry? (like Salesforce Industry Cloud)

  pc_subtype (hierarchical: industries → roles within industries)
    = Drilling down further into industry roles
```

---

## 2. UPDATED 6-LAYER CASCADE

```
LAYER 0: PARTNER (uppermost)
  ├─ AIJunction (Kumar — owner)
  ├─ Future white-label partners

LAYER 1: BRAND (under partner)
  ├─ Travvellis (partner: AIJunction)
  ├─ Tally, Marg (future)
  ├─ Default
  Each brand maps to 1+ CRM editions

LAYER 2: CRM_EDITION ⭐ RENAMED (was "vertical")
  ├─ SOFTWARE  (CRM edition for software businesses)
  ├─ TRAVEL    (CRM edition for travel businesses)
  └─ RETAIL    (CRM edition for retail businesses)
  Determines: which modules are available for the brand

LAYER 3: VERTICAL ⭐ NEW NAME (was "business_type")
  Industries within each edition:
  ├─ For TRAVEL edition: TRAVEL_TOURISM, HOSPITALITY, AVIATION
  ├─ For SOFTWARE edition: IT_SERVICES, SAAS, ENTERPRISE_SOFTWARE
  └─ For RETAIL edition: RETAIL_FASHION, RETAIL_GROCERY, RETAIL_ELECTRONICS

LAYER 4: USER_TYPE (4 fixed)
  B2B / B2C / IND_SP / IND_EE

LAYER 5: SUB_TYPE ⭐ HIERARCHICAL
  Per vertical + user_type combo, role within industry:
  Travel Tourism + B2B:
    ├─ DMC_PROVIDER (DMC Provider)
    ├─ AGENT (Travel Agent)
    └─ TOUR_OPERATOR (Tour Operator)

LAYER 6: PAGE (every UI screen)
  Same as v2.0/v2.1 — LEAD_FORM_CREATE_V1, etc.
```

---

## 3. UPDATED COMBINED CODE FORMAT

```
FORMAT v2.2:
  {USER_TYPE}_{EDITION_SHORT}_{BRAND_SHORT}_{SUB_TYPE_SHORT}

Example breakdown:
  B2B_TRAV_TRAVL_DMC
   ↑    ↑    ↑     ↑
   |    |    |     └─ Sub-type (DMC Provider)
   |    |    └─ Brand (Travvellis → TRAVL)
   |    └─ CRM Edition (TRAVEL → TRAV)
   └─ User Type (Business)

NOTE: vertical (industry) is implicit in subtype hierarchy
  DMC_PROVIDER's parent → TRAVEL_TOURISM (vertical)
  TRAVEL_TOURISM's edition → TRAVEL

So full code stays compact: B2B_TRAV_TRAVL_DMC

For PAGE-LEVEL CODE (RBAC):
  B2B_TRAV_TRAVL_DMC_LEAD_FORM_CREATE_V1
```

---

## 4. UPDATED TABLE DESIGN

### 4.1 PcPartner (NEW)

```prisma
model PcPartner {
  id          String   @id @default(uuid())
  code        String   @unique  // "AIJUNCTION"
  shortCode   String   @unique  // "AIJ"
  name        String              // "AIJunction"
  description String?
  ownerEmail  String

  licenseLevel  String?            // "owner", "white-label"
  licenseExpiry DateTime?
  isActive      Boolean  @default(true)

  brands        PcBrand[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("pc_partner")
}
```

### 4.2 PcCrmEdition (RENAMED from gv_cfg_verticals)

```prisma
model PcCrmEdition {
  id          String   @id @default(uuid())
  code        String   @unique  // "TRAVEL", "SOFTWARE", "RETAIL"
  shortCode   String   @unique  // "TRAV", "SW", "RT"
  name        String              // "Travel CRM"
  description String?
  iconUrl     String?

  defaultModules Json   @default("[]")  // modules available in this edition

  isActive    Boolean  @default(true)
  isBuilt     Boolean  @default(false)  // is this edition fully built?

  brands      PcBrandEdition[]
  verticals   PcVertical[]

  @@map("pc_crm_edition")
}
```

### 4.3 PcVertical (RENAMED from gv_cfg_business_type_registry)

```prisma
model PcVertical {
  id          String   @id @default(uuid())
  code        String   @unique  // "TRAVEL_TOURISM"
  shortCode   String   @unique  // "TRTT"
  name        String              // "Travel & Tourism"
  description String?
  iconUrl     String?

  // Belongs to which CRM edition
  crmEditionId String
  crmEdition   PcCrmEdition @relation(fields: [crmEditionId], references: [id])

  // Rich metadata (already exists in business_type_registry)
  terminologyMap     Json?   // { "lead": "inquiry", "customer": "guest" }
  defaultModules     Json    @default("[]")
  registrationFields Json    @default("[]")
  workflowTemplates  Json    @default("[]")

  isActive    Boolean  @default(true)

  subTypes    PcSubType[]

  @@map("pc_vertical")
}
```

### 4.4 PcSubType (HIERARCHICAL)

```prisma
model PcSubType {
  id          String   @id @default(uuid())
  code        String   @unique  // "DMC_PROVIDER"
  shortCode   String              // "DMC"
  name        String              // "DMC Provider"
  description String?
  iconUrl     String?

  // Hierarchy
  level       Int      @default(1)  // 1 = top role, 2 = sub-role, 3 = sub-sub-role
  parentId    String?
  parent      PcSubType?  @relation("SubTypeHierarchy", fields: [parentId], references: [id])
  children    PcSubType[] @relation("SubTypeHierarchy")

  // Context
  verticalId  String
  vertical    PcVertical @relation(fields: [verticalId], references: [id])
  userType    UserTypeEnum

  translations Json     @default("{}")
  /* { "en": {"name", "description"}, "hi": {...}, "mr": {...} } */

  defaultModules     Json    @default("[]")
  registrationFields Json    @default("[]")

  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)

  @@unique([verticalId, userType, code])
  @@map("pc_subtype")
}

enum UserTypeEnum {
  B2B
  B2C
  IND_SP
  IND_EE
}
```

### 4.5 PcBrand + PcBrandEdition + PcBrandVertical (M:N)

```prisma
model PcBrand {
  id              String   @id @default(uuid())
  code            String   @unique  // "TRAVVELLIS"
  shortCode       String   @unique  // "TRAVL"
  name            String

  partnerId       String
  partner         PcPartner @relation(fields: [partnerId], references: [id])

  layoutFolder    String?             // "travvellis"
  themeId         String?
  loginPath       String?
  domain          String?

  editions        PcBrandEdition[]   // which CRM editions this brand uses
  verticals       PcBrandVertical[]  // which industries this brand serves

  isActive        Boolean  @default(true)
  isPublic        Boolean  @default(false)

  @@map("pc_brand")
}

// Junction: Brand ↔ CRM Edition (M:N)
model PcBrandEdition {
  id            String   @id @default(uuid())
  brandId       String
  brand         PcBrand      @relation(fields: [brandId], references: [id])
  crmEditionId  String
  crmEdition    PcCrmEdition @relation(fields: [crmEditionId], references: [id])

  isPrimary     Boolean  @default(false)
  sortOrder     Int      @default(0)

  @@unique([brandId, crmEditionId])
  @@map("pc_brand_edition")
}

// Junction: Brand ↔ Vertical (M:N)
model PcBrandVertical {
  id          String   @id @default(uuid())
  brandId     String
  brand       PcBrand    @relation(fields: [brandId], references: [id])
  verticalId  String
  vertical    PcVertical @relation(fields: [verticalId], references: [id])

  isPrimary   Boolean  @default(false)
  sortOrder   Int      @default(0)

  @@unique([brandId, verticalId])
  @@map("pc_brand_vertical")
}
```

### 4.6 PcCombinedCode (NEW)

```prisma
model PcCombinedCode {
  id              String   @id @default(uuid())
  code            String   @unique  // "B2B_TRAV_TRAVL_DMC"

  // Decomposed
  partnerId       String
  brandId         String
  crmEditionId    String
  verticalId      String   // stored for fast queries
  userType        UserTypeEnum
  subTypeId       String

  displayName     String              // "Travvellis DMC Provider"
  description     String?

  modulesEnabled  Json     @default("[]")
  marketplaceRules Json    @default("{}")

  isActive        Boolean  @default(true)

  pageAccesses    PcPageAccess[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("pc_combined_code")
}
```

### 4.7 PcPageRegistry (EXTEND existing gv_cfg_page_registry)

```sql
-- ALTER existing gv_cfg_page_registry (466 rows preserved):

ALTER TABLE gv_cfg_page_registry ADD COLUMN page_code VARCHAR(255) UNIQUE;
ALTER TABLE gv_cfg_page_registry ADD COLUMN page_type VARCHAR(20);
  -- FORM / RPT / TXN / POS / COMP / TAB / PAGE / DASH
ALTER TABLE gv_cfg_page_registry ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE gv_cfg_page_registry ADD COLUMN is_latest_version BOOLEAN DEFAULT true;
ALTER TABLE gv_cfg_page_registry ADD COLUMN parent_version_id UUID;
ALTER TABLE gv_cfg_page_registry ADD COLUMN is_demo_ready BOOLEAN DEFAULT false;
ALTER TABLE gv_cfg_page_registry ADD COLUMN demo_notes TEXT;
ALTER TABLE gv_cfg_page_registry ADD COLUMN partner_ids JSONB DEFAULT '[]';
ALTER TABLE gv_cfg_page_registry ADD COLUMN brand_ids JSONB DEFAULT '[]';
ALTER TABLE gv_cfg_page_registry ADD COLUMN crm_edition_ids JSONB DEFAULT '[]';
ALTER TABLE gv_cfg_page_registry ADD COLUMN vertical_ids JSONB DEFAULT '[]';
ALTER TABLE gv_cfg_page_registry ADD COLUMN tags JSONB DEFAULT '[]';

-- Run module_code backfill script (auto-derives ~80%, flags rest for review)

-- Then rename for consistency:
ALTER TABLE gv_cfg_page_registry RENAME TO pc_page_registry;
```

### 4.8 PcPageAccess (NEW)

```prisma
model PcPageAccess {
  id              String   @id @default(uuid())

  combinedCodeId  String
  combinedCode    PcCombinedCode @relation(fields: [combinedCodeId], references: [id])

  pageRegistryId  String

  fullCode        String   @unique   // "B2B_TRAV_TRAVL_DMC_LEAD_FORM_CREATE_V1"

  canRead         Boolean  @default(true)
  canCreate       Boolean  @default(false)
  canUpdate       Boolean  @default(false)
  canDelete       Boolean  @default(false)
  canExport       Boolean  @default(false)

  fieldOverrides  Json     @default("[]")
  customActions   Json     @default("[]")

  isEnabled       Boolean  @default(true)

  @@unique([combinedCodeId, pageRegistryId])
  @@map("pc_page_access")
}
```

### 4.9 PcSystemConfig (EXTEND system_field_master)

```sql
-- ALTER existing system_field_master (preserves existing rows):

ALTER TABLE system_field_master ADD COLUMN partner_id UUID;
ALTER TABLE system_field_master ADD COLUMN brand_id UUID;
ALTER TABLE system_field_master ADD COLUMN crm_edition_id UUID;
ALTER TABLE system_field_master ADD COLUMN vertical_id UUID;
ALTER TABLE system_field_master ADD COLUMN module_code VARCHAR(50);
ALTER TABLE system_field_master ADD COLUMN config_type VARCHAR(20);
ALTER TABLE system_field_master ADD COLUMN config_rules JSONB DEFAULT '{}';
ALTER TABLE system_field_master ADD COLUMN translations JSONB DEFAULT '{}';
ALTER TABLE system_field_master ADD COLUMN is_customer_toggleable BOOLEAN DEFAULT false;
ALTER TABLE system_field_master ADD COLUMN is_customer_overridable BOOLEAN DEFAULT false;
ALTER TABLE system_field_master ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE system_field_master ADD COLUMN is_latest_version BOOLEAN DEFAULT true;

ALTER TABLE system_field_master RENAME TO pc_system_config;
```

### 4.10 PcErrorCatalog (EXTEND existing gv_cfg_error_catalog)

```sql
-- ALTER existing (already has EN/HI messages, severity, retry_after_ms, 0 rows):

ALTER TABLE gv_cfg_error_catalog ADD COLUMN partner_id UUID;
ALTER TABLE gv_cfg_error_catalog ADD COLUMN brand_id UUID;
ALTER TABLE gv_cfg_error_catalog ADD COLUMN crm_edition_id UUID;
ALTER TABLE gv_cfg_error_catalog ADD COLUMN vertical_id UUID;
ALTER TABLE gv_cfg_error_catalog ADD COLUMN module_code VARCHAR(50);
ALTER TABLE gv_cfg_error_catalog ADD COLUMN help_text JSONB DEFAULT '{}';
ALTER TABLE gv_cfg_error_catalog ADD COLUMN help_url JSONB DEFAULT '{}';
ALTER TABLE gv_cfg_error_catalog ADD COLUMN suggestions JSONB DEFAULT '{}';
ALTER TABLE gv_cfg_error_catalog ADD COLUMN is_customer_overridable BOOLEAN DEFAULT true;

ALTER TABLE gv_cfg_error_catalog RENAME TO pc_error_catalog;
```

### 4.11 PcOnboardingStage (NEW)

```prisma
model PcOnboardingStage {
  id              String   @id @default(uuid())

  combinedCodeId  String?              // null = applies to all combined codes

  stageKey        String              // "language", "email_otp", "user_type"
  stageLabel      String
  componentName   String              // React component to render

  sortOrder       Int      @default(0)

  skipIfFieldSet  String?             // skip if user.{field} is truthy
  required        Boolean  @default(true)

  translations    Json     @default("{}")

  isActive        Boolean  @default(true)

  @@unique([combinedCodeId, stageKey])
  @@map("pc_onboarding_stage")
}
```

### 4.12 PcRegistrationField (NEW)

```prisma
model PcRegistrationField {
  id              String   @id @default(uuid())

  combinedCodeId  String

  fieldKey        String              // "company_name"
  fieldType       String              // "text" / "select" / "file"
  label           String
  placeholder     String?
  helpText        String?
  required        Boolean  @default(false)

  options         Json?               // for select fields
  validation      Json?               // pattern, min, max
  showWhen        Json?               // conditional display

  translations    Json     @default("{}")

  sortOrder       Int      @default(0)
  isActive        Boolean  @default(true)

  @@unique([combinedCodeId, fieldKey])
  @@map("pc_registration_field")
}
```

---

## 5. CACHING LAYER (Performance)

```
ALL Pc* tables MUST be cached:

REDIS STRATEGY:
  - Cache on app boot (eager loading)
  - Per-table TTL: 1 hour
  - Invalidation: CRUD on Pc* → invalidate that table's cache

  Key naming: config:{table}:{id_or_query}
    Examples:
      config:pc_partner:all
      config:pc_brand:travvellis
      config:pc_combined_code:B2B_TRAV_TRAVL_DMC
      config:pc_page_access:B2B_TRAV_TRAVL_DMC_LEAD_FORM_CREATE_V1

PERFORMANCE BUDGET:
  Cache hit:   < 2ms
  Cache miss:  < 50ms (one DB round-trip)
  Hit ratio:   > 99%
```

---

## 6. COMPLETE TABLE COUNT (Reality Check)

```
EXTEND existing (5):
  1. gv_cfg_error_catalog → pc_error_catalog
  2. system_field_master → pc_system_config
  3. pc_brand_vertical_config (already there)
  4. pc_vertical_module (already there)
  5. pc_vertical_menu (already there)

RENAME + EXTEND (4):
  6.  gv_cfg_verticals → pc_crm_edition
  7.  gv_cfg_brands → pc_brand
  8.  business_type_registry + pc_subcategory → pc_vertical + pc_subtype (merge)
  9.  gv_cfg_page_registry → pc_page_registry

CREATE NEW (5):
  10. pc_partner
  11. pc_combined_code
  12. pc_page_access
  13. pc_onboarding_stage
  14. pc_registration_field

JUNCTION TABLES (2):
  15. pc_brand_edition (M:N)
  16. pc_brand_vertical (M:N)

TOTAL: 16 tables
  Already exist:  5 (extend-only)
  Renamed:        4 (extend + rename)
  Truly new:      7
```

---

## 7. SPRINT PLAN (v2.2 — 23 days)

```
SPRINT M0a: ✅ DONE — 402 pages catalogued
SPRINT M0b: ✅ DONE — 387 tables mapped
SPRINT M0c: ✅ DONE — reconciliation + naming resolved

SPRINT M1: SCHEMA + SEED (3 days) ← NEXT

  Day 1 — Foundation:
    - Rename gv_cfg_verticals → pc_crm_edition (data preserved)
    - Rename gv_cfg_brands → pc_brand (data preserved)
    - ALTER existing tables (add new columns)
    - Create pc_partner (NEW)
    - Run validation

  Day 2 — Sub-types + Pages:
    - Migrate business_type_registry + pc_subcategory → pc_vertical + pc_subtype
    - ALTER gv_cfg_page_registry → pc_page_registry (add 12 columns)
    - Run module_code backfill script (auto-derive ~80%)
    - Manual review flagged pages (1 hour)
    - Create pc_page_access (NEW)

  Day 3 — Combined Code + Onboarding + Seed:
    - Create pc_combined_code (NEW)
    - Create pc_onboarding_stage (NEW)
    - Create pc_registration_field (NEW)
    - Create pc_brand_edition + pc_brand_vertical junctions (NEW)
    - Run all 12 seed scripts
    - Validation tests

SPRINT M2: BACKEND APIs (2 days)
SPRINT M3: DEV CONSOLE UI (4 days)
SPRINT M4: DYNAMIC REGISTRATION (2 days)
SPRINT M5: DYNAMIC ONBOARDING (2 days)
SPRINT M6: BRAND LAYOUT SYSTEM (3 days)
SPRINT M7: PAGE-LEVEL RBAC RUNTIME (2 days)
SPRINT M8a: TENANT SYNC (3 days)
SPRINT M8: TESTING + DOCS (2 days)

═══════════════════════════════════════════
TOTAL: 23 days
Demo target: May 18-20, 2026
═══════════════════════════════════════════
```

---

## 8. AUTO-DERIVE MODULE CODE (Blocker 3 Solution)

```typescript
// Script: scripts/backfill-page-modules.ts

const moduleMap: Record<string, string> = {
  '/leads': 'leads',
  '/quotations': 'quotations',
  '/orders': 'orders',
  '/invoices': 'invoices',
  '/customers': 'customers',
  '/contacts': 'contacts',
  '/marketplace': 'marketplace',
  '/employees': 'employees',
  '/dashboard': 'dashboard',
  '/reports': 'reports',
  '/settings': 'settings',
  '/payments': 'payments',
  '/products': 'products',
  '/inventory': 'inventory',
  '/crm-admin': 'admin',
  '/vendor-panel': 'vendor',
};

async function deriveModuleCode(route: string): Promise<string | null> {
  for (const [pathPrefix, moduleCode] of Object.entries(moduleMap)) {
    if (route.startsWith(pathPrefix)) return moduleCode;
  }
  return null;  // flagged for manual review
}

// Run on all 466 rows:
//   ~80% auto-derive correctly
//   ~20% need manual review (flagged)
```

---

## 9. M0c IMPACT SUMMARY

```
SAVED:
  ✅ 1 day from M1 (extend existing, not create from scratch)
  ✅ Naming confusion eliminated (vertical → crm_edition)
  ✅ Hierarchical sub-types (cleaner than flat)
  ✅ Reusing 466 page registry rows
  ✅ Reusing existing error catalog schema
  ✅ Reusing system_field_master

TIMELINE EVOLUTION:
  v2.0 estimate: 22 days
  v2.1 estimate: 25 days (+ tenant sync)
  v2.2 actual:   23 days (-1 from M0c savings, +tenant sync)

DEMO TARGET: May 18-20, 2026
```

---

**END OF ARCHITECTURE v2.2**
