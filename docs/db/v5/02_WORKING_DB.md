# WorkingDB — Deep Documentation

**Schema root:** `Application/backend/prisma/working/v1/`
**Generator output:** `node_modules/@prisma/working-client`
**Env var:** `GLOBAL_WORKING_DATABASE_URL`
**Model count:** 228 (largest DB in the system)
**Migration policy:** `prisma migrate deploy` (formal migrations)

---

## Purpose

The main business database. Every live (non-trial) tenant's CRM, sales, purchase, inventory, communication, and operational data lives here. Every row is scoped by `tenantId`.

**Blast radius:** Corruption here = customer outage. Highest-priority backup and replication target.

---

## Schema Files (14 files, 9,700 lines)

| File | Lines | Models | Domain |
|---|---:|---:|---|
| `_base.prisma` | 1,407 | 0 | Datasource + generator + 100+ domain enums |
| `config.prisma` | 1,655 | 50 | Tenant config, masters, custom fields, filters, rate limits, cron jobs |
| `crm.prisma` | 1,555 | 44 | Contacts, organizations, leads, activities, demos, quotations, support tickets |
| `inventory.prisma` | 1,044 | 31 | Products, stock, warehouses, BOM, purchase orders |
| `communication.prisma` | 882 | 21 | Email, WhatsApp, broadcasts, chatbot, conversations |
| `accounts.prisma` | 709 | 16 | Ledgers, bank accounts, journal entries, reconciliation |
| `sales.prisma` | 645 | 17 | Sales orders, invoices, delivery challans, returns, AMC |
| `documents.prisma` | 474 | 12 | Documents, templates, attachments, share links |
| `workflow.prisma` | 323 | 10 | Workflow instances, states, transitions, approvals, SLA |
| `notifications.prisma` | 296 | 7 | Notifications, preferences, push subscriptions |
| `audit.prisma` | 252 | 7 | Tenant-scoped audit, data masking, unmask requests |
| `payments.prisma` | 193 | 5 | Payment records, reminders, credit/debit notes |
| `reports.prisma` | 163 | 5 | Report definitions, bookmarks, scheduled reports |
| `tax.prisma` | 102 | 3 | GST returns, TDS records, tax details |

**Total: 228 models.**

---

## Domain Grouping

WorkingDB is organized by **functional domain** (not entity type). Each `.prisma` file is a cohesive slice.

### CRM Core (crm.prisma, 44 models)

Entity lifecycle from lead → deal → customer. Key models grouped:

- **Contacts & orgs:** `Contact`, `ContactOrganization`, `Organization`, `OrganizationLocation`, `RawContact`, `Manufacturer`, `ManufacturerContact`, `ManufacturerOrganization`, `Brand`, `BrandContact`, `BrandOrganization`
- **Leads:** `Lead`, `LeadFilter`, `AssignmentRule`
- **Activities & demos:** `Activity`, `Demo`, `TourPlan`, `TourPlanVisit`, `TourPlanPhoto`, `FollowUp`, `Reminder`, `Task`, `TaskHistory`, `TaskWatcher`, `TaskLogicConfig`
- **Quotations:** `Quotation`, `QuotationLineItem`, `QuotationActivity`, `QuotationTemplate`, `QuotationComparison`, `QuotationSendLog`, `QuotationNegotiationLog`
- **Support:** `SupportTicket`, `SupportTicketMessage`, `EscalationRule`
- **Filters & saves:** `ContactFilter`, `RawContactFilter`, `OrganizationFilter`, `LeadFilter`, `ProductFilter`, `SavedFilter`, `SavedFormula`, `SalesTarget`
- **Verification:** `EntityVerificationRecord`, `GstVerificationLog`

### Sales + Invoicing (sales.prisma, 17 models)

`SaleOrder`, `SaleOrderItem`, `SaleMaster`, `SaleReturn`, `SaleReturnItem`, `Invoice`, `InvoiceLineItem`, `ProformaInvoice`, `ProformaLineItem`, `DeliveryChallan`, `DeliveryChallanItem`, `ServiceCharge`, `ServiceRate`, `AMCContract`, `AMCPlanTemplate`, `AMCSchedule`, `ServiceVisitLog`

### Purchase + Inventory (inventory.prisma, 31 models)

- **Products & pricing:** `Product`, `ProductPrice`, `ProductRelation`, `ProductTaxDetail`, `ProductUnitConversion`, `PriceList`, `PriceListItem`, `CustomerGroupMapping`, `CustomerPriceGroup`
- **Stock:** `StockLocation`, `StockTransaction`, `StockSummary`, `StockAdjustment`, `InventoryItem`, `InventoryLabel`, `ScrapRecord`, `SerialMaster`
- **Purchase:** `PurchaseOrder`, `PurchaseOrderItem`, `PurchaseInvoice`, `PurchaseInvoiceItem`, `PurchaseMaster`, `PurchaseRFQ`, `PurchaseRFQItem`, `PurchaseQuotation`, `PurchaseQuotationItem`, `GoodsReceipt`, `GoodsReceiptItem`
- **BOM:** `BOMFormula`, `BOMFormulaItem`, `BOMProduction`

### Communication (communication.prisma, 21 models)

- **Email:** `Email`, `EmailAccount`, `EmailAttachment`, `EmailThread`, `EmailTemplate`, `EmailSignature`, `EmailFooterTemplate`, `EmailCampaign`, `EmailTrackingEvent`, `EmailUnsubscribe`, `Communication`, `CommunicationLog`, `CampaignRecipient`
- **WhatsApp:** `WhatsAppBusinessAccount`, `WaTemplate`, `WaMessage`, `WaBroadcast`, `WaBroadcastRecipient`, `WaConversation`, `WaQuickReply`, `WaChatbotFlow`, `WaOptOut`

### Accounts (accounts.prisma, 16 models)

`AccountGroup`, `AccountTransaction`, `BankAccount`, `BankReconciliation`, `LedgerMaster`, `LedgerMapping`, `Payment`, `PaymentRecord`, `PaymentReceipt`, `PaymentReminder`, `Refund`, `CreditNote`, `DebitNote`, `DebitNoteItem`, `UnitConversion`, `UnitMaster`

### Documents (documents.prisma, 12 models)

`Document`, `DocumentActivity`, `DocumentAttachment`, `DocumentFolder`, `DocumentShareLink`, `DocumentTemplate`, `ImportJob`, `ImportProfile`, `ImportRow`, `ExportJob`, `CloudConnection`, `GoogleConnection`

### Workflow (workflow.prisma, 10 models)

`Workflow`, `WorkflowInstance`, `WorkflowState`, `WorkflowTransition`, `WorkflowHistory`, `WorkflowActionLog`, `WorkflowApproval`, `WorkflowSlaEscalation`, `ApprovalRule`, `ApprovalRequest`

### Config + Masters (config.prisma, 50 models — the largest file)

Tenant-level configuration surface area:

- **Control room:** `ControlRoomRule`, `ControlRoomValue`, `ControlRoomDraft`, `ControlRoomAuditLog`, `TenantRuleCacheVersion`, `TenantTemplateCustomization`
- **Masters:** `BusinessLocation`, `CompanyProfile`, `CompanyCity`, `CompanyCountry`, `CompanyState`, `CompanyPincode`, `Department`-ish, `Designation`-ish (some masters live in Identity)
- **Custom fields:** `CustomFieldDefinition`, `EntityConfigValue`, `EntityOwner`, `OwnershipLog`
- **Calendar:** `CalendarConfig`, `CalendarEvent`, `CalendarHighlight`, `BusinessHoursSchedule`, `HolidayCalendar`, `BlockedSlot`, `RecurringEvent`, `EventParticipant`, `EventHistory`, `ScheduledEvent`, `UserCalendarSync`, `UserAvailability`, `QuietHourConfig`
- **Auto numbering:** `AutoNumberSequence`
- **Sync:** `SyncDevice`, `SyncPolicy`, `SyncChangeLog`, `SyncConflict`, `SyncFlushCommand`, `SyncAuditLog`, `SyncWarningRule`
- **API & rate limits:** `ApiKey`, `ApiRequestLog`, `RateLimitTier`, `WebhookEndpoint`, `WebhookDelivery`, `PushSubscription`
- **Cron:** `CronJobConfig`, `CronJobRunLog`
- **Notion integration:** `NotionConfig`
- **UI:** `TableConfig`, `ShortcutDefinition`, `ShortcutUserOverride`
- **Notifications (config half):** `NotificationConfig`, `NotificationTemplate`, `NotificationPreference`

### AI (inside config.prisma, 8 models)

`AiChatSession`, `AiChatMessage`, `AiDataset`, `AiDocument`, `AiEmbedding`, `AiModel`, `AiSettings`, `AiSystemPrompt`, `AiTrainingJob`, `AiUsageLog`

### Data masking (audit.prisma, 7 models)

`DataMaskingPolicy`, `UnmaskAuditLog`, + domain audit tables.

### Notifications delivery (notifications.prisma, 7 models)

`Notification`, `PushSubscription` (dup here), `NotificationConfig` (dup), `NotificationTemplate`, `NotificationPreference`, `CampaignRecipient`

### Warranties (mixed)

`WarrantyClaim`, `WarrantyRecord`, `WarrantyTemplate`

---

## Key Models (Deep Detail)

### `Contact` (crm.prisma)

- **Purpose:** The core CRM record — a person-level record. Separate from `User` (which is authentication). One Contact may have multiple Emails/Phones through `Communication`.
- **`contactType`:** `RAW` | `VALIDATED` — raw contacts are unverified imports; validated have completed enrichment.
- **Scoped by:** `tenantId`.
- **Cross-DB:** `createdById` → IdentityDB User.
- **Dynamic fields:** `verticalData: Json?` for industry-specific data.

### `Organization`

- Company-level record. Multi-location via `OrganizationLocation`.
- GST verification tracked via `GstVerificationLog` + `EntityVerificationRecord`.
- `organizationType` references the 7 core business types.

### `Lead`

- Opportunity tracker with stage transitions. `LeadStatus` enum drives pipeline.
- `AssignmentRule` auto-assigns based on criteria (territory, industry, source).
- `SalesTarget` measures performance.

### `Quotation` + `QuotationLineItem`

- Revisioned document (via `QuotationTemplate` and `QuotationSendLog`).
- `QuotationNegotiationLog` tracks customer counter-offers.
- `QuotationComparison` holds saved comparisons across revisions.

### `Product`

- The master catalog. Multi-level pricing via `ProductPrice` + `PriceList` + `PriceListItem`.
- Stock tracked via `StockTransaction` → `StockSummary` rollup.
- `BOMFormula` + `BOMFormulaItem` support manufacturing use cases.

### `Invoice` + `InvoiceLineItem`

- Generated from `Quotation` or standalone.
- Tax breakdown via `ProductTaxDetail`.
- Linked to `PaymentRecord` for settlement.
- GST Return tracking via `GSTReturn` (tax.prisma).

### `PurchaseOrder`

- **Key field added in Stage 3 PR #2:** `saleOrderId` (FK to `SaleOrder`) — enables SO↔PO traceability.
- Lifecycle: PO created → GoodsReceipt → PurchaseInvoice.

### `Communication` + `CommunicationLog`

- `Communication` — the actual channel endpoint (email address, WhatsApp number) attached to a Contact/Organization.
- `CommunicationLog` — delivery attempts. Has status flags `SENT`/`FAILED`/`SKIPPED`/`QUEUED_AWAITING_PLUGIN_IMPL`. Drives the Customer Portal invite retry flow (Stage 3 PR #7/#8).

### `Workflow` + `WorkflowInstance` + `WorkflowState` + `WorkflowTransition`

- Tenant-definable state machines for Leads, Quotations, Tickets, etc.
- `WorkflowSlaEscalation` applies timed alerts.
- `ApprovalRule` + `ApprovalRequest` for multi-step approvals.

### `SyncDevice` + `SyncChangeLog` + `SyncConflict`

- Mobile offline-first sync infrastructure (salesman app).
- `SyncPolicy` defines direction (`PUSH_ONLY`, `PULL_ONLY`, `BIDIRECTIONAL`) per entity.
- `SyncConflict` requires manual resolution via `GET /sync/conflicts/{id}`.

---

## Enum Highlights (from `_base.prisma`)

100+ enums in this file. Noteworthy groups:

- **Lead / opportunity:** `LeadStatus`, `LeadSource`, `LeadStage`
- **Sales / accounting:** `InvoiceStatus`, `PaymentMethod`, `TaxType`, `CurrencyCode`
- **Inventory:** `StockMovementType`, `InventoryStatus`, `BOMType`
- **Communication:** `EmailStatus`, `WhatsAppMessageStatus`, `CommunicationChannel`
- **Workflow:** `WorkflowEntityType`, `WorkflowState` (state enum), `ApprovalStatus`
- **Sync:** `SyncDirection`, `SyncConflictResolution`, `SyncStatus`
- **Recurrence:** `RecurrenceFrequency`, `RecurrenceEnd`

---

## Cross-DB Touchpoints

Every model references `tenantId` → IdentityDB `Tenant`. Additionally:

| From WorkingDB | To DB | Field(s) | Resolved via |
|---|---|---|---|
| `Contact`, `Lead`, `Quotation`, etc. | IdentityDB | `createdById`, `assignedToId`, `updatedById` | `CrossDbResolverService.resolveUsers()` |
| `Tenant`-scoped rows | IdentityDB | `tenantId` | Tenant resolution at request guard |
| `Product` | PlatformDB | `industryPackageId` (if used) | `resolveIndustryPackages` |
| `SaleOrder`, `Invoice` | PlatformDB | `couponId` (if used) | `resolveCoupons` |
| Marketplace cross-post | MarketplaceDB | entity IDs carried over | Event-driven sync |

---

## V5 Dynamic Field Integration

- **`verticalData: Json?`** lives on `Contact`, `Organization`, `Product`, `Lead`, `Quotation` and others — carrying vertical-specific fields without schema churn.
- **`CustomFieldDefinition` + `EntityConfigValue`** provide tenant-level custom fields (UI-configurable).
- **`TerminologyOverride`** (in IdentityDB) controls label rewrites per tenant.

See [`10_DYNAMIC_FIELDS_V5.md`](./10_DYNAMIC_FIELDS_V5.md).

---

## Tenant Scoping Rule (CRITICAL)

Every query MUST include `tenantId` in the `WHERE` clause. Example:

```typescript
// ✅ CORRECT
const leads = await workingDb.lead.findMany({
  where: { tenantId: ctx.tenantId, status: 'OPEN' }
});

// ❌ WRONG — cross-tenant data leak
const leads = await workingDb.lead.findMany({ where: { status: 'OPEN' } });
```

See [`11_MULTITENANT_MODEL.md`](./11_MULTITENANT_MODEL.md).

---

## Volume Notes

- WorkingDB carries the bulk of the SaaS's write volume.
- Expect sharding per-tenant (or per-region) as a future scale step; dedicated `dbStrategy=DEDICATED` tenants are already a provisioning path.
- Backup + restore planning lives in PlatformDB (`DatabaseBackupRecord`, `BackupLog`, `RestoreLog`).
