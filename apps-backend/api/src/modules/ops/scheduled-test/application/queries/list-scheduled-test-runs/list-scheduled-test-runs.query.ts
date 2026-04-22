export class ListScheduledTestRunsQuery {
  constructor(
    public readonly scheduledTestId: string,
    public readonly tenantId: string,
    public readonly limit?: number,
  ) {}
}
