# PlatformDB — Deep Documentation

**Schema root:** `Application/backend/prisma/platform/v1/`
**Generator output:** `node_modules/@prisma/platform-client`
**Env var:** `PLATFORM_DATABASE_URL`
**Model count:** 64
**Migration policy:** ⚠️ **`prisma db push` only** (no formal migrations)

---

## Purpose

CRMSoft's **own** operations data — the vendor side of the SaaS. Plans, licenses, coupons, vertical registry, industry packages, error catalog, billing wallet, marketplace governance, test infrastructure, and the module/feature registry.

**Think of it as:** everything Anthropic Inc. uses to run Claude Cloud, vs. what Claude users see. PlatformDB is the vendor's operational plane.

**Blast radius:** High for CRMSoft team workflows; low for customer-facing flows (tenants keep working even if PlatformConsole is down, assuming cache is warm).

---

## ⚠️ Migration Policy

**PlatformDB uses `prisma db push` only, not `prisma migrate deploy`.**

Rationale:

- Schema iterates rapidly as CRMSoft team adds vendor-side features.
- Migrations add friction without safety benefit (admin DB, single writer, no external consumers depending on exact schema history).
- `db push` syncs the schema in one step; no migration files to maintain.

**If you run `prisma migrate deploy` against PlatformDB, you will create a migration baseline that is out of sync with reality. Don't.**

---

## Schema Files (7 files, 2,735 lines)

| File | Lines | Models | Domain |
|---|---:|---:|---|
| `_base.prisma` | 583 | 0 | Datasource + generator + all platform enums |
| `modules.prisma` | 640 | 19 | Master lookups, modules, verticals, industry packages, plugins, backups |
| `subscriptions.prisma` | 459 | 14 | Packages, plans, coupons, wallet, license keys, AI subscriptions |
| `marketplace.prisma` | 465 | 13 | Vendor-side marketplace records (listings, posts, orders) |
| `testing.prisma` | 396 | 13 | Test infrastructure (runs, plans, evidence, errors, reports) |
| `audit.prisma` | 163 | 4 | Error logs, activity logs, plugin hook logs |
| `vendors.prisma` | 29 | 1 | `MarketplaceVendor` |

---

## Full Model List (by file)

### modules.prisma (19 models)

| Model | Purpose |
|---|---|
| `MasterLookup` | Platform-wide lookup types (registry of what can be looked up) |
| `LookupValue` | Lookup values (similar to GlobalDB's but platform-managed; may be migrated) |
| `ErrorCatalog` | Canonical error codes with English + Hindi messages + solutions |
| `ModuleDefinition` | Registry of CRM modules (Contacts, Leads, Inventory, …) |
| `BusinessTypeRegistry` | **The 7 core business types plus CRMSoft-curated extensions** |
| `GvCfgVertical` | **Vertical registry** (Electronics, Travel, Restaurant, Retail, …) |
| `GvCfgVerticalModule` | Which modules are available per vertical |
| `IndustryPackage` | Pre-packaged configs for an industry |
| `IndustryPatch` | Delta updates to an industry package |
| `TenantModule` | Module enablement per tenant |
| `HelpArticle` | In-app help content |
| `PluginRegistry` | Available plugins (WhatsApp Business, Razorpay, Gmail, …) |
| `TenantPlugin` | Plugin activation per tenant |
| `PageRegistry` | Registry of CRM pages (for menu generation) |
| `AppVersion` | CRMSoft version manifest |
| `DatabaseBackupRecord` | Registry of database backups |
| `BackupLog` | Individual backup run log |
| `RestoreLog` | Restore run log |
| `SystemFieldMaster` | System-managed field definitions |

### subscriptions.prisma (14 models)

| Model | Purpose |
|---|---|
| `Package` | Subscription package (bundle of modules) |
| `PackageModule` | Modules in a package |
| `SubscriptionPackage` | Link between Subscription (IdentityDB) and Package |
| `TenantUsageDetail` | Fine-grained usage counters |
| `Wallet` | Tenant wallet balance |
| `WalletTransaction` | Wallet debits/credits |
| `RechargePlan` | Recharge pricing options |
| `Coupon` | Discount coupons |
| `CouponRedemption` | Coupon usage log |
| `SoftwareOffer` | Bundled offers (e.g., CRMSoft + Tally discount) |
| `LicenseKey` | License key issuance |
| `AiPlan` | AI-specific plan definitions (Claude, GPT, etc.) |
| `AiSubscription` | AI add-on subscriptions |
| `AiSubscriptionItem` | Line items on AI subscriptions |

### marketplace.prisma (13 models — vendor side)

Vendor-side records that **mirror** the live data in MarketplaceDB. Used for billing, moderation, and vendor reporting.

| Model | Purpose |
|---|---|
| `MarketplaceVendor` | (actually in vendors.prisma) A vendor tenant's marketplace profile |
| `MarketplaceModule` | Marketplace-as-a-product module config |
| `TenantMarketplaceModule` | Tenant-level enablement of marketplace module |
| `MarketplaceListing` | Vendor record of live listings (billing, moderation) |
| `ListingPriceTier` | Tier pricing mirror |
| `MarketplacePost` | Vendor record of social posts |
| `PostEngagement`, `PostComment` | Vendor engagement records |
| `MarketplaceEnquiry` | Vendor record of buyer enquiries |
| `MarketplaceOrder`, `MarketplaceOrderItem` | Orders placed through marketplace |
| `MarketplaceReview` | Vendor record of reviews |
| `ListingAnalytics`, `PostAnalytics` | Vendor analytics tables |

### testing.prisma (13 models)

CRMSoft's test infrastructure — used by the QA system to run and track automated + manual tests across the platform.

`TestEnvironment`, `TestRun`, `TestResult`, `TestGroup`, `TestGroupExecution`, `ManualTestLog`, `ScheduledTest`, `ScheduledTestRun`, `TestPlan`, `TestPlanItem`, `TestEvidence`, `TestErrorLog`, `TestReport`

### audit.prisma (4 models)

`ErrorLog`, `ErrorAutoReportRule`, `TenantActivityLog`, `PluginHookLog`

### vendors.prisma (1 model)

`MarketplaceVendor` — the CRMSoft-side record of a vendor tenant.

---

## Key Models (Deeper Detail)

### `BusinessTypeRegistry`

**The backbone of V5's 3-axis architecture.** Holds the 7 hardcoded core business types (B2B, B2C, CUSTOMER, MANUFACTURER, SERVICE_PROVIDER, INDIVIDUAL_SERVICE_PROVIDER, EMPLOYEE) plus any CRMSoft-curated extensions (e.g., WHOLESALER, IMPORTER, if/when added).

⚠️ **Governance-locked:** Only CRMSoft (Software Provider) can add rows. Brands, customers, and WL partners cannot modify this table. Enforced via backend guards.

### `GvCfgVertical` + `GvCfgVerticalModule`

The vertical registry. A vertical (Electronics, Travel, Restaurant, Retail, Software Vendor, …) maps to a curated set of modules. When a tenant is assigned a vertical, `GvCfgVerticalModule` determines which modules they can enable.

⚠️ **Curated list:** Verticals are approved by Platform, not self-service.

### `IndustryPackage` + `IndustryPatch`

Industry-specific pre-configured bundles. An `IndustryPackage` contains a starter set of:

- Custom field definitions
- Workflow templates
- Report definitions
- Quotation templates
- Menu layout

Tenants choosing an industry package get instant setup instead of starting from scratch.

### `Coupon` + `CouponRedemption` + `SoftwareOffer`

The promotions system. `Coupon` defines the discount (amount/percent, validity window, caps). `CouponRedemption` tracks usage. `SoftwareOffer` bundles coupons across partners (e.g., "get CRMSoft + Tally at 20% off").

### `Wallet` + `WalletTransaction` + `RechargePlan`

Prepaid credit system. Tenants top up wallet balance via `RechargePlan` packs; consumed by AI usage, SMS, WhatsApp, and other metered features. `WalletTransaction` is append-only ledger.

### `LicenseKey`

Issued license keys. Tenants activate by entering a key; system creates subscription in IdentityDB.

### `PluginRegistry` + `TenantPlugin`

Plugin system — third-party integrations (WhatsApp Business API, Razorpay, Gmail, Stripe, AWS S3, Anthropic Claude, OpenAI GPT, …). `PluginRegistry` is the catalog; `TenantPlugin` is activation per tenant.

### `ErrorCatalog`

The canonical registry of all error codes used across the backend. Each row has:

- `code` (e.g., `LEAD_NOT_FOUND`, `PURCHASE_ORDER_SALE_ORDER_NOT_FOUND`)
- `layer` (BE / FE / DB / MOB)
- `module` (CUSTOMER_PORTAL, PROCUREMENT, AUTH, …)
- `severity` (INFO / WARNING / ERROR / CRITICAL)
- `httpStatus`
- `messageEn`, `messageHi`, `solutionEn`, `solutionHi`
- `isRetryable`, `retryAfterMs`

Populated via `prisma/seeds/error-catalog.seed.ts`. Used by the unified error response formatter to deliver helpful errors to users in English + Hindi.

### `PageRegistry`

Declarative manifest of every CRM page. Powers menu generation (combined with `TenantModule` and `RoleMenuPermission` in IdentityDB) so menus adapt to plan + role + tenant config without hardcoding.

---

## Cross-DB Touchpoints

PlatformDB is referenced **from** IdentityDB, WorkingDB, MarketplaceDB, and PlatformConsole:

| From DB | To PlatformDB | Field |
|---|---|---|
| IdentityDB | `Subscription.packageId` | `Package` |
| IdentityDB | `Tenant.verticalId`, `Tenant.brandId` | `GvCfgVertical`, (brand registry) |
| WorkingDB | `SaleOrder.couponId`, `Invoice.couponId` | `Coupon` |
| WorkingDB | `Product.industryPackageId` | `IndustryPackage` |
| Any | error handler uses | `ErrorCatalog` (cached at startup) |
| MarketplaceDB ↔ PlatformDB | mirrored records | vendor-side tracking |

---

## Notes for V5 Restructure

- **`LookupValue` in PlatformDB** vs. **`GlCfgLookupValue` in GlobalDB** — two separate tables today. Consider whether V5 should consolidate into GlobalDB. (Decision not scoped here.)
- **Vendor-side marketplace models** live here AND in MarketplaceDB — don't accidentally "deduplicate" them; they serve different roles.
- **`db push` only** — any restructure script must not run `migrate deploy` against PlatformDB.
