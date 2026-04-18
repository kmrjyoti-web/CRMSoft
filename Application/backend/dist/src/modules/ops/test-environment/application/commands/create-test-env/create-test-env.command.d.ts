export declare class CreateTestEnvCommand {
    readonly tenantId: string;
    readonly userId: string;
    readonly sourceType: 'SEED_DATA' | 'LIVE_CLONE' | 'BACKUP_RESTORE';
    readonly displayName?: string | undefined;
    readonly backupId?: string | undefined;
    readonly sourceDbUrl?: string | undefined;
    readonly ttlHours?: number | undefined;
    constructor(tenantId: string, userId: string, sourceType: 'SEED_DATA' | 'LIVE_CLONE' | 'BACKUP_RESTORE', displayName?: string | undefined, backupId?: string | undefined, sourceDbUrl?: string | undefined, ttlHours?: number | undefined);
}
