import { ApiResponse } from '../../../../common/utils/api-response';
import { BackupValidationService } from '../infrastructure/services/backup-validation.service';
import { IBackupRecordRepository } from '../infrastructure/repositories/backup-record.repository';
import { DbOperationsService } from '../../test-environment/infrastructure/db-operations.service';
export declare class BackupController {
    private readonly backupValidation;
    private readonly dbOps;
    private readonly repo;
    private readonly logger;
    constructor(backupValidation: BackupValidationService, dbOps: DbOperationsService, repo: IBackupRecordRepository);
    list(tenantId: string): Promise<ApiResponse<any[]>>;
    create(tenantId: string, userId: string, body: {
        dbName: string;
        backupUrl: string;
        checksum: string;
        sizeBytes: number;
        tableCount?: number;
        rowCount?: number;
        expiresAt?: string;
    }): Promise<ApiResponse<Record<string, unknown>>>;
    validate(id: string): Promise<ApiResponse<null> | ApiResponse<{
        valid: boolean;
    }>>;
    createFromDump(tenantId: string, userId: string, body: {
        dbUrl: string;
        expiresInHours?: number;
    }): Promise<ApiResponse<null> | ApiResponse<{
        filePath: string;
    }>>;
    check(tenantId: string): Promise<ApiResponse<{
        hasValidBackup: boolean;
        message: string;
    }> | ApiResponse<{
        hasValidBackup: boolean;
        backupId: any;
        createdAt: any;
        dbName: any;
    }>>;
}
