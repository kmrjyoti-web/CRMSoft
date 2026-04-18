import { ICommandHandler } from '@nestjs/cqrs';
import { WorkflowEngineService } from '../../../../../../core/workflow/workflow-engine.service';
import { RejectTransitionCommand } from './reject-transition.command';
export declare class RejectTransitionHandler implements ICommandHandler<RejectTransitionCommand> {
    private readonly engine;
    private readonly logger;
    constructor(engine: WorkflowEngineService);
    execute(cmd: RejectTransitionCommand): Promise<{
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
