import { ICommandHandler } from '@nestjs/cqrs';
import { CreateVersionCommand } from '../commands/create-version.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class CreateVersionHandler implements ICommandHandler<CreateVersionCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: CreateVersionCommand): Promise<{
        id: string;
        version: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/platform-client").$Enums.VersionStatus;
        codeName: string | null;
        releaseType: string;
        changelog: import("@prisma/platform-client/runtime/library").JsonValue;
        notionPageId: string | null;
        breakingChanges: import("@prisma/platform-client/runtime/library").JsonValue;
        migrationNotes: string | null;
        gitBranch: string | null;
        gitTag: string | null;
        gitCommitHash: string | null;
        rollbackReason: string | null;
        schemaChanges: import("@prisma/platform-client/runtime/library").JsonValue | null;
        deployedBy: string | null;
        modulesUpdated: string[];
        deployedAt: Date | null;
        rollbackAt: Date | null;
    }>;
}
