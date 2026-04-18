import { ICommandHandler } from '@nestjs/cqrs';
import { WorkflowEngineService } from '../../../../../../core/workflow/workflow-engine.service';
import { InitializeWorkflowCommand } from './initialize-workflow.command';
export declare class InitializeWorkflowHandler implements ICommandHandler<InitializeWorkflowCommand> {
    private readonly engine;
    private readonly logger;
    constructor(engine: WorkflowEngineService);
    execute(cmd: InitializeWorkflowCommand): Promise<{
        workflow: {
            name: string;
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
