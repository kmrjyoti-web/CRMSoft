export class GetTestDashboardQuery {
  constructor(
    public readonly tenantId: string,
    public readonly days: number = 30,
  ) {}
}
