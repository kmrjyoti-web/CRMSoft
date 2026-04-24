export class ListQuotationsQuery {
  constructor(
    public readonly page?: number,
    public readonly limit?: number,
    public readonly sortBy?: string,
    public readonly sortOrder?: 'asc' | 'desc',
    public readonly search?: string,
    public readonly status?: string,
    public readonly leadId?: string,
    public readonly userId?: string,
    public readonly dateFrom?: Date,
    public readonly dateTo?: Date,
  ) {}
}
