import { ICommandHandler } from '@nestjs/cqrs';
import { CreateReviewCommand } from './create-review.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class CreateReviewHandler implements ICommandHandler<CreateReviewCommand> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(command: CreateReviewCommand): Promise<{
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
    }>;
    private updateListingRating;
}
