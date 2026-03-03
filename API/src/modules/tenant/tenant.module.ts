import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_GUARD } from '@nestjs/core';

// Services
import { TenantProvisioningService } from './services/tenant-provisioning.service';
import { UsageTrackerService } from './services/usage-tracker.service';
import { LimitCheckerService } from './services/limit-checker.service';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { InvoiceGeneratorService } from './services/invoice-generator.service';

// Infrastructure
import { TenantContextService } from './infrastructure/tenant-context.service';
import { TenantContextInterceptor } from './infrastructure/tenant-context.interceptor';
import { TenantGuard } from './infrastructure/tenant.guard';
import { SuperAdminGuard } from './infrastructure/super-admin.guard';
import { PlanLimitGuard } from './infrastructure/plan-limit.guard';
import { FeatureFlagGuard } from './infrastructure/feature-flag.guard';

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
    SubscriptionController,
    BillingController,
  ],
  providers: [
    // Services
    TenantProvisioningService,
    UsageTrackerService,
    LimitCheckerService,
    PaymentGatewayService,
    InvoiceGeneratorService,
    // Infrastructure
    TenantContextService,
    TenantContextInterceptor,
    TenantGuard,
    { provide: APP_GUARD, useClass: TenantGuard },
    SuperAdminGuard,
    PlanLimitGuard,
    FeatureFlagGuard,
    // CQRS
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [
    TenantProvisioningService,
    UsageTrackerService,
    LimitCheckerService,
    TenantContextService,
  ],
})
export class TenantModule {}
