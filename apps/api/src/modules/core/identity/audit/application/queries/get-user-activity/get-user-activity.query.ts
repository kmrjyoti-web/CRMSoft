export class GetUserActivityQuery {
  constructor(
    public readonly userId: string,
    public readonly page?: number,
    public readonly limit?: number,
    public readonly dateFrom?: Date,
    public readonly dateTo?: Date,
  ) {}
}
