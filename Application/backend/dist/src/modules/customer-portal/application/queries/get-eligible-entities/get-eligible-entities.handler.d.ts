import { IQueryHandler } from '@nestjs/cqrs';
import { GetEligibleEntitiesQuery } from './get-eligible-entities.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
interface EligibleEntity {
    id: string;
    entityType: string;
    name: string;
    email: string | null;
    phone: string | null;
    isAlreadyActivated: boolean;
}
export declare class GetEligibleEntitiesHandler implements IQueryHandler<GetEligibleEntitiesQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetEligibleEntitiesQuery): Promise<import("../../../../../common/utils/paginated-list.helper").PaginatedResult<EligibleEntity>>;
}
export {};
