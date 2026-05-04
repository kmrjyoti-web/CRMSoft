export class GetGlobalFeedQuery {
  constructor(
    public readonly page?: number,
    public readonly limit?: number,
    public readonly entityType?: string,
    public readonly action?: string,
    public readonly dateFrom?: Date,
    public readonly dateTo?: Date,
  ) {}
}
