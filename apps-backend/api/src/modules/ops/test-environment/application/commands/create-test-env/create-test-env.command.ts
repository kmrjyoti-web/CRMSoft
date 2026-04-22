export class CreateTestEnvCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly sourceType: 'SEED_DATA' | 'LIVE_CLONE' | 'BACKUP_RESTORE',
    public readonly displayName?: string,
    public readonly backupId?: string,
    public readonly sourceDbUrl?: string,
    public readonly ttlHours?: number,
  ) {}
}
