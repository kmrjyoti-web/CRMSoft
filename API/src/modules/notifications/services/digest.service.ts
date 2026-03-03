import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class DigestService {
  private readonly logger = new Logger(DigestService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Called by cron-engine (DIGEST_HOURLY). */
  async processHourlyDigest() {
    await this.processDigest('HOURLY', 60);
  }

  /** Called by cron-engine (DIGEST_DAILY). */
  async processDailyDigest() {
    await this.processDigest('DAILY', 1440);
  }

  /** Called by cron-engine (DIGEST_WEEKLY). */
  async processWeeklyDigest() {
    await this.processDigest('WEEKLY', 10080);
  }

  private async processDigest(frequency: string, minutesBack: number) {
    const since = new Date(Date.now() - minutesBack * 60 * 1000);

    const preferences = await this.prisma.notificationPreference.findMany({
      where: { digestFrequency: frequency as any, isActive: true },
    });

    for (const pref of preferences) {
      try {
        const unreadCount = await this.prisma.notification.count({
          where: {
            recipientId: pref.userId,
            status: 'UNREAD',
            isActive: true,
            createdAt: { gte: since },
          },
        });

        if (unreadCount === 0) continue;

        const notifications = await this.prisma.notification.findMany({
          where: {
            recipientId: pref.userId,
            status: 'UNREAD',
            isActive: true,
            createdAt: { gte: since },
          },
          orderBy: { priority: 'desc' },
          take: 20,
        });

        const byCategory: Record<string, number> = {};
        for (const n of notifications) {
          byCategory[n.category] = (byCategory[n.category] || 0) + 1;
        }

        this.logger.log(
          `${frequency} digest for user ${pref.userId}: ${unreadCount} unread across ${Object.keys(byCategory).length} categories`,
        );

        // In production: send digest email/push summarizing notifications
      } catch (error) {
        this.logger.error(`Digest failed for user ${pref.userId}: ${error.message}`);
      }
    }
  }

  /** Called by cron-engine (REGROUP_NOTIFICATIONS). */
  async regroupNotifications() {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

    const groupable = await this.prisma.notification.groupBy({
      by: ['recipientId', 'groupKey'],
      where: {
        groupKey: { not: null },
        status: 'UNREAD',
        isActive: true,
        createdAt: { gte: thirtyMinAgo },
      },
      _count: true,
      having: { groupKey: { _count: { gt: 1 } } },
    });

    for (const group of groupable) {
      if (!group.groupKey) continue;

      const notifications = await this.prisma.notification.findMany({
        where: {
          recipientId: group.recipientId,
          groupKey: group.groupKey,
          status: 'UNREAD',
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (notifications.length <= 1) continue;

      const [keep, ...rest] = notifications;
      await this.prisma.notification.update({
        where: { id: keep.id },
        data: { isGrouped: true, groupCount: notifications.length },
      });

      if (rest.length > 0) {
        await this.prisma.notification.updateMany({
          where: { id: { in: rest.map(r => r.id) } },
          data: { isActive: false },
        });
      }
    }
  }
}
