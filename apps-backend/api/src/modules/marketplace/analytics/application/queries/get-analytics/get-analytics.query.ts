export class GetAnalyticsQuery {
  constructor(
    public readonly tenantId: string,
    public readonly entityType: string,
    public readonly entityId: string,
  ) {}
}
