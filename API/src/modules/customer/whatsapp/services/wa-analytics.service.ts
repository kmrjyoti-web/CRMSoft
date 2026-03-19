// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class WaAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverallAnalytics(wabaId: string, dateFrom?: Date, dateTo?: Date) {
    const messageWhere: any = { wabaId };
    if (dateFrom || dateTo) {
      messageWhere.createdAt = {};
      if (dateFrom) messageWhere.createdAt.gte = dateFrom;
      if (dateTo) messageWhere.createdAt.lte = dateTo;
    }

    const [
      totalSent,
      totalReceived,
      totalDelivered,
      totalRead,
      totalFailed,
      totalConversations,
      openConversations,
      resolvedConversations,
    ] = await Promise.all([
      this.prisma.waMessage.count({ where: { ...messageWhere, direction: 'OUTBOUND' } }),
      this.prisma.waMessage.count({ where: { ...messageWhere, direction: 'INBOUND' } }),
      this.prisma.waMessage.count({ where: { ...messageWhere, direction: 'OUTBOUND', status: 'DELIVERED' } }),
      this.prisma.waMessage.count({ where: { ...messageWhere, direction: 'OUTBOUND', status: 'READ' } }),
      this.prisma.waMessage.count({ where: { ...messageWhere, direction: 'OUTBOUND', status: 'FAILED' } }),
      this.prisma.waConversation.count({ where: { wabaId } }),
      this.prisma.waConversation.count({ where: { wabaId, status: 'OPEN' } }),
      this.prisma.waConversation.count({ where: { wabaId, status: 'RESOLVED' } }),
    ]);

    const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;
    const readRate = totalSent > 0 ? Math.round((totalRead / totalSent) * 100) : 0;

    return {
      totalSent,
      totalReceived,
      totalDelivered,
      totalRead,
      totalFailed,
      deliveryRate,
      readRate,
      totalConversations,
      openConversations,
      resolvedConversations,
    };
  }

  async getAgentPerformance(wabaId: string, dateFrom?: Date, dateTo?: Date) {
    const conversationWhere: any = { wabaId, assignedToId: { not: null } };

    const assignedConversations = await this.prisma.waConversation.findMany({
      where: conversationWhere,
      select: {
        assignedToId: true,
        status: true,
        messageCount: true,
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    const agentMap = new Map<string, any>();

    for (const conv of assignedConversations) {
      if (!conv.assignedToId) continue;
      if (!agentMap.has(conv.assignedToId)) {
        agentMap.set(conv.assignedToId, {
          userId: conv.assignedToId,
          name: `${conv.assignedTo?.firstName || ''} ${conv.assignedTo?.lastName || ''}`.trim(),
          totalAssigned: 0,
          resolved: 0,
          open: 0,
          totalMessages: 0,
        });
      }
      const agent = agentMap.get(conv.assignedToId);
      agent.totalAssigned++;
      if (conv.status === 'RESOLVED') agent.resolved++;
      if (conv.status === 'OPEN') agent.open++;
      agent.totalMessages += conv.messageCount;
    }

    return Array.from(agentMap.values());
  }

  async getBroadcastStats(broadcastId: string) {
    const broadcast = await this.prisma.waBroadcast.findUniqueOrThrow({
      where: { id: broadcastId },
    });

    const recipientStats = await this.prisma.waBroadcastRecipient.groupBy({
      by: ['status'],
      where: { broadcastId },
      _count: { id: true },
    });

    const statusMap = recipientStats.reduce((acc, s) => {
      acc[s.status] = s._count.id;
      return acc;
    }, {} as Record<string, number>);

    return {
      broadcast: {
        id: broadcast.id,
        name: broadcast.name,
        status: broadcast.status,
        totalRecipients: broadcast.totalRecipients,
        startedAt: broadcast.startedAt,
        completedAt: broadcast.completedAt,
      },
      stats: {
        sent: broadcast.sentCount,
        delivered: broadcast.deliveredCount,
        read: broadcast.readCount,
        failed: broadcast.failedCount,
        optedOut: broadcast.optOutCount,
      },
      recipientBreakdown: statusMap,
    };
  }
}
