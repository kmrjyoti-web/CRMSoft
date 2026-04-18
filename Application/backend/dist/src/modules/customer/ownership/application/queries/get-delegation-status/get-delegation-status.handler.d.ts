import { IQueryHandler } from '@nestjs/cqrs';
import { GetDelegationStatusQuery } from './get-delegation-status.query';
import { DelegationService } from '../../../services/delegation.service';
export declare class GetDelegationStatusHandler implements IQueryHandler<GetDelegationStatusQuery> {
    private readonly delegation;
    private readonly logger;
    constructor(delegation: DelegationService);
    execute(query: GetDelegationStatusQuery): Promise<{
        id: string;
        tenantId: string;
        entityType: import("@prisma/identity-client").$Enums.EntityType | null;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        reason: string;
        startDate: Date;
        endDate: Date;
        fromUserId: string;
        toUserId: string;
        isReverted: boolean;
        revertedAt: Date | null;
    }[]>;
}
