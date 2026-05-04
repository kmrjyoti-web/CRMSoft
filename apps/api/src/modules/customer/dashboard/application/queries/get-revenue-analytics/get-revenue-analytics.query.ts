export class GetRevenueAnalyticsQuery {
  constructor(
    public readonly dateFrom: Date,
    public readonly dateTo: Date,
    public readonly groupBy?: string,
  ) {}
}
