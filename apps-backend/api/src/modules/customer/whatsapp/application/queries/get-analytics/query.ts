export class GetAnalyticsQuery {
  constructor(
    public readonly wabaId: string,
    public readonly dateFrom?: Date,
    public readonly dateTo?: Date,
  ) {}
}
