import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetApprovalByIdQuery } from './get-approval-by-id.query';
export declare class GetApprovalByIdHandler implements IQueryHandler<GetApprovalByIdQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetApprovalByIdQuery): Promise<{
        instance: {
            workflow: {
                id: string;
                name: string;
                code: string;
            };
            currentState: {
                id: string;
                name: string;
                code: string;
            };
        } & {
            id: string;
            tenantId: string;
            entityType: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            workflowId: string;
            data: import("@prisma/working-client/runtime/library").JsonValue | null;
            completedAt: Date | null;
            entityId: string;
            currentStateId: string;
            previousStateId: string | null;
            startedAt: Date;
        };
        transition: {
            fromState: {
                id: string;
                name: string;
                code: string;
            };
            toState: {
                id: string;
                name: string;
                code: string;
            };
        } & {
            id: string;
            tenantId: string;
            name: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            workflowId: string;
            sortOrder: number;
            fromStateId: string;
            toStateId: string;
            triggerType: import("@prisma/working-client").$Enums.WorkflowTriggerType;
            conditions: import("@prisma/working-client/runtime/library").JsonValue | null;
            actions: import("@prisma/working-client/runtime/library").JsonValue | null;
            requiredPermission: string | null;
            requiredRole: string | null;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: import("@prisma/working-client").$Enums.WorkflowApprovalStatus;
        comment: string | null;
        instanceId: string;
        transitionId: string;
        requestedById: string;
        approvedById: string | null;
        expiresAt: Date | null;
        decidedAt: Date | null;
    }>;
}
