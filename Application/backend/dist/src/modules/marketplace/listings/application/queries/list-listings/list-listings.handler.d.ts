import { IQueryHandler } from '@nestjs/cqrs';
import { ListListingsQuery } from './list-listings.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class ListListingsHandler implements IQueryHandler<ListListingsQuery> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(query: ListListingsQuery): Promise<{
        data: ({
            _count: {
                reviews: number;
                enquiries: number;
            };
            priceTiers: {
                id: string;
                createdAt: Date;
                label: string;
                minQty: number;
                maxQty: number | null;
                listingId: string;
                pricePerUnit: number;
                requiresVerification: boolean;
            }[];
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
            updatedById: string | null;
            status: import("@prisma/marketplace-client").$Enums.ListingStatus;
            currency: string;
            slug: string | null;
            basePrice: number;
            isFeatured: boolean;
            shortDescription: string | null;
            mrp: number | null;
            hsnCode: string | null;
            gstRate: number | null;
            minOrderQty: number;
            maxOrderQty: number | null;
            categoryId: string | null;
            title: string;
            expiresAt: Date | null;
            publishedAt: Date | null;
            avgRating: number | null;
            reviewCount: number;
            viewCount: number;
            visibility: import("@prisma/marketplace-client").$Enums.VisibilityType;
            authorId: string;
            listingType: import("@prisma/marketplace-client").$Enums.ListingType;
            mediaUrls: import("@prisma/marketplace-client/runtime/library").JsonValue;
            visibilityConfig: import("@prisma/marketplace-client/runtime/library").JsonValue | null;
            publishAt: Date | null;
            attributes: import("@prisma/marketplace-client/runtime/library").JsonValue;
            stockAvailable: number;
            shippingConfig: import("@prisma/marketplace-client/runtime/library").JsonValue | null;
            keywords: string[];
            trackInventory: boolean;
            stockReserved: number;
            expiryAction: import("@prisma/marketplace-client").$Enums.ExpiryAction;
            requirementConfig: import("@prisma/marketplace-client/runtime/library").JsonValue | null;
            enquiryCount: number;
            orderCount: number;
            featuredUntil: Date | null;
            subcategoryId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
