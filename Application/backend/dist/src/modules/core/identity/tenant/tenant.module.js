"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const core_1 = require("@nestjs/core");
const tenant_provisioning_service_1 = require("./services/tenant-provisioning.service");
const usage_tracker_service_1 = require("./services/usage-tracker.service");
const limit_checker_service_1 = require("./services/limit-checker.service");
const payment_gateway_service_1 = require("./services/payment-gateway.service");
const invoice_generator_service_1 = require("./services/invoice-generator.service");
const plan_limit_service_1 = require("./services/plan-limit.service");
const tenant_profile_service_1 = require("./services/tenant-profile.service");
const license_service_1 = require("./services/license.service");
const software_offer_service_1 = require("./services/software-offer.service");
const module_definition_service_1 = require("./services/module-definition.service");
const module_access_service_1 = require("./services/module-access.service");
const tenant_activity_service_1 = require("./services/tenant-activity.service");
const vendor_dashboard_service_1 = require("./services/vendor-dashboard.service");
const module_registry_service_1 = require("./services/module-registry.service");
const package_builder_service_1 = require("./services/package-builder.service");
const page_scanner_service_1 = require("./services/page-scanner.service");
const page_registry_service_1 = require("./services/page-registry.service");
const page_menu_sync_service_1 = require("./services/page-menu-sync.service");
const page_registry_bootstrap_service_1 = require("./services/page-registry-bootstrap.service");
const version_control_service_1 = require("./services/version-control.service");
const industry_patching_service_1 = require("./services/industry-patching.service");
const rollback_engine_service_1 = require("./services/rollback-engine.service");
const notion_docs_service_1 = require("./services/notion-docs.service");
const tenant_audit_service_1 = require("./services/tenant-audit.service");
const vendor_modules_service_1 = require("./services/vendor-modules.service");
const vendor_tenants_service_1 = require("./services/vendor-tenants.service");
const vendor_audit_logs_service_1 = require("./services/vendor-audit-logs.service");
const vendor_packages_service_1 = require("./services/vendor-packages.service");
const system_health_service_1 = require("./services/system-health.service");
const tenant_context_service_1 = require("./infrastructure/tenant-context.service");
const tenant_context_interceptor_1 = require("./infrastructure/tenant-context.interceptor");
const tenant_guard_1 = require("./infrastructure/tenant.guard");
const super_admin_guard_1 = require("./infrastructure/super-admin.guard");
const plan_limit_guard_1 = require("./infrastructure/plan-limit.guard");
const feature_flag_guard_1 = require("./infrastructure/feature-flag.guard");
const module_access_guard_1 = require("./infrastructure/module-access.guard");
const create_tenant_handler_1 = require("./application/commands/create-tenant/create-tenant.handler");
const update_tenant_handler_1 = require("./application/commands/update-tenant/update-tenant.handler");
const suspend_tenant_handler_1 = require("./application/commands/suspend-tenant/suspend-tenant.handler");
const activate_tenant_handler_1 = require("./application/commands/activate-tenant/activate-tenant.handler");
const create_plan_handler_1 = require("./application/commands/create-plan/create-plan.handler");
const update_plan_handler_1 = require("./application/commands/update-plan/update-plan.handler");
const deactivate_plan_handler_1 = require("./application/commands/deactivate-plan/deactivate-plan.handler");
const subscribe_handler_1 = require("./application/commands/subscribe/subscribe.handler");
const cancel_subscription_handler_1 = require("./application/commands/cancel-subscription/cancel-subscription.handler");
const change_plan_handler_1 = require("./application/commands/change-plan/change-plan.handler");
const record_payment_handler_1 = require("./application/commands/record-payment/record-payment.handler");
const generate_invoice_handler_1 = require("./application/commands/generate-invoice/generate-invoice.handler");
const create_super_admin_handler_1 = require("./application/commands/create-super-admin/create-super-admin.handler");
const update_tenant_settings_handler_1 = require("./application/commands/update-tenant-settings/update-tenant-settings.handler");
const complete_onboarding_step_handler_1 = require("./application/commands/complete-onboarding-step/complete-onboarding-step.handler");
const recalculate_usage_handler_1 = require("./application/commands/recalculate-usage/recalculate-usage.handler");
const handler_1 = require("./application/queries/get-tenant-by-id/handler");
const handler_2 = require("./application/queries/list-tenants/handler");
const handler_3 = require("./application/queries/get-plan-by-id/handler");
const handler_4 = require("./application/queries/list-plans/handler");
const handler_5 = require("./application/queries/get-subscription/handler");
const handler_6 = require("./application/queries/get-tenant-usage/handler");
const handler_7 = require("./application/queries/list-invoices/handler");
const handler_8 = require("./application/queries/get-tenant-dashboard/handler");
const handler_9 = require("./application/queries/list-super-admins/handler");
const tenant_admin_controller_1 = require("./presentation/tenant-admin.controller");
const plan_admin_controller_1 = require("./presentation/plan-admin.controller");
const subscription_controller_1 = require("./presentation/subscription.controller");
const billing_controller_1 = require("./presentation/billing.controller");
const plan_limit_controller_1 = require("./presentation/plan-limit.controller");
const vendor_dashboard_controller_1 = require("./presentation/vendor-dashboard.controller");
const tenant_profile_controller_1 = require("./presentation/tenant-profile.controller");
const license_controller_1 = require("./presentation/license.controller");
const software_offer_controller_1 = require("./presentation/software-offer.controller");
const module_access_controller_1 = require("./presentation/module-access.controller");
const vendor_modules_controller_1 = require("./presentation/vendor-modules.controller");
const vendor_licenses_controller_1 = require("./presentation/vendor-licenses.controller");
const vendor_tenants_controller_1 = require("./presentation/vendor-tenants.controller");
const vendor_packages_controller_1 = require("./presentation/vendor-packages.controller");
const vendor_partners_controller_1 = require("./presentation/vendor-partners.controller");
const vendor_dev_requests_controller_1 = require("./presentation/vendor-dev-requests.controller");
const vendor_wallet_controller_1 = require("./presentation/vendor-wallet.controller");
const vendor_ai_tokens_controller_1 = require("./presentation/vendor-ai-tokens.controller");
const vendor_webhooks_controller_1 = require("./presentation/vendor-webhooks.controller");
const system_health_controller_1 = require("./presentation/system-health.controller");
const vendor_error_logs_controller_1 = require("./presentation/vendor-error-logs.controller");
const vendor_db_admin_controller_1 = require("./presentation/vendor-db-admin.controller");
const vendor_audit_logs_controller_1 = require("./presentation/vendor-audit-logs.controller");
const module_registry_controller_1 = require("./presentation/module-registry.controller");
const package_builder_controller_1 = require("./presentation/package-builder.controller");
const page_registry_controller_1 = require("./presentation/page-registry.controller");
const vendor_versions_controller_1 = require("./presentation/vendor-versions.controller");
const vendor_tenant_audit_controller_1 = require("./presentation/vendor-tenant-audit.controller");
const tenant_audit_status_controller_1 = require("./presentation/tenant-audit-status.controller");
const vendor_guard_1 = require("./infrastructure/vendor.guard");
const CommandHandlers = [
    create_tenant_handler_1.CreateTenantHandler,
    update_tenant_handler_1.UpdateTenantHandler,
    suspend_tenant_handler_1.SuspendTenantHandler,
    activate_tenant_handler_1.ActivateTenantHandler,
    create_plan_handler_1.CreatePlanHandler,
    update_plan_handler_1.UpdatePlanHandler,
    deactivate_plan_handler_1.DeactivatePlanHandler,
    subscribe_handler_1.SubscribeHandler,
    cancel_subscription_handler_1.CancelSubscriptionHandler,
    change_plan_handler_1.ChangePlanHandler,
    record_payment_handler_1.RecordPaymentHandler,
    generate_invoice_handler_1.GenerateInvoiceHandler,
    create_super_admin_handler_1.CreateSuperAdminHandler,
    update_tenant_settings_handler_1.UpdateTenantSettingsHandler,
    complete_onboarding_step_handler_1.CompleteOnboardingStepHandler,
    recalculate_usage_handler_1.RecalculateUsageHandler,
];
const QueryHandlers = [
    handler_1.GetTenantByIdHandler,
    handler_2.ListTenantsHandler,
    handler_3.GetPlanByIdHandler,
    handler_4.ListPlansHandler,
    handler_5.GetSubscriptionHandler,
    handler_6.GetTenantUsageHandler,
    handler_7.ListInvoicesHandler,
    handler_8.GetTenantDashboardHandler,
    handler_9.ListSuperAdminsHandler,
];
let TenantModule = class TenantModule {
};
exports.TenantModule = TenantModule;
exports.TenantModule = TenantModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [
            tenant_admin_controller_1.TenantAdminController,
            plan_admin_controller_1.PlanAdminController,
            plan_limit_controller_1.PlanLimitController,
            subscription_controller_1.SubscriptionController,
            billing_controller_1.BillingController,
            vendor_dashboard_controller_1.VendorDashboardController,
            tenant_profile_controller_1.TenantProfileController,
            license_controller_1.LicenseController,
            software_offer_controller_1.SoftwareOfferController,
            module_access_controller_1.ModuleAccessController,
            vendor_modules_controller_1.VendorModulesController,
            vendor_licenses_controller_1.VendorLicensesController,
            vendor_tenants_controller_1.VendorTenantsController,
            vendor_packages_controller_1.VendorPackagesController,
            vendor_partners_controller_1.VendorPartnersController,
            vendor_dev_requests_controller_1.VendorDevRequestsController,
            vendor_wallet_controller_1.VendorWalletController,
            vendor_ai_tokens_controller_1.VendorAiTokensController,
            vendor_webhooks_controller_1.VendorWebhooksController,
            system_health_controller_1.SystemHealthController,
            vendor_error_logs_controller_1.VendorErrorLogsController,
            vendor_db_admin_controller_1.VendorDbAdminController,
            vendor_audit_logs_controller_1.VendorAuditLogsController,
            module_registry_controller_1.ModuleRegistryController,
            package_builder_controller_1.PackageBuilderController,
            page_registry_controller_1.PageRegistryController,
            vendor_versions_controller_1.VendorVersionsController,
            vendor_versions_controller_1.TenantForceUpdateController,
            vendor_tenant_audit_controller_1.VendorTenantAuditController,
            tenant_audit_status_controller_1.TenantAuditStatusController,
        ],
        providers: [
            tenant_provisioning_service_1.TenantProvisioningService,
            usage_tracker_service_1.UsageTrackerService,
            limit_checker_service_1.LimitCheckerService,
            payment_gateway_service_1.PaymentGatewayService,
            invoice_generator_service_1.InvoiceGeneratorService,
            plan_limit_service_1.PlanLimitService,
            tenant_profile_service_1.TenantProfileService,
            license_service_1.LicenseService,
            software_offer_service_1.SoftwareOfferService,
            module_definition_service_1.ModuleDefinitionService,
            module_access_service_1.ModuleAccessService,
            tenant_activity_service_1.TenantActivityService,
            vendor_dashboard_service_1.VendorDashboardService,
            module_registry_service_1.ModuleRegistryService,
            package_builder_service_1.PackageBuilderService,
            page_scanner_service_1.PageScannerService,
            page_registry_service_1.PageRegistryService,
            page_menu_sync_service_1.PageMenuSyncService,
            page_registry_bootstrap_service_1.PageRegistryBootstrapService,
            version_control_service_1.VersionControlService,
            industry_patching_service_1.IndustryPatchingService,
            rollback_engine_service_1.RollbackEngineService,
            notion_docs_service_1.NotionDocsService,
            tenant_audit_service_1.TenantAuditService,
            vendor_modules_service_1.VendorModulesService,
            vendor_tenants_service_1.VendorTenantsService,
            vendor_audit_logs_service_1.VendorAuditLogsService,
            vendor_packages_service_1.VendorPackagesService,
            system_health_service_1.SystemHealthService,
            tenant_context_service_1.TenantContextService,
            tenant_context_interceptor_1.TenantContextInterceptor,
            tenant_guard_1.TenantGuard,
            { provide: core_1.APP_GUARD, useClass: tenant_guard_1.TenantGuard },
            super_admin_guard_1.SuperAdminGuard,
            plan_limit_guard_1.PlanLimitGuard,
            feature_flag_guard_1.FeatureFlagGuard,
            module_access_guard_1.ModuleAccessGuard,
            vendor_guard_1.VendorGuard,
            ...CommandHandlers,
            ...QueryHandlers,
        ],
        exports: [
            tenant_provisioning_service_1.TenantProvisioningService,
            usage_tracker_service_1.UsageTrackerService,
            limit_checker_service_1.LimitCheckerService,
            tenant_context_service_1.TenantContextService,
            plan_limit_service_1.PlanLimitService,
            module_access_service_1.ModuleAccessService,
            license_service_1.LicenseService,
            tenant_activity_service_1.TenantActivityService,
            tenant_audit_service_1.TenantAuditService,
        ],
    })
], TenantModule);
//# sourceMappingURL=tenant.module.js.map