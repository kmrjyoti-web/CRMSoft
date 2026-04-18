import { IQueryHandler } from '@nestjs/cqrs';
import { GetUnassignedEntitiesQuery } from './get-unassigned-entities.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class GetUnassignedEntitiesHandler implements IQueryHandler<GetUnassignedEntitiesQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetUnassignedEntitiesQuery): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        entityType: string;
    }>;
}
