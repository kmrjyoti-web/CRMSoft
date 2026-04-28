import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { RedisCacheService } from '../../modules/core/cache/cache.service';

const CACHE_TTL = 10 * 60; // 10 minutes

@Injectable()
export class FeatureGateService {
  private readonly logger = new Logger(FeatureGateService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisCacheService,
  ) {}

  /**
   * Returns the featureFlags JSON from SubscriptionPackage for a given planCode.
   * Used for WL-tier plans (WL_FREE, WL_STARTER, WL_PROFESSIONAL, WL_ENTERPRISE).
   * Falls back to empty object if plan not found.
   */
  async getPlanFeatures(planCode: string): Promise<Record<string, boolean>> {
    const cacheKey = `plan-features:${planCode.toUpperCase()}`;
    const cached = await this.cache.get<Record<string, boolean>>(cacheKey);
    if (cached) return cached;

    const pkg = await this.prisma.platform.subscriptionPackage.findUnique({
      where: { packageCode: planCode.toUpperCase() },
      select: { featureFlags: true },
    }).catch(() => null);

    const flags = (pkg?.featureFlags as Record<string, boolean>) ?? {};
    await this.cache.set(cacheKey, flags, CACHE_TTL);
    return flags;
  }

  async isFeatureEnabled(planCode: string | null | undefined, feature: string): Promise<boolean> {
    if (!planCode) return false;
    const flags = await this.getPlanFeatures(planCode);
    return flags[feature] === true;
  }

  /** Returns plan level number for plan comparison. WL_FREE=0 … WL_ENTERPRISE=3. */
  getPlanLevel(planCode: string | null | undefined): number {
    const levels: Record<string, number> = {
      WL_FREE: 0, FREE: 0,
      WL_STARTER: 1, STARTER: 1,
      WL_PROFESSIONAL: 2, PROFESSIONAL: 2,
      WL_ENTERPRISE: 3, ENTERPRISE: 3,
    };
    if (!planCode) return -1;
    return levels[planCode.toUpperCase()] ?? -1;
  }

  async invalidatePlanCache(planCode: string): Promise<void> {
    await this.cache.invalidate(`plan-features:${planCode.toUpperCase()}`);
    this.logger.log(`Plan features cache invalidated: ${planCode}`);
  }
}
