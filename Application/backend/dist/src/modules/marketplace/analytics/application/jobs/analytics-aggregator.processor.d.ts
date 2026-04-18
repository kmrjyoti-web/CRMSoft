import { Job } from 'bull';
import { MktPrismaService } from '../../infrastructure/mkt-prisma.service';
export declare const ANALYTICS_QUEUE = "marketplace-analytics";
export interface ComputeSummaryJob {
    tenantId: string;
    entityType: 'POST' | 'LISTING' | 'OFFER';
    entityId: string;
}
export declare class AnalyticsAggregatorProcessor {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    handleComputeSummary(job: Job<ComputeSummaryJob>): Promise<void>;
}
