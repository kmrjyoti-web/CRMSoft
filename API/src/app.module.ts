import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './core/prisma/prisma.module';
import { ErrorLoggerService } from './common/errors/error-logger.service';
import { ErrorAdminController } from './common/errors/presentation/error-admin.controller';
import { RequestContextService } from './common/request/request-context.service';
import { RequestLoggerMiddleware } from './common/request/request-logger.middleware';
import { TenantContextInterceptor } from './modules/tenant/infrastructure/tenant-context.interceptor';
// TenantGuard APP_GUARD registered in TenantModule (runs after JwtAuthGuard from AuthModule)
import { AuthModule } from './core/auth/auth.module';
import { PermissionsCoreModule } from './core/permissions/permissions-core.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { RawContactsModule } from './modules/raw-contacts/raw-contacts.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { LeadsModule } from './modules/leads/leads.module';
import { CommunicationsModule } from './modules/communications/communications.module';
import { ContactOrganizationsModule } from './modules/contact-organizations/contact-organizations.module';
import { LookupsModule } from './modules/lookups/lookups.module';
import { EntityFiltersModule } from './modules/entity-filters/entity-filters.module';
import { UserOverridesModule } from './modules/user-overrides/user-overrides.module';
import { ApprovalRequestsModule } from './modules/approval-requests/approval-requests.module';
import { ApprovalRulesModule } from './modules/approval-rules/approval-rules.module';
import { MenusModule } from './modules/menus/menus.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { DesignationsModule } from './modules/designations/designations.module';
import { BrandsModule } from './modules/brands/brands.module';
import { ManufacturersModule } from './modules/manufacturers/manufacturers.module';
import { BusinessLocationsModule } from './modules/business-locations/business-locations.module';
import { CustomFieldsModule } from './modules/custom-fields/custom-fields.module';
import { ProductsModule } from './modules/products/products.module';
import { ProductPricingModule } from './modules/product-pricing/product-pricing.module';
import { CustomerPriceGroupsModule } from './modules/customer-price-groups/customer-price-groups.module';
import { ProductTaxModule } from './modules/product-tax/product-tax.module';
import { ProductUnitsModule } from './modules/product-units/product-units.module';
import { WorkflowCoreModule } from './core/workflow/workflow-core.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { DemosModule } from './modules/demos/demos.module';
import { TourPlansModule } from './modules/tour-plans/tour-plans.module';
import { FollowUpsModule } from './modules/follow-ups/follow-ups.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { RecurrenceModule } from './modules/recurrence/recurrence.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { QuotationsModule } from './modules/quotations/quotations.module';
import { OwnershipModule } from './modules/ownership/ownership.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuditInterceptor } from './modules/audit/interceptors/audit.interceptor';
import { BulkImportModule } from './modules/bulk-import/bulk-import.module';
import { BulkExportModule } from './modules/bulk-export/bulk-export.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { EmailModule } from './modules/email/email.module';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { MisReportsModule } from './modules/mis-reports/mis-reports.module';
import { OfflineSyncModule } from './modules/offline-sync/offline-sync.module';
import { TenantConfigModule } from './modules/tenant-config/tenant-config.module';
import { CronEngineModule } from './modules/cron-engine/cron-engine.module';
import { RecycleBinModule } from './modules/recycle-bin/recycle-bin.module';
import { SettingsModule } from './modules/settings/settings.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ApiGatewayModule } from './modules/api-gateway/api-gateway.module';
import { TableConfigModule } from './modules/table-config/table-config.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { CommentsModule } from './modules/comments/comments.module';
import { TaskLogicModule } from './modules/task-logic/task-logic.module';
import { PackagesModule } from './modules/packages/packages.module';
import { GoogleModule } from './modules/google/google.module';
import { AiModule } from './modules/ai/ai.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { BusinessTypeModule } from './modules/business-type/business-type.module';
import { ModuleManagerModule } from './modules/module-manager/module-manager.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { SubscriptionPackageModule } from './modules/subscription-package/subscription-package.module';
import { HelpModule } from './modules/help/help.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
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
    ModuleManagerModule,
    MarketplaceModule,
    SubscriptionPackageModule,
    HelpModule,
  ],
  controllers: [ErrorAdminController],
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
    ErrorLoggerService,
    RequestContextService,
  ],
  exports: [ErrorLoggerService, RequestContextService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
