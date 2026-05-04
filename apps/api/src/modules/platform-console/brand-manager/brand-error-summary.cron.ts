import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';

@Injectable()
export class BrandErrorSummaryCron {
  private readonly logger = new Logger(BrandErrorSummaryCron.name);

  constructor(private readonly db: PlatformConsolePrismaService) {}

  @Cron('30 0 1 * *', { name: 'monthly-brand-error-summary', timeZone: 'Asia/Kolkata' })
  async aggregateMonthlyErrors() {
    try {
      this.logger.log('Starting monthly brand error summary aggregation');

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const now = new Date();
      const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // Get all errors from last 30 days grouped by brandId
      const errors = await this.db.globalErrorLog.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
      });

      // Group by brandId
      const brandMap = new Map<string, typeof errors>();
      for (const error of errors) {
        const brandId = error.brandId || 'UNKNOWN';
        if (!brandMap.has(brandId)) {
          brandMap.set(brandId, []);
        }
        brandMap.get(brandId)!.push(error);
      }

      for (const [brandId, brandErrors] of brandMap) {
        const totalErrors = brandErrors.length;
        const criticalCount = brandErrors.filter((e) => e.severity === 'CRITICAL').length;
        const resolvedCount = brandErrors.filter((e) => e.resolvedAt !== null).length;

        // Top 5 modules by error count
        const moduleCountMap = new Map<string, number>();
        for (const e of brandErrors) {
          const mod = (e as any).moduleCode || 'unknown';
          moduleCountMap.set(mod, (moduleCountMap.get(mod) || 0) + 1);
        }
        const topModules = [...moduleCountMap.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([moduleCode, count]) => ({ moduleCode, count }));

        await this.db.brandErrorSummary.upsert({
          where: { brandId_period: { brandId, period } },
          update: {
            totalErrors,
            criticalCount,
            resolvedCount,
            topModules: topModules as any,
            updatedAt: new Date(),
          },
          create: {
            brandId,
            period,
            totalErrors,
            criticalCount,
            resolvedCount,
            topModules: topModules as any,
          },
        });
      }

      this.logger.log(`Monthly brand error summary completed for ${brandMap.size} brands`);
    } catch (error) {
      this.logger.error('Failed to aggregate monthly brand errors', (error as Error).stack);
    }
  }
}
