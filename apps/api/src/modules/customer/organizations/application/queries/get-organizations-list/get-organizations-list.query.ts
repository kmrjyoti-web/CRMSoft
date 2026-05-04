export class GetOrganizationsListQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly sortBy: string,
    public readonly sortOrder: 'asc' | 'desc',
    public readonly search?: string,
    public readonly city?: string,
    public readonly industry?: string,
    public readonly isActive?: boolean,
  ) {}
}
