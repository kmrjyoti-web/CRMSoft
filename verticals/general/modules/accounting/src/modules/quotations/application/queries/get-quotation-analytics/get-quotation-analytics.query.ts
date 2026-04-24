export class GetQuotationAnalyticsQuery {
  constructor(
    public readonly type: 'overview' | 'conversion',
    public readonly dateFrom?: Date,
    public readonly dateTo?: Date,
    public readonly userId?: string,
  ) {}
}
