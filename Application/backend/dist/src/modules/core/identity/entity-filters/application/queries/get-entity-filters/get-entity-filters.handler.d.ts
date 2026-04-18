import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { GetEntityFiltersQuery } from './get-entity-filters.query';
export declare class GetEntityFiltersHandler implements IQueryHandler<GetEntityFiltersQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetEntityFiltersQuery): Promise<{
        grouped: Record<string, {
            category: string;
            displayName: string;
            values: Record<string, unknown>[];
        }>;
        flat: any;
        count: any;
    }>;
}
