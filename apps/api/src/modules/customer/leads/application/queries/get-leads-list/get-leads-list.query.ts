export class GetLeadsListQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly sortBy: string,
    public readonly sortOrder: 'asc' | 'desc',
    public readonly search?: string,
    public readonly isActive?: boolean,
    public readonly status?: string,
    public readonly priority?: string,
    public readonly allocatedToId?: string,
    public readonly contactId?: string,
    public readonly organizationId?: string,
  ) {}
}
