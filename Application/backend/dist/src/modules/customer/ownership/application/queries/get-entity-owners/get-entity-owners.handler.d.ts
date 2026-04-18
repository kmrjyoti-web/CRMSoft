import { IQueryHandler } from '@nestjs/cqrs';
import { GetEntityOwnersQuery } from './get-entity-owners.query';
import { OwnershipCoreService } from '../../../services/ownership-core.service';
export declare class GetEntityOwnersHandler implements IQueryHandler<GetEntityOwnersQuery> {
    private readonly ownershipCore;
    private readonly logger;
    constructor(ownershipCore: OwnershipCoreService);
    execute(query: GetEntityOwnersQuery): Promise<{
        id: string;
        tenantId: string;
        entityType: import("@prisma/working-client").$Enums.EntityType;
        isActive: boolean;
        configJson: import("@prisma/working-client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        userId: string | null;
        priority: number;
        entityId: string;
        validFrom: Date;
        validTo: Date | null;
        ownerType: import("@prisma/working-client").$Enums.OwnerType;
        teamId: string | null;
        assignedById: string;
        assignmentReason: string | null;
    }[]>;
}
