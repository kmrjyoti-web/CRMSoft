export class GetFollowUpListQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly sortBy: string = 'dueDate',
    public readonly sortOrder: 'asc' | 'desc' = 'asc',
    public readonly search?: string,
    public readonly priority?: string,
    public readonly assignedToId?: string,
    public readonly isOverdue?: boolean,
    public readonly entityType?: string,
    public readonly entityId?: string,
  ) {}
}
