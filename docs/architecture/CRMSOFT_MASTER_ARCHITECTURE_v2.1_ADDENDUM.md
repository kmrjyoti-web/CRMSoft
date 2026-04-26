# CRMSoft Architecture v2.1 — Addendum: System Config + Error Catalog + Tenant Sync

**Version:** 2.1 (extends v2.0)
**Date:** April 26, 2026 (9:30 AM)
**Author:** Kumar (CRMSoft Founder) + AIJunction
**Status:** APPROVED ADDITION TO v2.0

**What's new:**
- ✅ PcSystemConfig — global config registry
- ✅ PcErrorCatalog — centralized error definitions
- ✅ Multi-language support (JSON translations) for both
- ✅ Tenant-Master Sync model (when customer has own DB)
- ✅ Governance flow (Dev → AIJunction → Deploy)

---

## 1. SYSTEM CONFIG ARCHITECTURE

### 1.1 Why This Layer

```
PROBLEM TODAY:
  - Settings scattered: env vars, hardcoded constants, DB rows
  - No single source of truth for configuration
  - Customer cannot toggle anything without code change
  - Multi-language config? Not possible currently

SOLUTION:
  PcSystemConfig table — every system config has:
    - Scope (partner/brand/vertical/module)
    - Key + Name + Detail
    - Rules in JSON (validation, defaults, options)
    - Translations in JSON (English, Hindi, Marathi, etc.)
    - Customer-toggleable flag
```

### 1.2 PcSystemConfig Schema

```prisma
model PcSystemConfig {
  id              String   @id @default(uuid())
  
  // ⭐ Scope (same pattern as PcCombinedCode)
  partnerId       String?              // null = global
  brandId         String?              // null = applies to all brands
  verticalId      String?              // null = applies to all verticals
  moduleCode      String?              // "leads", "marketplace", "auth"
  
  // Identity
  configKey       String              // "max_login_attempts"
  configName      String              // "Maximum Login Attempts"
  configDetail    String?             // human description
  
  // Value structure
  configType      ConfigTypeEnum     // STRING, NUMBER, BOOLEAN, JSON, ENUM
  defaultValue    Json?               // typed by configType
  
  // Rules (validation + behavior)
  configRules     Json     @default("{}")
  /*
    Examples:
    {
      "validation": "<rule>",
      "options": ["en", "hi", "mr"],
      "required": true,
      "regex": "^[A-Z]+$"
    }
  */
  
  // Multi-language
  translations    Json     @default("{}")
  /*
    Example:
    {
      "en": { "name": "Maximum Login Attempts", "detail": "..." },
      "hi": { "name": "अधिकतम लॉगिन प्रयास", "detail": "..." },
      "mr": { "name": "कमाल लॉगिन प्रयत्न", "detail": "..." }
    }
  */
  
  // Customer permissions
  isCustomerToggleable Boolean @default(false)
  isCustomerOverridable Boolean @default(false)  // can customer set custom value?
  isReadOnly           Boolean @default(false)
  
  // Lifecycle
  isActive             Boolean @default(true)
  isDeprecated         Boolean @default(false)
  deprecatedAt         DateTime?
  replacedBy           String?  // FK to new config
  
  // Versioning (same as page registry)
  version              Int      @default(1)
  isLatestVersion      Boolean  @default(true)
  parentVersionId      String?
  
  // Sync metadata (for tenant DBs)
  syncSource           String?  // "MASTER" or "TENANT_OVERRIDE"
  lastSyncedAt         DateTime?
  
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  
  @@unique([partnerId, brandId, verticalId, moduleCode, configKey, version])
  @@map("pc_system_config")
}

enum ConfigTypeEnum {
  STRING
  NUMBER
  BOOLEAN
  JSON
  ENUM
  ARRAY
}
```

### 1.3 Example Configs

```json
[
  {
    "configKey": "default_currency",
    "configName": "Default Currency",
    "scope": { "global": true },
    "configType": "STRING",
    "defaultValue": "INR",
    "configRules": { "options": ["INR", "USD", "EUR"] },
    "translations": {
      "en": { "name": "Default Currency", "detail": "Default currency for transactions" },
      "hi": { "name": "डिफ़ॉल्ट मुद्रा", "detail": "लेनदेन के लिए डिफ़ॉल्ट मुद्रा" }
    },
    "isCustomerOverridable": true
  },
  {
    "configKey": "marketplace_commission_rate",
    "scope": { "verticalId": "TR", "moduleCode": "marketplace" },
    "configType": "NUMBER",
    "defaultValue": 10,
    "configRules": { "min": 0, "max": 30 },
    "isCustomerToggleable": false
  },
  {
    "configKey": "max_login_attempts",
    "scope": { "moduleCode": "auth" },
    "configType": "NUMBER",
    "defaultValue": 5,
    "configRules": { "min": 3, "max": 10 },
    "isCustomerOverridable": true
  },
  {
    "configKey": "supported_languages",
    "scope": { "global": true },
    "configType": "ARRAY",
    "defaultValue": ["en", "hi", "mr"],
    "isCustomerOverridable": false
  }
]
```

---

## 2. ERROR CATALOG ARCHITECTURE

### 2.1 Why Centralized Errors

```
PROBLEM TODAY:
  - Errors thrown with hardcoded English strings
  - No multi-language support
  - No help URLs for users
  - No way to update error messages without redeploy
  - Customers can't customize messages for their brand voice

SOLUTION:
  PcErrorCatalog table — every error has:
    - Code (machine-readable, never changes)
    - Message (translatable)
    - Help text (translatable, optional)
    - Help URL (translatable docs link)
    - Severity (info/warning/error/critical)
    - Category (auth/validation/business/system)
```

### 2.2 PcErrorCatalog Schema

```prisma
model PcErrorCatalog {
  id              String   @id @default(uuid())
  
  // ⭐ Scope (same pattern)
  partnerId       String?
  brandId         String?
  verticalId      String?
  moduleCode      String?
  
  // Identity
  errorCode       String              // "AUTH_INVALID_CREDENTIALS"
  errorName       String              // for dev/admin reference
  
  // Classification
  severity        ErrorSeverity      // INFO, WARNING, ERROR, CRITICAL
  category        ErrorCategory      // AUTH, VALIDATION, BUSINESS, SYSTEM, NETWORK
  httpStatusCode  Int?                // 401, 400, 500, etc.
  
  // Multi-language messaging
  messages        Json     @default("{}")
  /*
    {
      "en": "Invalid email or password.",
      "hi": "अमान्य ईमेल या पासवर्ड।",
      "mr": "अवैध ईमेल किंवा पासवर्ड."
    }
  */
  
  helpText        Json     @default("{}")
  helpUrl         Json     @default("{}")
  
  suggestions     Json     @default("{}")
  /*
    {
      "en": ["Reset your password", "Check your email", "Contact support"],
      "hi": ["अपना पासवर्ड रीसेट करें", "अपना ईमेल जांचें"]
    }
  */
  
  // Behavior flags
  isRetryable     Boolean  @default(false)
  showToUser      Boolean  @default(true)
  isLoggable      Boolean  @default(true)
  isAlertable     Boolean  @default(false)
  
  // Customization
  isCustomerOverridable Boolean @default(true)
  
  // Lifecycle
  isActive        Boolean  @default(true)
  isDeprecated    Boolean  @default(false)
  
  // Versioning
  version         Int      @default(1)
  isLatestVersion Boolean  @default(true)
  parentVersionId String?
  
  // Sync
  syncSource      String?
  lastSyncedAt    DateTime?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([partnerId, brandId, verticalId, moduleCode, errorCode, version])
  @@map("pc_error_catalog")
}

enum ErrorSeverity {
  INFO
  WARNING
  ERROR
  CRITICAL
}

enum ErrorCategory {
  AUTH
  VALIDATION
  BUSINESS
  SYSTEM
  NETWORK
  PERMISSION
  DATA
  EXTERNAL
}
```

### 2.3 Example Error Entries

```json
[
  {
    "errorCode": "AUTH_INVALID_CREDENTIALS",
    "errorName": "Invalid Login Credentials",
    "severity": "ERROR",
    "category": "AUTH",
    "httpStatusCode": 401,
    "messages": {
      "en": "Invalid email or password.",
      "hi": "अमान्य ईमेल या पासवर्ड।"
    },
    "helpText": {
      "en": "Make sure your credentials are correct.",
      "hi": "सुनिश्चित करें कि आपकी जानकारी सही है।"
    },
    "suggestions": {
      "en": ["Reset password", "Try again", "Contact support"],
      "hi": ["पासवर्ड रीसेट करें", "फिर से कोशिश करें"]
    },
    "isRetryable": true,
    "showToUser": true,
    "isCustomerOverridable": true
  },
  {
    "errorCode": "PAYMENT_GATEWAY_TIMEOUT",
    "scope": { "moduleCode": "payments" },
    "severity": "ERROR",
    "category": "EXTERNAL",
    "httpStatusCode": 504,
    "messages": {
      "en": "Payment gateway not responding. Please try again.",
      "hi": "पेमेंट गेटवे प्रतिक्रिया नहीं दे रहा। कृपया पुनः प्रयास करें।"
    },
    "isRetryable": true,
    "isAlertable": true
  }
]
```

---

## 3. GOVERNANCE FLOW (Who Creates What)

```
═══════════════════════════════════════════════
TIER 1: DEVELOPER (suggests)
═══════════════════════════════════════════════
  Developer discovers need for new config/error
  Creates SUGGESTION file:
    docs/suggestions/2026-04-26_new_config.md
  Submits via PR or Notion task
  
  CANNOT directly seed production
  CANNOT modify master seed files

═══════════════════════════════════════════════
TIER 2: AIJUNCTION (creates)
═══════════════════════════════════════════════
  Kumar reviews developer suggestion
  Validates: scope, naming, translations, rules
  Creates seed entry in:
    apps-backend/api/prisma/seeds/master/
      ├─ system-config.json
      ├─ error-catalog.json
      ├─ verticals.json
      ├─ brands.json
      └─ ...
  Commits to git → triggers seed deployment

═══════════════════════════════════════════════
TIER 3: DEPLOY (executes)
═══════════════════════════════════════════════
  Seed deployment:
    - Validates schema
    - Backs up existing data
    - Inserts/updates rows (version++ where needed)
    - Syncs to all tenant DBs
    - Audit log entry

═══════════════════════════════════════════════
TIER 4: CUSTOMER (toggles only)
═══════════════════════════════════════════════
  Customer admin can:
    ✓ Toggle isActive on configs (where allowed)
    ✓ Override values (where isCustomerOverridable=true)
    ✓ Customize error messages (where isCustomerOverridable=true)
    ✓ Choose between versions (V1 vs V2)
  
  Cannot:
    ✗ Create new config keys
    ✗ Create new error codes
    ✗ Modify master seed
    ✗ Delete entries
```

---

## 4. TENANT-MASTER SYNC MODEL ⭐ CRITICAL

### 4.1 The Architecture Decision

```
MASTER DB (PlatformConsoleDB at AIJunction):
  pc_system_config       ← source of truth
  pc_error_catalog       ← source of truth
  pc_menu                ← source of truth
  pc_page_registry       ← source of truth
  
TENANT DB (Customer's dedicated DB):
  tenant_system_config   ← synced from master + customer overrides
  tenant_error_catalog   ← synced from master + customer overrides
  tenant_menu            ← synced from master + customer overrides
  tenant_page_registry   ← synced from master + customer overrides

SYNC RULES:
  ✅ Master changes → push to tenant DBs (one-way)
  ✅ Customer overrides → stored only in tenant DB
  ✅ Customer overrides NEVER overwritten by master
  ✅ Customer can revert to master at any time
  ✅ Audit log of all syncs
```

### 4.2 Tenant Override Schema

```prisma
model TenantSystemConfig {
  id              String   @id @default(uuid())
  
  masterConfigId  String              // FK to PcSystemConfig.id
  masterVersion   Int
  
  partnerId       String?
  brandId         String?
  verticalId      String?
  moduleCode      String?
  configKey       String
  
  hasOverride     Boolean  @default(false)
  overrideValue   Json?
  overrideRules   Json?
  overrideTranslations Json?
  
  syncStatus      SyncStatusEnum
  lastSyncedAt    DateTime
  lastModifiedAt  DateTime
  
  conflictDetected     Boolean @default(false)
  conflictDetectedAt   DateTime?
  conflictResolution   String?  // "USE_MASTER", "USE_OVERRIDE", "MERGE"
  
  @@unique([masterConfigId])
  @@map("tenant_system_config")
}

enum SyncStatusEnum {
  SYNCED
  MASTER_NEWER
  OVERRIDE_LOCKED
  CONFLICT
}
```

### 4.3 Sync Workflow

```
INITIAL SYNC (when tenant DB is created):
  1. Tenant DB created (empty config tables)
  2. Sync job copies all master rows → tenant
  3. Sets syncStatus = SYNCED, hasOverride = false
  4. Tenant ready to use

INCREMENTAL SYNC (master updated):
  For each tenant, for each updated master row:
    IF hasOverride = true:
      → Mark syncStatus = MASTER_NEWER
      → Don't overwrite
      → Notify customer of available update
    ELSE:
      → Update tenant row to match master
      → Set syncStatus = SYNCED

CUSTOMER OVERRIDE:
  Customer sets overrideValue
  Backend: hasOverride = true, syncStatus = OVERRIDE_LOCKED
  Future master changes DO NOT overwrite

CONFLICT RESOLUTION OPTIONS:
  A) USE_OVERRIDE — keep customer value (default)
  B) USE_MASTER   — accept new master
  C) MERGE        — for JSON configs
```

### 4.4 Tables That Get Tenant Sync

```
GLOBAL ONLY (no tenant copy):
  pc_partner
  pc_brand_vertical
  pc_combined_code (read-only reference)

GLOBAL + TENANT SYNC:
  pc_system_config        → tenant_system_config
  pc_error_catalog        → tenant_error_catalog
  pc_menu                 → tenant_menu
  pc_page_registry        → tenant_page_registry
  pc_page_access          → tenant_page_access
  pc_onboarding_stage     → tenant_onboarding_stage
  pc_registration_field   → tenant_registration_field
  pc_module_access        → tenant_module_access

TENANT-ONLY (no sync needed):
  user data, transactions, leads, etc.
```

---

## 5. UPDATED CONFIG TABLE COUNT

```
v2.0 tables: 10
v2.1 adds:    4
─────────────
TOTAL:       14 config tables

NEW IN v2.1:
  PcSystemConfig
  PcErrorCatalog
  PcSystemConfigTranslation (if splitting JSON — TBD)
  TenantSync metadata table (optional)

TENANT MIRROR TABLES (when dedicated DB applicable):
  TenantSystemConfig     TenantErrorCatalog
  TenantMenu             TenantPageRegistry
  TenantPageAccess       TenantOnboardingStage
  TenantRegistrationField TenantModuleAccess
```

---

## 6. UPDATED SPRINT PLAN (v2.1)

```
M0a: AUDIT EXISTING PAGES       ✅ DONE (402 pages catalogued)
M0b: ECOSYSTEM AUDIT            ✅ DONE (387 tables mapped)
M0c: RECONCILIATION AUDIT       ⭐ NEW (1-2 hours)
     → Reconcile gv_cfg_business_type_registry (15 codes)
     → Map gv_cfg_page_registry (466 rows) to PcPageRegistry

M1:  SCHEMA + SEED (3 days)
     14 tables (was 10), SystemConfig + ErrorCatalog added
     Seed master data + migration scripts

M2:  BACKEND CONFIG APIs (2 days)
     + GET /config/system-config (with translations)
     + GET /config/error-catalog (with translations)
     + GET /config/error/:code

M3:  DEV CONSOLE UI (4 days)
     + System Config Management screen
     + Error Catalog Management screen
     + Translation editor

M4:  DYNAMIC REGISTRATION (2 days)
M5:  DYNAMIC ONBOARDING (2 days)
M6:  BRAND LAYOUT SYSTEM (3 days)
M7:  PAGE-LEVEL RBAC RUNTIME (2 days)

M8a: TENANT SYNC SYSTEM (3 days) ⭐ NEW
     Tenant DB schema (tenant_* mirrors)
     Sync engine (master → tenant push)
     Override detection + conflict resolution UI

M8:  TESTING + DOCS (2 days)

═══════════════════════════════════════════════════════
TOTAL: 25 days (was 22, +3 for tenant sync)
═══════════════════════════════════════════════════════
```

---

## 7. EXAMPLE WORKFLOW

```
SCENARIO: Travvellis wants different login error message

DEVELOPER (suggests):
  Creates: docs/suggestions/2026-04-27_travvellis_auth_error.md

AIJUNCTION (Kumar):
  Decision: Approve, mark as customer-customizable
  Action: SET isCustomerOverridable = true
          WHERE errorCode = 'AUTH_INVALID_CREDENTIALS'

CUSTOMER (Travvellis admin in tenant DB):
  Settings → Error Messages → AUTH_INVALID_CREDENTIALS
  Override: "Login failed. Please check your details."

RESULT:
  Travvellis users → "Login failed. Please check your details."
  All other tenants → "Invalid email or password."
  
  On next master update:
  - Travvellis NOT overwritten (hasOverride=true)
  - Others get new message (synced)
  - Travvellis gets notification: "Master message updated, view?"
```

---

## 8. BENEFITS LOCKED IN v2.1

```
❌ Hardcoded error messages in code
   → ✅ All from PcErrorCatalog with translations

❌ No multi-language support
   → ✅ JSON translations for messages, help, URLs

❌ Config changes require redeploy
   → ✅ Update DB row, takes effect immediately

❌ Customer can't customize for their brand
   → ✅ Customer overrides in tenant DB (where granted)

❌ Master config breaks customer customizations
   → ✅ Sync respects overrides, customer chooses to update

❌ No governance over who creates what
   → ✅ 4-tier flow: Dev → AIJunction → Deploy → Customer toggles

❌ Errors lack help/context for users
   → ✅ helpText + helpUrl with multi-lang support
```

---

**END OF ARCHITECTURE v2.1 ADDENDUM**
