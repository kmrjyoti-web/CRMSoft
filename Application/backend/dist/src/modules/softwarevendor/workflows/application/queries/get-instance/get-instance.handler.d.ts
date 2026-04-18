import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetInstanceQuery } from './get-instance.query';
export declare class GetInstanceHandler implements IQueryHandler<GetInstanceQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetInstanceQuery): Promise<{
        workflow: {
            id: string;
            name: string;
            code: string;
            entityType: string;
        };
        _count: {
            approvals: number;
            history: number;
        };
        currentState: {
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
            category: import("@prisma/working-client").$Enums.WorkflowStateCategory | null;
            workflowId: string;
            stateType: import("@prisma/working-client").$Enums.WorkflowStateType;
            color: string | null;
            icon: string | null;
            sortOrder: number;
            metadata: import("@prisma/working-client/runtime/library").JsonValue | null;
        };
        previousState: {
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
            category: import("@prisma/working-client").$Enums.WorkflowStateCategory | null;
            workflowId: string;
            stateType: import("@prisma/working-client").$Enums.WorkflowStateType;
            color: string | null;
            icon: string | null;
            sortOrder: number;
            metadata: import("@prisma/working-client/runtime/library").JsonValue | null;
        } | null;
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
    }>;
}
