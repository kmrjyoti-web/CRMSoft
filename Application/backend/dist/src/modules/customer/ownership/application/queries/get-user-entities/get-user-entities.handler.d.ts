import { IQueryHandler } from '@nestjs/cqrs';
import { GetUserEntitiesQuery } from './get-user-entities.query';
import { OwnershipCoreService } from '../../../services/ownership-core.service';
export declare class GetUserEntitiesHandler implements IQueryHandler<GetUserEntitiesQuery> {
    private readonly ownershipCore;
    private readonly logger;
    constructor(ownershipCore: OwnershipCoreService);
    execute(query: GetUserEntitiesQuery): Promise<{
        leads: unknown[];
        contacts: unknown[];
        organizations: unknown[];
        quotations: unknown[];
        summary: {
            totalLeads: number;
            totalContacts: number;
            totalOrganizations: number;
            totalQuotations: number;
            total: number;
        };
    }>;
}
