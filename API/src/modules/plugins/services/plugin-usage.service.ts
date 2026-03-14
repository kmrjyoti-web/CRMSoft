import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

interface UsageSummary {
  pluginCode: string;
  pluginName: string;
  category: string;
  monthlyUsage: number;
  monthlyLimit: number | null;
  usagePercent: number | null;
  lastUsedAt: Date | null;
  isEnabled: boolean;
}

interface UsageStats {
  totalPlugins: number;
  activePlugins: number;
  totalUsage: number;
  byCategory: Record<string, number>;
}

@Injectable()
export class PluginUsageService {
  private readonly logger = new Logger(PluginUsageService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get usage summary for all installed plugins of a tenant.
   */
  async getTenantUsage(tenantId: string): Promise<UsageSummary[]> {
    const tenantPlugins = await this.prisma.tenantPlugin.findMany({
      where: { tenantId },
      include: { plugin: true },
      orderBy: { plugin: { category: 'asc' } },
    });

    return tenantPlugins.map((tp) => ({
      pluginCode: tp.plugin.code,
      pluginName: tp.plugin.name,
      category: tp.plugin.category,
      monthlyUsage: tp.monthlyUsage,
      monthlyLimit: tp.monthlyLimit,
      usagePercent: tp.monthlyLimit
        ? Math.round((tp.monthlyUsage / tp.monthlyLimit) * 100)
        : null,
      lastUsedAt: tp.lastUsedAt,
      isEnabled: tp.isEnabled,
    }));
  }

  /**
   * Get aggregated usage stats for a tenant.
   */
  async getTenantStats(tenantId: string): Promise<UsageStats> {
    const tenantPlugins = await this.prisma.tenantPlugin.findMany({
      where: { tenantId },
      include: { plugin: true },
    });

    const byCategory: Record<string, number> = {};
    let totalUsage = 0;
    let activePlugins = 0;

    for (const tp of tenantPlugins) {
      totalUsage += tp.monthlyUsage;
      if (tp.isEnabled) activePlugins++;

      const cat = tp.plugin.category;
      byCategory[cat] = (byCategory[cat] || 0) + tp.monthlyUsage;
    }

    return {
      totalPlugins: tenantPlugins.length,
      activePlugins,
      totalUsage,
      byCategory,
    };
  }

  /**
   * Reset monthly usage for all plugins (called by cron on 1st of month).
   */
  async resetMonthlyUsage(): Promise<number> {
    const result = await this.prisma.tenantPlugin.updateMany({
      where: { monthlyUsage: { gt: 0 } },
      data: {
        monthlyUsage: 0,
        usageResetAt: new Date(),
      },
    });

    this.logger.log(`Monthly usage reset for ${result.count} tenant plugins`);
    return result.count;
  }

  /**
   * Check if a plugin has exceeded its monthly limit.
   */
  async checkQuota(
    tenantId: string,
    pluginCode: string,
  ): Promise<{ allowed: boolean; usage: number; limit: number | null }> {
    const plugin = await this.prisma.pluginRegistry.findUnique({
      where: { code: pluginCode },
    });
    if (!plugin) return { allowed: false, usage: 0, limit: null };

    const tp = await this.prisma.tenantPlugin.findUnique({
      where: {
        tenantId_pluginId: { tenantId, pluginId: plugin.id },
      },
    });

    if (!tp || !tp.isEnabled) {
      return { allowed: false, usage: 0, limit: null };
    }

    const allowed = tp.monthlyLimit === null || tp.monthlyUsage < tp.monthlyLimit;
    return {
      allowed,
      usage: tp.monthlyUsage,
      limit: tp.monthlyLimit,
    };
  }

  /**
   * Get plugin usage for hook logs (recent activity).
   */
  async getRecentActivity(
    tenantId: string,
    pluginCode?: string,
    limit = 50,
  ) {
    const plugin = pluginCode
      ? await this.prisma.pluginRegistry.findUnique({ where: { code: pluginCode } })
      : null;

    return this.prisma.pluginHookLog.findMany({
      where: {
        tenantId,
        ...(plugin ? { pluginId: plugin.id } : {}),
      },
      orderBy: { executedAt: 'desc' },
      take: limit,
    });
  }
}
