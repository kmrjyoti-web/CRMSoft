import { IQueryHandler } from '@nestjs/cqrs';
import { EmailAnalyticsService } from '../../../services/email-analytics.service';
import { GetCampaignStatsQuery } from './query';
export declare class GetCampaignStatsHandler implements IQueryHandler<GetCampaignStatsQuery> {
    private readonly emailAnalytics;
    constructor(emailAnalytics: EmailAnalyticsService);
    execute(query: GetCampaignStatsQuery): Promise<{
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
}
