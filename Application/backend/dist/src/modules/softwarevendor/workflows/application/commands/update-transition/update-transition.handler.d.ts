import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { UpdateTransitionCommand } from './update-transition.command';
export declare class UpdateTransitionHandler implements ICommandHandler<UpdateTransitionCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: UpdateTransitionCommand): Promise<{
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
    }>;
}
