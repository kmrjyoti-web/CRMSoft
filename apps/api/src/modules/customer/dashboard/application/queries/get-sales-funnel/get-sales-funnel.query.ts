export class GetSalesFunnelQuery {
  constructor(
    public readonly dateFrom: Date,
    public readonly dateTo: Date,
    public readonly userId?: string,
    public readonly source?: string,
  ) {}
}
