import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { GetEntitiesByFilterQuery } from './get-entities-by-filter.query';
export declare class GetEntitiesByFilterHandler implements IQueryHandler<GetEntitiesByFilterQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetEntitiesByFilterQuery): Promise<any>;
}
