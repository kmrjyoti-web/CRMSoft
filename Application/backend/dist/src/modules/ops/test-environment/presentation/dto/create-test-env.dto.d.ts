export declare class CreateTestEnvDto {
    sourceType: 'SEED_DATA' | 'LIVE_CLONE' | 'BACKUP_RESTORE';
    displayName?: string;
    backupId?: string;
    sourceDbUrl?: string;
    ttlHours?: number;
}
