export class CreateBulkAuditLogCommand {
  constructor(
    public readonly entityType: string,
    public readonly entityIds: string[],
    public readonly action: string,
    public readonly summary: string,
    public readonly source: string,
    public readonly performedById?: string,
    public readonly performedByName?: string,
    public readonly module?: string,
    public readonly correlationId?: string,
  ) {}
}
