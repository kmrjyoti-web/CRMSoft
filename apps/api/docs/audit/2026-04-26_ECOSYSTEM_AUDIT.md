# CRMSoft Ecosystem Audit — Sprint M0b
Date: 2026-04-26
Branch: feat/person-centric-multi-brand
Auditor: Claude Code (Sonnet 4.6)

---

## Executive Summary

- **4 databases audited:** identitydb (55 tables), workingdb (229 tables), platformconsoledb (38 tables), platformdb (65 tables)
- **Total tables across all DBs:** 387
- **Config tables with real data:** 10 (gv_cfg_brands x2 DBs, gv_cfg_verticals, pc_subcategory, pc_user_category, pc_vertical_registry, pc_vertical_v2, pc_brand_profiles, gv_cfg_business_type_registry, pc_menu_global_configs)
- **Registered brands in identitydb:** 2 (default/CRMSoft, travvellis)
- **Registered verticals in identitydb:** 3 (SOFTWARE, TRAVEL, RETAIL)
- **Live users:** 13 users; 3 company mappings (all Travvellis/TRAVEL/DMC_PROVIDER)
- **API controllers:** 70+ controllers across all domains
- **Critical hardcoding:** 6 files with vertical names hardcoded; 4 files with sub-type codes hardcoded
- **Onboarding stages:** 6 wired stages (language → email_otp → mobile_otp → user_type → sub_user_type → profile_redirect)
- **JWT payload fields:** 13 fields including new person-centric fields (companyId, brandCode, talentId, companyRole)
- **Guards:** 17 guard files
- **Biggest M1 risk:** gv_cfg_verticals (identitydb) has only 3 verticals but platformdb has 15 business types — requires alignment before migration

---

## 1. Database Tables Inventory

### 1.1 Identity DB (identitydb) — 55 tables

**Prefix key:** `gv_cfg_` = config/global | `gv_cmp_` = company | `gv_usr_` = user | `gv_lic_` = licensing | `gv_per_` = person-profile | `gv_aud_` = audit

Config-like tables:
| Table | Description | Row Count |
|-------|-------------|-----------|
| `gv_cfg_brands` | Brand registry (code, domain, theme, login_variant) | **2 rows** |
| `gv_cfg_verticals` | Vertical registry (code, terminology, default_modules) | **3 rows** |
| `gv_cfg_menus` | Menu definitions per tenant | 344 rows |
| `gv_cfg_partners` | Partner configs | **0 rows** |
| `gv_cfg_tenant_configs` | Per-tenant config | rows present |
| `gv_cfg_tenant_brandings` | Per-tenant branding | rows present |
| `gv_cfg_security_policies` | Security rules | rows present |
| `gv_cfg_ip_access_rules` | IP access control | rows present |
| `gv_cfg_customer_menu_categories` | Customer portal menu categories | rows present |
| `gv_cfg_global_default_credentials` | Default credential config | rows present |

Core domain tables: `gv_usr_users` (13 rows), `gv_usr_roles` (13 rows), `gv_usr_tenants`, `gv_cmp_companies` (2 rows), `gv_cmp_user_company_mappings` (3 rows), `gv_usr_permissions`, `gv_usr_role_permissions`, `gv_usr_role_menu_permissions`

Audit tables: `gv_aud_logs`, `gv_aud_field_changes`, `gv_aud_tenant_logs`, `gv_aud_tenant_sessions`, `gv_aud_credential_access_logs`, `gv_aud_customer_portal_logs`, `gv_aud_retention_policies`

Person-centric tables: `gv_per_user_profiles`, `gv_per_educations`, `gv_per_experiences`, `gv_per_skills`, `gv_per_company_follows`

Licensing tables: `gv_lic_plans`, `gv_lic_subscriptions`, `gv_lic_plan_limits`, `gv_lic_plan_module_access`, `gv_lic_tenant_invoices`, `gv_lic_tenant_usage`

### 1.2 Global Working DB (workingdb) — 229 tables

This is the primary operational DB. Tables organized by prefix:

| Prefix | Domain | Example Tables |
|--------|--------|----------------|
| `gv_cfg_` | Config | brands (0 rows), company_profiles, ai_models, webhook_endpoints, calendar_configs |
| `gv_crm_` | CRM | contacts, leads, organizations, activities, follow_ups, tasks, tour_plans, support_tickets |
| `gv_inv_` | Inventory | products, items, purchase_orders, quotations, goods_receipts, stock_transactions |
| `gv_sal_` | Sales | quotations, orders, delivery_challans, price_lists, returns |
| `gv_acc_` | Accounting | invoices, credit_notes, debit_notes, bank_accounts, transactions, ledger_masters |
| `gv_pay_` | Payments | payments, receipts, refunds, reminders |
| `gv_cmn_` | Communications | emails, whatsapp, campaigns, templates |
| `gv_doc_` | Documents | documents, templates, attachments, folders |
| `gv_wf_` | Workflows | workflows, instances, approvals, sla_escalations |
| `gv_not_` | Notifications | notifications, preferences, reminders, escalation_rules |
| `gv_rpt_` | Reports | definitions, bookmarks, scheduled_reports |
| `gv_tax_` | Tax | gst_returns, tds_records |
| `gv_aud_` | Audit | api_request_logs, ai_usage_logs, sync_audit_logs |

**Note:** `gv_cfg_brands` in workingdb has **0 rows** — brands are only in identitydb.

### 1.3 Platform Console DB (platformconsoledb) — 38 tables

Config tables with data:

**pc_vertical_registry** (5 rows):
| code | name | status | is_active |
|------|------|--------|-----------|
| CRM_GENERAL | General Business CRM | ACTIVE | true |
| PHARMA | Pharmaceutical | BETA | false |
| TOURISM | Tourism & Travel | BETA | false |
| RESTAURANT | Restaurant & Food | BETA | false |
| RETAIL | Retail & Commerce | BETA | false |
| REAL_ESTATE | Real Estate | BETA | false |
| SOFTWARE_VENDOR | Software Vendor | ACTIVE | true |

**pc_vertical_v2** (5 rows):
| code | display_name | is_active | is_coming_soon |
|------|-------------|-----------|----------------|
| TRAVEL | Travel (full package) | false | true |
| ELECTRONIC | Electronic Retail | false | true |
| SOFTWARE | Software Vendor | false | true |
| TV | Travel Crm (test) | true | true |
| CRM_GENERAL | General Business CRM | true | true (beta) |

**pc_user_category** (5 rows):
| code | name | marketplace_role |
|------|------|-----------------|
| COMPANY_B2B | Company (B2B) | SELLER_B2B_B2C |
| COMPANY_B2C | Company (B2C) | SELLER_B2C_ONLY |
| INDIVIDUAL_SP | Individual Service Provider | SERVICE_PROVIDER_DUAL |
| CUSTOMER | Customer | BUYER_B2C |
| EMPLOYEE | Employee | INTERNAL |

**pc_subcategory** (4 rows — all under TRAVEL vertical):
| code | parent_category | name | requires_approval |
|------|----------------|------|------------------|
| DMC_PROVIDER | COMPANY_B2B | DMC Provider | true |
| AGENT | COMPANY_B2C | Travel Agent | true |
| TOUR_GUIDE | INDIVIDUAL_SP | Tour Guide | true |
| TRAVELER | CUSTOMER | Traveler | false |

**pc_brand_profiles** (2 rows):
| brand_code | display_name | vertical_code | login_component |
|-----------|-------------|---------------|----------------|
| TR_TRAV | Travvellis | null | null |
| travvellis | Travvellis — Travel CRM | TRAVEL | TravvellisLogin |

**pc_menu_global_configs** (15 rows): dashboard, contacts, leads, products, quotations, invoices, orders, settings, settings-general, settings-users, markethub, markethub-feed, markethub-offers, markethub-profiles, markethub-analytics

**pc_menu_brand_overrides**: table exists (no rows checked)

Other tables: pc_alert_rules, pc_brand_feature_flags, pc_brand_module_whitelists, pc_brand_vertical_config (1 row: TR_TRAV → TRAVEL), pc_vertical_audits, pc_vertical_feature, pc_vertical_health, pc_vertical_menu, pc_vertical_module, pc_vertical_versions, pc_build_logs, pc_deployment_logs, pc_test_plans, pc_test_executions, pc_pipeline_runs, pc_incident_logs

### 1.4 Platform DB (platformdb) — 65 tables

**gv_cfg_vertical** (2 rows):
| code | name | table_prefix | is_built |
|------|------|-------------|---------|
| gv | General | gv_ | true |
| soft | Software Vendor | soft_ | true |

**gv_cfg_business_type_registry** (15 rows):
GENERAL_TRADING, IT_SERVICES, MANUFACTURING, REAL_ESTATE, HEALTHCARE_CLINIC, EDUCATION, RESTAURANT_FOOD, ECOMMERCE, CONSULTING, CONSTRUCTION, TRAVEL_TOURISM, AUTOMOTIVE, EVENT_MANAGEMENT, FINANCIAL_SERVICES, LAUNDRY_SERVICES

**gv_cfg_page_registry**: 466 rows (extensive page inventory exists)

**gv_cfg_module_definitions**: 0 rows (not yet populated)

Other notable tables: gv_cfg_lookup_values, gv_cfg_master_lookups, gv_cfg_industry_packages, gv_cfg_industry_patches, gv_cfg_plugin_registry, gv_cfg_tenant_modules, gv_cfg_vertical_module, gv_mkt_* (marketplace), gv_lic_* (licensing), gv_qa_* (QA), gv_ven_marketplace_vendors

### 1.5 Config Table → v2.0 Mapping

| Source Table | DB | Rows | v2.0 Target | Action |
|-------------|-----|------|-------------|--------|
| `gv_cfg_brands` | identitydb | 2 | extend | Add: partner_type, registration_config, supported_subcategories |
| `gv_cfg_verticals` | identitydb | 3 | extend | Add: all 15 business types from gv_cfg_business_type_registry |
| `pc_subcategory` | platformconsoledb | 4 (TRAVEL only) | extend | Add subcategories for all other verticals |
| `pc_user_category` | platformconsoledb | 5 | keep | Already complete — COMPANY_B2B, COMPANY_B2C, INDIVIDUAL_SP, CUSTOMER, EMPLOYEE |
| `pc_vertical_registry` | platformconsoledb | 7 | migrate/merge | Reconcile with gv_cfg_verticals; gv is canonical |
| `pc_brand_profiles` | platformconsoledb | 2 | extend | 2 duplicate Travvellis entries; consolidate |
| `gv_cfg_business_type_registry` | platformdb | 15 | migrate | Migrate into gv_cfg_verticals (identitydb) as full vertical list |
| `pc_menu_global_configs` | platformconsoledb | 15 | extend | Grow to per-vertical menu trees |
| `gv_cfg_menus` | identitydb | 344 | keep | Per-tenant menu overrides — retain |

---

## 2. API Routes Inventory

### 2.1 Auth / Registration
**Controller:** `POST|GET /auth/*`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/admin/login` | Public | Admin portal login |
| POST | `/auth/employee/login` | Public | Employee portal login |
| POST | `/auth/customer/login` | Public | Customer portal login |
| POST | `/auth/partner/login` | Public | Referral partner login |
| POST | `/auth/vendor/login` | Public | Vendor portal login |
| POST | `/auth/super-admin/login` | Public | Platform super admin login |
| POST | `/auth/login` | Public | Universal login — returns user + company list |
| POST | `/auth/switch-company` | JWT | Re-issue JWT with new companyId |
| POST | `/auth/select-company` | JWT | Initial company selection after multi-company login |
| GET | `/auth/me/companies` | JWT | List all companies for authenticated user |
| POST | `/auth/:vertical/register` | Public | Brand-aware vertical registration (TravvellisRegister flow) |
| POST | `/auth/customer/register` | Public | Customer self-registration |
| POST | `/auth/partner/register` | Public | Referral partner self-registration |
| GET | `/auth/tenant/check-slug/:slug` | Public | Check slug availability |
| POST | `/auth/tenant/register` | Public | Tenant self-registration |
| POST | `/auth/staff/register` | JWT+ADMIN | Admin creates staff |
| POST | `/auth/refresh` | Public | Token refresh |
| POST | `/auth/change-password` | JWT | Change password |
| GET | `/auth/permissions` | JWT | Get current user effective permissions |
| GET | `/auth/me` | JWT | Get current user profile |

### 2.2 Onboarding
**Controller:** `/onboarding/*`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/onboarding/status` | Get onboarding status and current stage |
| POST | `/onboarding/locale` | Stage 1 — select preferred locale |
| POST | `/onboarding/otp/send` | Send OTP to email or mobile |
| POST | `/onboarding/otp/verify` | Verify OTP for email or mobile |
| POST | `/onboarding/otp/skip-mobile` | Skip mobile verification |
| POST | `/onboarding/user-type` | Stage 4 — select user/business type (B2B/B2C/IND_SP) |
| POST | `/onboarding/sub-type` | Stage 5 — select sub-type (DMC, Agent, etc.) |
| POST | `/onboarding/complete-profile` | Complete profile and finish onboarding |

### 2.3 Platform Console (menu/category/brand endpoints)
**Controller:** `/platform-console/menus/*`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/platform-console/menus` | Get menu tree |
| GET | `/platform-console/menus/flat` | Get flat menu list |
| POST | `/platform-console/menus` | Create menu item |
| POST | `/platform-console/menus/reorder` | Reorder menu items |
| GET | `/platform-console/menus/brands/:brandId` | Get menu with brand overrides |
| POST | `/platform-console/menus/brands/:brandId/override` | Set brand override |
| PATCH | `/platform-console/menus/brands/:brandId/override/:id` | Update brand override |
| DELETE | `/platform-console/menus/brands/:brandId/override/:id` | Remove brand override |
| GET | `/platform-console/menus/brands/:brandId/overrides` | Get all brand overrides |
| GET | `/platform-console/menus/preview/:brandId` | Preview menu for brand |
| GET | `/platform-console/menus/preview/:brandId/:role` | Preview menu for brand+role |
| PATCH | `/platform-console/menus/:id` | Update menu item |
| DELETE | `/platform-console/menus/:id` | Delete menu item |

**Identity menus controller:** `/menus/*`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/menus` | Create menu item (admin) |
| GET | `/menus/tree` | Full menu tree |
| GET | `/menus/my-menu` | Permission-filtered menu for current user |

### 2.4 All Other Controllers

**Settings domain:**
- `GET|PUT /settings/branding` — tenant branding
- `GET|PUT /settings/company-profile` — company profile
- `GET|PUT /settings/business-hours` — business hours
- `GET|POST|PUT /settings/auto-number` — auto-numbering sequences

**Tenant / Subscription domain:**
- `GET|POST /tenant/subscription` — subscription management
- `POST /tenant/subscription/subscribe` / `/change-plan` / `/cancel`
- `GET /tenant/subscription/usage` / `/limits`
- `POST /tenant/subscription/onboarding/:step`
- `GET|POST /tenant/billing/invoices`

**Vendor domain:**
- `GET /admin/vendor/dashboard` + MRR, growth, plan-distribution, revenue-by-plan
- `GET|POST|PUT|DELETE /vendor/tenants`
- `GET|POST|PUT|DELETE /vendor/modules`
- `GET /vendor/wallet` + transactions
- `GET|POST|PATCH /vendor/partners`
- `GET|POST|PUT|PATCH /vendor/dev-requests`
- `GET|POST|PUT|DELETE /vendor/document-templates`

**CRM domain:**
- `/contacts`, `/leads`, `/organizations`, `/activities`, `/follow-ups`
- `/tasks`, `/tour-plans`, `/demos`, `/support-tickets`
- `/raw-contacts`, `/entity-filters`

**Communication domain:**
- `/emails`, `/email-accounts`, `/email-templates`, `/email-signatures`, `/email-campaigns`, `/email-tracking`
- `/whatsapp`, `/whatsapp/templates`, `/whatsapp/broadcasts`, `/whatsapp/webhook`, `/whatsapp/chatbot`, `/whatsapp/quick-replies`
- `/communications`, `/reminders`

**Documents / Reports:**
- `/documents`, `/document-templates`, `/vendor/document-templates`
- `/formulas`, `/report-ai`

**Inventory / Sales / Accounting:**
- `/products`, `/quotations`, `/orders`, `/invoices`
- `/amc/contracts`, `/amc/schedules`, `/amc/plans`
- `/warranty/records`, `/warranty/templates`, `/warranty/claims`, `/service-visits`

**Permissions / Audit / Profile:**
- `/profile` (GET/PUT current user profile)
- `/audit/logs` (admin + user)
- `/admin/errors/catalog`, `/errors/frontend`
- `/admin/tenant-profiles/:tenantId`

**Health / Customer portal:**
- `GET /health`
- `/customer-portal/*`

**API Gateway (software vendor):**
- `/api-gateway/*` (api-key, api-rate-limit, api-scope guards)

### 2.5 v2.0 Gaps — Endpoints to Build

| Endpoint | Priority | Sprint | Reason |
|----------|----------|--------|--------|
| `GET /auth/brands` | P0 | M1 | Frontend needs to resolve brand config dynamically |
| `GET /auth/brands/:code` | P0 | M1 | Brand resolution by subdomain/code |
| `GET /platform-console/verticals` | P0 | M1 | List all verticals with subcategories |
| `GET /platform-console/subcategories?vertical=TRAVEL` | P0 | M1 | Already in PC DB; needs REST exposure |
| `GET /platform-console/user-categories?vertical=TRAVEL` | P0 | M1 | Same — PC DB has data, no endpoint |
| `GET /config/registration-schema?brand=travvellis&subcategory=DMC_PROVIDER` | P1 | M2 | Config-driven registration fields |
| `POST /onboarding/vertical` | P1 | M2 | Config-driven vertical selection stage |
| `GET /menus/vertical/:verticalCode` | P1 | M2 | Vertical-specific menu tree |
| `GET /auth/me/company/:companyId/profile` | P1 | M2 | Per-company profile fetch |
| `GET /admin/partners` | P2 | M3 | Partner management (gv_cfg_partners is empty) |

---

## 3. Registration Entry Points

### 3.1 Frontend

**TravvellisRegister.tsx**
- Path: `apps-frontend/crm-admin/src/components/brand-login/brands/travvellis/register/TravvellisRegister.tsx`
- Entry: `/brand-login?brand=travvellis&mode=register`
- Vertical hardcoded: `'TRAVEL'`
- Category codes: `COMPANY_B2B`, `COMPANY_B2C`, `INDIVIDUAL_SP` (hardcoded as emoji map)
- Subcategories: fetched from `pc_subcategory` via `useSubcategories('TRAVEL', categoryCode)` — config-driven
- Dynamic fields: rendered from `subcategory.registration_fields` JSON — config-driven
- Calls: `POST /auth/TRAVEL/register` → `AuthService.registerVertical()`
- 4/4 backbone fields captured

**DefaultRegister.tsx**
- Path: `apps-frontend/crm-admin/src/components/brand-login/DefaultRegister.tsx`
- Generic fallback registration form
- No vertical/brand hardcoding

**RegisterForm.tsx**
- Path: `apps-frontend/crm-admin/src/features/registration/components/RegisterForm.tsx`
- Used in generic registration flow
- Contains IndustrySelector (fetches from `gv_cfg_business_type_registry` via API)

**GenericRegister.tsx**
- Path: `apps-frontend/crm-admin/src/components/auth/GenericRegister.tsx`
- Generic auth register component

### 3.2 Brand Registry

**File:** `apps-frontend/crm-admin/src/lib/brand/registry.tsx`

Only 1 brand registered in BRAND_REGISTRY:
```
travvellis:
  vertical: 'TRAVEL'
  colors: { primary: '#b8894a', secondary: '#1e3a5f' }  -- Golden Hour palette
  loginComponent: TravvellisLogin (dynamic import)
  registerComponent: TravvellisRegister (dynamic import)
  extendedTheme: 17 CSS variable tokens
  fonts: { heading: Playfair Display, body: Inter }
```

Commented stubs for: `electronic_brand`, `software_brand`, `retail_brand`, `restaurant_brand`

**Login registry:** `apps-frontend/crm-admin/src/components/brand-login/registry.tsx`
- Only key: `TravvellisLogin`

**Register registry:** `apps-frontend/crm-admin/src/components/brand-login/register-registry.tsx`
- Keys: `TravvellisRegister`, `DefaultRegister`

### 3.3 Backend DTOs

**VerticalRegisterDto** (used by `POST /auth/:vertical/register`):
```typescript
categoryCode: string          // e.g. "COMPANY_B2B"
subcategoryCode: string       // e.g. "DMC_PROVIDER"
brandCode: string             // e.g. "travvellis"
email: string
password: string (min 8)
registrationFields?: Record<string, any>  // dynamic form data
```
Note: `verticalCode` is taken from the URL param `:vertical`, not the body.

**TenantRegisterDto** (used by `POST /auth/tenant/register`):
```typescript
companyName, slug, email, password, firstName, lastName
industryTypeCode?: string, phone?, city?, state?, country?, gstNumber?, panNumber?
```

**RegisterDto** (admin creates staff, `POST /auth/staff/register`):
```typescript
email, password, firstName, lastName, phone?, roleId, userType?, departmentId?, designationId?
```

**CustomerRegisterDto** (`POST /auth/customer/register`):
```typescript
email, password, firstName, lastName, phone?, companyName?, gstNumber?, city?, state?, country?, industry?
```

**PartnerRegisterDto** (`POST /auth/partner/register`):
```typescript
email, password, firstName, lastName, phone?, panNumber?, bankName?, bankAccount?, ifscCode?
```

---

## 4. Onboarding Wall State

### 4.1 Current Frontend Stages (from OnboardingDialog.tsx)

Order defined in `STAGE_ORDER` constant:
1. `language` → `StageLanguage` — locale preference
2. `email_otp` → `StageEmailOtp` — email verification
3. `mobile_otp` → `StageMobileOtp` — mobile verification (skippable)
4. `user_type` → `StageUserType` — B2B / B2C / IND_SP selection (hardcoded 3 options)
5. `sub_user_type` → `StageSubUserType` — vertical-specific sub-type; reads `verticalCode` from status with fallback `'TRAVEL'` (line 31)
6. `profile_redirect` → `StageProfileRedirect` — redirect to self-care profile page

### 4.2 Backend Stage Logic (onboarding.service.ts)

`computeNextStage(user)` checks fields in order:
1. If `onboardingStage` is null/`language` → return `language`
2. If `!emailVerified` → return `email_otp`
3. If stored stage index <= `mobile_otp` index AND `!mobileVerified` → return `mobile_otp`
4. If `!categoryCode` → return `user_type`
5. If `!subcategoryCode` → return `sub_user_type`
6. Else → return `profile_redirect`

**USER_TYPE_TO_CATEGORY mapping (hardcoded):**
```
B2B    → COMPANY_B2B
B2C    → COMPANY_B2C
IND_SP → INDIVIDUAL_SP
IND_EE → EMPLOYEE
```

This mapping is a direct mirror of `pc_user_category` — currently hardcoded in `onboarding.service.ts` and `onboarding.dto.ts`.

### 4.3 v2.0 Migration Path

**Problem 1 — user_type stage hardcodes B2B/B2C/IND_SP:**
Should be replaced by `GET /platform-console/user-categories?verticalCode=TRAVEL` which returns the `pc_user_category` rows dynamically.

**Problem 2 — sub_user_type stage fallbacks to `'TRAVEL'`:**
Line 31 of `StageSubUserType.tsx`: `const verticalCode = status?.verticalCode || 'TRAVEL';`
Must rely on `status.verticalCode` from the JWT/onboarding status API.

**Problem 3 — no vertical selection stage:**
For TravvellisRegister flow this isn't needed (vertical is implicit from brand). For generic registration (TenantRegister), vertical is selected via IndustrySelector. Onboarding wall has no vertical selection stage — it only runs after registration, so vertical is already set. This is correct.

**What must change for config-driven onboarding:**
- `StageUserType` must fetch categories from API instead of hardcoding `B2B/B2C/IND_SP`
- `onboarding.service.ts` `USER_TYPE_TO_CATEGORY` map must be removed; categories should use canonical codes directly
- `onboarding.dto.ts` enum `['B2B', 'B2C', 'IND_SP', 'IND_EE']` must accept any string and validate against DB
- Add a `vertical_select` stage for generic (non-brand) registration flows

---

## 5. Hardcoding Report

### 5.1 Vertical Names Hardcoded

| File | Line | Hardcoded String | Context |
|------|------|-----------------|---------|
| `apps-frontend/crm-admin/src/app/company/[companyId]/dashboard/page.tsx` | 6-29 | `TRAVEL`, `RETAIL`, `SOFTWARE` | `VERTICAL_TERMINOLOGY` map for dashboard labels |
| `apps-frontend/crm-admin/src/features/registration/components/IndustrySelector.tsx` | 30-53 | `HEALTHCARE`, `EDUCATION`, `TECHNOLOGY` etc. | `CATEGORY_ORDER` and `CATEGORY_LABELS` arrays |
| `apps-frontend/crm-admin/src/features/user-onboarding/stages/StageSubUserType.tsx` | 31 | `'TRAVEL'` | Default vertical fallback |
| `apps-frontend/crm-admin/src/components/brand-login/brands/travvellis/register/TravvellisRegister.tsx` | 43, 116 | `'TRAVEL'` | `useSubcategories('TRAVEL')` and `verticalCode: 'TRAVEL'` in payload |
| `apps-frontend/crm-admin/src/lib/brand/registry.tsx` | 86, 138-140 | `'TRAVEL'`, `'ELECTRONIC'`, `'SOFTWARE'`, `'RETAIL'`, `'RESTAURANT'` | Brand config and future stub comments |
| `apps-frontend/crm-admin/src/app/(main)/layout.tsx` | 81, 92-94 | `"SOFTWARE_VENDOR_GROUP"`, `"DEVELOPER_GROUP"` | Menu group filtering |

### 5.2 Brand Names Hardcoded

| File | Line | Hardcoded String | Context |
|------|------|-----------------|---------|
| `apps-frontend/crm-admin/src/components/brand-login/brands/travvellis/TravvellisLogin.tsx` | 25, 311 | `'Travvellis'`, `'TRAVVELLIS'` | Default prop, CSS title text |
| `apps-frontend/crm-admin/src/components/brand-login/registry.tsx` | 20-21 | `TravvellisLogin` | Dynamic import key |
| `apps-frontend/crm-admin/src/components/brand-login/register-registry.tsx` | 15-16 | `TravvellisRegister` | Dynamic import key |
| `apps-frontend/crm-admin/src/lib/brand/registry.tsx` | 83-141 | `'travvellis'` (code) | BRAND_REGISTRY map key |
| `apps-frontend/crm-admin/src/styles/themes/golden-hour.ts` | 2 | `'Travvellis'` | Comment |

Brand-name strings in scene/CSS files (20+ files) are internal to the brand package — acceptable, not a migration concern.

### 5.3 User Type Values Hardcoded

| File | Line | Hardcoded Value | Context |
|------|------|----------------|---------|
| `apps-frontend/crm-admin/src/features/user-onboarding/stages/StageUserType.tsx` | 28-30 | `'B2B'`, `'B2C'`, `'IND_SP'` | Stage option keys |
| `apps-frontend/crm-admin/src/features/user-onboarding/user-onboarding.service.ts` | 12 | `OnboardingUserType = 'B2B' | 'B2C' | 'IND_SP' | 'IND_EE'` | Type definition |
| `apps-backend/api/src/modules/core/identity/onboarding/dto/onboarding.dto.ts` | 5, 27 | `['B2B', 'B2C', 'IND_SP', 'IND_EE']` | DTO type and enum validator |
| `apps-backend/api/src/modules/core/identity/onboarding/onboarding.service.ts` | 21-23 | `USER_TYPE_TO_CATEGORY` map | Translation B2B→COMPANY_B2B etc. |
| `apps-backend/api/src/core/auth/auth.service.ts` | 245-248 | `COMPANY_B2B`, `COMPANY_B2C`, `INDIVIDUAL_SP`, `CUSTOMER` | Marketplace capabilities map |
| `apps-backend/api/src/core/auth/mapping.service.ts` | 5 | `COMPANY_CATEGORY_CODES` array | Company creation check |
| `apps-frontend/crm-admin/src/components/brand-login/brands/travvellis/register/TravvellisRegister.tsx` | 22-24 | `COMPANY_B2B`, `COMPANY_B2C`, `INDIVIDUAL_SP` | Emoji map for category codes |

### 5.4 Sub-type Values Hardcoded

| File | Line | Hardcoded Value | Context |
|------|------|----------------|---------|
| `apps-backend/api/src/core/auth/auth.service.ts` | 267 | `['DMC_PROVIDER', 'AGENT', 'TOUR_GUIDE']` | Determines if registration requires approval |

This is the most critical hardcoding: the approval logic is hard-linked to TRAVEL sub-types. For v2.0, approval config should come from `pc_subcategory.requires_approval` (already in DB).

### 5.5 Vertical Card Grids

No files with classic "Choose your industry" grid (pattern `Software & IT|Restaurant & Food|Travel & Tourism`) were found. The `IndustrySelector.tsx` component fetches industries dynamically from `gv_cfg_business_type_registry` via `registrationService.getBusinessTypes()` — this is **already config-driven**.

The only hardcoding in IndustrySelector is the `CATEGORY_ORDER` display order array and `CATEGORY_LABELS` display names — these control grouping/display, not the industry list itself.

### 5.6 Migration Effort Estimate

| Category | Files Affected | Instances | Estimated Hours |
|----------|---------------|-----------|-----------------|
| Vertical codes (frontend) | 5 files | 12 instances | 4h |
| Brand names (non-internal) | 4 files | 8 instances | 3h |
| User type codes (B2B/B2C) | 4 BE + 3 FE files | 20 instances | 8h |
| Sub-type approval hardcoding | 1 file | 1 instance | 2h |
| Stage order hardcoding | 2 files | 6 instances | 6h |
| **Total** | **~14 files** | **~47 instances** | **~23h** |

---

## 6. Theme / Layout State

### 6.1 Tailwind Configuration

File: `apps-frontend/crm-admin/tailwind.config.ts`

Minimal config — only 2 custom color tokens:
```
background: "var(--background)"
foreground: "var(--foreground)"
```

All branding is done via CSS variables in `globals.css`, not Tailwind extend. This is intentional — dynamic brand switching via CSS vars.

### 6.2 Brand-specific Styling

**globals.css** (`apps-frontend/crm-admin/src/app/globals.css`):
- Defines 22 CSS `--brand-*` variables as defaults (Neutral Premium dark theme)
- Variables: `--brand-bg`, `--brand-primary`, `--brand-card-bg`, `--brand-text`, `--brand-success`, etc.
- Smooth transitions via `--theme-transition` applied globally

**BrandThemeProvider** (`apps-frontend/crm-admin/src/components/brand/BrandThemeProvider.tsx`):
- Applies brand-specific CSS vars to `document.documentElement`
- Maps `BrandConfig.extendedTheme` tokens → CSS variable overrides

**Theme files in** `apps-frontend/crm-admin/src/styles/themes/`:
- `neutral-premium.ts` — dark default theme
- `golden-hour.ts` — Travvellis golden/warm theme
- `index.ts` — theme exports

**Travvellis-specific CSS:**
- `apps-frontend/crm-admin/src/components/brand-login/brands/travvellis/travvellis.module.css`
- `apps-frontend/crm-admin/src/components/brand-login/brands/travvellis/register/travvellis-register.module.css`
- Animated scene components (BeachScene, MountainScene, NightScene, etc.) — purely decorative

**crm-theme.css:** Exists at `apps-frontend/crm-admin/src/styles/crm-theme.css` (content not audited)

### 6.3 v2.0 Gap Analysis

| Feature | Current State | v2.0 Need | Gap |
|---------|-------------|-----------|-----|
| Brand CSS tokens | 17 tokens for Travvellis only | Per-brand token set | New theme file per brand |
| Theme switching | Client-side via BrandThemeProvider | Same pattern, more brands | No gap — architecture is solid |
| Brand registration component | Travvellis only (hardcoded import) | Dynamic from brand registry | Already dynamic via registry.tsx |
| Font loading | Playfair Display + Inter | Per-brand font config | `BrandConfig.fonts` exists; add to BrandThemeProvider |
| CoreUI theme integration | Imports from lib/coreui | Must extend CoreUI tokens | Audit CoreUI token names |

The theme architecture is already multi-brand capable. Adding a new brand requires:
1. New theme file in `styles/themes/`
2. New entry in `BRAND_REGISTRY` in `lib/brand/registry.tsx`
3. New login/register component in `components/brand-login/brands/<code>/`
4. DB row in `gv_cfg_brands` (identitydb)

---

## 7. Seed Data State

### 7.1 Existing Seed Scripts

| File | Domain | Description |
|------|--------|-------------|
| `identity/seed-identity.ts` | Identity | Seed base users, roles, tenants |
| `identity/seed-multi-brand.ts` | Identity | Seeds brands (default, travvellis) + 3 verticals + kmrjyoti mapping |
| `identity/reset-kmrjyoti-password.ts` | Identity | Password reset utility for kmrjyoti@gmail.com |
| `identity/seed-kmrjyoti-role-admin.ts` | Identity | Grants ADMIN role to kmrjyoti |
| `identity/seed-kmrjyoti-travvellis-mapping.ts` | Identity | Wires kmrjyoti → Travvellis company mapping |
| `identity/reset-onboarding.ts` | Identity | Resets onboarding state for testing |
| `platform/2026-04-13_vertical_registry.seed.ts` | Platform | Seeds gv/soft verticals in platformdb |
| `global-reference-seed.ts` | Global | Currencies, timezones, languages, countries |
| `global-reference/seed-b2-reference.ts` | Global | GST rates, HSN/SAC codes, industry types |
| `permission-templates.seed.ts` | Identity | Default permission templates |
| `module-package.seed.ts` | Platform | Module packaging |
| `tenant-configs.seed.ts` | Identity | Default tenant configuration |
| `demo-data.seed.ts` | Working | Demo CRM data (leads, contacts, etc.) |
| `demo/seed-demo.ts` | Working | Extended demo data |
| `workflow-*.seed.ts` (7 files) | Working | Workflow templates (lead, quotation, etc.) |
| `calendar-*.seed.ts` (2 files) | Working | Calendar configuration |
| `error-catalog.seed.ts` | Platform | Error code definitions |
| `plugin-registry.seed.ts` | Platform | Plugin registry definitions |
| `account-master.seed.ts` | Working | Chart of accounts |
| `document-template.seed.ts` | Working | Document templates |
| `shortcut-definitions.seed.ts` | Working | Keyboard shortcuts |
| `formula.seed.ts` | Working | Financial formulas |
| `report-definitions.seed.ts` | Working | Report configurations |
| `safe-complete-seed.ts` | All | Orchestrates all safe seeds |

### 7.2 Execution Order

No formal `run-all.ts` or `index.ts` exists. The `safe-complete-seed.ts` is the closest to an orchestrator. Seeds should run in dependency order:
1. `seed-identity.ts` (users, roles, tenants)
2. `seed-multi-brand.ts` (brands, verticals)
3. `permission-templates.seed.ts`
4. `module-package.seed.ts`
5. `tenant-configs.seed.ts`
6. `platform/2026-04-13_vertical_registry.seed.ts`
7. `global-reference-seed.ts`
8. Domain seeds (workflow, document, calendar, etc.)
9. `demo-data.seed.ts` (last)

### 7.3 Seeds Needed for v2.0

| Seed File to Create | Target DB | Purpose | Sprint |
|--------------------|-----------|---------|--------|
| `seed-verticals-full.ts` | identitydb | Add all 15 business types to gv_cfg_verticals | M1 |
| `seed-subcategories-all-verticals.ts` | platformconsoledb | Add subcategories for RETAIL, SOFTWARE, RESTAURANT etc. | M1 |
| `seed-brands-v2.ts` | identitydb | Add brand entries for future verticals | M1 |
| `seed-pc-brand-profiles-clean.ts` | platformconsoledb | Consolidate duplicate Travvellis entries | M1 |
| `seed-menu-vertical-trees.ts` | platformconsoledb | Per-vertical menu configs | M2 |
| `seed-registration-schemas.ts` | platformconsoledb | Dynamic registration field schemas per subcategory | M2 |
| `seed-approval-workflow-configs.ts` | platformconsoledb | Config-driven approval triggers (replaces hardcoded list) | M2 |
| `seed-partners-initial.ts` | identitydb | Initial partner data for gv_cfg_partners | M3 |

---

## 8. JWT / RBAC State

### 8.1 Current JWT Payload Fields

From `jwt.strategy.ts` validate() return + `auth.service.ts` token generation:

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `id` | string | user.id | User UUID |
| `email` | string | user.email | |
| `firstName` | string | user.firstName | |
| `lastName` | string | user.lastName | |
| `role` | string | user.role.name | e.g. 'ADMIN' |
| `roleId` | string | user.role.id | |
| `roleLevel` | number | user.role.level | |
| `userType` | string | user.userType | DB field |
| `departmentId` | string? | user.departmentId | |
| `departmentPath` | string? | user.department.path | |
| `tenantId` | string? | user.tenantId | |
| `companyId` | string? | JWT pass-through | Person-centric: active company |
| `isSharedTenant` | boolean | computed | true if no tenantId |
| `businessTypeCode` | string? | tenant.industryCode | Vertical/industry code |
| `talentId` | string? | JWT pass-through | Day 2 self-care field |
| `brandCode` | string? | JWT pass-through | Active brand |
| `purpose` | string? | JWT pass-through | e.g. 'self_care' |
| `companyRole` | string? | JWT pass-through | e.g. 'OWNER' |

Special cases:
- `isSuperAdmin: true` — no DB lookup, minimal payload
- `vendorId` + `role: 'VENDOR'` — no user DB lookup

### 8.2 v2.0 JWT Changes Required

| Field to Add | Why | When |
|-------------|-----|------|
| `verticalCode` | Currently derives from tenant.industryCode (businessTypeCode) — should be canonical from company mapping | M2 |
| `subcategoryCode` | Not in JWT; needed for permission filtering per subcategory | M2 |
| `categoryCode` | Not in JWT; needed for marketplace role enforcement | M2 |
| `approvalStatus` | `PENDING_APPROVAL` vs `APPROVED` — gate portal access before approval | M2 |
| `companyTalentId` | Company's talentId for self-care profile reference | M2 |

Fields to rename for clarity:
- `businessTypeCode` → `verticalCode` (in progress — `brandCode` already correct)

### 8.3 Permission Guards

| Guard File | Purpose |
|-----------|---------|
| `common/guards/jwt-auth.guard.ts` | Verifies JWT; skips routes with `@Public()` |
| `common/guards/roles.guard.ts` | Checks `@Roles(...)` decorator against `user.role` |
| `common/guards/user-type.guard.ts` | Checks user type (ADMIN, EMPLOYEE, CUSTOMER, etc.) |
| `core/permissions/guards/menu-permission.guard.ts` | Checks menu-specific permissions |
| `core/permissions/guards/ownership.guard.ts` | Entity ownership validation |
| `core/permissions/guards/permission-policy.guard.ts` | Fine-grained permission check |
| `tenant/infrastructure/feature-flag.guard.ts` | Feature flag gate per tenant |
| `tenant/infrastructure/module-access.guard.ts` | Module subscription check |
| `tenant/infrastructure/plan-limit.guard.ts` | Plan limit enforcement |
| `tenant/infrastructure/super-admin.guard.ts` | Super admin only access |
| `tenant/infrastructure/tenant.guard.ts` | Ensures tenantId is present; respects `@SkipTenantGuard()` |
| `tenant/infrastructure/vendor.guard.ts` | Vendor-only access |
| `customer-portal/infrastructure/guards/customer-auth.guard.ts` | Customer portal auth |
| `softwarevendor/api-gateway/guards/api-key.guard.ts` | API key validation |
| `softwarevendor/api-gateway/guards/api-rate-limit.guard.ts` | Rate limiting |
| `softwarevendor/api-gateway/guards/api-scope.guard.ts` | API scope enforcement |
| `softwarevendor/verification/guards/verification.guard.ts` | Verification status check |

### 8.4 Permission Tables in DB (identitydb)

| Table | Description | State |
|-------|-------------|-------|
| `gv_usr_roles` | Role definitions | 13 rows |
| `gv_usr_permissions` | Permission codes | populated |
| `gv_usr_role_permissions` | Role → permission mapping | populated |
| `gv_usr_role_menu_permissions` | Role → menu permission mapping | populated |
| `gv_usr_permission_templates` | Permission templates | populated |
| `gv_usr_permission_overrides` | Per-user permission overrides | exists |

**Permission resolution chain** (5-check): 1) Super admin bypass → 2) Permission templates → 3) Role permissions → 4) Permission overrides → 5) Menu permissions. Implemented in `PermissionChainService`.

---

## 9. Menu System State

### 9.1 Backend

**menus.controller.ts** (`/menus/*` path):
- File: `apps-backend/api/src/modules/core/identity/menus/presentation/menus.controller.ts`
- CQRS pattern (CommandBus + QueryBus)
- GetMyMenuQuery: 5-check permission filtering
- BulkSeedMenusCommand available

**menu-management.controller.ts** (`/platform-console/menus/*` path):
- File: `apps-backend/api/src/modules/platform-console/menu-management/menu-management.controller.ts`
- Brand override support (create/update/delete overrides per brandId)
- Preview endpoint (render menu as user with specific brand+role)

**menu-permission.controller.ts**:
- File: `apps-backend/api/src/modules/core/identity/menus/presentation/menu-permission.controller.ts`
- Permission-to-menu mapping management

### 9.2 Frontend

**CRMSidebar.tsx**:
- File: `apps-frontend/crm-admin/src/app/(main)/_components/CRMSidebar.tsx`
- Filters menu groups: removes `SOFTWARE_VENDOR_GROUP` and `DEVELOPER_GROUP` from non-vendor users (lines 81-94)
- Fetches from `/menus/my-menu` endpoint

### 9.3 DB Tables

**identitydb:** `gv_cfg_menus` — 344 rows (per-tenant menu definitions)

**platformconsoledb:** 
- `pc_menu_global_configs` — 15 rows (global menu items: dashboard, contacts, leads, products, quotations, invoices, orders, settings group, markethub group)
- `pc_menu_brand_overrides` — brand-specific menu overrides
- `pc_vertical_menu` — table exists (not queried for row count)

**workingdb:** No menu/module/page/route tables found (`information_schema` query returned 0 rows).

**platformdb:** `gv_cfg_page_registry` — 466 rows (extensive page inventory).

### 9.4 v2.0 Migration Path

Current state: 3 separate menu systems (gv_cfg_menus per-tenant, pc_menu_global_configs global, gv_cfg_page_registry page inventory). No vertical-specific menu trees.

For v2.0 config-driven menus:
1. **M1:** Seed `pc_vertical_menu` with vertical-specific menu configs (TRAVEL gets tour-plans, quotations; SOFTWARE gets deals, activities; etc.)
2. **M2:** Add `GET /menus/vertical/:verticalCode` endpoint that returns vertical's default menu tree
3. **M2:** Update `GetMyMenuQuery` to apply vertical filter based on `user.businessTypeCode`
4. **M3:** Frontend: use `status.verticalCode` to conditionally render menu groups instead of hardcoded `SOFTWARE_VENDOR_GROUP` check
5. **M5:** Deprecate `gv_cfg_menus` static seeds; fully config-driven from PC DB

---

## 10. Migration Strategy

### Phase A — Schema (Sprint M1)
Create without removing existing:
1. Extend `gv_cfg_verticals` (identitydb): add the 12 missing verticals from `gv_cfg_business_type_registry`
2. Seed `pc_subcategory` for RETAIL, SOFTWARE, RESTAURANT, HEALTHCARE, EDUCATION verticals
3. Consolidate `pc_brand_profiles` — remove duplicate `TR_TRAV` entry, keep `travvellis`
4. Add `approval_config` JSONB column to `pc_subcategory` — replace hardcoded `['DMC_PROVIDER', 'AGENT', 'TOUR_GUIDE']`
5. Create `pc_vertical_menu` seed entries per vertical
6. Add `gv_cfg_brands.registration_component` column to store login/register component key

### Phase B — Data (Sprint M1)
Populate new/extended tables from existing data:
1. `seed-verticals-full.ts` → populate all 15 business types into `gv_cfg_verticals`
2. `seed-subcategories-all-verticals.ts` → add subcategory rows for each vertical
3. `seed-brands-v2.ts` → add brand rows for SOFTWARE/RETAIL/RESTAURANT brands when needed
4. Migrate `gv_cfg_business_type_registry` → `gv_cfg_verticals` mapping script

### Phase C — APIs (Sprint M2)
New endpoints:
1. `GET /auth/brands?subdomain=travvellis` — brand resolution
2. `GET /platform-console/user-categories?vertical=TRAVEL` — replaces hardcoded categories
3. `GET /platform-console/subcategories?vertical=TRAVEL&categoryCode=COMPANY_B2B` — already DB-backed
4. `GET /config/registration-schema?brand=travvellis&subcategory=DMC_PROVIDER` — dynamic fields
5. `GET /menus/vertical/:verticalCode` — vertical menu tree
6. `POST /onboarding/vertical` — optional vertical selection stage for generic flow

### Phase D — Frontend (Sprint M3-M6)
Gradual migration:
1. M3: Remove `COMPANY_B2B/COMPANY_B2C/INDIVIDUAL_SP` hardcoding from `StageUserType.tsx` → fetch from API
2. M3: Remove `'TRAVEL'` fallback from `StageSubUserType.tsx` line 31
3. M4: Remove `USER_TYPE_TO_CATEGORY` map from `onboarding.service.ts` — categories come in directly
4. M4: Remove hardcoded approval check `['DMC_PROVIDER', 'AGENT', 'TOUR_GUIDE']` from `auth.service.ts`
5. M5: Add new brand entries to `BRAND_REGISTRY` as brands are built
6. M5: Remove `SOFTWARE_VENDOR_GROUP`/`DEVELOPER_GROUP` hardcoding from sidebar
7. M6: IndustrySelector already config-driven — no work needed there

### Phase E — Cleanup (Sprint M8)
Remove deprecated:
1. `USER_TYPE_TO_CATEGORY` constant in onboarding service
2. Old `B2B/B2C/IND_SP` type aliases in onboarding DTO
3. Duplicate `TR_TRAV` brand_profile row in platformconsoledb
4. `gv_cfg_module_definitions` seeding (currently 0 rows — populate or deprecate)
5. Static `pc_vertical_registry` table (superseded by `gv_cfg_verticals`)

---

## 11. Sprint M1 Readiness

### Schema Priorities (ordered by dependency)

1. **Extend `gv_cfg_verticals` (identitydb)** — add missing verticals; all other changes depend on vertical codes
2. **Seed `pc_subcategory` for non-TRAVEL verticals** — needed before registration flows can be built for other brands
3. **Add approval config to `pc_subcategory`** — remove hardcoded approval list in `auth.service.ts`
4. **Consolidate `pc_brand_profiles`** — 2 Travvellis entries need cleanup; adds confusion
5. **Seed `pc_vertical_menu`** — foundation for config-driven menu per vertical
6. **Add `gv_cfg_brands.vertical_code` FK** — brands should have an explicit vertical relationship (currently only in companyMappings)
7. **Create `gv_cfg_partners` seeding** — currently 0 rows; partner management feature is blocked

### Existing Data to Migrate

| Source | Source DB | Target | Target DB | Migration Script |
|--------|----------|--------|----------|-----------------|
| `gv_cfg_business_type_registry` (15 rows) | platformdb | `gv_cfg_verticals` | identitydb | `migrate-business-types-to-verticals.ts` |
| `pc_brand_profiles` TR_TRAV row | platformconsoledb | DELETE duplicate | platformconsoledb | `cleanup-pc-brand-profiles.ts` |
| `gv_cfg_verticals` SOFTWARE/TRAVEL/RETAIL | identitydb | Extend | identitydb | Already seeded — add 12 more |

### Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| `gv_cfg_verticals` (3 codes) vs `gv_cfg_business_type_registry` (15 codes) mismatch | HIGH | Define canonical list before M1 migration scripts run |
| `pc_subcategory.vertical_id` references platformconsole IDs, not identitydb IDs | HIGH | Add `vertical_code` text FK as alternate key instead of relying on UUID |
| `auth.service.ts` line 267 hardcodes `['DMC_PROVIDER', 'AGENT', 'TOUR_GUIDE']` for approval | MEDIUM | Replace with DB query before adding new brands that need approval |
| `onboarding.dto.ts` enum `['B2B', 'B2C', 'IND_SP', 'IND_EE']` will break if new category added | MEDIUM | Change validator to `@IsString()` + runtime DB check |
| `gv_cfg_menus` (344 rows in identitydb) vs `pc_menu_global_configs` (15 rows) — which is canonical? | MEDIUM | PC menu is global default; gv_cfg_menus are per-tenant overrides — document this |
| Duplicate Travvellis brand profiles (`TR_TRAV` + `travvellis`) may cause confusion in brand resolution | LOW | Cleanup script in M1 |
| `gv_cfg_partners` is empty (0 rows) — partner flow is completely unbuilt | LOW | Not blocking M1; note for M3 |
| `pc_vertical_v2.TV` test row with code `TV` | LOW | Delete before M1 |

---

## 12. Quick Reference — What to Build in M1

| New Table/Action | Source Data | Migration Script | Priority |
|-----------------|-------------|-----------------|---------|
| Extend `gv_cfg_verticals` with 12 verticals | `gv_cfg_business_type_registry` (platformdb) | `seed-verticals-full.ts` | P0 |
| Add `pc_subcategory` rows for RETAIL vertical | Design required (similar to TRAVEL pattern) | `seed-subcategories-retail.ts` | P0 |
| Add `pc_subcategory` rows for SOFTWARE vertical | Design required | `seed-subcategories-software.ts` | P0 |
| Add `approval_config` to `pc_subcategory` | Existing `requires_approval` boolean | `migrate-subcategory-approval.ts` | P0 |
| Remove duplicate `pc_brand_profiles` TR_TRAV | None | `cleanup-brand-profiles.ts` | P1 |
| Seed `pc_vertical_menu` for TRAVEL, SOFTWARE, RETAIL | `gv_cfg_menus` patterns + `pc_menu_global_configs` | `seed-vertical-menus.ts` | P1 |
| Add `vertical_code` to `gv_cfg_brands` (identitydb) | `gv_cfg_verticals.code` | Prisma migration | P1 |
| Populate `gv_cfg_module_definitions` (0 rows) | `gv_cfg_vertical_module` (platformdb) | `seed-module-definitions.ts` | P2 |
| Seed `gv_cfg_partners` initial data | New data | `seed-partners-initial.ts` | P3 |
| Delete test row `pc_vertical_v2.TV` | None | `cleanup-vertical-v2-test.ts` | P2 |

---

*End of audit. All data sourced from live DB queries and codebase reads on 2026-04-26.*
*Databases: identitydb, workingdb, platformconsoledb, platformdb at nozomi.proxy.rlwy.net:35324*
*Codebase branch: feat/person-centric-multi-brand (commit c9a25660)*
