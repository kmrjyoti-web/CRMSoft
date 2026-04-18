export class GetContactsDashboardQuery {
  constructor(
    public readonly tenantId: string,
    public readonly dateFrom?: string,
    public readonly dateTo?: string,
  ) {}
}
