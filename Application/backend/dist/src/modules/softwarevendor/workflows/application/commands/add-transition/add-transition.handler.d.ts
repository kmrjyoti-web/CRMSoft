import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { AddTransitionCommand } from './add-transition.command';
export declare class AddTransitionHandler implements ICommandHandler<AddTransitionCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: AddTransitionCommand): Promise<{
        fromState: {
            name: string;
            code: string;
        };
        toState: {
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
    }>;
}
