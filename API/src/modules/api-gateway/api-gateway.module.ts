import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { PrismaModule } from '../../core/prisma/prisma.module';

// Services
import { ApiKeyService } from './services/api-key.service';
import { RateLimiterService } from './services/rate-limiter.service';
import { ScopeCheckerService } from './services/scope-checker.service';
import { ApiLoggerService } from './services/api-logger.service';
import { WebhookService } from './services/webhook.service';
import { WebhookSignerService } from './services/webhook-signer.service';
import { WebhookDispatcherService } from './services/webhook-dispatcher.service';
import { ApiAnalyticsService } from './services/api-analytics.service';
import { RateLimitTierService } from './services/rate-limit-tier.service';
import { ApiGatewaySeederService } from './services/api-gateway-seeder.service';

// Guards
import { ApiKeyGuard } from './guards/api-key.guard';
import { ApiScopeGuard } from './guards/api-scope.guard';
import { ApiRateLimitGuard } from './guards/api-rate-limit.guard';

// Interceptors
import { ApiLoggingInterceptor } from './interceptors/api-logging.interceptor';
import { ApiResponseTransformInterceptor } from './interceptors/api-response-transform.interceptor';

// Middleware
import { ApiVersionMiddleware } from './middleware/api-version.middleware';

// Admin Controllers
import { ApiKeyAdminController } from './presentation/api-key-admin.controller';
import { WebhookAdminController } from './presentation/webhook-admin.controller';
import { ApiLogAdminController } from './presentation/api-log-admin.controller';
import { ApiAnalyticsAdminController } from './presentation/api-analytics-admin.controller';

// Public API Controllers
import { PublicLeadsController } from './presentation/public-leads.controller';
import { PublicContactsController } from './presentation/public-contacts.controller';
import { PublicOrganizationsController } from './presentation/public-organizations.controller';
import { PublicActivitiesController } from './presentation/public-activities.controller';
import { PublicQuotationsController } from './presentation/public-quotations.controller';
import { PublicInvoicesController } from './presentation/public-invoices.controller';
import { PublicProductsController } from './presentation/public-products.controller';
import { PublicPaymentsController } from './presentation/public-payments.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    // Admin
    ApiKeyAdminController,
    WebhookAdminController,
    ApiLogAdminController,
    ApiAnalyticsAdminController,
    // Public API
    PublicLeadsController,
    PublicContactsController,
    PublicOrganizationsController,
    PublicActivitiesController,
    PublicQuotationsController,
    PublicInvoicesController,
    PublicProductsController,
    PublicPaymentsController,
  ],
  providers: [
    // Core services
    ApiKeyService,
    RateLimiterService,
    ScopeCheckerService,
    ApiLoggerService,
    // Webhook services
    WebhookService,
    WebhookSignerService,
    WebhookDispatcherService,
    // Analytics & tiers
    ApiAnalyticsService,
    RateLimitTierService,
    // Seeder
    ApiGatewaySeederService,
    // Guards
    ApiKeyGuard,
    ApiScopeGuard,
    ApiRateLimitGuard,
    // Interceptors
    ApiLoggingInterceptor,
    ApiResponseTransformInterceptor,
  ],
  exports: [
    ApiKeyService,
    RateLimiterService,
    ScopeCheckerService,
    ApiLoggerService,
    WebhookService,
    WebhookDispatcherService,
    ApiAnalyticsService,
    RateLimitTierService,
    ApiGatewaySeederService,
  ],
})
export class ApiGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiVersionMiddleware).forRoutes('api/v1/*');
  }
}
