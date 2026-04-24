export class CompareTestRunsQuery {
  constructor(
    public readonly runId1: string,
    public readonly runId2: string,
  ) {}
}
