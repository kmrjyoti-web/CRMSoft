export class GetEntityTimelineQuery {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly page?: number,
    public readonly limit?: number,
    public readonly action?: string,
    public readonly dateFrom?: Date,
    public readonly dateTo?: Date,
  ) {}
}
