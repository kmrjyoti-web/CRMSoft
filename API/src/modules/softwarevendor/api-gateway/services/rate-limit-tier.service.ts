import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class RateLimitTierService {
  private readonly logger = new Logger(RateLimitTierService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getTierForPlan(planCode: string) {
    return this.prisma.working.rateLimitTier.findUnique({ where: { planCode } });
  }

  async getAllTiers() {
    return this.prisma.working.rateLimitTier.findMany({
      where: { isActive: true },
      orderBy: { requestsPerDay: 'asc' },
    });
  }

  async seedTiers() {
    const tiers = [
      { planCode: 'FREE', planName: 'Free', requestsPerMinute: 10, requestsPerHour: 100, requestsPerDay: 500, maxApiKeys: 1, maxWebhookEndpoints: 2, webhookRatePerMinute: 5, burstLimit: 5 },
      { planCode: 'STARTER', planName: 'Starter', requestsPerMinute: 20, requestsPerHour: 500, requestsPerDay: 5000, maxApiKeys: 3, maxWebhookEndpoints: 5, webhookRatePerMinute: 10, burstLimit: 10 },
      { planCode: 'GROWTH', planName: 'Growth', requestsPerMinute: 50, requestsPerHour: 2000, requestsPerDay: 20000, maxApiKeys: 10, maxWebhookEndpoints: 15, webhookRatePerMinute: 30, burstLimit: 20 },
      { planCode: 'BUSINESS', planName: 'Business', requestsPerMinute: 100, requestsPerHour: 5000, requestsPerDay: 50000, maxApiKeys: 25, maxWebhookEndpoints: 50, webhookRatePerMinute: 60, burstLimit: 50 },
      { planCode: 'ENTERPRISE', planName: 'Enterprise', requestsPerMinute: 500, requestsPerHour: 20000, requestsPerDay: 200000, maxApiKeys: 100, maxWebhookEndpoints: 200, webhookRatePerMinute: 200, burstLimit: 100 },
    ];

    for (const tier of tiers) {
      await this.prisma.working.rateLimitTier.upsert({
        where: { planCode: tier.planCode },
        update: {},
        create: tier,
      });
    }

    this.logger.log('Rate limit tiers seeded');
  }
}
