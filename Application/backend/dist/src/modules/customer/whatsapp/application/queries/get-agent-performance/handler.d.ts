import { IQueryHandler } from '@nestjs/cqrs';
import { WaAnalyticsService } from '../../../services/wa-analytics.service';
import { GetAgentPerformanceQuery } from './query';
export declare class GetAgentPerformanceHandler implements IQueryHandler<GetAgentPerformanceQuery> {
    private readonly waAnalytics;
    constructor(waAnalytics: WaAnalyticsService);
    execute(query: GetAgentPerformanceQuery): Promise<any[]>;
}
