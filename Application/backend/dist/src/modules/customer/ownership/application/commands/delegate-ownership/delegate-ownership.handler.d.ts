import { ICommandHandler } from '@nestjs/cqrs';
import { DelegateOwnershipCommand } from './delegate-ownership.command';
import { DelegationService } from '../../../services/delegation.service';
export declare class DelegateOwnershipHandler implements ICommandHandler<DelegateOwnershipCommand> {
    private readonly delegation;
    private readonly logger;
    constructor(delegation: DelegationService);
    execute(command: DelegateOwnershipCommand): Promise<{
        entitiesDelegated: number;
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
    }>;
}
