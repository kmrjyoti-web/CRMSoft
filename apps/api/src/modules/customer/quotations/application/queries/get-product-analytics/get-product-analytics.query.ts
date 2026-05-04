export class GetProductAnalyticsQuery {
  constructor(
    public readonly dateFrom?: Date,
    public readonly dateTo?: Date,
  ) {}
}
