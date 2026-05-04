export class GetManualTestSummaryQuery {
  constructor(
    public readonly tenantId: string,
    public readonly filters: { testRunId?: string; from?: string; to?: string },
  ) {}
}
