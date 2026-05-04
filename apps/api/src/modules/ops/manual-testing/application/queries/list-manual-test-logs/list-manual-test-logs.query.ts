export class ListManualTestLogsQuery {
  constructor(
    public readonly tenantId: string,
    public readonly filters: {
      testRunId?: string;
      module?: string;
      status?: string;
      userId?: string;
      page?: number;
      limit?: number;
    },
  ) {}
}
