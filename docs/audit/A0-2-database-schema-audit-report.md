# A0-2: Database Schema Audit Report
## CRMSoft — Phase 0 Audit

**Date:** 2026-03-18
**Auditor:** Claude Code (automated scan)
**Scope:** `API/prisma/schema.prisma`

---

## SCORECARD

| Dimension | Score | Status |
|-----------|-------|--------|
| Schema Completeness | 7/10 | ⚠️ Good size, field gaps exist |
| Tenant Isolation | 7/10 | ⚠️ 22 non-platform models missing `tenantId` |
| Index Coverage | 6/10 | ⚠️ 31 models with tenantId lack tenantId index |
| Soft Delete | 4/10 | 🔴 253 business models have no soft delete |
| Audit Trail | 6/10 | ⚠️ `createdById` on 20% of models; `updatedAt` missing on 40+ |
| Relation Integrity | 6/10 | ⚠️ 252 of 370 relations have no explicit `onDelete` rule |
| Domain Boundaries | 8/10 | ✅ Clean grouping; platform/core/customer/vendor/plugin clear |
| **OVERALL** | **6.3/10** | ⚠️ |

**CRITICAL: 3 | WARNING: 5 | INFO: 4**

---

## 1. SCHEMA OVERVIEW

| Metric | Value |
|--------|-------|
| Schema file | `prisma/schema.prisma` |
| Lines | 11,633 |
| **Total Models** | **307** |
| **Total Enums** | **212** |
| Total Views | 0 |
| Total Migrations | 4 |
| `@@index` declarations | 542 |
| `@@unique` declarations | 160 |
| `@unique` declarations | 51 |
| `@relation` declarations | 370 |
| JSON field usage | 122 models |
| Database | PostgreSQL (Prisma) |

### Migration History (4 total — very few for 307 models)
```
20260225074903_init
20260304000000_add_table_config_and_masking
20260306000001_add_enums
20260306000002_add_calendar_task_tables
```
⚠️ Only 4 migrations for 307 models means most schema was written in the initial migration. This limits incremental audit/rollback capability.

---

## 2. ALL 307 MODELS (by domain)

### PLATFORM Models (45) — Global DB, no `tenantId` expected
`AMCPlanTemplate`, `AppVersion`, `BusinessTypeRegistry`, `Coupon`, `CouponRedemption`, `GlobalDefaultCredential`, `IndustryPackage`, `IndustryPatch`, `LicenseKey`, `ModuleDefinition`, `Package`, `PackageModule`, `PageRegistry`, `PermissionTemplate`, `Plan`, `PlanLimit`, `PlanModuleAccess`, `PushSubscription`, `RateLimitTier`, `RechargePlan`, `ReferralPartner`, `SoftwareOffer`, `Subscription`, `SubscriptionPackage`, `SuperAdmin`, `Tenant`, `TenantActivityLog`, `TenantAuditLog`, `TenantAuditSession`, `TenantBranding`, `TenantConfig`, `TenantCredential`, `TenantInvoice`, `TenantMarketplaceModule`, `TenantModule`, `TenantPlugin`, `TenantProfile`, `TenantRuleCacheVersion`, `TenantTemplateCustomization`, `TenantUsage`, `TenantUsageDetail`, `TenantVersion`, `TourPlan`, `TourPlanPhoto`, `TourPlanVisit`

### CORE Models (64) — Shared infrastructure
`AuditFieldChange`, `AuditLog`, `AuditRetentionPolicy`, `Comment`, `Communication`, `CommunicationLog`, `Contact`, `ContactFilter`, `ContactOrganization`, `CustomFieldDefinition`, `Document`, `DocumentActivity`, `DocumentAttachment`, `DocumentFolder`, `DocumentShareLink`, `Email`, `EmailAccount`, `EmailAttachment`, `EmailCampaign`, `EmailFooterTemplate`, `EmailSignature`, `EmailTemplate`, `EmailThread`, `EmailTrackingEvent`, `EmailUnsubscribe`, `Menu`, `Notification`, `NotificationConfig`, `NotificationPreference`, `NotificationTemplate`, `Organization`, `OrganizationFilter`, `OrganizationLocation`, `Permission`, `Role`, `RoleMenuPermission`, `RolePermission`, `Tag`, `User`, `UserAvailability`, `UserCalendarSync`, `UserCapacity`, `UserPermissionOverride`, `VerificationOtp`, _(+ 20 more)_

### CUSTOMER CRM Models (164) — CRM portal (Port 3005)
`Activity`, `AMCContract`, `AMCSchedule`, `AccountGroup`, `AccountTransaction`, `ApiKey`, `ApiRequestLog`, `ApprovalRequest`, `ApprovalRule`, `AssignmentRule`, `BOMFormula`, `BOMFormulaItem`, `BOMProduction`, `BankAccount`, `BankReconciliation`, `Brand`, `BusinessHoursSchedule`, `BusinessLocation`, `CalendarConfig`, `CalendarEvent`, `CalendarHighlight`, `Campaign`, `CreditNote`, `DebitNote`, `DeliveryChallan`, `Demo`, `Department`, `Designation`, `ErrorLog`, `ExportJob`, `FollowUp`, `GSTReturn`, `GoodsReceipt`, `HolidayCalendar`, `ImportJob`, `ImportProfile`, `ImportRow`, `InventoryItem`, `Invoice`, `Lead`, `LeadFilter`, `LedgerMaster`, `Manufacturer`, `Payment`, `PaymentReceipt`, `PaymentRecord`, `Product`, `ProductPrice`, `ProformaInvoice`, `PurchaseInvoice`, `PurchaseMaster`, `PurchaseOrder`, `PurchaseQuotation`, `PurchaseRFQ`, `Quotation`, `QuotationLineItem`, `QuotationTemplate`, `RawContact`, `Reminder`, `ReportDefinition`, `SaleOrder`, `SaleMaster`, `SaleReturn`, `SalesTarget`, `ScrapRecord`, `ServiceVisitLog`, `StockAdjustment`, `StockLocation`, `StockSummary`, `StockTransaction`, `SupportTicket`, `Task`, `TDSRecord`, `TourPlan`, `Workflow`, `WorkflowInstance`, _(+ 80+ more)_

### VENDOR Models (6) — Vendor portal (Port 3006)
`ServiceCharge`, `ServiceRate`, `ServiceVisitLog`, `Wallet`, `WalletTransaction`, `MarketplaceVendor`

### MARKETPLACE Models (9)
`ListingAnalytics`, `ListingPriceTier`, `MarketplaceEnquiry`, `MarketplaceListing`, `MarketplaceModule`, `MarketplaceOrder`, `MarketplaceOrderItem`, `MarketplacePost`, `MarketplaceReview`

### PLUGIN Models (19) — WhatsApp, GST, etc.
`GSTReturn`, `PluginHookLog`, `PluginRegistry`, `WaBroadcast`, `WaBroadcastRecipient`, `WaChatbotFlow`, `WaConversation`, `WaMessage`, `WaOptOut`, `WaQuickReply`, `WaTemplate`, `WarrantyClaim`, `WarrantyRecord`, `WarrantyTemplate`, `WhatsAppBusinessAccount`, `WorkflowActionLog`, `WorkflowApproval`, _(+ 2 more)_

---

## 3. TENANT ISOLATION ANALYSIS

### 🔴 CRITICAL: 22 Non-Platform Models Missing `tenantId`

These models are tenant-scoped (business data) but **lack `tenantId`** — meaning there is NO way to enforce tenant data isolation at the DB level:

| Model | Risk | Recommendation |
|-------|------|----------------|
| `BOMFormulaItem` | HIGH — BOM child row | Add `tenantId`, inherit from parent BOMFormula |
| `ControlRoomRule` | HIGH — rule config | Add `tenantId` |
| `CronJobConfig` | MEDIUM — job config | Add `tenantId` |
| `DebitNoteItem` | HIGH — finance line item | Add `tenantId`, inherit from DebitNote |
| `DeliveryChallanItem` | HIGH — line item | Add `tenantId` |
| `DocumentTemplate` | MEDIUM | Add `tenantId` |
| `ErrorCatalog` | LOW — global | Review: global catalog or tenant-specific |
| `GoodsReceiptItem` | HIGH — line item | Add `tenantId` |
| `HelpArticle` | LOW — platform content | Review: global or per-tenant |
| `InventoryLabel` | MEDIUM | Add `tenantId` |
| `IpAccessRule` | MEDIUM — security rule | Add `tenantId` |
| `Permission` | LOW — RBAC | Global by design; verify |
| `PurchaseInvoiceItem` | HIGH — finance line item | Add `tenantId` |
| `PurchaseOrderItem` | HIGH — line item | Add `tenantId` |
| `PurchaseQuotationItem` | HIGH — line item | Add `tenantId` |
| `PurchaseRFQItem` | HIGH — line item | Add `tenantId` |
| `SaleOrderItem` | HIGH — line item | Add `tenantId` |
| `SaleReturnItem` | HIGH — line item | Add `tenantId` |
| `ServiceRate` | MEDIUM | Add `tenantId` |
| `SupportTicketMessage` | HIGH — message | Add `tenantId` |
| `TaskWatcher` | MEDIUM | Add `tenantId` |
| `VersionBackup` | LOW | Review scope |

**Impact:** Finance line items (`SaleOrderItem`, `PurchaseInvoiceItem`, etc.) without `tenantId` can be queried cross-tenant at the DB layer if repository filters miss the parent join.

---

## 4. SOFT DELETE ANALYSIS

### 🔴 CRITICAL: 253 Business Models Lack `isDeleted` / `deletedAt`

Total models: 307. Log/audit models (don't need soft delete): ~53. Business models without soft delete: **253**.

**High-priority business models missing soft delete:**

| Model | Impact |
|-------|--------|
| `Product` | Cannot recover deleted products tied to quotations |
| `Lead` | Lead history lost on hard delete |
| `Contact` | All linked activities orphaned |
| `Quotation` | Financial record permanently deleted |
| `Invoice` | Audit/GST compliance risk |
| `SaleMaster` / `SaleOrder` | Finance records unrecoverable |
| `PurchaseMaster` / `PurchaseOrder` | Finance records unrecoverable |
| `BankAccount` | Linked transactions become orphaned |
| `Workflow` | Active workflows deleted with no trace |
| `SupportTicket` | Customer history lost |
| `Demo` | Sales pipeline history lost |
| `Brand` / `Manufacturer` | Product catalog integrity risk |

**Note:** ~53 log/audit/tracking models (`AuditLog`, `WorkflowHistory`, `EmailTrackingEvent`, etc.) legitimately don't need soft delete — they are append-only records.

**Recommended pattern to add:**
```prisma
isDeleted   Boolean   @default(false)
deletedAt   DateTime?
deletedById String?
```

---

## 5. AUDIT TRAIL ANALYSIS

### `createdAt` / `updatedAt` Coverage

| Field | Models With | Models Missing |
|-------|-------------|----------------|
| `createdAt` | ~275 / 307 | 32 |
| `updatedAt` | ~267 / 307 | 40+ |

**Models missing both `createdAt` and `updatedAt`:**
`RolePermission`, `PermissionTemplate`, `RawContactFilter`, `ContactFilter`, `OrganizationFilter`, `LeadFilter`, `CompanyPincode`, `NotificationPreference`, `ProductFilter`

**Models missing `updatedAt` only (40+):**
`Permission`, `QuotationSendLog`, `QuotationNegotiationLog`, `QuotationActivity`, `OwnershipLog`, `UserPermissionOverride`, `ApprovalRequest`, `ApprovalRule`, `BrandOrganization`, `BrandContact`, `ManufacturerOrganization`, `ManufacturerContact`, `OrganizationLocation`, `CustomerGroupMapping`, `ProductTaxDetail`, `ProductUnitConversion`, `ProductRelation`, `WorkflowHistory`, `WorkflowActionLog`, `WorkflowSlaEscalation`, `TourPlanPhoto`, `ReportExportLog`, `ReportDefinition`, `AuditLog`, `AuditFieldChange`, `ExportJob`, `DocumentAttachment`, `DocumentShareLink`, `DocumentActivity`, `EmailAttachment`, `CampaignRecipient`, _(+ 10 more)_

### `createdById` / `updatedById` Coverage

| Field | Models With | Coverage |
|-------|-------------|----------|
| `createdById` | 60 / 307 | 19.5% — ⚠️ LOW |
| `updatedById` | 14 / 307 | 4.6% — 🔴 CRITICAL |

**Impact:** For GST compliance and Indian business audit requirements, who-created/who-modified is mandatory for financial records (Invoices, Payments, Quotations). Current coverage is dangerously low.

---

## 6. INDEX ANALYSIS

| Type | Count |
|------|-------|
| `@@index` | 542 |
| `@@unique` | 160 |
| `@unique` | 51 |

### ⚠️ WARNING: 31 Models with `tenantId` but No `@@index([tenantId...])`

Every query for a tenant-scoped model will do a **full table scan** without a `tenantId` index:

`AMCPlanTemplate`, `AiChatMessage`, `AiSettings`, `AutoNumberSequence`, `BOMFormula`, `BOMProduction`, `BusinessHoursSchedule`, `CompanyProfile`, `CronJobRunLog`, `DataRetentionPolicy`, `ErrorAutoReportRule`, `MarketplaceListing`, `MarketplaceReview`, `NotificationPreference`, `NotionConfig`, `PermissionTemplate`, `PostComment`, `QuotationComparison`, `SecurityPolicy`, `ServiceCharge`, `ShortcutUserOverride`, `StockLocation`, `TenantBranding`, `TenantModule`, `TenantProfile`, `TenantRuleCacheVersion`, `TenantTemplateCustomization`, `TenantUsage`, `VerificationOtp`, `Wallet`, _(+ 1 more)_

**Recommended index pattern:**
```prisma
@@index([tenantId])
@@index([tenantId, createdAt])      // for sorted lists
@@index([tenantId, status])         // for filtered lists
@@index([tenantId, isDeleted])      // if soft delete added
```

---

## 7. RELATION INTEGRITY

| Rule | Count |
|------|-------|
| Total `@relation` | 370 |
| `onDelete: Cascade` | 114 (30.8%) |
| `onDelete: SetNull` | 4 (1.1%) |
| `onDelete: Restrict` | 0 |
| **No explicit `onDelete`** | **252 (68.1%)** |

### ⚠️ WARNING: 252 Relations Without Explicit `onDelete`

Prisma default is `Restrict` — meaning deleting a parent will **throw an error** if child records exist. Without explicit rules, delete operations become unpredictable.

**High-risk patterns:**
- `QuotationLineItem` → `Quotation` (no cascade defined)
- `InvoiceLineItem` → `Invoice` (no cascade defined)
- `SaleOrderItem` → `SaleOrder` (no cascade defined)
- Line items across procurement, sales, BOM modules

**All models have `@id`** ✅ — no models without primary key.

---

## 8. JSON FIELDS (122 Models)

Heavy use of `Json` type — 122 models store unstructured data:

| Model | Json Fields | Risk |
|-------|-------------|------|
| `Workflow` | `configJson` | Unvalidated workflow config |
| `WorkflowTransition` | `conditions`, `actions` | Runtime parsing needed |
| `WorkflowInstance` | `data` | Unbounded state blob |
| `ApprovalRequest` | `payload` | Approval data untyped |
| `Notification` | `data`, `metadata` | Hard to query notification data |
| `ReportDefinition` | `defaultFilters`, `availableFilters` | Report config untyped |
| `Product` | `images`, `dimensions`, `configJson` | Product metadata untyped |
| `Quotation` | `aiSuggestions`, `configJson` | AI output stored as blob |
| `AssignmentRule` | `conditions` | Rule logic untyped |
| `Menu` | `businessTypeApplicability` | Menu config untyped |

**Verdict:** JSON fields are appropriate for config/metadata scenarios. However, complex runtime parsing (WorkflowTransition.conditions, WorkflowTransition.actions) should be strongly typed with Zod schemas at the application layer.

---

## 9. ENUM ANALYSIS

212 enums total — comprehensive coverage of all status/type fields. Key enums:

| Enum | Values | Usage |
|------|--------|-------|
| `LeadStatus` | NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST, JUNK | Leads |
| `QuotationStatus` | DRAFT, SENT, VIEWED, ACCEPTED, REJECTED, EXPIRED, REVISED | Quotations |
| `InvoiceStatus` | DRAFT, SENT, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED, VOID | Finance |
| `WorkflowTriggerType` | 10+ trigger types | Workflows |
| `NotificationChannel` | EMAIL, SMS, PUSH, IN_APP, WHATSAPP | Notifications |
| `TaxType` | GST, IGST, CGST, SGST, CESS | Indian tax |
| `PaymentMethod` | CASH, CHEQUE, NEFT, RTGS, UPI, RAZORPAY, etc. | Payments |

**All enums appear to be used** — no orphaned enums detected.

---

## 10. FINDINGS — PRIORITIZED

### 🔴 CRITICAL (3)

| # | Finding | Impact | Fix |
|---|---------|--------|-----|
| C1 | **22 non-platform business models missing `tenantId`** — includes finance line items (`SaleOrderItem`, `PurchaseInvoiceItem`, `DeliveryChallanItem`, `GoodsReceiptItem`, `DebitNoteItem`, etc.) | Tenant data isolation can be bypassed at DB level for line items | Add `tenantId String` to all 22 models. Add composite @@index. Migration required. |
| C2 | **253 business models without soft delete** — core financial records (Invoice, SaleMaster, PurchaseOrder, Product, Lead, Contact, Quotation) permanently deleted | Data unrecoverable. GST audit trail broken. Recycle bin cannot restore. | Add `isDeleted Boolean @default(false)` + `deletedAt DateTime?` + `deletedById String?`. Priority: finance models first. |
| C3 | **`updatedById` on only 4.6% of models (14/307)** — financial records lack who-modified tracking | Indian GST compliance requires full audit trail | Add `updatedById String?` + `@relation(fields:[updatedById])` to all financial models (Invoice, Payment, Quotation, SaleMaster, PurchaseMaster, etc.) |

### ⚠️ WARNING (5)

| # | Finding | Impact | Fix |
|---|---------|--------|-----|
| W1 | **31 models with `tenantId` missing `@@index([tenantId...])`** | Full table scans on every tenant-scoped query — performance degrades with data growth | Add `@@index([tenantId])` or composite indexes to all 31 models |
| W2 | **252 of 370 relations (68.1%) without explicit `onDelete`** | Unpredictable delete behavior; likely runtime errors when deleting parents | Audit each relation: line items → `Cascade`, optional FKs → `SetNull`, enforced deps → `Restrict` |
| W3 | **40+ models missing `updatedAt`** | Cannot track when records were last modified | Add `updatedAt DateTime @updatedAt` to all missing models |
| W4 | **Only 4 migrations for 307 models** | Schema evolution not tracked incrementally; hard to roll back specific changes | Split future schema changes into granular migrations |
| W5 | **`createdById` on only 19.5% of models (60/307)** | Incomplete creation audit trail across most modules | Add `createdById String?` to remaining business models |

### ℹ️ INFO (4)

| # | Finding | Impact | Fix |
|---|---------|--------|-----|
| I1 | 122 models use `Json` type | Complex JSON requires Zod validation at app layer | Create typed Zod schemas for all Json fields; validate on write |
| I2 | `onDelete: Restrict` = 0 occurrences | No referential integrity enforcement declared | Add `Restrict` where parent→child deletion should be blocked |
| I3 | All 307 models have `@id` ✅ | Clean primary key coverage | Maintain |
| I4 | 212 enums, all appear used ✅ | No dead enum pollution | Maintain |

---

## 11. MIGRATION READINESS FOR CQRS

| Domain | Models | Aggregate Roots (suggested) | Readiness |
|--------|--------|----------------------------|-----------|
| **Lead** | `Lead`, `LeadFilter`, `Activity`, `FollowUp` | `Lead` | ✅ Ready |
| **Contact** | `Contact`, `ContactOrganization`, `ContactFilter` | `Contact` | ✅ Ready |
| **Organization** | `Organization`, `OrganizationLocation`, `OrganizationFilter` | `Organization` | ✅ Ready |
| **Quotation** | `Quotation`, `QuotationLineItem`, `QuotationNegotiationLog`, `QuotationActivity`, `QuotationSendLog` | `Quotation` | ✅ Ready |
| **Invoice** | `Invoice`, `InvoiceLineItem`, `ProformaInvoice`, `ProformaLineItem` | `Invoice` | ⚠️ Missing soft delete |
| **SaleOrder** | `SaleOrder`, `SaleOrderItem`, `SaleMaster`, `SaleReturn`, `SaleReturnItem` | `SaleOrder` | ⚠️ Items missing tenantId |
| **PurchaseOrder** | `PurchaseOrder`, `PurchaseOrderItem`, `PurchaseMaster`, `PurchaseRFQ`, `PurchaseQuotation` | `PurchaseOrder` | ⚠️ Items missing tenantId |
| **Product** | `Product`, `ProductPrice`, `ProductRelation`, `ProductTaxDetail`, `ProductUnitConversion` | `Product` | ⚠️ Missing soft delete |
| **Workflow** | `Workflow`, `WorkflowState`, `WorkflowTransition`, `WorkflowInstance`, `WorkflowHistory` | `Workflow` | ⚠️ JSON conditions need Zod |
| **Task** | `Task`, `TaskHistory`, `TaskWatcher`, `TaskLogicConfig` | `Task` | ⚠️ TaskWatcher missing tenantId |
| **WhatsApp** | `WhatsAppBusinessAccount`, `WaConversation`, `WaMessage`, `WaBroadcast`, `WaTemplate` | `WhatsAppBusinessAccount` | ✅ Ready |
| **Inventory** | `InventoryItem`, `StockSummary`, `StockTransaction`, `StockAdjustment`, `StockLocation` | `InventoryItem` | ⚠️ StockLocation missing tenantId index |

---

## 12. RECOMMENDATIONS (Prioritized)

| Priority | Action | Effort | Risk |
|----------|--------|--------|------|
| P1 | Add `tenantId` to 22 missing models (esp. line items) | Medium — requires migration | HIGH if missed |
| P1 | Add soft delete to top 20 financial/business models | Low per model, High total | MEDIUM |
| P1 | Add `updatedById` to all financial models | Low | MEDIUM |
| P2 | Add `@@index([tenantId])` to 31 un-indexed models | Low | MEDIUM (perf) |
| P2 | Explicit `onDelete` on 252 relations | Medium | MEDIUM |
| P2 | Add `updatedAt` to 40+ missing models | Low | LOW |
| P3 | Create Zod schemas for all 122 Json fields | Medium | LOW |
| P3 | Split future changes into granular migrations | Process change | LOW |
| P4 | Add `createdById` to remaining 247 models | High effort | LOW per model |

---

## OVERALL ASSESSMENT

**Score: 6.3 / 10**

**Strengths:**
- 307 models comprehensively covering all CRM domains
- 212 enums with no orphans — excellent type safety at DB layer
- 542 `@@index` and 160 `@@unique` — good indexing foundation
- All models have `@id` — no missing PKs
- Clear domain boundary mapping (platform/core/customer/vendor/plugin)
- Strong relation coverage (370 `@relation`)

**Critical Gaps:**
- Finance line items lack `tenantId` — cross-tenant isolation risk
- 253 business models without soft delete — data permanently lost on delete
- `updatedById` on only 4.6% of models — audit trail insufficient for GST compliance
- 252 relations without `onDelete` — delete operations can fail unexpectedly

**Risk Level:** MEDIUM-HIGH — primarily due to tenant isolation gaps on financial line items and missing soft delete on core business data.

**Before Phase 2 (Architecture Freeze):** Must resolve C1 (tenantId on line items) and add soft delete to at minimum the 15 financial models.

---

_Generated by Claude Code | CRMSoft Phase 0 Audit | 2026-03-18_
