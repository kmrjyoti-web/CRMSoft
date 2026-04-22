export class UpdateRetentionPolicyCommand {
  constructor(
    public readonly entityType: string,
    public readonly retentionDays: number,
    public readonly archiveEnabled?: boolean,
    public readonly isActive?: boolean,
  ) {}
}
