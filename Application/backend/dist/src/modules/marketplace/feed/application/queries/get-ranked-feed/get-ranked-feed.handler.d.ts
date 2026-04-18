import { IQueryHandler } from '@nestjs/cqrs';
import { GetRankedFeedQuery } from './get-ranked-feed.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
import { FeedRankerService } from '../../services/feed-ranker.service';
export declare class GetRankedFeedHandler implements IQueryHandler<GetRankedFeedQuery> {
    private readonly mktPrisma;
    private readonly ranker;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService, ranker: FeedRankerService);
    execute(query: GetRankedFeedQuery): Promise<{
        items: {
            type: string;
            data: Record<string, unknown> | undefined;
        }[];
        page: number;
        limit: number;
        hasMore: boolean;
    }>;
}
