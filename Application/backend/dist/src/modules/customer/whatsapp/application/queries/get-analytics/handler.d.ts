import { IQueryHandler } from '@nestjs/cqrs';
import { WaAnalyticsService } from '../../../services/wa-analytics.service';
import { GetAnalyticsQuery } from './query';
export declare class GetAnalyticsHandler implements IQueryHandler<GetAnalyticsQuery> {
    private readonly waAnalytics;
    constructor(waAnalytics: WaAnalyticsService);
    execute(query: GetAnalyticsQuery): Promise<{
        totalSent: number;
        totalReceived: number;
        totalDelivered: number;
        totalRead: number;
        totalFailed: number;
        deliveryRate: number;
        readRate: number;
        totalConversations: number;
        openConversations: number;
        resolvedConversations: number;
    }>;
}
