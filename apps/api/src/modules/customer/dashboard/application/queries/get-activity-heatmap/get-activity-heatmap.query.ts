export class GetActivityHeatmapQuery {
  constructor(
    public readonly dateFrom: Date,
    public readonly dateTo: Date,
    public readonly userId?: string,
    public readonly activityType?: string,
  ) {}
}
