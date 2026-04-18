import { IQueryHandler } from '@nestjs/cqrs';
import { EmailAnalyticsService } from '../../../services/email-analytics.service';
import { GetEmailAnalyticsQuery } from './query';
export declare class GetEmailAnalyticsHandler implements IQueryHandler<GetEmailAnalyticsQuery> {
    private readonly emailAnalytics;
    constructor(emailAnalytics: EmailAnalyticsService);
    execute(query: GetEmailAnalyticsQuery): Promise<{
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
}
