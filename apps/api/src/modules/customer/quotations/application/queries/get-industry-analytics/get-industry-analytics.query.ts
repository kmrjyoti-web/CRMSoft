export class GetIndustryAnalyticsQuery {
  constructor(
    public readonly dateFrom?: Date,
    public readonly dateTo?: Date,
  ) {}
}
