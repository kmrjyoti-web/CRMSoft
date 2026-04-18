import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { R2StorageService } from '../../../shared/infrastructure/storage/r2-storage.service';
export type BackupSchema = 'identity' | 'platform' | 'working' | 'marketplace';
export interface BackupResult {
    logId: string;
    schemaName: string;
    dbName: string;
    r2Key: string | null;
    r2Url: string | null;
    sizeBytes: number;
    checksum: string;
    status: 'SUCCESS' | 'FAILED';
    errorMessage?: string;
    durationMs: number;
}
export interface RestoreResult {
    logId: string;
    schemaName: string;
    dbName: string;
    status: 'SUCCESS' | 'FAILED';
    errorMessage?: string;
    durationMs: number;
}
export declare class BackupService {
    private readonly prisma;
    private readonly config;
    private readonly r2;
    private readonly logger;
    private readonly tmpDir;
    constructor(prisma: PrismaService, config: ConfigService, r2: R2StorageService);
    backupSchema(schema: BackupSchema, triggeredBy?: string, retentionDays?: number): Promise<BackupResult>;
    backupAllSchemas(triggeredBy?: string): Promise<BackupResult[]>;
    restoreFromBackup(backupLogId: string, triggeredBy: string): Promise<RestoreResult>;
    listBackups(schema?: string, limit?: number): Promise<{
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
    }[]>;
    getBackup(id: string): Promise<{
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
    } | null>;
    listRestores(limit?: number): Promise<{
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
    }[]>;
    getPresignedDownloadUrl(backupLogId: string): Promise<string | null>;
    cleanupExpiredBackups(): Promise<{
        deleted: number;
    }>;
    isPgDumpAvailable(): boolean;
    private extractDbName;
    private failResult;
}
