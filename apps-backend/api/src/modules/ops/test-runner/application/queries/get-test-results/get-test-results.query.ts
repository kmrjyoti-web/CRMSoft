export class GetTestResultsQuery {
  constructor(
    public readonly testRunId: string,
    public readonly filters: {
      testType?: string;
      status?: string;
      module?: string;
      page?: number;
      limit?: number;
    },
  ) {}
}
