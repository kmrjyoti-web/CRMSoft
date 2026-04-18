import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { ListUsersQuery } from './list-users.query';
export declare class ListUsersHandler implements IQueryHandler<ListUsersQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: ListUsersQuery): Promise<{
        data: {
            [key: string]: unknown;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
        };
    }>;
}
