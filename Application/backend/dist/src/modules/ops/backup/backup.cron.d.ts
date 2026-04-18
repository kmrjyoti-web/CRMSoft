import { BackupService } from './backup.service';
export declare class BackupCron {
    private readonly backup;
    private readonly logger;
    constructor(backup: BackupService);
    nightlyBackupAll(): Promise<void>;
    weeklyRetentionCleanup(): Promise<void>;
}
