import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { UpdateWorkflowCommand } from './update-workflow.command';
export declare class UpdateWorkflowHandler implements ICommandHandler<UpdateWorkflowCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: UpdateWorkflowCommand): Promise<{
        id: string;
        tenantId: string;
        name: string;
        code: string;
        entityType: string;
        description: string | null;
        version: number;
        isDefault: boolean;
        isActive: boolean;
        configJson: import("@prisma/working-client/runtime/library").JsonValue | null;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
    }>;
}
