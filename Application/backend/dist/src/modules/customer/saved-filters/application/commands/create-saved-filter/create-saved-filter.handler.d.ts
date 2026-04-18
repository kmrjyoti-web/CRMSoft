import { ICommandHandler } from '@nestjs/cqrs';
import { CreateSavedFilterCommand } from './create-saved-filter.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class CreateSavedFilterHandler implements ICommandHandler<CreateSavedFilterCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: CreateSavedFilterCommand): Promise<{
        id: string;
        tenantId: string;
        name: string;
        entityType: string;
        description: string | null;
        isDefault: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        usageCount: number;
        lastUsedAt: Date | null;
        isShared: boolean;
        filterConfig: import("@prisma/working-client/runtime/library").JsonValue;
        sharedWithRoles: import("@prisma/working-client/runtime/library").JsonValue | null;
    }>;
}
