export class GetDemoListQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly sortBy: string = 'scheduledAt',
    public readonly sortOrder: 'asc' | 'desc' = 'desc',
    public readonly search?: string,
    public readonly status?: string,
    public readonly mode?: string,
    public readonly conductedById?: string,
    public readonly fromDate?: string,
    public readonly toDate?: string,
  ) {}
}
