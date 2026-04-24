export class GetEmailAnalyticsQuery {
  constructor(
    public readonly userId?: string,
    public readonly dateFrom?: Date,
    public readonly dateTo?: Date,
  ) {}
}
