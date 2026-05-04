export class GetWorkflowListQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly sortOrder: 'asc' | 'desc',
    public readonly search?: string,
    public readonly entityType?: string,
  ) {}
}
