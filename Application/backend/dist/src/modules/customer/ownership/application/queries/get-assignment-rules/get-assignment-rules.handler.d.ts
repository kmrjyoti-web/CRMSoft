import { IQueryHandler } from '@nestjs/cqrs';
import { GetAssignmentRulesQuery } from './get-assignment-rules.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class GetAssignmentRulesHandler implements IQueryHandler<GetAssignmentRulesQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetAssignmentRulesQuery): Promise<{
        data: {
            id: string;
            tenantId: string;
            name: string;
            entityType: import("@prisma/working-client").$Enums.EntityType;
            description: string | null;
            isActive: boolean;
            createdById: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            conditions: import("@prisma/working-client/runtime/library").JsonValue;
            status: import("@prisma/working-client").$Enums.AssignmentRuleStatus;
            priority: number;
            lastAssignedIndex: number;
            triggerEvent: string;
            assignmentMethod: import("@prisma/working-client").$Enums.AssignmentMethod;
            assignToUserId: string | null;
            assignToTeamIds: string[];
            assignToRoleId: string | null;
            ownerType: import("@prisma/working-client").$Enums.OwnerType;
            maxPerUser: number | null;
            respectWorkload: boolean;
            escalateAfterHours: number | null;
            escalateToUserId: string | null;
            escalateToRoleId: string | null;
            executionCount: number;
            lastExecutedAt: Date | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
}
