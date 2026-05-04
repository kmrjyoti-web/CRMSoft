export class ListPortalUsersQuery {
  constructor(
    public readonly tenantId: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly search?: string,
    public readonly isActive?: boolean,
  ) {}
}
