export class GetMyTasksDashboardQuery {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
  ) {}
}
