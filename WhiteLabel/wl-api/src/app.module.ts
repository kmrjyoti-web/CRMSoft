import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { PartnersModule } from './modules/partners/partners.module';
import { BrandingModule } from './modules/branding/branding.module';
import { DomainsModule } from './modules/domains/domains.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';
import { ProvisioningModule } from './modules/provisioning/provisioning.module';
import { GitBranchesModule } from './modules/git-branches/git-branches.module';
import { DeploymentsModule } from './modules/deployments/deployments.module';
import { ErrorsModule } from './modules/errors/errors.module';
import { TestsModule } from './modules/tests/tests.module';
import { DevRequestsModule } from './modules/dev-requests/dev-requests.module';
import { BillingModule } from './modules/billing/billing.module';
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { SlaAlertsModule } from './modules/sla-alerts/sla-alerts.module';
import { ScalingModule } from './modules/scaling/scaling.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PartnersModule,
    BrandingModule,
    DomainsModule,
    PricingModule,
    AuditModule,
    HealthModule,
    ProvisioningModule,
    GitBranchesModule,
    DeploymentsModule,
    ErrorsModule,
    TestsModule,
    DevRequestsModule,
    BillingModule,
    FeatureFlagsModule,
    WebhooksModule,
    SlaAlertsModule,
    ScalingModule,
  ],
})
export class AppModule {}
