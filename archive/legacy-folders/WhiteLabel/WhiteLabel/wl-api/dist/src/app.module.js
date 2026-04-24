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
const prisma_module_1 = require("./modules/prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const partners_module_1 = require("./modules/partners/partners.module");
const branding_module_1 = require("./modules/branding/branding.module");
const domains_module_1 = require("./modules/domains/domains.module");
const pricing_module_1 = require("./modules/pricing/pricing.module");
const audit_module_1 = require("./modules/audit/audit.module");
const health_module_1 = require("./modules/health/health.module");
const provisioning_module_1 = require("./modules/provisioning/provisioning.module");
const git_branches_module_1 = require("./modules/git-branches/git-branches.module");
const deployments_module_1 = require("./modules/deployments/deployments.module");
const errors_module_1 = require("./modules/errors/errors.module");
const tests_module_1 = require("./modules/tests/tests.module");
const dev_requests_module_1 = require("./modules/dev-requests/dev-requests.module");
const billing_module_1 = require("./modules/billing/billing.module");
const feature_flags_module_1 = require("./modules/feature-flags/feature-flags.module");
const webhooks_module_1 = require("./modules/webhooks/webhooks.module");
const sla_alerts_module_1 = require("./modules/sla-alerts/sla-alerts.module");
const scaling_module_1 = require("./modules/scaling/scaling.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            partners_module_1.PartnersModule,
            branding_module_1.BrandingModule,
            domains_module_1.DomainsModule,
            pricing_module_1.PricingModule,
            audit_module_1.AuditModule,
            health_module_1.HealthModule,
            provisioning_module_1.ProvisioningModule,
            git_branches_module_1.GitBranchesModule,
            deployments_module_1.DeploymentsModule,
            errors_module_1.ErrorsModule,
            tests_module_1.TestsModule,
            dev_requests_module_1.DevRequestsModule,
            billing_module_1.BillingModule,
            feature_flags_module_1.FeatureFlagsModule,
            webhooks_module_1.WebhooksModule,
            sla_alerts_module_1.SlaAlertsModule,
            scaling_module_1.ScalingModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map