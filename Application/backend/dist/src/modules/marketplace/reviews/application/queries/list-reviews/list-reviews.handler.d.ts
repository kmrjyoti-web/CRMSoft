import { IQueryHandler } from '@nestjs/cqrs';
import { ListReviewsQuery } from './list-reviews.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class ListReviewsHandler implements IQueryHandler<ListReviewsQuery> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(query: ListReviewsQuery): Promise<{
        data: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            status: import("@prisma/marketplace-client").$Enums.ReviewStatus;
            body: string | null;
            title: string | null;
            orderId: string | null;
            rating: number;
            helpfulCount: number;
            mediaUrls: import("@prisma/marketplace-client/runtime/library").JsonValue;
            listingId: string;
            reviewerId: string;
            isVerifiedPurchase: boolean;
            moderatorId: string | null;
            moderationNote: string | null;
            reportCount: number;
            sellerResponse: string | null;
            sellerRespondedAt: Date | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
