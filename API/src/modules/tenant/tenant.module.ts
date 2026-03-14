import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_GUARD } from '@nestjs/core';

// Services
import { TenantProvisioningService } from './services/tenant-provisioning.service';
import { UsageTrackerService } from './services/usage-tracker.service';
import { LimitCheckerService } from './services/limit-checker.service';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { InvoiceGeneratorService } from './services/invoice-generator.service';
import { PlanLimitService } from './services/plan-limit.service';
import { TenantProfileService } from './services/tenant-profile.service';
import { LicenseService } from './services/license.service';
import { SoftwareOfferService } from './services/software-offer.service';
import { ModuleDefinitionService } from './services/module-definition.service';
import { ModuleAccessService } from './services/module-access.service';
import { TenantActivityService } from './services/tenant-activity.service';
import { VendorDashboardService } from './services/vendor-dashboard.service';
import { ModuleRegistryService } from './services/module-registry.service';
import { PackageBuilderService } from './services/package-builder.service';
import { PageScannerService } from './services/page-scanner.service';
import { PageRegistryService } from './services/page-registry.service';
import { PageMenuSyncService } from './services/page-menu-sync.service';
import { PageRegistryBootstrapService } from './services/page-registry-bootstrap.service';
import { VersionControlService } from './services/version-control.service';
import { IndustryPatchingService } from './services/industry-patching.service';
import { RollbackEngineService } from './services/rollback-engine.service';
import { NotionDocsService } from './services/notion-docs.service';
import { TenantAuditService } from './services/tenant-audit.service';

// Infrastructure
import { TenantContextService } from './infrastructure/tenant-context.service';
import { TenantContextInterceptor } from './infrastructure/tenant-context.interceptor';
import { TenantGuard } from './infrastructure/tenant.guard';
import { SuperAdminGuard } from './infrastructure/super-admin.guard';
import { PlanLimitGuard } from './infrastructure/plan-limit.guard';
import { FeatureFlagGuard } from './infrastructure/feature-flag.guard';
import { ModuleAccessGuard } from './infrastructure/module-access.guard';

// Command Handlers
import { CreateTenantHandler } from './application/commands/create-tenant/create-tenant.handler';
import { UpdateTenantHandler } from './application/commands/update-tenant/update-tenant.handler';
import { SuspendTenantHandler } from './application/commands/suspend-tenant/suspend-tenant.handler';
import { ActivateTenantHandler } from './application/commands/activate-tenant/activate-tenant.handler';
import { CreatePlanHandler } from './application/commands/create-plan/create-plan.handler';
import { UpdatePlanHandler } from './application/commands/update-plan/update-plan.handler';
import { DeactivatePlanHandler } from './application/commands/deactivate-plan/deactivate-plan.handler';
import { SubscribeHandler } from './application/commands/subscribe/subscribe.handler';
import { CancelSubscriptionHandler } from './application/commands/cancel-subscription/cancel-subscription.handler';
import { ChangePlanHandler } from './application/commands/change-plan/change-plan.handler';
import { RecordPaymentHandler } from './application/commands/record-payment/record-payment.handler';
import { GenerateInvoiceHandler } from './application/commands/generate-invoice/generate-invoice.handler';
import { CreateSuperAdminHandler } from './application/commands/create-super-admin/create-super-admin.handler';
import { UpdateTenantSettingsHandler } from './application/commands/update-tenant-settings/update-tenant-settings.handler';
import { CompleteOnboardingStepHandler } from './application/commands/complete-onboarding-step/complete-onboarding-step.handler';
import { RecalculateUsageHandler } from './application/commands/recalculate-usage/recalculate-usage.handler';

// Query Handlers
import { GetTenantByIdHandler } from './application/queries/get-tenant-by-id/handler';
import { ListTenantsHandler } from './application/queries/list-tenants/handler';
import { GetPlanByIdHandler } from './application/queries/get-plan-by-id/handler';
import { ListPlansHandler } from './application/queries/list-plans/handler';
import { GetSubscriptionHandler } from './application/queries/get-subscription/handler';
import { GetTenantUsageHandler } from './application/queries/get-tenant-usage/handler';
import { ListInvoicesHandler } from './application/queries/list-invoices/handler';
import { GetTenantDashboardHandler } from './application/queries/get-tenant-dashboard/handler';
import { ListSuperAdminsHandler } from './application/queries/list-super-admins/handler';

// Controllers
import { TenantAdminController } from './presentation/tenant-admin.controller';
import { PlanAdminController } from './presentation/plan-admin.controller';
import { SubscriptionController } from './presentation/subscription.controller';
import { BillingController } from './presentation/billing.controller';
import { PlanLimitController } from './presentation/plan-limit.controller';
import { VendorDashboardController } from './presentation/vendor-dashboard.controller';
import { TenantProfileController } from './presentation/tenant-profile.controller';
import { LicenseController } from './presentation/license.controller';
import { SoftwareOfferController } from './presentation/software-offer.controller';
import { ModuleAccessController } from './presentation/module-access.controller';
import { VendorModulesController } from './presentation/vendor-modules.controller';
import { VendorLicensesController } from './presentation/vendor-licenses.controller';
import { VendorTenantsController } from './presentation/vendor-tenants.controller';
import { VendorPackagesController } from './presentation/vendor-packages.controller';
import { VendorPartnersController } from './presentation/vendor-partners.controller';
import { VendorDevRequestsController } from './presentation/vendor-dev-requests.controller';
import { VendorWalletController } from './presentation/vendor-wallet.controller';
import { VendorAiTokensController } from './presentation/vendor-ai-tokens.controller';
import { VendorWebhooksController } from './presentation/vendor-webhooks.controller';
import { SystemHealthController } from './presentation/system-health.controller';
import { VendorErrorLogsController } from './presentation/vendor-error-logs.controller';
import { VendorDbAdminController } from './presentation/vendor-db-admin.controller';
import { VendorAuditLogsController } from './presentation/vendor-audit-logs.controller';
import { ModuleRegistryController } from './presentation/module-registry.controller';
import { PackageBuilderController } from './presentation/package-builder.controller';
import { PageRegistryController } from './presentation/page-registry.controller';
import { VendorVersionsController, TenantForceUpdateController } from './presentation/vendor-versions.controller';
import { VendorTenantAuditController } from './presentation/vendor-tenant-audit.controller';
import { TenantAuditStatusController } from './presentation/tenant-audit-status.controller';

// Guards
import { VendorGuard } from './infrastructure/vendor.guard';

const CommandHandlers = [
  CreateTenantHandler,
  UpdateTenantHandler,
  SuspendTenantHandler,
  ActivateTenantHandler,
  CreatePlanHandler,
  UpdatePlanHandler,
  DeactivatePlanHandler,
  SubscribeHandler,
  CancelSubscriptionHandler,
  ChangePlanHandler,
  RecordPaymentHandler,
  GenerateInvoiceHandler,
  CreateSuperAdminHandler,
  UpdateTenantSettingsHandler,
  CompleteOnboardingStepHandler,
  RecalculateUsageHandler,
];

const QueryHandlers = [
  GetTenantByIdHandler,
  ListTenantsHandler,
  GetPlanByIdHandler,
  ListPlansHandler,
  GetSubscriptionHandler,
  GetTenantUsageHandler,
  ListInvoicesHandler,
  GetTenantDashboardHandler,
  ListSuperAdminsHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [
    TenantAdminController,
    PlanAdminController,
    PlanLimitController,
    SubscriptionController,
    BillingController,
    VendorDashboardController,
    TenantProfileController,
    LicenseController,
    SoftwareOfferController,
    ModuleAccessController,
    VendorModulesController,
    VendorLicensesController,
    VendorTenantsController,
    VendorPackagesController,
    VendorPartnersController,
    VendorDevRequestsController,
    VendorWalletController,
    VendorAiTokensController,
    VendorWebhooksController,
    SystemHealthController,
    VendorErrorLogsController,
    VendorDbAdminController,
    VendorAuditLogsController,
    ModuleRegistryController,
    PackageBuilderController,
    PageRegistryController,
    VendorVersionsController,
    TenantForceUpdateController,
    VendorTenantAuditController,
    TenantAuditStatusController,
  ],
  providers: [
    // Services
    TenantProvisioningService,
    UsageTrackerService,
    LimitCheckerService,
    PaymentGatewayService,
    InvoiceGeneratorService,
    PlanLimitService,
    TenantProfileService,
    LicenseService,
    SoftwareOfferService,
    ModuleDefinitionService,
    ModuleAccessService,
    TenantActivityService,
    VendorDashboardService,
    ModuleRegistryService,
    PackageBuilderService,
    PageScannerService,
    PageRegistryService,
    PageMenuSyncService,
    PageRegistryBootstrapService,
    VersionControlService,
    IndustryPatchingService,
    RollbackEngineService,
    NotionDocsService,
    TenantAuditService,
    // Infrastructure
    TenantContextService,
    TenantContextInterceptor,
    TenantGuard,
    { provide: APP_GUARD, useClass: TenantGuard },
    SuperAdminGuard,
    PlanLimitGuard,
    FeatureFlagGuard,
    ModuleAccessGuard,
    VendorGuard,
    // CQRS
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [
    TenantProvisioningService,
    UsageTrackerService,
    LimitCheckerService,
    TenantContextService,
    PlanLimitService,
    ModuleAccessService,
    LicenseService,
    TenantActivityService,
    TenantAuditService,
  ],
})
export class TenantModule {}
