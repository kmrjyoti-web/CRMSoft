import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RateLimitTierService } from './rate-limit-tier.service';

@Injectable()
export class ApiGatewaySeederService {
  private readonly logger = new Logger(ApiGatewaySeederService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rateLimitTier: RateLimitTierService,
  ) {}

  async seedAll(tenantId: string) {
    await Promise.all([
      this.seedCronJobs(),
      this.seedTenantConfigs(tenantId),
      this.rateLimitTier.seedTiers(),
    ]);
    this.logger.log(`API Gateway seeds completed for tenant ${tenantId}`);
  }

  private async seedCronJobs() {
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
      await this.prisma.cronJobConfig.upsert({
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

  private async seedTenantConfigs(tenantId: string) {
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
}
