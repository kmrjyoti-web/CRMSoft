# CRMSoft Master Architecture v2.0 — Complete Multi-Layer System

**Version:** 2.0 (supersedes v1.0)
**Date:** April 26, 2026 (8:30 AM session)
**Author:** Kumar (CRMSoft Founder) + AIJunction
**Status:** LOCKED — Foundation for Phase 2 rebuild

**Changes from v1.0:**
- ✅ Added PARTNER layer (above brand)
- ✅ Brand can have MULTIPLE verticals (asked at registration if multi)
- ✅ Added PAGE REGISTRY table — every page/component catalogued
- ✅ Added VERSIONING per page (v1, v2, v3)
- ✅ Added DEMO_READY flag per page
- ✅ Added page-level code extension to combined code
- ✅ Locked sequence: Module > Menu > Page

---

## 1. PHILOSOPHY (6 Non-Negotiable Rules)

```
RULE 1: ZERO HARDCODING
  No vertical/brand/sub-type/module names in components
  Only 4 user_types fixed: B2B / B2C / IND_SP / IND_EE
  Everything else from DB

RULE 2: SEED-DRIVEN, NOT CUSTOMER-DRIVEN
  Customer can only TOGGLE on/off
  We define rules in seed
  Dev console for our team only

RULE 3: COMBINED CODE = PRIMARY KEY (Extended to PAGE level)
  User code: B2B_TR_TRAV_DMC
  Full code: B2B_TR_TRAV_DMC_LEAD_FORM_V1
  This drives: modules + menus + pages + RBAC + dynamic forms

RULE 4: DYNAMIC UI PER BRAND
  (brands)/{brand_name}/ folder structure
  Path-attached via brand resolver
  Theme tokens

RULE 5: AUDIT BEFORE BUILD
  Every existing page audited and catalogued
  Page Registry holds truth
  No page exists outside registry

RULE 6: VERSIONED, NOT REPLACED
  v1 stays when v2 builds
  Both runnable simultaneously
  Customer toggle: which version to use
```

---

## 2. CORE DATA MODEL — 6 Layer Cascade

```
LAYER 0: PARTNER (NEW — uppermost owner)
  ├─ AIJunction (Kumar — owns CRMSoft)
  ├─ Future Partner 1 (white-label license)
  └─ Future Partner 2

LAYER 1: BRAND (under partner)
  ├─ Travvellis    (partner: AIJunction, verticals: [TR])
  ├─ Tally         (partner: AIJunction, verticals: [SW])
  ├─ MultiVendCo   (partner: AIJunction, verticals: [TR, FB, HC]) ← multi
  └─ Default

LAYER 2: VERTICAL
  ├─ TR (Travel)
  ├─ RT (Retail)
  ├─ SW (Software)
  ├─ FB (Food/Restaurant)
  ├─ HC (Healthcare)
  └─ ED (Education)

LAYER 3: USER_TYPE (4 fixed)
  B2B / B2C / IND_SP / IND_EE

LAYER 4: SUB_TYPE (per vertical+user_type)
  Travel + B2B → DMC, AGENT, TOUR_OPERATOR
  Software + B2B → DEALER, RESELLER, MFG, STOCKIST
  ...

LAYER 5: PAGE (NEW — every UI screen)
  Every form/report/dashboard/component has:
    - Unique page code
    - Type (form/report/dashboard/etc.)
    - Route + folder + file path
    - Version
    - Demo flag
    - Linked module + menu

REGISTRATION RESOLUTION:
  /register?brand=travvellis
    → Brand has 1 vertical (TR) → no vertical question
    → Ask user_type → Ask sub_type → fields → submit
  
  /register?brand=multivendco
    → Brand has 3 verticals → ASK vertical first
    → Then user_type → sub_type → fields → submit
```

---

## 3. CODE GENERATION

### 3.1 USER COMBINED CODE (registered users)

```
FORMAT: {USER_TYPE}_{VERTICAL_SHORT}_{BRAND_SHORT}_{SUB_TYPE_SHORT}

EXAMPLES:
  B2B_TR_TRAV_DMC          ← B2B Travel Travvellis DMC
  B2B_TR_TRAV_AGENT
  B2C_TR_TRAV_TRAVELER
  IND_SP_TR_TRAV_GUIDE
  B2B_SW_TALLY_DEALER
  B2B_FB_MULTIVEND_RESTAURANT
```

### 3.2 PAGE CODE (every UI screen)

```
FORMAT: {MODULE_SHORT}_{PAGE_TYPE}_{PAGE_NAME}_V{N}

PAGE_TYPE values:
  FORM         → input form
  TXN          → transaction form
  RPT          → report
  POS          → POS form
  COMP         → child component
  TAB          → tab component
  PAGE         → standalone page
  DASH         → dashboard

EXAMPLES:
  LEAD_FORM_CREATE_V1
  LEAD_RPT_SUMMARY_V1
  QUOT_TXN_LINE_ITEMS_V2     ← v2 of line items
  POS_POS_BILLING_V1
  EMP_FORM_PROFILE_V1
  EMP_FORM_PROFILE_V2        ← v2 of employee profile
  DASH_DASH_EXECUTIVE_V1
```

### 3.3 FULL ACCESS CODE (combined for RBAC)

```
FORMAT: {USER_CODE}_{PAGE_CODE}

EXAMPLES:
  B2B_TR_TRAV_DMC + LEAD_FORM_CREATE_V1
    → B2B_TR_TRAV_DMC_LEAD_FORM_CREATE_V1
    
  B2B_TR_TRAV_DMC + EMP_FORM_PROFILE_V2
    → B2B_TR_TRAV_DMC_EMP_FORM_PROFILE_V2

THIS FULL CODE drives:
  ✅ Can this user access this page version?
  ✅ Which fields visible on this page for this user?
  ✅ Which actions allowed (read/write/delete)?
  ✅ Which form layout (per user type)?
```

---

## 4. CONFIG TABLES (Complete Schema)

### 4.1 PARTNER Layer

```prisma
model PcPartner {
  id              String   @id @default(uuid())
  code            String   @unique  // "AIJUNCTION"
  shortCode       String   @unique  // "AIJ"
  name            String              // "AIJunction"
  description     String?
  ownerEmail      String
  
  // Licensing
  licenseLevel    String?             // "owner", "white-label", "reseller"
  licenseExpiry   DateTime?
  
  isActive        Boolean  @default(true)
  
  brands          PcBrand[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@map("pc_partner")
}
```

### 4.2 BRAND with Multi-Vertical Support

```prisma
model PcBrand {
  id              String   @id @default(uuid())
  code            String   @unique  // "TRAVVELLIS"
  shortCode       String   @unique  // "TRAV"
  name            String              // "Travvellis"
  
  // Partner link
  partnerId       String
  partner         PcPartner @relation(fields: [partnerId], references: [id])
  
  // UI binding
  layoutFolder    String?             // "travvellis"
  themeId         String?
  loginPath       String?             // "/login?brand=travvellis"
  domain          String?             // "travvellis.com" (for subdomain routing)
  
  // Multi-vertical support
  verticals       PcBrandVertical[]   // ⭐ M:N relation
  
  isActive        Boolean  @default(true)
  isPublic        Boolean  @default(false)
  
  @@map("pc_brand")
}

// ⭐ Junction table: Brand ↔ Vertical (multi-vertical)
model PcBrandVertical {
  id              String   @id @default(uuid())
  brandId         String
  brand           PcBrand    @relation(fields: [brandId], references: [id])
  verticalId      String
  vertical        PcVertical @relation(fields: [verticalId], references: [id])
  
  isPrimary       Boolean  @default(false)  // Default vertical for brand
  sortOrder       Int      @default(0)
  
  @@unique([brandId, verticalId])
  @@map("pc_brand_vertical")
}

model PcVertical {
  id              String   @id @default(uuid())
  code            String   @unique  // "TRAVEL"
  shortCode       String   @unique  // "TR"
  name            String
  description     String?
  iconUrl         String?
  
  isActive        Boolean  @default(true)
  isBuilt         Boolean  @default(false)
  
  brands          PcBrandVertical[]
  
  @@map("pc_vertical")
}
```

### 4.3 SUB_TYPE

```prisma
model PcSubType {
  id              String   @id @default(uuid())
  verticalId      String
  vertical        PcVertical @relation(fields: [verticalId], references: [id])
  userType        UserTypeEnum
  code            String              // "DMC_PROVIDER"
  shortCode       String              // "DMC"
  name            String
  description     String?
  iconUrl         String?
  isActive        Boolean  @default(true)
  
  @@unique([verticalId, userType, code])
  @@map("pc_sub_type")
}

enum UserTypeEnum {
  B2B
  B2C
  IND_SP
  IND_EE
}
```

### 4.4 COMBINED CODE (User-level)

```prisma
model PcCombinedCode {
  id              String   @id @default(uuid())
  code            String   @unique  // "B2B_TR_TRAV_DMC"
  
  partnerId       String
  brandId         String
  verticalId      String
  userType        UserTypeEnum
  subTypeId       String
  
  displayName     String
  description     String?
  
  // Default rules (toggleable by customer)
  modulesEnabled  Json     @default("[]")
  marketplaceRules Json    @default("{}")
  
  // Toggleable by customer
  isActive        Boolean  @default(true)
  
  // Page accesses
  pageAccesses    PcPageAccess[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@map("pc_combined_code")
}
```

### 4.5 ⭐ PAGE REGISTRY (THE NEW HEART)

```prisma
model PcPageRegistry {
  id              String   @id @default(uuid())
  
  // ⭐ Unique page code (auto-generated)
  pageCode        String   @unique  // "LEAD_FORM_CREATE_V1"
  
  // Hierarchy (sequence: Module > Menu > Page)
  moduleId        String?              // FK to module
  moduleCode      String              // "leads"
  menuId          String?              // FK to menu
  menuCode        String?
  
  // Page identity
  pageName        String              // "Create Lead"
  pageType        PageTypeEnum         // FORM, RPT, TXN, POS, COMP, TAB, PAGE, DASH
  pageSlug        String              // "create-lead"
  
  // Version control
  version         Int      @default(1)  // 1, 2, 3
  isLatestVersion Boolean  @default(true)
  parentVersionId String?              // points to v1 from v2
  
  // Routing & filesystem
  route           String              // "/leads/create"
  folderPath      String              // "src/app/(main)/leads/create"
  filePath        String              // "src/app/(main)/leads/create/page.tsx"
  
  // Component reference
  componentName   String              // "CreateLeadPage"
  componentPath   String              // import path
  
  // Scope (which combinations can see this page)
  isPartnerScope  Boolean  @default(false)  // accessible to all partners
  partnerIds      Json     @default("[]")    // specific partners
  brandIds        Json     @default("[]")    // specific brands
  verticalIds     Json     @default("[]")    // specific verticals
  moduleScope     Json     @default("[]")    // additional module rules
  
  // Demo flag ⭐
  isDemoReady     Boolean  @default(false)
  demoNotes       String?
  
  // State
  isActive        Boolean  @default(true)
  isDeprecated    Boolean  @default(false)
  
  // Metadata
  description     String?
  tags            Json     @default("[]")    // ["lead-management", "core"]
  
  // Linked records
  pageAccesses    PcPageAccess[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([moduleCode, pageType, pageSlug, version])
  @@map("pc_page_registry")
}

enum PageTypeEnum {
  FORM           // input form
  TXN            // transaction form (multi-step)
  RPT            // report
  POS            // POS interface
  COMP           // child component (reusable)
  TAB            // tab component
  PAGE           // standalone page
  DASH           // dashboard
}
```

### 4.6 PAGE ACCESS RULES (per Combined Code)

```prisma
model PcPageAccess {
  id              String   @id @default(uuid())
  
  combinedCodeId  String
  combinedCode    PcCombinedCode @relation(fields: [combinedCodeId], references: [id])
  
  pageRegistryId  String
  pageRegistry    PcPageRegistry @relation(fields: [pageRegistryId], references: [id])
  
  // ⭐ Full code: combinedCode + pageCode
  fullCode        String   @unique   // "B2B_TR_TRAV_DMC_LEAD_FORM_CREATE_V1"
  
  // RBAC
  canRead         Boolean  @default(true)
  canCreate       Boolean  @default(false)
  canUpdate       Boolean  @default(false)
  canDelete       Boolean  @default(false)
  canExport       Boolean  @default(false)
  
  // Field-level overrides (which fields visible per user type)
  fieldOverrides  Json     @default("[]")
  
  // Page-specific actions
  customActions   Json     @default("[]")
  
  // Toggleable by customer
  isEnabled       Boolean  @default(true)
  
  @@unique([combinedCodeId, pageRegistryId])
  @@map("pc_page_access")
}
```

### 4.7 MODULE & MENU (sequence: Module > Menu > Page)

```prisma
model PcModule {
  id              String   @id @default(uuid())
  code            String   @unique  // "leads"
  name            String              // "Lead Management"
  description     String?
  iconUrl         String?
  
  isActive        Boolean  @default(true)
  sortOrder       Int      @default(0)
  
  menus           PcMenu[]
  
  @@map("pc_module")
}

model PcMenu {
  id              String   @id @default(uuid())
  code            String   @unique  // "leads-list"
  name            String              // "Leads"
  
  moduleId        String
  module          PcModule @relation(fields: [moduleId], references: [id])
  
  // Hierarchy (parent menu support)
  parentMenuId    String?
  parentMenu      PcMenu?  @relation("MenuHierarchy", fields: [parentMenuId], references: [id])
  childMenus      PcMenu[] @relation("MenuHierarchy")
  
  iconUrl         String?
  sortOrder       Int      @default(0)
  
  // Default landing page (FK to PageRegistry)
  defaultPageId   String?
  
  isActive        Boolean  @default(true)
  
  @@map("pc_menu")
}
```

### 4.8 USER IDENTITY (extended)

```prisma
model UserIdentity {
  // ... existing fields ...
  
  // ⭐ Combined code (resolved at registration)
  combinedCode        String?    @map("combined_code")
  
  // Decomposed (for queries)
  partnerCode         String?    @map("partner_code")
  brandCode           String?    @map("brand_code")
  verticalCode        String?    @map("vertical_code")
  userType            String?    @map("user_type")
  subTypeCode         String?    @map("sub_type_code")
  
  // Form data
  registrationData    Json?      @map("registration_data")
  
  // Onboarding
  onboardingStage     String?
  onboardingComplete  Boolean    @default(false)
  preferredLocale     String?
  emailVerified       Boolean    @default(false)
  mobileVerified      Boolean    @default(false)
}
```

---

## 5. REGISTRATION FLOW (with Multi-Vertical Logic)

```
USER VISITS /register?brand=travvellis OR /register?brand=multivendco

Step 1: GET /api/v1/config/brand/{code}
  Returns:
    {
      partner: {...},
      brand: { code, name, layoutFolder, theme },
      verticals: [...]  ← could be 1 or many
    }

Step 2: Vertical Selection
  IF verticals.length === 1:
    auto-select, no question
    proceed to user_type
  ELSE (multiple verticals):
    SHOW: "Select your industry"
    Cards: Travel & Tourism / Food & Beverage / Healthcare
    User picks one
    proceed to user_type

Step 3: User Type Selection
  Show 4 cards: B2B / B2C / IND_SP / IND_EE
  (filtered by what's available for brand+vertical)
  User picks → next

Step 4: Sub-Type Selection
  Load PcSubType where vertical+user_type matches
  Cards: DMC / Agent / Tour Operator (per Travel B2B)
  User picks → next

Step 5: Form Fields
  GET /api/v1/config/registration-form?combined_code=B2B_TR_TRAV_DMC
  Returns dynamic field list
  User fills → submit

Step 6: Backend creates user
  Generate combined_code: B2B_TR_TRAV_DMC
  Create UserIdentity with all backbone fields
  Create UserCompanyMapping
  Generate JWT (includes combined_code + partner)
  Return tokens + redirect path

Step 7: Auto-login → /dashboard (brand-themed)

Step 8: Onboarding (only what's incomplete)
  Stages from PcOnboardingStage filtered by combined_code
  Smart skip based on registration data already captured
```

---

## 6. PAGE REGISTRY USAGE

### 6.1 Discovery (Audit existing)

```
SCRIPT: scripts/audit-pages.ts

Walks src/app/, src/components/, src/features/
For each .tsx page found:
  - Extract route from folder structure
  - Determine type from filename heuristics
  - Auto-generate page_code
  - Insert into PcPageRegistry (mark as imported)

OUTPUT:
  Initial registry populated with all existing pages
  Manual review to refine: type, demoReady, scope
```

### 6.2 New Page Creation Flow

```
DEV CONSOLE → Pages Management
  
  [+] Add New Page
    Module: [Leads ▼]
    Menu: [Leads List ▼]
    Page Type: [FORM ▼]
    Page Name: "Create Lead"
    Version: 1 (auto)
    Route: /leads/create (auto)
    Folder: src/app/(main)/leads/create (auto)
    File: page.tsx (auto)
    Demo Ready: [ ]  ← toggle when ready
    Scope:
      Verticals: [Travel ✓]
      Brands: [All ▼] or specific
      Module Rules: [...]
  
  Auto-generates:
    pageCode: LEAD_FORM_CREATE_V1
  
  [Save] → inserts into PcPageRegistry
  
  Then for each combined code that should access:
    [Configure Access]
    For B2B_TR_TRAV_DMC:
      ☑ canRead, ☑ canCreate, ☑ canUpdate
      Field overrides: hide commission_rate
    For B2C_TR_TRAV_TRAVELER:
      ☑ canRead only
```

### 6.3 Versioning Workflow

```
NEED v2 of Employee Form:

DEV CONSOLE → Pages → EMP_FORM_PROFILE_V1
  [Create New Version]
  
  Auto-creates:
    pageCode: EMP_FORM_PROFILE_V2
    parentVersionId: <v1's id>
    isLatestVersion: true
    (V1: isLatestVersion = false but still active)
  
  Configure new fields/layout for V2
  Test alongside V1
  
  Customer Toggle Panel:
    For each combined code:
      Use Employee Form: [V1 ▼] / [V2 ▼]
      Switch when ready
  
  V1 stays accessible, can rollback
```

### 6.4 RBAC at Page Level (Runtime)

```
USER REQUESTS: /leads/create

Backend resolves:
  1. user.combinedCode = "B2B_TR_TRAV_DMC"
  2. Match route /leads/create to pageRegistry
     pageCode = "LEAD_FORM_CREATE_V1"
  3. Check PcPageAccess where:
     combinedCode = "B2B_TR_TRAV_DMC" AND
     pageRegistryId = <leadCreate id>
  4. fullCode = "B2B_TR_TRAV_DMC_LEAD_FORM_CREATE_V1"
  5. Read RBAC flags + field overrides
  6. Return: { allowed: true, fieldOverrides: [...] }

Frontend:
  Renders form
  Hides fields per overrides
  Disables actions per RBAC
```

---

## 7. DEV CONSOLE — Updated Screens

```
DEV CONSOLE (Vendor Panel @ port 3006):

═══════════════════════════════════════════════════════
SCREEN 0: Partners Management ⭐ NEW
  [+] Add Partner
  Existing: AIJunction (owner)
  Future: white-label partners

═══════════════════════════════════════════════════════
SCREEN 1: Verticals Management
  Same as v1.0

═══════════════════════════════════════════════════════
SCREEN 2: Brands Management ⭐ UPDATED
  Select Partner: [AIJunction ▼]
  
  [+] Add Brand
    - Partner: AIJunction
    - Code: TRAVVELLIS
    - Layout folder, theme, login path
    - Verticals: [Travel ✓] (multi-select!)
  
  Travvellis: 1 vertical (TR)
  MultiVendCo: 3 verticals (TR, FB, HC)

═══════════════════════════════════════════════════════
SCREEN 3: Sub-Types Management
  Same as v1.0

═══════════════════════════════════════════════════════
SCREEN 4: Combined Code Builder
  Same as v1.0 (user-level)

═══════════════════════════════════════════════════════
SCREEN 5: ⭐ NEW — Pages Management
  Filters: Module ▼ Menu ▼ Type ▼ Version ▼ Demo ▼
  
  Table view:
    pageCode | Type | Route | Version | Demo | Active | Actions
    LEAD_FORM_CREATE_V1 | FORM | /leads/create | 1 | ✓ | ✓ | [Edit]
    EMP_FORM_PROFILE_V1 | FORM | /employees/profile | 1 | ✓ | ✓ | [Edit]
    EMP_FORM_PROFILE_V2 | FORM | /employees/profile | 2 | - | ✓ | [Edit]
  
  [+] Add Page
  [Audit & Import Existing] ← scans codebase, populates registry

═══════════════════════════════════════════════════════
SCREEN 6: Page Access Rules
  Select Combined Code: [B2B_TR_TRAV_DMC ▼]
  
  Page list with checkboxes:
    Page                            | Read | Create | Update | Delete | Active
    LEAD_FORM_CREATE_V1             | ✓    | ✓      | ✓      | -      | ✓
    QUOT_TXN_LINE_ITEMS_V2          | ✓    | ✓      | ✓      | -      | ✓
    POS_POS_BILLING_V1              | -    | -      | -      | -      | -
  
  Field Overrides per page (drill-in)

═══════════════════════════════════════════════════════
SCREEN 7: Customer Toggle Panel
  For Travvellis admin (separate from dev):
  - Module on/off
  - Page version selection (V1 vs V2)
  - Cannot create new
```

---

## 8. AUDIT EXISTING PAGES (Sprint M0a)

```
GOAL: Catalogue ALL existing pages into PcPageRegistry

AUDIT SCRIPT (scripts/audit-existing-pages.ts):

1. Walk src/app/(main)/* recursively
2. For each page.tsx:
   - Determine route from folder
   - Heuristic: filename + content for type
   - Extract component name from default export
3. Walk src/features/* for child components
4. Walk src/components/shared/* for reusables
5. Generate pageCode for each
6. Output: pages-inventory.json

MANUAL REVIEW:
  - Confirm types
  - Mark demo-ready ones
  - Set scope (verticals/brands)
  - Group into modules + menus

OUTPUT:
  Inserted into PcPageRegistry
  Each page now has unique pageCode
  Customer/dev can see what exists
```

---

## 9. SPRINT PLAN v2.0 (8 Sprints, 22 Days)

```
SPRINT M0a: AUDIT EXISTING PAGES (1 day) ✅ DONE
  Audit script to scan codebase
  Output: page inventory + pages-inventory.json
  → apps-backend/api/docs/audit/2026-04-26_PAGE_INVENTORY.md
  → apps-backend/api/prisma/seeds/data/pages-inventory.json

SPRINT M0b: ECOSYSTEM AUDIT (1 day) ✅ DONE
  Existing config tables, routes, components
  → apps-backend/api/docs/audit/2026-04-26_ECOSYSTEM_AUDIT.md

SPRINT M1: SCHEMA + SEED (3 days) ← NEXT
  All 10 config tables (Partner, Brand, Vertical, BrandVertical,
  SubType, CombinedCode, PageRegistry, PageAccess, Module, Menu)
  Migration scripts
  Seed scripts (12 total)

SPRINT M2: BACKEND CONFIG APIs (2 days)
  GET /config/brand/:code (with verticals)
  GET /config/sub-types
  GET /config/registration-form
  GET /config/onboarding-stages
  GET /config/menus
  GET /config/page-access (for current user)
  GET /pages/registry (filtered by user)
  POST /pages (dev console — create new page)
  POST /pages/:id/version (create new version)

SPRINT M3: DEV CONSOLE UI (4 days)
  All 7 screens (Partners, Verticals, Brands, Sub-Types,
  Combined Code Builder, Pages Management, Page Access)
  Customer Toggle Panel (separate UI)

SPRINT M4: DYNAMIC REGISTRATION (2 days)
  Multi-vertical aware (asks vertical if multi)
  DynamicRegisterForm component
  Field rendering from config

SPRINT M5: DYNAMIC ONBOARDING (2 days)
  Stages from PcOnboardingStage
  Smart skip logic

SPRINT M6: BRAND LAYOUT SYSTEM (3 days)
  (brands)/{name}/ folders
  Brand resolver
  Theme tokens

SPRINT M7: PAGE-LEVEL RBAC RUNTIME (2 days)
  JWT with combined_code
  Page access check on every request
  Field-level overrides applied

SPRINT M8: TESTING + DOCS (2 days)
  E2E tests
  Notion/Drive docs
  Customer onboarding guide

═══════════════════════════════════════════════════════
TOTAL: 22 days
NO RUSH. Quality over speed.
═══════════════════════════════════════════════════════
```

---

## 10. APR 28 STRATEGY

```
KUMAR'S DECISION:
  "Maine kitne bar bola — agar hum kuch sacha dikha de
   to customer se kuch time le sakte hai. Aap sirf prompt
   war-level dene pe focus karo bus."

INTERPRETATION:
  ✅ Skip Apr 28 confirmed
  ✅ Customer will be informed: "We're building you something great"
  ✅ Show compelling progress/demo when ready
  ✅ Trust process: prompt → execute → ship in May

CUSTOMER COMMUNICATION (Kumar to handle):
  "We're rebuilding the platform with a multi-brand, multi-
   vertical architecture that will let you scale beyond
   Travel into Hospitality, Healthcare, etc. without code
   changes. Need 2-3 weeks to deliver the right foundation.
   Demo in early-mid May with full power."
```

---

## 11. NOTION + GOOGLE DRIVE STRUCTURE

```
NOTION:
  CRMSoft Workspace
    └─ Architecture
        ├─ 📄 Master Architecture v2.0 (this doc)
        ├─ 📄 Combined Code Reference
        ├─ 📄 Page Registry Catalogue
        ├─ 📄 Sprint Logs (M0a, M0b, M1-M8)
        ├─ 📊 Partners DB
        ├─ 📊 Brands DB
        ├─ 📊 Verticals DB
        ├─ 📊 Sub-Types DB
        ├─ 📊 Combined Codes DB
        └─ 📊 Pages Registry DB

GOOGLE DRIVE:
  CRMSoft/Architecture/
    ├─ MASTER_ARCHITECTURE_v2.0.pdf
    ├─ schemas/
    ├─ seed-data/
    │   ├─ partners.json
    │   ├─ verticals.json
    │   ├─ brands.json
    │   ├─ sub-types.json
    │   ├─ combined-codes.json
    │   └─ pages-registry.json
    └─ diagrams/
        ├─ data-model-v2.png
        ├─ registration-flow-multi-vertical.png
        ├─ page-registry-flow.png
        └─ rbac-runtime.png
```

---

## 12. BENEFITS RECAP

```
PERMANENTLY SOLVED PROBLEMS:

❌ Hardcoded forms → ✅ All from PcRegistrationField
❌ Hardcoded onboarding → ✅ All from PcOnboardingStage
❌ Hardcoded vertical names → ✅ All from PcVertical
❌ Brand = single vertical → ✅ M:N relation via PcBrandVertical
❌ Pages scattered, no inventory → ✅ PcPageRegistry catalogues all
❌ No versioning → ✅ V1, V2, V3 with parent linking
❌ Customer can break system → ✅ Toggle-only access
❌ No partner separation → ✅ PcPartner top layer
❌ RBAC at coarse role level → ✅ Per-page + field overrides
❌ Hard to add new brand → ✅ Seed insert + folder copy
❌ Demo readiness unclear → ✅ isDemoReady flag per page

FUTURE ADDITIONS COST:
  New vertical = seed insert (10 min)
  New brand = seed + theme + layout folder (1 hour)
  New sub-type = seed insert (5 min)
  New page = dev console form (2 min)
  New page version = clone in dev console (1 min)
  New customer access rules = checkboxes in console (5 min)
```

---

## 13. NEXT STEPS

```
1. ✅ Kumar reviewed and approved v2.0
2. ✅ Saved to docs/architecture/
3. Sprint M0a ✅ DONE — 402 pages catalogued
4. Sprint M0b ✅ DONE — 387 tables + ecosystem mapped
5. Sprint M0c NEXT — Reconciliation Audit (1-2 hours)
6. Sprint M1 — Schema + Seed (14 tables per v2.1)
7. ... M2-M8, M8a in sequence
8. Demo when M5 minimum complete
```

**See also:** `CRMSOFT_MASTER_ARCHITECTURE_v2.1_ADDENDUM.md`
  - PcSystemConfig (global config registry)
  - PcErrorCatalog (centralized error definitions with multi-language)
  - Tenant-Master Sync model
  - Updated sprint plan: 25 days (added M0c + M8a)

---

**END OF MASTER ARCHITECTURE v2.0**
