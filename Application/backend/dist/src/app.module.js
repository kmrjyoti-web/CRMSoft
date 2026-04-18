"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cqrs_1 = require("@nestjs/cqrs");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./core/prisma/prisma.module");
const errors_module_1 = require("./common/errors/errors.module");
const architecture_validator_service_1 = require("./common/architecture-validator/architecture-validator.service");
const request_context_service_1 = require("./common/request/request-context.service");
const request_logger_middleware_1 = require("./common/request/request-logger.middleware");
const tenant_context_interceptor_1 = require("./modules/core/identity/tenant/infrastructure/tenant-context.interceptor");
const auth_module_1 = require("./core/auth/auth.module");
const permissions_core_module_1 = require("./core/permissions/permissions-core.module");
const contacts_module_1 = require("./modules/customer/contacts/contacts.module");
const raw_contacts_module_1 = require("./modules/customer/raw-contacts/raw-contacts.module");
const organizations_module_1 = require("./modules/customer/organizations/organizations.module");
const leads_module_1 = require("./modules/customer/leads/leads.module");
const communications_module_1 = require("./modules/customer/communications/communications.module");
const contact_organizations_module_1 = require("./modules/customer/contact-organizations/contact-organizations.module");
const lookups_module_1 = require("./modules/core/platform/lookups/lookups.module");
const entity_filters_module_1 = require("./modules/core/identity/entity-filters/entity-filters.module");
const user_overrides_module_1 = require("./modules/softwarevendor/user-overrides/user-overrides.module");
const approval_requests_module_1 = require("./modules/customer/approval-requests/approval-requests.module");
const approval_rules_module_1 = require("./modules/customer/approval-rules/approval-rules.module");
const menus_module_1 = require("./modules/core/identity/menus/menus.module");
const departments_module_1 = require("./modules/softwarevendor/departments/departments.module");
const designations_module_1 = require("./modules/softwarevendor/designations/designations.module");
const brands_module_1 = require("./modules/customer/brands/brands.module");
const manufacturers_module_1 = require("./modules/customer/manufacturers/manufacturers.module");
const business_locations_module_1 = require("./modules/softwarevendor/business-locations/business-locations.module");
const custom_fields_module_1 = require("./modules/core/work/custom-fields/custom-fields.module");
const products_module_1 = require("./modules/customer/products/products.module");
const product_pricing_module_1 = require("./modules/customer/product-pricing/product-pricing.module");
const customer_price_groups_module_1 = require("./modules/customer/customer-price-groups/customer-price-groups.module");
const product_tax_module_1 = require("./modules/customer/product-tax/product-tax.module");
const product_units_module_1 = require("./modules/customer/product-units/product-units.module");
const workflow_core_module_1 = require("./core/workflow/workflow-core.module");
const workflows_module_1 = require("./modules/softwarevendor/workflows/workflows.module");
const activities_module_1 = require("./modules/customer/activities/activities.module");
const demos_module_1 = require("./modules/customer/demos/demos.module");
const tour_plans_module_1 = require("./modules/customer/tour-plans/tour-plans.module");
const follow_ups_module_1 = require("./modules/customer/follow-ups/follow-ups.module");
const reminders_module_1 = require("./modules/customer/reminders/reminders.module");
const recurrence_module_1 = require("./modules/customer/recurrence/recurrence.module");
const calendar_module_1 = require("./modules/customer/calendar/calendar.module");
const quotations_module_1 = require("./modules/customer/quotations/quotations.module");
const ownership_module_1 = require("./modules/customer/ownership/ownership.module");
const notifications_module_1 = require("./modules/core/work/notifications/notifications.module");
const dashboard_module_1 = require("./modules/customer/dashboard/dashboard.module");
const audit_module_1 = require("./modules/core/identity/audit/audit.module");
const audit_interceptor_1 = require("./modules/core/identity/audit/interceptors/audit.interceptor");
const bulk_import_module_1 = require("./modules/customer/bulk-import/bulk-import.module");
const bulk_export_module_1 = require("./modules/customer/bulk-export/bulk-export.module");
const documents_module_1 = require("./modules/customer/documents/documents.module");
const email_module_1 = require("./modules/customer/email/email.module");
const whatsapp_module_1 = require("./modules/customer/whatsapp/whatsapp.module");
const tenant_module_1 = require("./modules/core/identity/tenant/tenant.module");
const mis_reports_module_1 = require("./modules/customer/mis-reports/mis-reports.module");
const offline_sync_module_1 = require("./modules/softwarevendor/offline-sync/offline-sync.module");
const tenant_config_module_1 = require("./modules/softwarevendor/tenant-config/tenant-config.module");
const cron_engine_module_1 = require("./modules/softwarevendor/cron-engine/cron-engine.module");
const recycle_bin_module_1 = require("./modules/customer/recycle-bin/recycle-bin.module");
const settings_module_1 = require("./modules/core/identity/settings/settings.module");
const payment_module_1 = require("./modules/customer/payment/payment.module");
const api_gateway_module_1 = require("./modules/softwarevendor/api-gateway/api-gateway.module");
const table_config_module_1 = require("./modules/softwarevendor/table-config/table-config.module");
const tasks_module_1 = require("./modules/customer/tasks/tasks.module");
const comments_module_1 = require("./modules/customer/comments/comments.module");
const task_logic_module_1 = require("./modules/customer/task-logic/task-logic.module");
const packages_module_1 = require("./modules/softwarevendor/packages/packages.module");
const google_module_1 = require("./modules/softwarevendor/google/google.module");
const ai_module_1 = require("./modules/softwarevendor/ai/ai.module");
const wallet_module_1 = require("./modules/customer/wallet/wallet.module");
const business_type_module_1 = require("./modules/softwarevendor/business-type/business-type.module");
const cfg_vertical_module_1 = require("./modules/softwarevendor/cfg-vertical/cfg-vertical.module");
const db_auditor_module_1 = require("./modules/softwarevendor/db-auditor/db-auditor.module");
const module_manager_module_1 = require("./modules/softwarevendor/module-manager/module-manager.module");
const marketplace_module_1 = require("./modules/marketplace/marketplace.module");
const subscription_package_module_1 = require("./modules/softwarevendor/subscription-package/subscription-package.module");
const help_module_1 = require("./modules/core/platform/help/help.module");
const plugins_module_1 = require("./modules/plugins/plugins.module");
const verification_module_1 = require("./modules/softwarevendor/verification/verification.module");
const document_templates_module_1 = require("./modules/customer/document-templates/document-templates.module");
const support_module_1 = require("./modules/customer/support/support.module");
const inventory_module_1 = require("./modules/customer/inventory/inventory.module");
const procurement_module_1 = require("./modules/customer/procurement/procurement.module");
const accounts_module_1 = require("./modules/customer/accounts/accounts.module");
const sales_module_1 = require("./modules/customer/sales/sales.module");
const price_lists_module_1 = require("./modules/customer/price-lists/price-lists.module");
const performance_module_1 = require("./modules/customer/performance/performance.module");
const saved_filters_module_1 = require("./modules/customer/saved-filters/saved-filters.module");
const keyboard_shortcuts_module_1 = require("./modules/softwarevendor/keyboard-shortcuts/keyboard-shortcuts.module");
const entity_verification_module_1 = require("./modules/customer/entity-verification/entity-verification.module");
const smart_search_module_1 = require("./modules/core/work/search/smart-search.module");
const amc_warranty_module_1 = require("./modules/customer/amc-warranty/amc-warranty.module");
const self_hosted_ai_module_1 = require("./modules/softwarevendor/self-hosted-ai/self-hosted-ai.module");
const calendar_highlights_module_1 = require("./modules/customer/calendar-highlights/calendar-highlights.module");
const control_room_module_1 = require("./modules/softwarevendor/control-room/control-room.module");
const cross_service_module_1 = require("./common/cross-service/cross-service.module");
const customer_portal_module_1 = require("./modules/softwarevendor/customer-portal/customer-portal.module");
const customer_portal_module_2 = require("./modules/customer-portal/customer-portal.module");
const ops_module_1 = require("./modules/ops/ops.module");
const version_control_module_1 = require("./modules/softwarevendor/version-control/version-control.module");
const health_module_1 = require("./modules/core/health/health.module");
const platform_console_1 = require("./modules/platform-console");
const bull_1 = require("@nestjs/bull");
const tenant_audit_middleware_1 = require("./modules/core/identity/tenant/infrastructure/tenant-audit.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(request_logger_middleware_1.RequestLoggerMiddleware).forRoutes('*');
        consumer.apply(tenant_audit_middleware_1.TenantAuditMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            cqrs_1.CqrsModule.forRoot(),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
            bull_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => ({
                    redis: config.get('REDIS_URL', 'redis://localhost:6379'),
                }),
                inject: [config_1.ConfigService],
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            permissions_core_module_1.PermissionsCoreModule,
            workflow_core_module_1.WorkflowCoreModule,
            contacts_module_1.ContactsModule,
            raw_contacts_module_1.RawContactsModule,
            organizations_module_1.OrganizationsModule,
            leads_module_1.LeadsModule,
            communications_module_1.CommunicationsModule,
            contact_organizations_module_1.ContactOrganizationsModule,
            lookups_module_1.LookupsModule,
            entity_filters_module_1.EntityFiltersModule,
            user_overrides_module_1.UserOverridesModule,
            approval_requests_module_1.ApprovalRequestsModule,
            approval_rules_module_1.ApprovalRulesModule,
            menus_module_1.MenusModule,
            departments_module_1.DepartmentsModule,
            designations_module_1.DesignationsModule,
            brands_module_1.BrandsModule,
            manufacturers_module_1.ManufacturersModule,
            business_locations_module_1.BusinessLocationsModule,
            custom_fields_module_1.CustomFieldsModule,
            products_module_1.ProductsModule,
            product_pricing_module_1.ProductPricingModule,
            customer_price_groups_module_1.CustomerPriceGroupsModule,
            product_tax_module_1.ProductTaxModule,
            product_units_module_1.ProductUnitsModule,
            workflows_module_1.WorkflowsModule,
            activities_module_1.ActivitiesModule,
            demos_module_1.DemosModule,
            tour_plans_module_1.TourPlansModule,
            follow_ups_module_1.FollowUpsModule,
            reminders_module_1.RemindersModule,
            recurrence_module_1.RecurrenceModule,
            calendar_module_1.CalendarModule,
            quotations_module_1.QuotationsModule,
            ownership_module_1.OwnershipModule,
            notifications_module_1.NotificationsModule,
            dashboard_module_1.DashboardModule,
            audit_module_1.AuditModule,
            bulk_import_module_1.BulkImportModule,
            bulk_export_module_1.BulkExportModule,
            documents_module_1.DocumentsModule,
            email_module_1.EmailModule,
            whatsapp_module_1.WhatsAppModule,
            tenant_module_1.TenantModule,
            mis_reports_module_1.MisReportsModule,
            offline_sync_module_1.OfflineSyncModule,
            tenant_config_module_1.TenantConfigModule,
            cron_engine_module_1.CronEngineModule,
            recycle_bin_module_1.RecycleBinModule,
            settings_module_1.SettingsModule,
            payment_module_1.PaymentModule,
            api_gateway_module_1.ApiGatewayModule,
            table_config_module_1.TableConfigModule,
            tasks_module_1.TasksModule,
            comments_module_1.CommentsModule,
            task_logic_module_1.TaskLogicModule,
            packages_module_1.PackagesModule,
            google_module_1.GoogleModule,
            ai_module_1.AiModule,
            wallet_module_1.WalletModule,
            business_type_module_1.BusinessTypeModule,
            cfg_vertical_module_1.CfgVerticalModule,
            db_auditor_module_1.DbAuditorModule,
            module_manager_module_1.ModuleManagerModule,
            marketplace_module_1.MarketplaceModule,
            subscription_package_module_1.SubscriptionPackageModule,
            help_module_1.HelpModule,
            plugins_module_1.PluginsModule,
            verification_module_1.VerificationModule,
            document_templates_module_1.DocumentTemplatesModule,
            support_module_1.SupportModule,
            inventory_module_1.InventoryModule,
            procurement_module_1.ProcurementModule,
            accounts_module_1.AccountsModule,
            sales_module_1.SalesModule,
            price_lists_module_1.PriceListsModule,
            performance_module_1.PerformanceModule,
            saved_filters_module_1.SavedFiltersModule,
            keyboard_shortcuts_module_1.KeyboardShortcutsModule,
            entity_verification_module_1.EntityVerificationModule,
            smart_search_module_1.SmartSearchModule,
            amc_warranty_module_1.AmcWarrantyModule,
            self_hosted_ai_module_1.SelfHostedAiModule,
            calendar_highlights_module_1.CalendarHighlightsModule,
            control_room_module_1.ControlRoomModule,
            cross_service_module_1.CrossServiceModule,
            customer_portal_module_1.CustomerPortalModule,
            customer_portal_module_2.CustomerPortalModule,
            ops_module_1.OpsModule,
            version_control_module_1.VersionControlModule,
            health_module_1.HealthModule,
            platform_console_1.PlatformConsoleModule,
            errors_module_1.ErrorsModule,
        ],
        controllers: [],
        providers: [
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: tenant_context_interceptor_1.TenantContextInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: audit_interceptor_1.AuditInterceptor,
            },
            request_context_service_1.RequestContextService,
            architecture_validator_service_1.ArchitectureValidatorService,
        ],
        exports: [request_context_service_1.RequestContextService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map