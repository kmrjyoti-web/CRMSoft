import { IQueryHandler } from '@nestjs/cqrs';
import { GetVersionQuery, GetCurrentVersionQuery } from '../queries/get-version.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class GetVersionHandler implements IQueryHandler<GetVersionQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetVersionQuery): Promise<{
        patches: {
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
        }[];
    } & {
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
export declare class GetCurrentVersionHandler implements IQueryHandler<GetCurrentVersionQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(_query: GetCurrentVersionQuery): Promise<{
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
    } | {
        status: "NO_LIVE_VERSION";
        message: string;
    }>;
}
