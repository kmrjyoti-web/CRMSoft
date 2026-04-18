import { IQueryHandler } from '@nestjs/cqrs';
import { GetAnalyticsQuery } from './get-analytics.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class GetAnalyticsHandler implements IQueryHandler<GetAnalyticsQuery> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(query: GetAnalyticsQuery): Promise<{
        summary: {
            id: string;
            tenantId: string;
            entityType: import("@prisma/marketplace-client").$Enums.AnalyticsEntityType;
            createdAt: Date;
            updatedAt: Date;
            leads: number;
            entityId: string;
            enquiries: number;
            listingId: string | null;
            postId: string | null;
            totalOrderValue: number;
            offerId: string | null;
            impressions: number;
            uniqueImpressions: number;
            clicks: number;
            uniqueClicks: number;
            ctr: number;
            enquiryRate: number;
            leadConversionRate: number;
            orders: number;
            orderConversionRate: number;
            topCities: import("@prisma/marketplace-client/runtime/library").JsonValue;
            topStates: import("@prisma/marketplace-client/runtime/library").JsonValue;
            peakHours: import("@prisma/marketplace-client/runtime/library").JsonValue;
            deviceBreakdown: import("@prisma/marketplace-client/runtime/library").JsonValue;
            sourceBreakdown: import("@prisma/marketplace-client/runtime/library").JsonValue;
            lastComputedAt: Date;
        } | null;
        recentBreakdown: Record<string, number>;
        last24h: Record<string, number>;
    }>;
}
