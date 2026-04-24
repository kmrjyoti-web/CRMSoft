export class ListScheduledTestsQuery {
  constructor(
    public readonly tenantId: string,
    public readonly isActive?: boolean,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
