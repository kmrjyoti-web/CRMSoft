export class GetContactsListQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly sortBy: string,
    public readonly sortOrder: 'asc' | 'desc',
    public readonly search?: string,
    public readonly isActive?: boolean,
    public readonly designation?: string,
    public readonly department?: string,
    public readonly organizationId?: string,
  ) {}
}
