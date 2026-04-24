export class CreateAuditLogCommand {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly action: string,
    public readonly summary: string,
    public readonly source: string,
    public readonly performedById?: string,
    public readonly performedByName?: string,
    public readonly module?: string,
    public readonly changes?: Array<{ field: string; oldValue?: string; newValue?: string }>,
    public readonly correlationId?: string,
    public readonly tags?: string[],
  ) {}
}
