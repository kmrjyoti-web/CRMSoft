import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class EmailAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverallAnalytics(userId?: string, dateFrom?: Date, dateTo?: Date) {
    const accountWhere: any = {};
    if (userId) accountWhere.userId = userId;

    const accounts = await this.prisma.emailAccount.findMany({
      where: accountWhere,
      select: { id: true },
    });
    const accountIds = accounts.map(a => a.id);
    if (accountIds.length === 0) return this.emptyAnalytics();

    const emailWhere: any = { accountId: { in: accountIds } };
    if (dateFrom || dateTo) {
      emailWhere.createdAt = {};
      if (dateFrom) emailWhere.createdAt.gte = dateFrom;
      if (dateTo) emailWhere.createdAt.lte = dateTo;
    }

    const [totalSent, totalReceived, totalOpened, totalClicked, totalBounced, totalReplied] = await Promise.all([
      this.prisma.email.count({ where: { ...emailWhere, direction: 'OUTBOUND', status: { in: ['SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'REPLIED'] } } }),
      this.prisma.email.count({ where: { ...emailWhere, direction: 'INBOUND' } }),
      this.prisma.email.count({ where: { ...emailWhere, direction: 'OUTBOUND', openCount: { gt: 0 } } }),
      this.prisma.email.count({ where: { ...emailWhere, direction: 'OUTBOUND', clickCount: { gt: 0 } } }),
      this.prisma.email.count({ where: { ...emailWhere, isBounced: true } }),
      this.prisma.email.count({ where: { ...emailWhere, isReplied: true } }),
    ]);

    const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
    const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;
    const bounceRate = totalSent > 0 ? Math.round((totalBounced / totalSent) * 100) : 0;
    const replyRate = totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0;

    return {
      totalSent,
      totalReceived,
      totalOpened,
      totalClicked,
      totalBounced,
      totalReplied,
      openRate,
      clickRate,
      bounceRate,
      replyRate,
    };
  }

  async getCampaignStats(campaignId: string) {
    const campaign = await this.prisma.emailCampaign.findUniqueOrThrow({
      where: { id: campaignId },
    });

    const recipientStats = await this.prisma.campaignRecipient.groupBy({
      by: ['status'],
      where: { campaignId },
      _count: { id: true },
    });

    const statusMap = recipientStats.reduce((acc, s) => {
      acc[s.status] = s._count.id;
      return acc;
    }, {} as Record<string, number>);

    const totalSent = campaign.sentCount || statusMap['SENT'] || 0;
    const openRate = totalSent > 0 ? Math.round((campaign.openedCount / totalSent) * 100) : 0;
    const clickRate = totalSent > 0 ? Math.round((campaign.clickedCount / totalSent) * 100) : 0;

    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        totalRecipients: campaign.totalRecipients,
        startedAt: campaign.startedAt,
        completedAt: campaign.completedAt,
      },
      stats: {
        sent: campaign.sentCount,
        delivered: campaign.deliveredCount,
        opened: campaign.openedCount,
        clicked: campaign.clickedCount,
        replied: campaign.repliedCount,
        bounced: campaign.bouncedCount,
        failed: campaign.failedCount,
        unsubscribed: campaign.unsubscribedCount,
        openRate,
        clickRate,
      },
      recipientBreakdown: statusMap,
    };
  }

  private emptyAnalytics() {
    return {
      totalSent: 0, totalReceived: 0, totalOpened: 0, totalClicked: 0,
      totalBounced: 0, totalReplied: 0, openRate: 0, clickRate: 0, bounceRate: 0, replyRate: 0,
    };
  }
}
