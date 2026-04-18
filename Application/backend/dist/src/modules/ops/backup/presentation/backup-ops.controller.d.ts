import { ApiResponse } from '../../../../common/utils/api-response';
import { BackupService, BackupSchema } from '../backup.service';
export declare class BackupOpsController {
    private readonly backup;
    constructor(backup: BackupService);
    list(schema?: string, limit?: string): Promise<ApiResponse<{
        id: string;
        createdAt: Date;
        status: import("@prisma/platform-client").$Enums.BackupJobStatus;
        sizeBytes: bigint | null;
        errorMessage: string | null;
        expiresAt: Date | null;
        durationMs: number | null;
        retentionDays: number;
        triggeredBy: string;
        checksum: string | null;
        dbName: string;
        schemaName: string;
        r2Key: string | null;
        r2Url: string | null;
    }[]>>;
    get(id: string): Promise<ApiResponse<{
        id: string;
        createdAt: Date;
        status: import("@prisma/platform-client").$Enums.BackupJobStatus;
        sizeBytes: bigint | null;
        errorMessage: string | null;
        expiresAt: Date | null;
        durationMs: number | null;
        retentionDays: number;
        triggeredBy: string;
        checksum: string | null;
        dbName: string;
        schemaName: string;
        r2Key: string | null;
        r2Url: string | null;
    }>>;
    download(id: string): Promise<ApiResponse<{
        url: string;
        expiresIn: number;
    }>>;
    run(body: {
        schema: BackupSchema;
        retentionDays?: number;
    }, userId: string): Promise<ApiResponse<null> | ApiResponse<import("../backup.service").BackupResult>>;
    runAll(userId: string): Promise<ApiResponse<null> | ApiResponse<import("../backup.service").BackupResult[]>>;
    restore(id: string, userId: string, body: {
        notes?: string;
    }): Promise<ApiResponse<import("../backup.service").RestoreResult>>;
    listRestores(limit?: string): Promise<ApiResponse<{
        id: string;
        createdAt: Date;
        status: import("@prisma/platform-client").$Enums.RestoreJobStatus;
        notes: string | null;
        errorMessage: string | null;
        durationMs: number | null;
        triggeredBy: string;
        dbName: string;
        schemaName: string;
        r2Key: string | null;
        backupLogId: string | null;
    }[]>>;
    cleanup(): Promise<ApiResponse<{
        deleted: number;
    }>>;
    pgDumpStatus(): Promise<ApiResponse<{
        available: boolean;
    }>>;
}
