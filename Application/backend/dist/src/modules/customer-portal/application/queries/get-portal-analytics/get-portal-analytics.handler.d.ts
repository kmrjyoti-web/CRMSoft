import { IQueryHandler } from '@nestjs/cqrs';
import { GetPortalAnalyticsQuery } from './get-portal-analytics.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class GetPortalAnalyticsHandler implements IQueryHandler<GetPortalAnalyticsQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetPortalAnalyticsQuery): Promise<{
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        loginCount: number;
        topPages: {
            route: string;
            count: number;
        }[];
        period: {
            from: string | null;
            to: string | null;
        };
    }>;
}
