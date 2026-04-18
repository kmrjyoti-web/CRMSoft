import { IQueryHandler } from '@nestjs/cqrs';
import { GetFollowersQuery } from './get-followers.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class GetFollowersHandler implements IQueryHandler<GetFollowersQuery> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(query: GetFollowersQuery): Promise<{
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
