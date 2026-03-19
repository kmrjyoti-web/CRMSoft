import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

export interface NotificationAnalytics {
  totalSent: number;
  deliveryRate: number;
  readRate: number;
  failureRate: number;
  byChannel: Array<{ channel: string; count: number }>;
  byEvent: Array<{ eventType: string; count: number }>;
  topFailureReasons: Array<{ reason: string; count: number }>;
}

@Injectable()
export class NotificationAnalyticsService {
  private readonly logger = new Logger(NotificationAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get comprehensive notification analytics for a tenant within a date range.
   */
  async getAnalytics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<NotificationAnalytics> {
    const dateFilter = {
      tenantId,
      createdAt: { gte: startDate, lte: endDate },
    };

    // ─── Notification table aggregates ───

    const totalSent = await this.prisma.notification.count({
      where: { ...dateFilter, isActive: true },
    });

    const deliveredCount = await this.prisma.notification.count({
      where: { ...dateFilter, isActive: true, deliveredAt: { not: null } },
    });

    const readCount = await this.prisma.notification.count({
      where: { ...dateFilter, isActive: true, readAt: { not: null } },
    });

    const failedCount = await this.prisma.notification.count({
      where: { ...dateFilter, isActive: true, failedAt: { not: null } },
    });

    const deliveryRate = totalSent > 0 ? Math.round((deliveredCount / totalSent) * 10000) / 100 : 0;
    const readRate = totalSent > 0 ? Math.round((readCount / totalSent) * 10000) / 100 : 0;
    const failureRate = totalSent > 0 ? Math.round((failedCount / totalSent) * 10000) / 100 : 0;

    // ─── Group by channel (from CommunicationLog) ───

    const byChannelRaw = await this.prisma.communicationLog.groupBy({
      by: ['channel'],
      where: {
        tenantId,
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const byChannel = byChannelRaw.map((row) => ({
      channel: row.channel,
      count: row._count.id,
    }));

    // ─── Group by event type (from Notification) ───

    const byEventRaw = await this.prisma.notification.groupBy({
      by: ['eventType'],
      where: {
        ...dateFilter,
        isActive: true,
        eventType: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const byEvent = byEventRaw.map((row) => ({
      eventType: row.eventType || 'UNKNOWN',
      count: row._count.id,
    }));

    // ─── Top failure reasons ───

    const failedNotifications = await this.prisma.notification.findMany({
      where: {
        ...dateFilter,
        isActive: true,
        failedAt: { not: null },
        failureReason: { not: null },
      },
      select: { failureReason: true },
    });

    const reasonCounts: Record<string, number> = {};
    for (const n of failedNotifications) {
      const reason = n.failureReason || 'Unknown';
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    }

    const topFailureReasons = Object.entries(reasonCounts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalSent,
      deliveryRate,
      readRate,
      failureRate,
      byChannel,
      byEvent,
      topFailureReasons,
    };
  }
}
