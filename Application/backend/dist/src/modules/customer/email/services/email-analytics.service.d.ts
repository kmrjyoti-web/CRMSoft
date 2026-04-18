import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class EmailAnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getOverallAnalytics(userId?: string, dateFrom?: Date, dateTo?: Date): Promise<{
        totalSent: number;
        totalReceived: number;
        totalOpened: number;
        totalClicked: number;
        totalBounced: number;
        totalReplied: number;
        openRate: number;
        clickRate: number;
        bounceRate: number;
        replyRate: number;
    }>;
    getCampaignStats(campaignId: string): Promise<{
        campaign: {
            id: string;
            name: string;
            status: import("@prisma/working-client").$Enums.CampaignStatus;
            totalRecipients: number;
            startedAt: Date | null;
            completedAt: Date | null;
        };
        stats: {
            sent: number;
            delivered: number;
            opened: number;
            clicked: number;
            replied: number;
            bounced: number;
            failed: number;
            unsubscribed: number;
            openRate: number;
            clickRate: number;
        };
        recipientBreakdown: Record<string, number>;
    }>;
    private emptyAnalytics;
}
