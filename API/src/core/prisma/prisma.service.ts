import { Injectable, OnModuleInit, OnModuleDestroy, Logger, Optional, Inject } from '@nestjs/common';
import { PrismaClient as IdentityClient } from '@prisma/identity-client';
import { PrismaClient as PlatformClient } from '@prisma/platform-client';
import { PrismaClient as WorkingClient } from '@prisma/working-client';
import { TenantContextService } from '../../modules/core/identity/tenant/infrastructure/tenant-context.service';
import { createSoftDeleteMiddleware } from './soft-delete.middleware';

/**
 * Multi-DB PrismaService — 4-Database Architecture
 *
 * Accessors:
 *   prisma.identity                          → IdentityDB  (auth, RBAC, tenants, menus, audit)
 *   prisma.platform                          → PlatformDB  (packages, plugins, marketplace, lookups)
 *   await prisma.getWorkingClient(tenantId)  → WorkingDB   (CRM business data — shared or dedicated)
 *   prisma.globalWorking                     → GlobalWorkingDB (background jobs, migrations)
 *
 * For development: all 3 URLs may point to the same database.
 * For production:  each URL points to a separate PostgreSQL instance.
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  private _identity: IdentityClient;
  private _platform: PlatformClient;
  private _globalWorking: WorkingClient;

  /** Cache of per-tenant dedicated WorkingDB clients */
  private _tenantClients: Map<string, WorkingClient> = new Map();

  constructor(
    @Optional() @Inject(TenantContextService)
    private readonly tenantContext?: TenantContextService,
  ) {
    const isProd = process.env.NODE_ENV === 'production';

    const withPoolLimit = (url: string) => {
      if (isProd && url && !url.includes('connection_limit')) {
        const sep = url.includes('?') ? '&' : '?';
        return `${url}${sep}connection_limit=5&pool_timeout=30`;
      }
      return url;
    };

    const logLevel: ('warn' | 'error')[] = isProd ? ['error'] : ['warn', 'error'];

    this._identity = new IdentityClient({
      log: logLevel,
      datasources: { db: { url: withPoolLimit(process.env.IDENTITY_DATABASE_URL || process.env.DATABASE_URL || '') } },
    });

    this._platform = new PlatformClient({
      log: logLevel,
      datasources: { db: { url: withPoolLimit(process.env.PLATFORM_DATABASE_URL || process.env.DATABASE_URL || '') } },
    });

    this._globalWorking = new WorkingClient({
      log: logLevel,
      datasources: { db: { url: withPoolLimit(process.env.GLOBAL_WORKING_DATABASE_URL || process.env.DATABASE_URL || '') } },
    });
  }

  async onModuleInit() {
    // Register soft-delete middleware on the WorkingDB client (business data)
    (this._globalWorking as any).$use(createSoftDeleteMiddleware());

    await Promise.all([
      this._identity.$connect(),
      this._platform.$connect(),
      this._globalWorking.$connect(),
    ]);

    this.logger.log('All 3 database clients connected (identity, platform, working)');
  }

  async onModuleDestroy() {
    await Promise.all([
      this._identity.$disconnect(),
      this._platform.$disconnect(),
      this._globalWorking.$disconnect(),
    ]);

    for (const [tenantId, client] of this._tenantClients.entries()) {
      await client.$disconnect();
      this.logger.log(`Disconnected dedicated tenant DB: ${tenantId}`);
    }

    this._tenantClients.clear();
  }

  // ─── DB Accessors ───────────────────────────────────────────────────────────

  /** IdentityDB — auth, users, roles, permissions, tenants, menus, audit */
  get identity(): IdentityClient {
    return this._identity;
  }

  /** PlatformDB — packages, plugins, marketplace, lookups, help, licensing */
  get platform(): PlatformClient {
    return this._platform;
  }

  /**
   * WorkingDB — CRM business data.
   *   Free/shared tenants → GlobalWorkingDB
   *   Paid dedicated tenants → their own DB (lazy-connected + cached)
   */
  async getWorkingClient(tenantId: string): Promise<WorkingClient> {
    // Lookup tenant's dedicated DB URL from IdentityDB
    const tenant = await this._identity.tenant.findUnique({
      where: { id: tenantId },
      select: { databaseUrl: true, hasDedicatedDb: true } as any,
    }).catch(() => null);

    if ((tenant as any)?.hasDedicatedDb && (tenant as any)?.databaseUrl) {
      if (!this._tenantClients.has(tenantId)) {
        const client = new WorkingClient({
          datasources: { db: { url: (tenant as any).databaseUrl } },
        });
        (client as any).$use(createSoftDeleteMiddleware());
        await client.$connect();
        this._tenantClients.set(tenantId, client);
        this.logger.log(`Connected dedicated DB for tenant ${tenantId}`);
      }
      return this._tenantClients.get(tenantId)!;
    }

    return this._globalWorking;
  }

  /**
   * GlobalWorkingDB shortcut — use in background jobs, migrations, seeding.
   * Prefer getWorkingClient(tenantId) in request handlers.
   */
  get globalWorking(): WorkingClient {
    return this._globalWorking;
  }

  // ─── Legacy compatibility ───────────────────────────────────────────────────
  /**
   * @deprecated Use prisma.identity, prisma.platform, or prisma.getWorkingClient(tenantId).
   * Returns globalWorking for backwards compatibility during migration.
   */
  get $queryRaw() {
    return this._globalWorking.$queryRaw.bind(this._globalWorking);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  get $transaction(): (...args: any[]) => any {
    return this._globalWorking.$transaction.bind(this._globalWorking);
  }

  get $executeRaw() {
    return this._globalWorking.$executeRaw.bind(this._globalWorking);
  }

  get $executeRawUnsafe() {
    return this._globalWorking.$executeRawUnsafe.bind(this._globalWorking);
  }

  get $queryRawUnsafe() {
    return this._globalWorking.$queryRawUnsafe.bind(this._globalWorking);
  }

  // ─── Backward-compatible model accessors (DB-1 migration bridge) ──────────
  // Use prisma.identity/platform/getWorkingClient() in new CQRS handler code.
  // These getters let existing 752 files continue working during migration.

  // IdentityDB models
  get user() { return this._identity.user; }
  get customerProfile() { return this._identity.customerProfile; }
  get referralPartner() { return this._identity.referralPartner; }
  get department() { return this._identity.department; }
  get designation() { return this._identity.designation; }
  get role() { return this._identity.role; }
  get permission() { return this._identity.permission; }
  get rolePermission() { return this._identity.rolePermission; }
  get roleMenuPermission() { return this._identity.roleMenuPermission; }
  get permissionTemplate() { return this._identity.permissionTemplate; }
  get userCapacity() { return this._identity.userCapacity; }
  get delegationRecord() { return this._identity.delegationRecord; }
  get userPermissionOverride() { return this._identity.userPermissionOverride; }
  get menu() { return this._identity.menu; }
  get auditLog() { return this._identity.auditLog; }
  get auditFieldChange() { return this._identity.auditFieldChange; }
  get auditRetentionPolicy() { return this._identity.auditRetentionPolicy; }
  get tenant() { return this._identity.tenant; }
  get plan() { return this._identity.plan; }
  get subscription() { return this._identity.subscription; }
  get tenantInvoice() { return this._identity.tenantInvoice; }
  get tenantUsage() { return this._identity.tenantUsage; }
  get superAdmin() { return this._identity.superAdmin; }
  get tenantConfig() { return this._identity.tenantConfig; }
  get tenantCredential() { return this._identity.tenantCredential; }
  get credentialAccessLog() { return this._identity.credentialAccessLog; }
  get globalDefaultCredential() { return this._identity.globalDefaultCredential; }
  get tenantAuditSession() { return this._identity.tenantAuditSession; }
  get tenantAuditLog() { return this._identity.tenantAuditLog; }
  get tenantBranding() { return this._identity.tenantBranding; }
  get securityPolicy() { return this._identity.securityPolicy; }
  get ipAccessRule() { return this._identity.ipAccessRule; }
  get dataRetentionPolicy() { return this._identity.dataRetentionPolicy; }
  get planLimit() { return this._identity.planLimit; }
  get tenantProfile() { return this._identity.tenantProfile; }
  get planModuleAccess() { return this._identity.planModuleAccess; }
  get terminologyOverride() { return this._identity.terminologyOverride; }
  get verificationOtp() { return this._identity.verificationOtp; }
  get tenantVersion() { return this._identity.tenantVersion; }
  get versionBackup() { return this._identity.versionBackup; }

  // PlatformDB models
  get masterLookup() { return this._platform.masterLookup; }
  get lookupValue() { return this._platform.lookupValue; }
  get package() { return this._platform.package; }
  get errorCatalog() { return this._platform.errorCatalog; }
  get errorLog() { return this._platform.errorLog; }
  get errorAutoReportRule() { return this._platform.errorAutoReportRule; }
  get tenantUsageDetail() { return this._platform.tenantUsageDetail; }
  get wallet() { return this._platform.wallet; }
  get walletTransaction() { return this._platform.walletTransaction; }
  get rechargePlan() { return this._platform.rechargePlan; }
  get coupon() { return this._platform.coupon; }
  get softwareOffer() { return this._platform.softwareOffer; }
  get licenseKey() { return this._platform.licenseKey; }
  get moduleDefinition() { return this._platform.moduleDefinition; }
  get tenantActivityLog() { return this._platform.tenantActivityLog; }
  get businessTypeRegistry() { return this._platform.businessTypeRegistry; }
  get industryPackage() { return this._platform.industryPackage; }
  get tenantModule() { return this._platform.tenantModule; }
  get marketplaceVendor() { return this._platform.marketplaceVendor; }
  get marketplaceModule() { return this._platform.marketplaceModule; }
  get marketplaceReview() { return this._platform.marketplaceReview; }
  get tenantMarketplaceModule() { return this._platform.tenantMarketplaceModule; }
  get subscriptionPackage() { return this._platform.subscriptionPackage; }
  get couponRedemption() { return this._platform.couponRedemption; }
  get helpArticle() { return this._platform.helpArticle; }
  get pluginRegistry() { return this._platform.pluginRegistry; }
  get tenantPlugin() { return this._platform.tenantPlugin; }
  get pluginHookLog() { return this._platform.pluginHookLog; }
  get marketplaceListing() { return this._platform.marketplaceListing; }
  get listingPriceTier() { return this._platform.listingPriceTier; }
  get marketplacePost() { return this._platform.marketplacePost; }
  get postEngagement() { return this._platform.postEngagement; }
  get postComment() { return this._platform.postComment; }
  get marketplaceEnquiry() { return this._platform.marketplaceEnquiry; }
  get marketplaceOrder() { return this._platform.marketplaceOrder; }
  get marketplaceOrderItem() { return this._platform.marketplaceOrderItem; }
  get listingAnalytics() { return this._platform.listingAnalytics; }
  get postAnalytics() { return this._platform.postAnalytics; }
  get packageModule() { return this._platform.packageModule; }
  get pageRegistry() { return this._platform.pageRegistry; }
  get appVersion() { return this._platform.appVersion; }
  get industryPatch() { return this._platform.industryPatch; }

  // WorkingDB models
  get rawContact() { return this._globalWorking.rawContact; }
  get rawContactFilter() { return this._globalWorking.rawContactFilter; }
  get contact() { return this._globalWorking.contact; }
  get contactFilter() { return this._globalWorking.contactFilter; }
  get organization() { return this._globalWorking.organization; }
  get organizationFilter() { return this._globalWorking.organizationFilter; }
  get contactOrganization() { return this._globalWorking.contactOrganization; }
  get communication() { return this._globalWorking.communication; }
  get lead() { return this._globalWorking.lead; }
  get leadFilter() { return this._globalWorking.leadFilter; }
  get activity() { return this._globalWorking.activity; }
  get demo() { return this._globalWorking.demo; }
  get tourPlan() { return this._globalWorking.tourPlan; }
  get quotation() { return this._globalWorking.quotation; }
  get quotationLineItem() { return this._globalWorking.quotationLineItem; }
  get quotationSendLog() { return this._globalWorking.quotationSendLog; }
  get quotationNegotiationLog() { return this._globalWorking.quotationNegotiationLog; }
  get quotationActivity() { return this._globalWorking.quotationActivity; }
  get quotationTemplate() { return this._globalWorking.quotationTemplate; }
  get entityOwner() { return this._globalWorking.entityOwner; }
  get ownershipLog() { return this._globalWorking.ownershipLog; }
  get assignmentRule() { return this._globalWorking.assignmentRule; }
  get approvalRequest() { return this._globalWorking.approvalRequest; }
  get approvalRule() { return this._globalWorking.approvalRule; }
  get brand() { return this._globalWorking.brand; }
  get brandOrganization() { return this._globalWorking.brandOrganization; }
  get brandContact() { return this._globalWorking.brandContact; }
  get manufacturer() { return this._globalWorking.manufacturer; }
  get manufacturerOrganization() { return this._globalWorking.manufacturerOrganization; }
  get manufacturerContact() { return this._globalWorking.manufacturerContact; }
  get businessLocation() { return this._globalWorking.businessLocation; }
  get organizationLocation() { return this._globalWorking.organizationLocation; }
  get companyCountry() { return this._globalWorking.companyCountry; }
  get companyState() { return this._globalWorking.companyState; }
  get companyCity() { return this._globalWorking.companyCity; }
  get companyPincode() { return this._globalWorking.companyPincode; }
  get customFieldDefinition() { return this._globalWorking.customFieldDefinition; }
  get entityConfigValue() { return this._globalWorking.entityConfigValue; }
  get product() { return this._globalWorking.product; }
  get productPrice() { return this._globalWorking.productPrice; }
  get customerPriceGroup() { return this._globalWorking.customerPriceGroup; }
  get customerGroupMapping() { return this._globalWorking.customerGroupMapping; }
  get productTaxDetail() { return this._globalWorking.productTaxDetail; }
  get productUnitConversion() { return this._globalWorking.productUnitConversion; }
  get productRelation() { return this._globalWorking.productRelation; }
  get productFilter() { return this._globalWorking.productFilter; }
  get workflow() { return this._globalWorking.workflow; }
  get workflowState() { return this._globalWorking.workflowState; }
  get workflowTransition() { return this._globalWorking.workflowTransition; }
  get workflowInstance() { return this._globalWorking.workflowInstance; }
  get workflowHistory() { return this._globalWorking.workflowHistory; }
  get workflowApproval() { return this._globalWorking.workflowApproval; }
  get workflowActionLog() { return this._globalWorking.workflowActionLog; }
  get workflowSlaEscalation() { return this._globalWorking.workflowSlaEscalation; }
  get followUp() { return this._globalWorking.followUp; }
  get reminder() { return this._globalWorking.reminder; }
  get recurringEvent() { return this._globalWorking.recurringEvent; }
  get tourPlanVisit() { return this._globalWorking.tourPlanVisit; }
  get tourPlanPhoto() { return this._globalWorking.tourPlanPhoto; }
  get calendarEvent() { return this._globalWorking.calendarEvent; }
  get notification() { return this._globalWorking.notification; }
  get notificationPreference() { return this._globalWorking.notificationPreference; }
  get notificationTemplate() { return this._globalWorking.notificationTemplate; }
  get pushSubscription() { return this._globalWorking.pushSubscription; }
  get salesTarget() { return this._globalWorking.salesTarget; }
  get reportExportLog() { return this._globalWorking.reportExportLog; }
  get reportDefinition() { return this._globalWorking.reportDefinition; }
  get reportBookmark() { return this._globalWorking.reportBookmark; }
  get scheduledReport() { return this._globalWorking.scheduledReport; }
  get reportTemplate() { return this._globalWorking.reportTemplate; }
  get importProfile() { return this._globalWorking.importProfile; }
  get importJob() { return this._globalWorking.importJob; }
  get importRow() { return this._globalWorking.importRow; }
  get exportJob() { return this._globalWorking.exportJob; }
  get document() { return this._globalWorking.document; }
  get documentAttachment() { return this._globalWorking.documentAttachment; }
  get documentFolder() { return this._globalWorking.documentFolder; }
  get cloudConnection() { return this._globalWorking.cloudConnection; }
  get documentShareLink() { return this._globalWorking.documentShareLink; }
  get documentActivity() { return this._globalWorking.documentActivity; }
  get emailAccount() { return this._globalWorking.emailAccount; }
  get emailThread() { return this._globalWorking.emailThread; }
  get email() { return this._globalWorking.email; }
  get emailAttachment() { return this._globalWorking.emailAttachment; }
  get emailTemplate() { return this._globalWorking.emailTemplate; }
  get emailSignature() { return this._globalWorking.emailSignature; }
  get emailCampaign() { return this._globalWorking.emailCampaign; }
  get campaignRecipient() { return this._globalWorking.campaignRecipient; }
  get emailTrackingEvent() { return this._globalWorking.emailTrackingEvent; }
  get emailUnsubscribe() { return this._globalWorking.emailUnsubscribe; }
  get whatsAppBusinessAccount() { return this._globalWorking.whatsAppBusinessAccount; }
  get waConversation() { return this._globalWorking.waConversation; }
  get waMessage() { return this._globalWorking.waMessage; }
  get waTemplate() { return this._globalWorking.waTemplate; }
  get waBroadcast() { return this._globalWorking.waBroadcast; }
  get waBroadcastRecipient() { return this._globalWorking.waBroadcastRecipient; }
  get waChatbotFlow() { return this._globalWorking.waChatbotFlow; }
  get waQuickReply() { return this._globalWorking.waQuickReply; }
  get waOptOut() { return this._globalWorking.waOptOut; }
  get syncPolicy() { return this._globalWorking.syncPolicy; }
  get syncWarningRule() { return this._globalWorking.syncWarningRule; }
  get syncDevice() { return this._globalWorking.syncDevice; }
  get syncConflict() { return this._globalWorking.syncConflict; }
  get syncFlushCommand() { return this._globalWorking.syncFlushCommand; }
  get syncChangeLog() { return this._globalWorking.syncChangeLog; }
  get syncAuditLog() { return this._globalWorking.syncAuditLog; }
  get cronJobConfig() { return this._globalWorking.cronJobConfig; }
  get cronJobRunLog() { return this._globalWorking.cronJobRunLog; }
  get supportTicket() { return this._globalWorking.supportTicket; }
  get supportTicketMessage() { return this._globalWorking.supportTicketMessage; }
  get businessHoursSchedule() { return this._globalWorking.businessHoursSchedule; }
  get holidayCalendar() { return this._globalWorking.holidayCalendar; }
  get calendarHighlight() { return this._globalWorking.calendarHighlight; }
  get autoNumberSequence() { return this._globalWorking.autoNumberSequence; }
  get companyProfile() { return this._globalWorking.companyProfile; }
  get emailFooterTemplate() { return this._globalWorking.emailFooterTemplate; }
  get notionConfig() { return this._globalWorking.notionConfig; }
  get invoice() { return this._globalWorking.invoice; }
  get invoiceLineItem() { return this._globalWorking.invoiceLineItem; }
  get proformaInvoice() { return this._globalWorking.proformaInvoice; }
  get proformaLineItem() { return this._globalWorking.proformaLineItem; }
  get payment() { return this._globalWorking.payment; }
  get paymentReceipt() { return this._globalWorking.paymentReceipt; }
  get refund() { return this._globalWorking.refund; }
  get creditNote() { return this._globalWorking.creditNote; }
  get paymentReminder() { return this._globalWorking.paymentReminder; }
  get apiKey() { return this._globalWorking.apiKey; }
  get apiRequestLog() { return this._globalWorking.apiRequestLog; }
  get webhookEndpoint() { return this._globalWorking.webhookEndpoint; }
  get webhookDelivery() { return this._globalWorking.webhookDelivery; }
  get rateLimitTier() { return this._globalWorking.rateLimitTier; }
  get tableConfig() { return this._globalWorking.tableConfig; }
  get dataMaskingPolicy() { return this._globalWorking.dataMaskingPolicy; }
  get unmaskAuditLog() { return this._globalWorking.unmaskAuditLog; }
  get task() { return this._globalWorking.task; }
  get taskHistory() { return this._globalWorking.taskHistory; }
  get taskWatcher() { return this._globalWorking.taskWatcher; }
  get comment() { return this._globalWorking.comment; }
  get notificationConfig() { return this._globalWorking.notificationConfig; }
  get escalationRule() { return this._globalWorking.escalationRule; }
  get communicationLog() { return this._globalWorking.communicationLog; }
  get taskLogicConfig() { return this._globalWorking.taskLogicConfig; }
  get quietHourConfig() { return this._globalWorking.quietHourConfig; }
  get scheduledEvent() { return this._globalWorking.scheduledEvent; }
  get eventParticipant() { return this._globalWorking.eventParticipant; }
  get eventHistory() { return this._globalWorking.eventHistory; }
  get userCalendarSync() { return this._globalWorking.userCalendarSync; }
  get userAvailability() { return this._globalWorking.userAvailability; }
  get blockedSlot() { return this._globalWorking.blockedSlot; }
  get calendarConfig() { return this._globalWorking.calendarConfig; }
  get googleConnection() { return this._globalWorking.googleConnection; }
  get aiUsageLog() { return this._globalWorking.aiUsageLog; }
  get aiSettings() { return this._globalWorking.aiSettings; }
  get serviceRate() { return this._globalWorking.serviceRate; }
  get gstVerificationLog() { return this._globalWorking.gstVerificationLog; }
  get documentTemplate() { return this._globalWorking.documentTemplate; }
  get tenantTemplateCustomization() { return this._globalWorking.tenantTemplateCustomization; }
  get savedFormula() { return this._globalWorking.savedFormula; }
  get inventoryItem() { return this._globalWorking.inventoryItem; }
  get stockLocation() { return this._globalWorking.stockLocation; }
  get stockTransaction() { return this._globalWorking.stockTransaction; }
  get stockSummary() { return this._globalWorking.stockSummary; }
  get stockAdjustment() { return this._globalWorking.stockAdjustment; }
  get serialMaster() { return this._globalWorking.serialMaster; }
  get bOMFormula() { return this._globalWorking.bOMFormula; }
  get bOMFormulaItem() { return this._globalWorking.bOMFormulaItem; }
  get bOMProduction() { return this._globalWorking.bOMProduction; }
  get scrapRecord() { return this._globalWorking.scrapRecord; }
  get inventoryLabel() { return this._globalWorking.inventoryLabel; }
  get unitMaster() { return this._globalWorking.unitMaster; }
  get unitConversion() { return this._globalWorking.unitConversion; }
  get purchaseRFQ() { return this._globalWorking.purchaseRFQ; }
  get purchaseRFQItem() { return this._globalWorking.purchaseRFQItem; }
  get purchaseQuotation() { return this._globalWorking.purchaseQuotation; }
  get purchaseQuotationItem() { return this._globalWorking.purchaseQuotationItem; }
  get quotationComparison() { return this._globalWorking.quotationComparison; }
  get purchaseOrder() { return this._globalWorking.purchaseOrder; }
  get purchaseOrderItem() { return this._globalWorking.purchaseOrderItem; }
  get goodsReceipt() { return this._globalWorking.goodsReceipt; }
  get goodsReceiptItem() { return this._globalWorking.goodsReceiptItem; }
  get purchaseInvoice() { return this._globalWorking.purchaseInvoice; }
  get purchaseInvoiceItem() { return this._globalWorking.purchaseInvoiceItem; }
  get ledgerMaster() { return this._globalWorking.ledgerMaster; }
  get ledgerMapping() { return this._globalWorking.ledgerMapping; }
  get accountTransaction() { return this._globalWorking.accountTransaction; }
  get paymentRecord() { return this._globalWorking.paymentRecord; }
  get bankAccount() { return this._globalWorking.bankAccount; }
  get bankReconciliation() { return this._globalWorking.bankReconciliation; }
  get gSTReturn() { return this._globalWorking.gSTReturn; }
  get tDSRecord() { return this._globalWorking.tDSRecord; }
  get saleOrder() { return this._globalWorking.saleOrder; }
  get saleOrderItem() { return this._globalWorking.saleOrderItem; }
  get deliveryChallan() { return this._globalWorking.deliveryChallan; }
  get deliveryChallanItem() { return this._globalWorking.deliveryChallanItem; }
  get saleReturn() { return this._globalWorking.saleReturn; }
  get saleReturnItem() { return this._globalWorking.saleReturnItem; }
  get debitNote() { return this._globalWorking.debitNote; }
  get debitNoteItem() { return this._globalWorking.debitNoteItem; }
  get accountGroup() { return this._globalWorking.accountGroup; }
  get saleMaster() { return this._globalWorking.saleMaster; }
  get purchaseMaster() { return this._globalWorking.purchaseMaster; }
  get shortcutDefinition() { return this._globalWorking.shortcutDefinition; }
  get shortcutUserOverride() { return this._globalWorking.shortcutUserOverride; }
  get entityVerificationRecord() { return this._globalWorking.entityVerificationRecord; }
  get warrantyTemplate() { return this._globalWorking.warrantyTemplate; }
  get warrantyRecord() { return this._globalWorking.warrantyRecord; }
  get warrantyClaim() { return this._globalWorking.warrantyClaim; }
  get aMCPlanTemplate() { return this._globalWorking.aMCPlanTemplate; }
  get aMCContract() { return this._globalWorking.aMCContract; }
  get aMCSchedule() { return this._globalWorking.aMCSchedule; }
  get serviceVisitLog() { return this._globalWorking.serviceVisitLog; }
  get serviceCharge() { return this._globalWorking.serviceCharge; }
  get aiModel() { return this._globalWorking.aiModel; }
  get aiDataset() { return this._globalWorking.aiDataset; }
  get aiDocument() { return this._globalWorking.aiDocument; }
  get aiTrainingJob() { return this._globalWorking.aiTrainingJob; }
  get aiEmbedding() { return this._globalWorking.aiEmbedding; }
  get aiChatSession() { return this._globalWorking.aiChatSession; }
  get aiChatMessage() { return this._globalWorking.aiChatMessage; }
  get aiSystemPrompt() { return this._globalWorking.aiSystemPrompt; }
  get controlRoomRule() { return this._globalWorking.controlRoomRule; }
  get controlRoomValue() { return this._globalWorking.controlRoomValue; }
  get controlRoomAuditLog() { return this._globalWorking.controlRoomAuditLog; }
  get tenantRuleCacheVersion() { return this._globalWorking.tenantRuleCacheVersion; }
  get controlRoomDraft() { return this._globalWorking.controlRoomDraft; }
}
