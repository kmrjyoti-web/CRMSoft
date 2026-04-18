import { PrismaService } from '../../../core/prisma/prisma.service';
export declare class MarketplaceSchedulingService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    processScheduled(): Promise<{
        published: number;
        expired: number;
    }>;
    private publishScheduledListings;
    private publishScheduledPosts;
    private expireListings;
    private expirePosts;
}
