/**
 * TENANT_SCOPED_MODELS — Prisma model names (PascalCase) that MUST be
 * auto-filtered by tenantId on every query.
 *
 * Context: All 220 tables in workingdb have a tenant_id column.
 * This set lists the critical user-data models.
 * The $extends factory uses this for FAST-PATH checks on hot paths;
 * for non-listed models in the working DB it still injects tenantId
 * (fail-closed default in tenant-aware-prisma.ts).
 *
 * Kumar morning: Verify list is complete — reference docs/audit/tenant_tables.txt
 */
export const TENANT_SCOPED_MODELS = new Set([
  // Core CRM entities
  'Lead',
  'RawContact',
  'Contact',
  'Organization',
  'Task',
  'FollowUp',
  'Activity',
  'Demo',
  'TourPlan',
  'TourPlanVisit',
  'TourPlanPhoto',
  'CalendarEvent',
  'ScheduledEvent',
  'RecurringEvent',
  'SupportTicket',
  'Comment',

  // Sales
  'Quotation',
  'QuotationLineItem',
  'QuotationActivity',
  'SaleOrder',
  'SaleOrderItem',
  'DeliveryChallan',
  'DeliveryChallanItem',
  'SaleReturn',
  'SaleReturnItem',
  'SaleMaster',

  // Inventory
  'Product',
  'ProductPrice',
  'InventoryItem',
  'StockLocation',
  'StockTransaction',
  'StockSummary',
  'StockAdjustment',
  'PurchaseOrder',
  'PurchaseOrderItem',
  'GoodsReceipt',
  'GoodsReceiptItem',

  // Communication
  'EmailThread',
  'Email',
  'WaConversation',
  'WaMessage',
  'WaBroadcast',

  // Notifications
  'Notification',
  'Reminder',

  // Payments
  'Payment',
  'PaymentReceipt',
  'Refund',

  // Config (tenant-specific config, not global)
  'CompanyProfile',
  'Brand',
  'ApiKey',
  'WebhookEndpoint',
  'CustomFieldDefinition',

  // Workflows & Approvals
  'Workflow',
  'WorkflowInstance',
  'ApprovalRequest',

  // Documents
  'Document',
  'DocumentFolder',
  'ImportJob',
  'ExportJob',

  // Reports
  'ReportDefinition',
  'ScheduledReport',

  // Audit logs (tenant-scoped)
  'SyncChangeLog',
  'SyncAuditLog',
  'ApiRequestLog',
]);

/**
 * Models that are accessed cross-tenant or have no tenant_id.
 * These are explicitly exempt from auto-filtering.
 * All are in platform/identity DBs — not in working DB.
 */
export const TENANT_EXEMPT_MODELS = new Set([
  // Platform DB — global config
  'PageRegistry',
  'LookupValue',
  'LookupCategory',
  'SubscriptionPackage',
  'MarketplaceModule',
  'ModuleDefinition',
  'SoftwareOffer',
  // Identity DB — cross-tenant
  'Tenant',
  'Plan',
  'Subscription',
  'SuperAdmin',
  'Permission',
  'GlobalDefaultCredential',
]);
