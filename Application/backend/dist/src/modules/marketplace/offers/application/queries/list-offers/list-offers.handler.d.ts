import { IQueryHandler } from '@nestjs/cqrs';
import { ListOffersQuery } from './list-offers.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class ListOffersHandler implements IQueryHandler<ListOffersQuery> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(query: ListOffersQuery): Promise<{
        data: ({
            _count: {
                redemptions: number;
            };
        } & {
            id: string;
            tenantId: string;
            description: string | null;
            isActive: boolean;
            createdById: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            conditions: import("@prisma/marketplace-client/runtime/library").JsonValue;
            status: import("@prisma/marketplace-client").$Enums.OfferStatus;
            lastResetAt: Date | null;
            title: string;
            closedAt: Date | null;
            expiresAt: Date | null;
            offerType: import("@prisma/marketplace-client").$Enums.OfferType;
            maxRedemptions: number | null;
            currentRedemptions: number;
            publishedAt: Date | null;
            discountType: import("@prisma/marketplace-client").$Enums.DiscountType;
            discountValue: number;
            clickCount: number;
            leadCount: number;
            authorId: string;
            mediaUrls: import("@prisma/marketplace-client/runtime/library").JsonValue;
            publishAt: Date | null;
            autoCloseOnLimit: boolean;
            enquiryCount: number;
            orderCount: number;
            linkedListingIds: string[];
            linkedCategoryIds: string[];
            primaryListingId: string | null;
            resetTime: string | null;
            closedReason: string | null;
            impressionCount: number;
            totalOrderValue: number;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
