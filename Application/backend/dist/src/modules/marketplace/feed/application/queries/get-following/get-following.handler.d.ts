import { IQueryHandler } from '@nestjs/cqrs';
import { GetFollowingQuery } from './get-following.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class GetFollowingHandler implements IQueryHandler<GetFollowingQuery> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(query: GetFollowingQuery): Promise<{
        data: {
            id: string;
            tenantId: string;
            createdAt: Date;
            followerId: string;
            followingId: string;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
