import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { AddStateCommand } from './add-state.command';
export declare class AddStateHandler implements ICommandHandler<AddStateCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: AddStateCommand): Promise<{
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
    }>;
}
