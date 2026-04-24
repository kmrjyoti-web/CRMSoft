export class GetRawContactsListQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly sortBy: string,
    public readonly sortOrder: 'asc' | 'desc',
    public readonly search?: string,
    public readonly isActive?: boolean,
    public readonly status?: string,
    public readonly source?: string,
    public readonly companyName?: string,
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly createdAtFrom?: string,
    public readonly createdAtTo?: string,
  ) {}
}
