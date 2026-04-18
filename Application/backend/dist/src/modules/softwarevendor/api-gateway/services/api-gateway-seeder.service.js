"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ApiGatewaySeederService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiGatewaySeederService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const rate_limit_tier_service_1 = require("./rate-limit-tier.service");
let ApiGatewaySeederService = ApiGatewaySeederService_1 = class ApiGatewaySeederService {
    constructor(prisma, rateLimitTier) {
        this.prisma = prisma;
        this.rateLimitTier = rateLimitTier;
        this.logger = new common_1.Logger(ApiGatewaySeederService_1.name);
    }
    async seedAll(tenantId) {
        await Promise.all([
            this.seedCronJobs(),
            this.seedTenantConfigs(tenantId),
            this.rateLimitTier.seedTiers(),
        ]);
        this.logger.log(`API Gateway seeds completed for tenant ${tenantId}`);
    }
    async seedCronJobs() {
        const jobs = [
            {
                jobCode: 'API_KEY_DAILY_RESET',
                jobName: 'API Key Daily Counter Reset',
                cronExpression: '0 0 * * *',
                description: 'Resets daily request counters for all API keys at midnight',
                moduleName: 'api-gateway',
            },
            {
                jobCode: 'API_KEY_HOURLY_RESET',
                jobName: 'API Key Hourly Counter Reset',
                cronExpression: '0 * * * *',
                description: 'Resets hourly request counters for all API keys every hour',
                moduleName: 'api-gateway',
            },
            {
                jobCode: 'API_KEY_EXPIRY_CHECK',
                jobName: 'API Key Expiry Check',
                cronExpression: '*/15 * * * *',
                description: 'Marks expired API keys every 15 minutes',
                moduleName: 'api-gateway',
            },
            {
                jobCode: 'WEBHOOK_RETRY_FAILED',
                jobName: 'Webhook Failed Delivery Retry',
                cronExpression: '*/5 * * * *',
                description: 'Retries failed webhook deliveries with exponential backoff',
                moduleName: 'api-gateway',
            },
            {
                jobCode: 'API_LOG_CLEANUP',
                jobName: 'API Log Cleanup',
                cronExpression: '0 3 * * *',
                description: 'Cleans up API request logs older than retention period',
                moduleName: 'api-gateway',
            },
            {
                jobCode: 'RATE_LIMITER_CLEANUP',
                jobName: 'Rate Limiter Memory Cleanup',
                cronExpression: '*/30 * * * *',
                description: 'Cleans up stale rate limit tracking entries from memory',
                moduleName: 'api-gateway',
            },
        ];
        for (const job of jobs) {
            await this.prisma.working.cronJobConfig.upsert({
                where: { jobCode: job.jobCode },
                update: {},
                create: {
                    jobCode: job.jobCode,
                    jobName: job.jobName,
                    cronExpression: job.cronExpression,
                    description: job.description,
                    moduleName: job.moduleName,
                },
            });
        }
        this.logger.log('API Gateway cron jobs seeded');
    }
    async seedTenantConfigs(tenantId) {
        const configs = [
            { configKey: 'api_gateway.enabled', configValue: 'true', displayName: 'API Gateway Enabled', description: 'Enable/disable public API access' },
            { configKey: 'api_gateway.default_rate_plan', configValue: 'FREE', displayName: 'Default Rate Plan', description: 'Default rate limit plan for new API keys' },
            { configKey: 'api_gateway.log_retention_days', configValue: '90', displayName: 'Log Retention Days', description: 'Number of days to retain API request logs' },
            { configKey: 'api_gateway.webhook_retry_enabled', configValue: 'true', displayName: 'Webhook Retry Enabled', description: 'Enable automatic webhook retry on failure' },
            { configKey: 'api_gateway.max_api_keys', configValue: '10', displayName: 'Max API Keys', description: 'Maximum number of API keys per tenant' },
            { configKey: 'api_gateway.max_webhook_endpoints', configValue: '10', displayName: 'Max Webhook Endpoints', description: 'Maximum webhook endpoints per tenant' },
        ];
        for (const config of configs) {
            await this.prisma.tenantConfig.upsert({
                where: { tenantId_configKey: { tenantId, configKey: config.configKey } },
                update: {},
                create: {
                    tenantId,
                    category: 'CUSTOM',
                    configKey: config.configKey,
                    configValue: config.configValue,
                    displayName: config.displayName,
                    description: config.description,
                },
            });
        }
        this.logger.log('API Gateway tenant configs seeded');
    }
};
exports.ApiGatewaySeederService = ApiGatewaySeederService;
exports.ApiGatewaySeederService = ApiGatewaySeederService = ApiGatewaySeederService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        rate_limit_tier_service_1.RateLimitTierService])
], ApiGatewaySeederService);
//# sourceMappingURL=api-gateway-seeder.service.js.map