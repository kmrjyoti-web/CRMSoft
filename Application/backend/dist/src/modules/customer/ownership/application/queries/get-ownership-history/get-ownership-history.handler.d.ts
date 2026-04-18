import { IQueryHandler } from '@nestjs/cqrs';
import { GetOwnershipHistoryQuery } from './get-ownership-history.query';
import { OwnershipCoreService } from '../../../services/ownership-core.service';
export declare class GetOwnershipHistoryHandler implements IQueryHandler<GetOwnershipHistoryQuery> {
    private readonly ownershipCore;
    private readonly logger;
    constructor(ownershipCore: OwnershipCoreService);
    execute(query: GetOwnershipHistoryQuery): Promise<{
        data: {
            id: string;
            tenantId: string;
            entityType: import("@prisma/working-client").$Enums.EntityType;
            createdAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            action: import("@prisma/working-client").$Enums.OwnershipAction;
            entityId: string;
            changedById: string;
            ownerType: import("@prisma/working-client").$Enums.OwnerType;
            fromUserId: string | null;
            fromUserName: string | null;
            toUserId: string | null;
            toUserName: string | null;
            reasonCode: string;
            reasonDetail: string | null;
            changedByName: string;
            isAutomated: boolean;
            ownershipDurationDays: number | null;
            entitySnapshot: import("@prisma/working-client/runtime/library").JsonValue | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
}
