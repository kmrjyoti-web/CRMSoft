export class GetSalesPipelineQuery {
  constructor(
    public readonly dateFrom?: Date,
    public readonly dateTo?: Date,
    public readonly userId?: string,
  ) {}
}
