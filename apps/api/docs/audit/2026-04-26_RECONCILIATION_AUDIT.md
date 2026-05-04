# Schema Reconciliation Audit — 2026-04-26
Sprint: M0c (Pre-M1 deep dive)
Auditor: Claude Code (Sonnet 4.6)

---

## Executive Summary

**Tables examined:** 40+ across 4 databases  
**Key decision count:** 14 migration actions defined  
**Surprise findings:** 3 critical ones  

### Top 3 Surprises
1. **gv_cfg_business_type_registry IS the subtype/industry table** — it has 15 codes with an `industry_category` column grouping them into 13 top-level categories. The 3 codes in `gv_cfg_verticals` (SOFTWARE, TRAVEL, RETAIL) are NOT a duplicate — they represent a separate "multi-tenant app vertical" concept. These are parallel taxonomies that serve different concerns.
2. **gv_cfg_page_registry has 466 rows but ALL are `is_auto_discovered=true` with `industry_code=NULL`** — the table is a filesystem scan artifact (crm=396, vendor=70). The table schema already covers most PcPageRegistry requirements but is missing `version`, `isDemoReady`, and `scope` fields.
3. **gv_cfg_error_catalog already exists in platformdb with 0 rows** — the complete schema is already defined with EN/HI message fields, severity, layer, is_retryable, retry_after_ms. PcErrorCatalog is NOT a new table — it's a migration + seed into this existing table.

### Sprint M1 Plan Summary
- **5 tables already exist** with schema close to v2.0 requirements (extend-only)
- **4 tables have partial equivalents** needing migrate + extend
- **5 tables are net-new** (no equivalent found anywhere)
- **Total Prisma migration files needed:** 8–10

---

## 1. Business Type Registry Analysis

### gv_cfg_business_type_registry (15 rows) — in platformdb

**Schema columns:**
`id, type_code, type_name, industry_category (enum), description, icon, color_theme, terminology_map (jsonb), default_modules (jsonb), recommended_modules (jsonb), excluded_modules (jsonb), workflow_templates (jsonb), dashboard_widgets (jsonb), extra_fields (jsonb), default_lead_stages (jsonb), default_activity_types (jsonb), registration_fields (jsonb), is_default, onboarding_script, is_active, sort_order, created_at, updated_at`

**All 15 codes:**

| type_code | type_name | industry_category | sort_order |
|-----------|-----------|-------------------|------------|
| AUTOMOTIVE | Automotive / Dealership | AUTOMOTIVE | 11 |
| CONSTRUCTION | Construction / Infrastructure | CONSTRUCTION | 9 |
| CONSULTING | Consulting / Professional Services | SERVICES | 8 |
| ECOMMERCE | E-Commerce | ECOMMERCE | 7 |
| EDUCATION | Education / Coaching | EDUCATION | 5 |
| EVENT_MANAGEMENT | Event Management | EVENTS | 12 |
| FINANCIAL_SERVICES | Financial Services / Insurance | FINANCE | 13 |
| GENERAL_TRADING | General Trading | RETAIL | 0 |
| HEALTHCARE_CLINIC | Healthcare / Clinic | HEALTHCARE | 4 |
| IT_SERVICES | IT / Software Services | SERVICES | 1 |
| LAUNDRY_SERVICES | Laundry / Dry Cleaning | SERVICES | 14 |
| MANUFACTURING | Manufacturing | MANUFACTURING | 2 |
| REAL_ESTATE | Real Estate | REAL_ESTATE | 3 |
| RESTAURANT_FOOD | Restaurant / Food & Beverage | FOOD_BEVERAGE | 6 |
| TRAVEL_TOURISM | Travel & Tourism | TRAVEL | 10 |

**Distinct industry_category values (13):** SERVICES, MANUFACTURING, RETAIL, HEALTHCARE, EDUCATION, FINANCE, REAL_ESTATE, FOOD_BEVERAGE, TRAVEL, CONSTRUCTION, ECOMMERCE, EVENTS, AUTOMOTIVE

**Used in code (files):**
- `src/core/auth/jwt.strategy.ts` — reads `businessTypeCode` from tenant's `industryCode`, puts in JWT
- `src/core/auth/auth.service.ts` — uses `businessTypeRegistry.findUnique()` on registration
- `src/core/auth/platform-bootstrap.service.ts` — seeds the 15 rows via `businessTypeRegistry.upsert()`
- `src/modules/core/identity/menus/application/queries/get-my-menu/get-my-menu.handler.ts` — cross-DB lookup to apply menu filtering by businessTypeCode
- `src/common/cross-service/monolith/vendor-service.monolith.ts` — `businessTypeRegistry.findFirst()`
- `src/modules/core/identity/tenant/services/industry-patching.service.ts` — patches tenant industry

**Verdict: These are BUSINESS SUBTYPES / INDUSTRY TYPES, NOT top-level verticals.**

The type_code values (TRAVEL_TOURISM, IT_SERVICES, HEALTHCARE_CLINIC) are specific business categories within a given CRM vertical. They answer "what kind of business are you?" during onboarding. They carry full operational config: terminology_map, default_modules, workflow_templates, registration_fields, etc.

This is the equivalent of `pc_subcategory` in platformconsoledb — but for the generic CRM vertical (non-TRAVEL). The TRAVEL vertical uses `pc_subcategory` (DMC_PROVIDER, AGENT, TOUR_GUIDE, TRAVELER), while ALL OTHER verticals use `gv_cfg_business_type_registry`.

### gv_cfg_verticals (3 rows) — in identitydb

| id | code | name | description |
|----|------|------|-------------|
| a855fea... | SOFTWARE | Software / SaaS | Software and technology companies |
| 5cb4719... | RETAIL | Retail & E-Commerce | Retail and e-commerce businesses |
| 5476d45... | TRAVEL | Travel & Tourism | Travel agencies, DMCs, tour operators |

**Schema:** `id, code, name, description, icon_code, default_modules (jsonb), default_menu (jsonb), terminology (jsonb), default_dashboard (jsonb), is_active, created_at, updated_at`

**FK dependency:** `gv_cmp_user_company_mappings.vertical_code` → `gv_cfg_verticals(code)` ON DELETE SET NULL

**Verdict: gv_cfg_verticals are the TOP-LEVEL CRM PRODUCT VERTICALS** — they represent separate product packages/editions. These map 1:1 to what `PcVertical` (v2.0 architecture) should represent.

### gv_cfg_vertical in platformdb (2 rows)

A THIRD "vertical" table — this is a *technical DB schema vertical* used for table-prefix-based database partitioning. Rows: `gv` (General) and `soft` (Software Vendor). NOT business verticals — ignore for M1.

### Reconciliation Decision

`gv_cfg_business_type_registry` (15 rows) → maps to **PcSubType** — these are industry-specific business sub-types used in registration and menu filtering. M1 action: **MIGRATE + EXTEND** into `pc_subcategory` or create a new `pc_subtype` table (see Section 6 for decision).

`gv_cfg_verticals` (3 rows) → maps to **PcVertical** — top-level CRM product editions. M1 action: **MIGRATE + EXTEND** these 3 rows to join the 5 already in `pc_vertical_v2`.

---

## 2. Page Registry Analysis

### gv_cfg_page_registry (466 rows) — in platformdb

**Schema:** `id, route_path, route_pattern, portal, file_path, component_name, friendly_name, description, page_type, category, module_code, menu_key, menu_label, menu_icon, menu_parent_key, menu_sort_order, show_in_menu, has_params, param_names[], is_nested, parent_route, features_covered[], api_endpoints[], screenshot_url, preview_url, industry_code, is_active, is_auto_discovered, last_scanned_at, created_at, updated_at`

**Sample data (10 rows):**

| route_path | portal | page_type | category | friendly_name |
|------------|--------|-----------|----------|---------------|
| crm:/ | crm | DASHBOARD | Other | Home |
| crm:/accounts | crm | LIST | Other | Accounts |
| crm:/activities | crm | LIST | CRM | Activities |
| vendor:/dashboard | vendor | DASHBOARD | Vendor | Dashboard |

**By portal/module:**

| portal | module_code | count |
|--------|-------------|-------|
| crm | NULL | 396 |
| vendor | NULL | 70 |

Note: All 466 rows have `module_code = NULL` — modules were never assigned during auto-discovery.

**By category (top 10):**

| portal | category | count |
|--------|----------|-------|
| crm | Other | 116 |
| crm | Settings | 60 |
| crm | CRM | 42 |
| crm | Communication | 29 |
| crm | Post-Sales | 26 |
| crm | Marketplace | 18 |
| vendor | Vendor | 69 |
| vendor | Settings | 1 |

**Discovery stats:** `is_auto_discovered = true` for ALL 466 rows. `industry_code = NULL` for ALL 466 rows. Zero manual entries.

**Schema comparison vs PcPageRegistry (v2.0):**

| PcPageRegistry field | Exists in gv_cfg_page_registry? | Column name / Status |
|---------------------|--------------------------------|---------------------|
| pageCode (unique) | PARTIAL | route_path is unique but has `crm:/` prefix |
| version | NO | Missing |
| isDemoReady | NO | Missing |
| pageType | YES | page_type (LIST, DETAIL, CREATE, etc.) |
| scope (brandIds etc.) | NO | industry_code exists but always NULL |
| portal | YES | portal (`crm`, `vendor`) |
| module_code | YES | module_code (but always NULL in data) |
| features_covered | YES | features_covered (text array) |
| api_endpoints | YES | api_endpoints (text array) |

**The 64 extra rows (466 DB - 402 M0a audit):**
- M0a audit found 402 pages by scanning the filesystem of `crm-admin` and `vendor-panel` frontends.
- The 64 extra rows in DB likely include: deprecated routes not yet cleaned up, routes from multiple scan runs, or routes from older app versions still in the table. All rows have `is_active = true` with no cleanup mechanism implemented.

**Code usage:** `PageRegistryService`, `PageRegistryBootstrapService`, and `PageRegistryController` are all live in `src/modules/core/identity/tenant/`. The service uses `this.prisma.platform.pageRegistry` directly.

**Migration decision:** The existing `gv_cfg_page_registry` IS the page registry. Do NOT create a separate `pc_page_registry`. Instead:
1. Add columns: `version TEXT DEFAULT '2.0'`, `is_demo_ready BOOLEAN DEFAULT false`, `brand_scope TEXT[]`
2. Move/copy into platformconsoledb as `pc_page_registry` during M1 migration
3. The 64 stale rows need a cleanup script (set `is_active = false` where route no longer exists in filesystem)

---

## 3. System Config Analysis

### Existing config tables found:

**identitydb:**
- `gv_cfg_tenant_configs` — 0 rows. Schema: tenant_id + config_key + config_value + ConfigCategory enum + ConfigValueType enum + full validation fields. Designed for per-tenant settings.

**global_working (workdb):**
- `gv_cfg_ai_settings` — 0 rows. Per-tenant AI provider config.
- `gv_cfg_ai_system_prompts` — (not sampled, 0 rows)
- `gv_cfg_calendar_configs` — (not sampled)
- `gv_cfg_cron_job_configs` — (not sampled)
- `gv_cfg_entity_config_values` — 0 rows. EAV-style custom field values, FK to `gv_cfg_custom_field_definitions`.
- `gv_cfg_notion_configs` — (not sampled)
- `gv_cfg_quiet_hour_configs` — (not sampled)
- `gv_cfg_table_configs` — (not sampled)
- `gv_not_configs` / `gv_not_preferences` — notification config

**platformdb:**
- `gv_cfg_system_field_master` — **0 rows**. Schema: `field_code, field_group, field_type, field_value, default_value, display_name, scope (PLATFORM|TENANT|USER), tenant_id`. This IS the intended PcSystemConfig equivalent.

**platformconsoledb:**
- `pc_brand_vertical_config` — 1 row. Per-brand+vertical module/feature overrides.
- `pc_menu_global_configs` — 15 rows (seeded). Global menu items with Hindi labels.

### Current config distribution:

- **env vars:** 67 references (JWT_SECRET, DB URLs, R2 storage, admin passwords)
- **ConfigService:** 177 references (NestJS ConfigService wrapping .env)
- **DB-stored:** All config tables are currently empty — 0 rows in every table

The entire application currently runs 100% off env vars and hardcoded defaults. No DB-stored config is active.

### Migration to PcSystemConfig:
`gv_cfg_system_field_master` (platformdb, 0 rows) is structurally identical to what PcSystemConfig needs. The decision is:
1. **Keep `gv_cfg_system_field_master` in platformdb** as the canonical platform-level config store (scope=PLATFORM, tenant_id=NULL)
2. **Use `gv_cfg_tenant_configs` in identitydb** for per-tenant overrides (scope=TENANT)
3. **Do NOT create a new pc_system_config** — the existing tables cover the requirement with a different naming convention

If M1 requires a `PcSystemConfig` table in platformconsoledb for platform-console-specific settings (e.g., brand defaults, vertical pricing), create it as a thin wrapper.

---

## 4. Error Handling Analysis

### Existing error infrastructure:

**Error DB tables:**
- `platformdb.gv_cfg_error_catalog` — **0 rows** but COMPLETE schema: `code, layer (ErrorLayer enum: BE|FE|DB), module, severity (ErrorSeverity enum), http_status, message_en, message_hi, solution_en, solution_hi, technical_info, help_url, is_retryable, retry_after_ms, is_active`
- `platformdb.gv_aud_error_logs` — runtime error logs
- `platformdb.gv_qa_error_logs` — QA test error logs
- `platformconsoledb.pc_brand_error_summaries` — brand-level error summaries
- `platformconsoledb.pc_error_auto_reports` — automated error reports
- `platformconsoledb.pc_error_escalations` — escalation tracking
- `platformconsoledb.pc_error_global_logs` — cross-brand error logs
- `platformconsoledb.pc_error_trends` — error trend analytics

**Error class files (31 files total):**
Key files:
- `src/common/errors/error-codes.ts` — 1298 lines, MASTER error code registry (`ERROR_CODES` object with `code, httpStatus, message, suggestion`)
- `src/common/errors/app-error.ts` — custom AppError class
- `src/common/errors/error-catalog.service.ts` — service to query error catalog
- `src/common/errors/errors.module.ts` — NestJS module
- `src/modules/platform-console/error-center/` — full error center module with controller, service, cron, interceptor
- Per-module error files: `brand-manager.errors.ts`, `cicd.errors.ts`, `security.errors.ts`, etc.

**Hardcoded error messages:** ~555 inline `throw new XyzException('...')` calls

**Multi-language support:** `gv_cfg_error_catalog` schema has `message_en` and `message_hi` columns — infrastructure for bilingual errors exists but is not populated. Frontend has an `i18n` directory but no JSON locale files found (only `request.ts`).

### Error throwing patterns:
Two patterns coexist:
1. **NestJS HTTP exceptions** — `throw new UnauthorizedException('Invalid credentials')` — 555 occurrences, inline messages, no catalog lookup
2. **ERROR_CODES registry** — `error-codes.ts` defines ~200 structured codes but they are NOT consistently used in throw sites

### Migration to PcErrorCatalog:
`gv_cfg_error_catalog` already exists with the right schema. M1 action:
- **DO NOT create a new table** — seed `gv_cfg_error_catalog` from `error-codes.ts`
- Write a seed script that reads `ERROR_CODES` and inserts/upserts into `gv_cfg_error_catalog`
- Estimated: ~200 catalog entries to seed (from error-codes.ts), ~555 throw sites to eventually migrate (LOW priority for M1 — schema-only, seed only)

---

## 5. Tenant Model Analysis

### Current tenancy model: SHARED DATABASE with tenant_id isolation

All tenants share the same databases. Row-level isolation via `tenant_id` column. No per-tenant DB sharding.

### Tenant count: 2 tenants (both are seed/demo tenants)

| id | name | slug | status |
|----|------|------|--------|
| demo-tenant-... | CRMSoft Demo | crmsoft-demo | DEMO |
| default-tenant-... | Default Organization | default | ACTIVE |

Users: 2 distinct `tenant_id` values in `gv_usr_users`.

### Per-tenant config:
- **Schema exists:** `gv_cfg_tenant_configs` (identitydb, 0 rows) — full per-tenant config table with `config_key, config_value, ConfigCategory enum`
- **Currently not used:** 0 rows in production
- **Tenant FK in system_field_master:** `gv_cfg_system_field_master.tenant_id` supports per-tenant overrides of platform fields

### Path to v2.1 Tenant Sync:
Current model is already v2.1 compatible. Shared DB + tenant_id isolation is the correct architecture. The `gv_cfg_tenant_configs` table just needs to be seeded with default values for each new tenant during onboarding. No structural changes needed for M1.

---

## 6. Reconciliation Decision Matrix

| v2.0/v2.1 Table | DB | Existing Equivalent | Existing Rows | Action | Priority |
|-----------------|-----|---------------------|---------------|--------|----------|
| PcPartner | identitydb | gv_cfg_partners (0 rows) | 0 | EXTEND (add fields: tier, wl_config, commission_rules) | HIGH |
| PcVertical | platformconsoledb | gv_cfg_verticals (3 rows in identitydb) + pc_vertical_v2 (5 rows in pc) | 8 total | MIGRATE identitydb rows to pc_vertical_v2 + EXTEND schema | HIGH |
| PcBrand | identitydb | gv_cfg_brands (2 rows) | 2 | EXTEND (add: vertical_code FK, tier, feature_flags) | HIGH |
| PcBrandVertical | platformconsoledb | pc_brand_vertical_config (1 row) | 1 | ALREADY EXISTS — rename/extend if needed | HIGH |
| PcSubType | platformconsoledb | pc_subcategory (4 rows, TRAVEL only) + gv_cfg_business_type_registry (15 rows, all others) | 19 total | MIGRATE business_type_registry → new pc_subtype table + merge with pc_subcategory | HIGH |
| PcCombinedCode | platformdb | gv_cfg_master_lookups (0 rows) | 0 | USE gv_cfg_master_lookups — it is the combined code / lookup table | MED |
| PcModule | platformconsoledb | pc_vertical_module (29 rows) + gv_cfg_module_definitions (0 rows in platform) | 29 | pc_vertical_module IS PcModule — EXTEND schema if needed | MED |
| PcMenu | platformconsoledb | pc_vertical_menu (58 rows) + pc_menu_global_configs (15 rows) + gv_cfg_menus (344 rows in identitydb) | 417 total | pc_vertical_menu + pc_menu_global_configs ARE the PcMenu tables — no new table needed | MED |
| PcPageRegistry | platformconsoledb | gv_cfg_page_registry (466 rows in platformdb) | 466 | MIGRATE to platformconsoledb + ADD columns: version, is_demo_ready, brand_scope[] | HIGH |
| PcPageAccess | platformconsoledb | gv_usr_role_menu_permissions (identitydb) | unknown | CREATE new table — role/user page access control separate from menu permissions | HIGH |
| PcSystemConfig | platformdb | gv_cfg_system_field_master (0 rows) | 0 | SEED existing table — schema is complete | MED |
| PcErrorCatalog | platformdb | gv_cfg_error_catalog (0 rows) | 0 | SEED existing table from error-codes.ts | LOW |
| PcOnboardingStage | platformconsoledb | NONE | 0 | CREATE new table | MED |
| PcRegistrationField | platformconsoledb | pc_subcategory.registration_fields (jsonb, embedded) | embedded | EXTRACT jsonb → normalized table per vertical+subtype | LOW |

---

## 7. Sprint M1 Action Plan

### Day 1 — Data migrations (move existing data to right place)

1. **Migrate gv_cfg_verticals (identitydb) → pc_vertical_v2 (platformconsoledb)**
   - Map 3 rows (SOFTWARE, TRAVEL, RETAIL) into pc_vertical_v2 schema
   - Add columns to pc_vertical_v2 if missing: `short_code`, `icon_code`, `terminology (jsonb)`
   - After migration, update FK in `gv_cmp_user_company_mappings` to reference pc_vertical_v2

2. **Create pc_subtype table in platformconsoledb**
   - Merge `gv_cfg_business_type_registry` (15 rows, all non-TRAVEL subtypes) + `pc_subcategory` (4 rows, TRAVEL) into a unified `pc_subtype` table
   - Schema: `id, code, name, vertical_id (FK), industry_category, terminology_map (jsonb), default_modules (jsonb), registration_fields (jsonb), workflow_templates (jsonb), requires_approval, is_active, sort_order`
   - Seed 19 rows total

3. **Extend gv_cfg_partners (identitydb)** — add: `tier (TEXT DEFAULT 'STANDARD')`, `billing_email`, `sla_tier`, `can_white_label (BOOLEAN)`

### Day 2 — New table creation

4. **Create pc_page_registry in platformconsoledb**
   - Copy all 466 rows from `platformdb.gv_cfg_page_registry`
   - Add new columns: `version TEXT DEFAULT '2.0'`, `is_demo_ready BOOLEAN DEFAULT false`, `brand_scope TEXT[]`, `vertical_scope TEXT[]`
   - Keep original `gv_cfg_page_registry` in platformdb as read replica during transition
   - Update `PageRegistryService` to read from new pc_page_registry

5. **Create pc_page_access in platformconsoledb**
   - Schema: `id, page_id (FK→pc_page_registry), role_code, brand_code, vertical_code, permission_type (VIEW|EDIT|ADMIN), is_active`
   - No existing rows — starts empty, filled by admin console

6. **Create pc_onboarding_stage in platformconsoledb**
   - Schema: `id, vertical_id (FK), stage_code, stage_name, stage_order, description, is_required, is_skippable, ui_component, validation_rules (jsonb), next_stage_code, created_at, updated_at`
   - Seed: 5–7 stages per vertical (ACCOUNT_CREATED, PROFILE_SETUP, VERTICAL_SELECTED, SUBTYPE_SELECTED, MODULES_CONFIGURED, TEAM_INVITED, COMPLETED)

### Day 3 — Config and catalog seeding

7. **Seed gv_cfg_system_field_master (platformdb)**
   - Extract all `ConfigService.get()` calls (177 references) → create catalog entries
   - Key configs to seed: JWT_EXPIRES_IN, BCRYPT_SALT_ROUNDS, DEFAULT_TENANT_ID, R2 bucket defaults, feature flags
   - ~20–30 records for M1

8. **Seed gv_cfg_error_catalog (platformdb)**
   - Write seed script reading `error-codes.ts` ERROR_CODES object
   - ~200 entries, EN message only in M1 (HI can be added in M2)

9. **Extend gv_cfg_brands (identitydb)**
   - Add: `vertical_code TEXT` (FK to gv_cfg_verticals for now), `partner_code TEXT`, `tier TEXT`, `is_white_label BOOLEAN DEFAULT false`

### Day 4 — Prisma schema sync + seed validation

10. **Update all Prisma schema files** to reflect new/extended tables
11. **Run `prisma db pull`** on all 4 clients to verify
12. **Run full seed suite** and validate all tables have expected row counts
13. **Write row-count assertions** in bootstrap service for CI validation

---

## 8. Data Preservation Checklist

| Dataset | Source Table | Source DB | Rows | Destination Table | Destination DB | Risk |
|---------|-------------|-----------|------|-------------------|----------------|------|
| Verticals (3 CRM editions) | gv_cfg_verticals | identitydb | 3 | pc_vertical_v2 | platformconsoledb | LOW — no FK deps broken if migrated carefully |
| Brands | gv_cfg_brands | identitydb | 2 | gv_cfg_brands (extended) | identitydb | LOW — no move, just extend |
| Partner config | gv_cfg_partners | identitydb | 0 | gv_cfg_partners (extended) | identitydb | NONE |
| Business subtypes (all verticals) | gv_cfg_business_type_registry | platformdb | 15 | pc_subtype | platformconsoledb | MEDIUM — code references in JWT, menu handler, auth.service must be updated |
| Travel subtypes | pc_subcategory | platformconsoledb | 4 | pc_subtype | platformconsoledb | LOW — same DB, merge operation |
| Page registry | gv_cfg_page_registry | platformdb | 466 | pc_page_registry | platformconsoledb | MEDIUM — PageRegistryService must be updated to read new table |
| Menu items (global) | pc_menu_global_configs | platformconsoledb | 15 | STAY in place | platformconsoledb | NONE |
| Menu items (vertical) | pc_vertical_menu | platformconsoledb | 58 | STAY in place | platformconsoledb | NONE |
| Menu items (tenant) | gv_cfg_menus | identitydb | 344 | STAY in place | identitydb | NONE |
| System config | gv_cfg_system_field_master | platformdb | 0 | STAY in place (seed) | platformdb | NONE |
| Error catalog | gv_cfg_error_catalog | platformdb | 0 | STAY in place (seed) | platformdb | NONE |
| Brand-vertical config | pc_brand_vertical_config | platformconsoledb | 1 | STAY in place | platformconsoledb | NONE |

---

## 9. Risks & Mitigations

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| 1 | **businessTypeCode cross-DB reference** — auth.service, jwt.strategy, and menu handler all read `gv_cfg_business_type_registry` from platformdb. Migrating subtypes to `pc_subtype` in platformconsoledb introduces a 3rd cross-DB call in the JWT critical path. | HIGH | Keep `gv_cfg_business_type_registry` in platformdb as source of truth; replicate/seed pc_subtype in parallel. Only cut over after all code references are updated. |
| 2 | **gv_cmp_user_company_mappings.vertical_code FK** — currently references `gv_cfg_verticals(code)` in identitydb. If verticals are moved to pc_vertical_v2 in platformconsoledb, this FK becomes a cross-DB reference (not possible in Postgres). | HIGH | Keep `gv_cfg_verticals` in identitydb as a FK-safe copy; sync data from pc_vertical_v2 via seed. This is the multi-client Prisma pattern already in use. |
| 3 | **466 page registry rows with module_code = NULL** — pages were auto-discovered but never assigned to modules. Moving the table to platformconsoledb without module assignments means PcModule → PcPageRegistry FK will fail for all 466 rows. | MED | Set `module_code` as nullable in pc_page_registry; populate via admin console bulk-assign (already has API endpoint: `POST /page-registry/:id/assign`). |
| 4 | **Duplicate vertical concepts** — 4 different "vertical" tables exist: `gv_cfg_verticals` (identity, 3 rows), `pc_vertical_v2` (console, 5 rows), `gv_cfg_vertical` (platform, 2 rows), `pc_vertical_registry` (console, 7 rows). Team confusion is certain. | MED | Publish a "one-pager vertical taxonomy" before M1 coding starts. Clear naming: gv_cfg_vertical = DB partition (DO NOT TOUCH); pc_vertical_v2 = product editions; gv_cfg_verticals = identity FK-safe copy; pc_vertical_registry = legacy (to be deprecated). |
| 5 | **gv_cfg_error_catalog is in platformdb, not platformconsoledb** — the M1 plan says PcErrorCatalog should be in platformconsoledb. If error-center controllers in platformconsoledb module try to write to platformdb, that's another cross-DB hop. | LOW | Accept that `gv_cfg_error_catalog` stays in platformdb (it is a GLOBAL platform-wide catalog). Platform console error controllers read via `this.prisma.platform.errorCatalog`. |

---

## 10. Database Placement Decision

### Final placement decision for all 14 v2.0/v2.1 tables:

| Table | DB | Rationale |
|-------|-----|-----------|
| PcPartner | **identitydb** (as `gv_cfg_partners`, extend) | Partners own companies/mappings; FK to `gv_cmp_user_company_mappings` must be in same DB |
| PcVertical | **platformconsoledb** (as `pc_vertical_v2`, migrate+extend) | Product editions managed by platform ops; no FK dependency from identitydb rows (use code reference, not id) |
| PcBrand | **identitydb** (as `gv_cfg_brands`, extend) | Brand code is FK'd in `gv_cmp_user_company_mappings.brand_code` — must stay in identitydb |
| PcBrandVertical | **platformconsoledb** (as `pc_brand_vertical_config`, already exists) | Brand+vertical config is platform-console concern, no FK deps |
| PcSubType | **platformconsoledb** (new `pc_subtype`) | Subtype definitions are product catalog items; consolidate pc_subcategory + business_type_registry here. Keep `gv_cfg_business_type_registry` in platformdb as read-source for menu/JWT until migration complete. |
| PcCombinedCode | **platformdb** (as `gv_cfg_master_lookups`, seed) | Lookup codes are global, shared across all tenants; belongs with other gv_cfg_ platform tables |
| PcModule | **platformconsoledb** (as `pc_vertical_module`, extend) | Module definitions are per-vertical; already 29 rows here |
| PcMenu | **platformconsoledb** (as `pc_vertical_menu` + `pc_menu_global_configs`) | Global and vertical menus both live here already |
| PcPageRegistry | **platformconsoledb** (new `pc_page_registry`, migrated from platformdb) | Pages are vertical/brand scoped; platform console manages them |
| PcPageAccess | **platformconsoledb** (new `pc_page_access`) | Access rules are brand/vertical-specific, managed by console ops |
| PcSystemConfig | **platformdb** (as `gv_cfg_system_field_master`, seed) | Platform-wide settings not brand/vertical specific; belongs in platformdb |
| PcErrorCatalog | **platformdb** (as `gv_cfg_error_catalog`, seed) | Global error catalog shared by all apps; already has correct schema + location |
| PcOnboardingStage | **platformconsoledb** (new `pc_onboarding_stage`) | Onboarding stages are per-vertical product decisions, not per-tenant |
| PcRegistrationField | **platformconsoledb** (as normalized extension of `pc_subtype.registration_fields`) | Extract embedded jsonb from pc_subtype → either normalize into `pc_registration_field` or keep as jsonb (LOW priority for M1) |

### Key principle behind split:
- **identitydb**: Tables with FK dependencies on users, companies, tenants → `gv_cfg_brands`, `gv_cfg_partners`, `gv_cfg_verticals` (FK copy)
- **platformdb**: Global platform-wide registry tables shared across all brands → `gv_cfg_error_catalog`, `gv_cfg_system_field_master`, `gv_cfg_business_type_registry` (keep as legacy)
- **platformconsoledb**: Product definition tables (what modules exist, what pages exist, what verticals are offered) → `pc_vertical_v2`, `pc_subtype`, `pc_page_registry`, `pc_page_access`, `pc_onboarding_stage`

---

## 11. Blockers for M1

### BLOCKER 1 — Vertical taxonomy decision required
There are 4 competing "vertical" table concepts. Before writing a single M1 migration file, the team must agree on the canonical vertical taxonomy:
- Which table is the authoritative source for "what verticals exist"?
- How does `gv_cmp_user_company_mappings.vertical_code` map to `pc_vertical_v2`?
- **Decision needed:** Does `gv_cfg_verticals` (identitydb, 3 rows) become a sync'd copy of `pc_vertical_v2`, or do they serve different purposes?

**Recommendation:** `pc_vertical_v2` = master (console manages it), `gv_cfg_verticals` = FK-safe replica in identitydb (seeded from pc_vertical_v2 via bootstrap). The 3-row identitydb copy must stay because of the existing FK constraint.

### BLOCKER 2 — PcSubType table name conflict
`pc_subcategory` (4 rows, TRAVEL-only) and `gv_cfg_business_type_registry` (15 rows, all others) serve the same logical purpose but have different schemas and live in different DBs. M1 requires a migration script that:
1. Creates `pc_subtype` in platformconsoledb with a unified schema
2. Migrates both sources into it
3. Updates all code references from `businessTypeRegistry.findUnique()` to the new table
This is a 2–3 hour code change, not just a migration. Must be planned explicitly.

### BLOCKER 3 — No existing migration for pc_page_registry FK to pc_vertical_v2
466 page rows have `module_code = NULL`. Until module assignments exist, `pc_page_access` cannot have meaningful data. This is a data quality issue that may block demo readiness for M1 sprint review.

**VERDICT: 3 decisions needed before M1 code starts. Once these are resolved, no other blockers exist. M1 can start immediately after team sync.**
