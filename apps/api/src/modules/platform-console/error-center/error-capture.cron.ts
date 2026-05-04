import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { EscalationService } from './escalation.service';

@Injectable()
export class ErrorCaptureCron {
  private readonly logger = new Logger(ErrorCaptureCron.name);

  constructor(
    private readonly db: PlatformConsolePrismaService,
    private readonly escalationService: EscalationService,
  ) {}

  // Every 5 min — check threshold auto-escalation rules
  @Cron('*/5 * * * *', {
    name: 'error-threshold-check',
    timeZone: 'Asia/Kolkata',
  })
  async checkThresholds() {
    try {
      await this.escalationService.checkThresholdRules();
    } catch (error) {
      this.logger.error(
        `ErrorCaptureCron.checkThresholds failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }

  // Daily 8 AM IST (2:30 AM UTC) — aggregate daily error trends
  @Cron('30 2 * * *', {
    name: 'daily-error-trend',
    timeZone: 'Asia/Kolkata',
  })
  async dailyTrend() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().slice(0, 10);

      const bySeverity = await this.db.globalErrorLog.groupBy({
        by: ['severity', 'brandId', 'verticalType'],
        _count: { id: true },
        where: {
          createdAt: {
            gte: new Date(dateStr + 'T00:00:00Z'),
            lt: new Date(new Date(dateStr + 'T00:00:00Z').getTime() + 86400000),
          },
        },
      });

      const totalErrors = bySeverity.reduce((sum, r) => sum + r._count.id, 0);
      const criticalCount = bySeverity
        .filter((r) => r.severity === 'CRITICAL')
        .reduce((sum, r) => sum + r._count.id, 0);
      const highCount = bySeverity
        .filter((r) => r.severity === 'HIGH')
        .reduce((sum, r) => sum + r._count.id, 0);
      const resolvedCount = await this.db.globalErrorLog.count({
        where: {
          resolvedAt: {
            gte: new Date(dateStr + 'T00:00:00Z'),
            lt: new Date(new Date(dateStr + 'T00:00:00Z').getTime() + 86400000),
          },
        },
      });

      await this.db.errorTrend.upsert({
        where: {
          period_periodDate_brandId: {
            period: 'DAILY',
            periodDate: dateStr,
            brandId: null as any,
          },
        },
        create: {
          period: 'DAILY',
          periodDate: dateStr,
          totalErrors,
          criticalCount,
          highCount,
          resolvedCount,
        },
        update: { totalErrors, criticalCount, highCount, resolvedCount },
      });

      this.logger.log(
        `Daily trend aggregated for ${dateStr}: ${totalErrors} total, ${criticalCount} critical`,
      );
    } catch (error) {
      this.logger.error(
        `ErrorCaptureCron.dailyTrend failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }

  // Weekly Sunday 6 AM IST (12:30 AM UTC Sunday)
  @Cron('30 0 * * 0', {
    name: 'weekly-error-trend',
    timeZone: 'Asia/Kolkata',
  })
  async weeklyTrend() {
    try {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      const weekStr = `${now.getFullYear()}-W${String(Math.ceil(now.getDate() / 7)).padStart(2, '0')}`;

      const [totalErrors, criticalCount, highCount, resolvedCount] =
        await Promise.all([
          this.db.globalErrorLog.count({
            where: { createdAt: { gte: weekStart } },
          }),
          this.db.globalErrorLog.count({
            where: { createdAt: { gte: weekStart }, severity: 'CRITICAL' },
          }),
          this.db.globalErrorLog.count({
            where: { createdAt: { gte: weekStart }, severity: 'HIGH' },
          }),
          this.db.globalErrorLog.count({
            where: {
              resolvedAt: { gte: weekStart },
            },
          }),
        ]);

      await this.db.errorTrend.upsert({
        where: {
          period_periodDate_brandId: {
            period: 'WEEKLY',
            periodDate: weekStr,
            brandId: null as any,
          },
        },
        create: {
          period: 'WEEKLY',
          periodDate: weekStr,
          totalErrors,
          criticalCount,
          highCount,
          resolvedCount,
        },
        update: { totalErrors, criticalCount, highCount, resolvedCount },
      });

      this.logger.log(
        `Weekly trend aggregated for ${weekStr}: ${totalErrors} total`,
      );
    } catch (error) {
      this.logger.error(
        `ErrorCaptureCron.weeklyTrend failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }
}
