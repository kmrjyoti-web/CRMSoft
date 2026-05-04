export class GetTourPlanStatsQuery {
  constructor(
    public readonly userId?: string,
    public readonly fromDate?: string,
    public readonly toDate?: string,
  ) {}
}
