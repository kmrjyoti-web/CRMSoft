export class GetTeamPerformanceQuery {
  constructor(
    public readonly dateFrom: Date,
    public readonly dateTo: Date,
    public readonly roleId?: string,
  ) {}
}
