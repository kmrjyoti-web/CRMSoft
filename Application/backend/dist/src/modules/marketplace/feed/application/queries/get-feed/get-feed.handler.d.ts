import { IQueryHandler } from '@nestjs/cqrs';
import { GetFeedQuery } from './get-feed.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class GetFeedHandler implements IQueryHandler<GetFeedQuery> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(query: GetFeedQuery): Promise<{
        data: ({
            _count: {
                comments: number;
                engagements: number;
            };
        } & {
            id: string;
            tenantId: string;
            isActive: boolean;
            createdById: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            status: import("@prisma/marketplace-client").$Enums.PostStatus;
            productId: string | null;
            expiresAt: Date | null;
            publishedAt: Date | null;
            content: string | null;
            viewCount: number;
            visibility: import("@prisma/marketplace-client").$Enums.VisibilityType;
            authorId: string;
            rating: number | null;
            mediaUrls: import("@prisma/marketplace-client/runtime/library").JsonValue;
            visibilityConfig: import("@prisma/marketplace-client/runtime/library").JsonValue | null;
            publishAt: Date | null;
            expiryAction: import("@prisma/marketplace-client").$Enums.ExpiryAction;
            postType: import("@prisma/marketplace-client").$Enums.PostType;
            linkedListingId: string | null;
            likeCount: number;
            commentCount: number;
            shareCount: number;
            saveCount: number;
            hashtags: string[];
            mentions: string[];
            pollConfig: import("@prisma/marketplace-client/runtime/library").JsonValue | null;
            linkedOfferId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
