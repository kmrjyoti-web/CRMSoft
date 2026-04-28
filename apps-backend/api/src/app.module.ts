import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './core/prisma/prisma.module';
import { ErrorsModule } from './common/errors/errors.module';
import { ArchitectureValidatorService } from './common/architecture-validator/architecture-validator.service';
import { RequestContextService } from './common/request/request-context.service';
import { RequestLoggerMiddleware } from './common/request/request-logger.middleware';
import { TenantContextInterceptor } from './modules/core/identity/tenant/infrastructure/tenant-context.interceptor';
// TenantGuard APP_GUARD registered in TenantModule (runs after JwtAuthGuard from AuthModule)
import { AuthModule } from './core/auth/auth.module';
import { PermissionsCoreModule } from './core/permissions/permissions-core.module';
import { ContactsModule } from './modules/customer/contacts/contacts.module';
import { RawContactsModule } from './modules/customer/raw-contacts/raw-contacts.module';
import { OrganizationsModule } from './modules/customer/organizations/organizations.module';
import { LeadsModule } from './modules/customer/leads/leads.module';
import { CommunicationsModule } from './modules/customer/communications/communications.module';
import { ContactOrganizationsModule } from './modules/customer/contact-organizations/contact-organizations.module';
import { LookupsModule } from './modules/core/platform/lookups/lookups.module';
import { EntityFiltersModule } from './modules/core/identity/entity-filters/entity-filters.module';
import { UserOverridesModule } from './modules/softwarevendor/user-overrides/user-overrides.module';
import { ApprovalRequestsModule } from './modules/customer/approval-requests/approval-requests.module';
import { ApprovalRulesModule } from './modules/customer/approval-rules/approval-rules.module';
import { MenusModule } from './modules/core/identity/menus/menus.module';
import { DepartmentsModule } from './modules/softwarevendor/departments/departments.module';
import { DesignationsModule } from './modules/softwarevendor/designations/designations.module';
import { BrandsModule } from './modules/customer/brands/brands.module';
import { ManufacturersModule } from './modules/customer/manufacturers/manufacturers.module';
import { BusinessLocationsModule } from './modules/softwarevendor/business-locations/business-locations.module';
import { CustomFieldsModule } from './modules/core/work/custom-fields/custom-fields.module';
import { ProductsModule } from './modules/customer/products/products.module';
import { ProductPricingModule } from './modules/customer/product-pricing/product-pricing.module';
import { CustomerPriceGroupsModule } from './modules/customer/customer-price-groups/customer-price-groups.module';
import { ProductTaxModule } from './modules/customer/product-tax/product-tax.module';
import { ProductUnitsModule } from './modules/customer/product-units/product-units.module';
import { WorkflowCoreModule } from './core/workflow/workflow-core.module';
import { WorkflowsModule } from './modules/softwarevendor/workflows/workflows.module';
import { ActivitiesModule } from './modules/customer/activities/activities.module';
import { DemosModule } from './modules/customer/demos/demos.module';
import { TourPlansModule } from './modules/customer/tour-plans/tour-plans.module';
import { FollowUpsModule } from './modules/customer/follow-ups/follow-ups.module';
import { RemindersModule } from './modules/customer/reminders/reminders.module';
import { RecurrenceModule } from './modules/customer/recurrence/recurrence.module';
import { CalendarModule } from './modules/customer/calendar/calendar.module';
import { QuotationsModule } from './modules/customer/quotations/quotations.module';
import { OwnershipModule } from './modules/customer/ownership/ownership.module';
import { NotificationsModule } from './modules/core/work/notifications/notifications.module';
import { DashboardModule } from './modules/customer/dashboard/dashboard.module';
import { AuditModule } from './modules/core/identity/audit/audit.module';
import { AuditInterceptor } from './modules/core/identity/audit/interceptors/audit.interceptor';
import { BulkImportModule } from './modules/customer/bulk-import/bulk-import.module';
import { BulkExportModule } from './modules/customer/bulk-export/bulk-export.module';
import { DocumentsModule } from './modules/customer/documents/documents.module';
import { EmailModule } from './modules/customer/email/email.module';
import { WhatsAppModule } from './modules/customer/whatsapp/whatsapp.module';
import { TenantModule } from './modules/core/identity/tenant/tenant.module';
import { MisReportsModule } from './modules/customer/mis-reports/mis-reports.module';
import { OfflineSyncModule } from './modules/softwarevendor/offline-sync/offline-sync.module';
import { TenantConfigModule } from './modules/softwarevendor/tenant-config/tenant-config.module';
import { CronEngineModule } from './modules/softwarevendor/cron-engine/cron-engine.module';
import { RecycleBinModule } from './modules/customer/recycle-bin/recycle-bin.module';
import { SettingsModule } from './modules/core/identity/settings/settings.module';
import { PaymentModule } from './modules/customer/payment/payment.module';
import { ApiGatewayModule } from './modules/softwarevendor/api-gateway/api-gateway.module';
import { TableConfigModule } from './modules/softwarevendor/table-config/table-config.module';
import { TasksModule } from './modules/customer/tasks/tasks.module';
import { CommentsModule } from './modules/customer/comments/comments.module';
import { TaskLogicModule } from './modules/customer/task-logic/task-logic.module';
import { PackagesModule } from './modules/softwarevendor/packages/packages.module';
import { GoogleModule } from './modules/softwarevendor/google/google.module';
import { AiModule } from './modules/softwarevendor/ai/ai.module';
import { WalletModule } from './modules/customer/wallet/wallet.module';
import { BusinessTypeModule } from './modules/softwarevendor/business-type/business-type.module';
import { CfgVerticalModule } from './modules/softwarevendor/cfg-vertical/cfg-vertical.module';
import { DbAuditorModule } from './modules/softwarevendor/db-auditor/db-auditor.module';
import { ModuleManagerModule } from './modules/softwarevendor/module-manager/module-manager.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { SubscriptionPackageModule } from './modules/softwarevendor/subscription-package/subscription-package.module';
import { HelpModule } from './modules/core/platform/help/help.module';
import { PluginsModule } from './modules/plugins/plugins.module';
import { VerificationModule } from './modules/softwarevendor/verification/verification.module';
import { DocumentTemplatesModule } from './modules/customer/document-templates/document-templates.module';
import { SupportModule } from './modules/customer/support/support.module';
import { InventoryModule } from './modules/customer/inventory/inventory.module';
import { ProcurementModule } from './modules/customer/procurement/procurement.module';
import { AccountsModule } from './modules/customer/accounts/accounts.module';
import { SalesModule } from './modules/customer/sales/sales.module';
import { PriceListsModule } from './modules/customer/price-lists/price-lists.module';
import { PerformanceModule } from './modules/customer/performance/performance.module';
import { SavedFiltersModule } from './modules/customer/saved-filters/saved-filters.module';
import { KeyboardShortcutsModule } from './modules/softwarevendor/keyboard-shortcuts/keyboard-shortcuts.module';
import { EntityVerificationModule } from './modules/customer/entity-verification/entity-verification.module';
// TODO: create module — verification-invite
// import { VerificationInviteModule } from './modules/customer/verification-invite/verification-invite.module';
import { SmartSearchModule } from './modules/core/work/search/smart-search.module';
import { AmcWarrantyModule } from './modules/customer/amc-warranty/amc-warranty.module';
import { SelfHostedAiModule } from './modules/softwarevendor/self-hosted-ai/self-hosted-ai.module';
import { CalendarHighlightsModule } from './modules/customer/calendar-highlights/calendar-highlights.module';
import { ControlRoomModule } from './modules/softwarevendor/control-room/control-room.module';
import { CrossServiceModule } from './common/cross-service/cross-service.module';
import { CustomerPortalModule } from './modules/softwarevendor/customer-portal/customer-portal.module';
import { CustomerPortalModule as CustomerPortalAuthModule } from './modules/customer-portal/customer-portal.module';
import { OpsModule } from './modules/ops/ops.module';
import { VersionControlModule } from './modules/softwarevendor/version-control/version-control.module';
import { HealthModule } from './modules/core/health/health.module';
import { ProfileModule } from './modules/core/identity/profile/profile.module';
import { OnboardingModule } from './modules/core/identity/onboarding/onboarding.module';
// TODO: create module — reference-data
// import { ReferenceDataModule } from './modules/core/reference-data/reference-data.module';
// TODO: create module — system-field
// import { SystemFieldModule } from './modules/core/system-field/system-field.module';
import { PlatformConsoleModule } from './modules/platform-console';
import { RedisCacheModule } from './modules/core/cache/cache.module';
import { PcConfigModule } from './modules/core/pc-config/pc-config.module';
// TODO: create module — ai-apps
// import { AiAppsModule } from './modules/softwarevendor/ai-apps/ai-apps.module';
import { BullModule } from '@nestjs/bull';
import { TenantAuditMiddleware } from './modules/core/identity/tenant/infrastructure/tenant-audit.middleware';
import { TenantResolverMiddleware } from './modules/core/identity/tenant/infrastructure/tenant-resolver.middleware';
import { DbRouterMiddleware } from './common/database/db-router.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        redis: config.get<string>('REDIS_URL', 'redis://localhost:6379'),
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    PermissionsCoreModule,
    WorkflowCoreModule,
    ContactsModule,
    RawContactsModule,
    OrganizationsModule,
    LeadsModule,
    CommunicationsModule,
    ContactOrganizationsModule,
    LookupsModule,
    EntityFiltersModule,
    UserOverridesModule,
    ApprovalRequestsModule,
    ApprovalRulesModule,
    MenusModule,
    DepartmentsModule,
    DesignationsModule,
    BrandsModule,
    ManufacturersModule,
    BusinessLocationsModule,
    CustomFieldsModule,
    ProductsModule,
    ProductPricingModule,
    CustomerPriceGroupsModule,
    ProductTaxModule,
    ProductUnitsModule,
    WorkflowsModule,
    ActivitiesModule,
    DemosModule,
    TourPlansModule,
    FollowUpsModule,
    RemindersModule,
    RecurrenceModule,
    CalendarModule,
    QuotationsModule,
    OwnershipModule,
    NotificationsModule,
    DashboardModule,
    AuditModule,
    BulkImportModule,
    BulkExportModule,
    DocumentsModule,
    EmailModule,
    WhatsAppModule,
    TenantModule,
    MisReportsModule,
    OfflineSyncModule,
    TenantConfigModule,
    CronEngineModule,
    RecycleBinModule,
    SettingsModule,
    PaymentModule,
    ApiGatewayModule,
    TableConfigModule,
    TasksModule,
    CommentsModule,
    TaskLogicModule,
    PackagesModule,
    GoogleModule,
    AiModule,
    WalletModule,
    BusinessTypeModule,
    CfgVerticalModule,
    DbAuditorModule,
    ModuleManagerModule,
    MarketplaceModule,
    SubscriptionPackageModule,
    HelpModule,
    PluginsModule,
    VerificationModule,
    DocumentTemplatesModule,
    SupportModule,
    InventoryModule,
    ProcurementModule,
    AccountsModule,
    SalesModule,
    PriceListsModule,
    PerformanceModule,
    SavedFiltersModule,
    KeyboardShortcutsModule,
    EntityVerificationModule,
    // VerificationInviteModule, // TODO: create module
    SmartSearchModule,
    AmcWarrantyModule,
    SelfHostedAiModule,
    CalendarHighlightsModule,
    ControlRoomModule,
    CrossServiceModule,
    CustomerPortalModule,
    CustomerPortalAuthModule,
    OpsModule,
    VersionControlModule,
    HealthModule,
    ProfileModule,
    OnboardingModule,
    // ReferenceDataModule, // TODO: create module
    // SystemFieldModule, // TODO: create module
    PlatformConsoleModule,
    RedisCacheModule,
    PcConfigModule,
    // AiAppsModule, // TODO: create module
    ErrorsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantContextInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    // TenantGuard moved to TenantModule to ensure it runs after JwtAuthGuard
    RequestContextService,
    ArchitectureValidatorService,
  ],
  exports: [RequestContextService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
    consumer.apply(TenantAuditMiddleware).forRoutes('*');
    // Resolves req['tenant'] from domain/subdomain/header/JWT before guards run.
    // Excluded paths: /health and /api/v1/public/* (no tenant context needed).
    consumer
      .apply(TenantResolverMiddleware)
      .exclude('/health', '/api/v1/public/(.*)')
      .forRoutes('*');
    // Runs after TenantResolverMiddleware — attaches req['tenantPrisma'] (shared or dedicated WorkingDB client).
    // Platform Console routes use PlatformDB directly and don't need tenant routing.
    consumer
      .apply(DbRouterMiddleware)
      .exclude('/health', '/api/v1/public/(.*)', '/api/v1/pc-config/(.*)')
      .forRoutes('*');
  }
}
