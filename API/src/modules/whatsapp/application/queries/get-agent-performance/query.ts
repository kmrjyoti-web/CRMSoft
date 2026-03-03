export class GetAgentPerformanceQuery {
  constructor(
    public readonly wabaId: string,
    public readonly dateFrom?: Date,
    public readonly dateTo?: Date,
  ) {}
}
