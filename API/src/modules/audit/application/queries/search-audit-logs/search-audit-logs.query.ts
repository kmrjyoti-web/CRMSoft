export class SearchAuditLogsQuery {
  constructor(
    public readonly q?: string,
    public readonly entityType?: string,
    public readonly action?: string,
    public readonly userId?: string,
    public readonly dateFrom?: Date,
    public readonly dateTo?: Date,
    public readonly field?: string,
    public readonly module?: string,
    public readonly sensitive?: boolean,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
