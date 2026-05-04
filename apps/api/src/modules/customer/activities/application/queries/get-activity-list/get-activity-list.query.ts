export class GetActivityListQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly sortBy: string = 'createdAt',
    public readonly sortOrder: 'asc' | 'desc' = 'desc',
    public readonly search?: string,
    public readonly isActive?: boolean,
    public readonly type?: string,
    public readonly leadId?: string,
    public readonly contactId?: string,
    public readonly createdById?: string,
    public readonly fromDate?: string,
    public readonly toDate?: string,
  ) {}
}
