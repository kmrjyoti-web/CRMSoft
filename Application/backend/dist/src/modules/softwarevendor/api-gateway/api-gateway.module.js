"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiGatewayModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../core/prisma/prisma.module");
const api_key_service_1 = require("./services/api-key.service");
const rate_limiter_service_1 = require("./services/rate-limiter.service");
const scope_checker_service_1 = require("./services/scope-checker.service");
const api_logger_service_1 = require("./services/api-logger.service");
const webhook_service_1 = require("./services/webhook.service");
const webhook_signer_service_1 = require("./services/webhook-signer.service");
const webhook_dispatcher_service_1 = require("./services/webhook-dispatcher.service");
const api_analytics_service_1 = require("./services/api-analytics.service");
const rate_limit_tier_service_1 = require("./services/rate-limit-tier.service");
const api_gateway_seeder_service_1 = require("./services/api-gateway-seeder.service");
const api_key_guard_1 = require("./guards/api-key.guard");
const api_scope_guard_1 = require("./guards/api-scope.guard");
const api_rate_limit_guard_1 = require("./guards/api-rate-limit.guard");
const api_logging_interceptor_1 = require("./interceptors/api-logging.interceptor");
const api_response_transform_interceptor_1 = require("./interceptors/api-response-transform.interceptor");
const api_version_middleware_1 = require("./middleware/api-version.middleware");
const api_key_admin_controller_1 = require("./presentation/api-key-admin.controller");
const webhook_admin_controller_1 = require("./presentation/webhook-admin.controller");
const api_log_admin_controller_1 = require("./presentation/api-log-admin.controller");
const api_analytics_admin_controller_1 = require("./presentation/api-analytics-admin.controller");
const public_leads_controller_1 = require("./presentation/public-leads.controller");
const public_contacts_controller_1 = require("./presentation/public-contacts.controller");
const public_organizations_controller_1 = require("./presentation/public-organizations.controller");
const public_activities_controller_1 = require("./presentation/public-activities.controller");
const public_quotations_controller_1 = require("./presentation/public-quotations.controller");
const public_invoices_controller_1 = require("./presentation/public-invoices.controller");
const public_products_controller_1 = require("./presentation/public-products.controller");
const public_payments_controller_1 = require("./presentation/public-payments.controller");
let ApiGatewayModule = class ApiGatewayModule {
    configure(consumer) {
        consumer.apply(api_version_middleware_1.ApiVersionMiddleware).forRoutes('api/v1/*');
    }
};
exports.ApiGatewayModule = ApiGatewayModule;
exports.ApiGatewayModule = ApiGatewayModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [
            api_key_admin_controller_1.ApiKeyAdminController,
            webhook_admin_controller_1.WebhookAdminController,
            api_log_admin_controller_1.ApiLogAdminController,
            api_analytics_admin_controller_1.ApiAnalyticsAdminController,
            public_leads_controller_1.PublicLeadsController,
            public_contacts_controller_1.PublicContactsController,
            public_organizations_controller_1.PublicOrganizationsController,
            public_activities_controller_1.PublicActivitiesController,
            public_quotations_controller_1.PublicQuotationsController,
            public_invoices_controller_1.PublicInvoicesController,
            public_products_controller_1.PublicProductsController,
            public_payments_controller_1.PublicPaymentsController,
        ],
        providers: [
            api_key_service_1.ApiKeyService,
            rate_limiter_service_1.RateLimiterService,
            scope_checker_service_1.ScopeCheckerService,
            api_logger_service_1.ApiLoggerService,
            webhook_service_1.WebhookService,
            webhook_signer_service_1.WebhookSignerService,
            webhook_dispatcher_service_1.WebhookDispatcherService,
            api_analytics_service_1.ApiAnalyticsService,
            rate_limit_tier_service_1.RateLimitTierService,
            api_gateway_seeder_service_1.ApiGatewaySeederService,
            api_key_guard_1.ApiKeyGuard,
            api_scope_guard_1.ApiScopeGuard,
            api_rate_limit_guard_1.ApiRateLimitGuard,
            api_logging_interceptor_1.ApiLoggingInterceptor,
            api_response_transform_interceptor_1.ApiResponseTransformInterceptor,
        ],
        exports: [
            api_key_service_1.ApiKeyService,
            rate_limiter_service_1.RateLimiterService,
            scope_checker_service_1.ScopeCheckerService,
            api_logger_service_1.ApiLoggerService,
            webhook_service_1.WebhookService,
            webhook_dispatcher_service_1.WebhookDispatcherService,
            api_analytics_service_1.ApiAnalyticsService,
            rate_limit_tier_service_1.RateLimitTierService,
            api_gateway_seeder_service_1.ApiGatewaySeederService,
        ],
    })
], ApiGatewayModule);
//# sourceMappingURL=api-gateway.module.js.map