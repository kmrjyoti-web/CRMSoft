import { IBackupRecordRepository } from '../repositories/backup-record.repository';
export declare class BackupValidationService {
    private readonly repo;
    private readonly logger;
    constructor(repo: IBackupRecordRepository);
    computeChecksum(backupUrl: string): Promise<string>;
    validateBackup(backupRecordId: string): Promise<{
        valid: boolean;
        reason?: string;
    }>;
    requireValidatedBackup(tenantId: string): Promise<void>;
    findBestBackupForTesting(tenantId: string): Promise<any | null>;
}
