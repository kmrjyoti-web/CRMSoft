export class GetTaskListQuery {
  constructor(
    public readonly userId: string,
    public readonly roleLevel: number,
    public readonly tenantId: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly status?: string,
    public readonly priority?: string,
    public readonly assignedToId?: string,
    public readonly search?: string,
    public readonly sortBy: string = 'createdAt',
    public readonly sortOrder: 'asc' | 'desc' = 'desc',
  ) {}
}
