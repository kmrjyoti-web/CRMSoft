import { ICommandHandler } from '@nestjs/cqrs';
import { CreatePatchCommand } from '../commands/create-patch.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class CreatePatchHandler implements ICommandHandler<CreatePatchCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: CreatePatchCommand): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/platform-client").$Enums.PatchStatus;
        industryCode: string;
        errorLog: string | null;
        appliedAt: Date | null;
        patchName: string;
        schemaChanges: import("@prisma/platform-client/runtime/library").JsonValue | null;
        configOverrides: import("@prisma/platform-client/runtime/library").JsonValue | null;
        menuOverrides: import("@prisma/platform-client/runtime/library").JsonValue | null;
        forceUpdate: boolean;
        versionId: string;
        seedData: import("@prisma/platform-client/runtime/library").JsonValue | null;
        appliedBy: string | null;
        rollbackData: import("@prisma/platform-client/runtime/library").JsonValue | null;
    }>;
}
