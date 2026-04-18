import { ICommandHandler } from '@nestjs/cqrs';
import { PublishVersionCommand } from '../commands/publish-version.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class PublishVersionHandler implements ICommandHandler<PublishVersionCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: PublishVersionCommand): Promise<{
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
