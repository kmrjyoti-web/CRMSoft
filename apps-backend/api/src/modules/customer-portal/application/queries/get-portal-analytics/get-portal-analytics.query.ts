export class GetPortalAnalyticsQuery {
  constructor(
    public readonly tenantId: string,
    public readonly from?: string,
    public readonly to?: string,
  ) {}
}
