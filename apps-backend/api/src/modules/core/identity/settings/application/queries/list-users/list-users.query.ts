export class ListUsersQuery {
  constructor(
    public readonly tenantId: string,
    public readonly page: number = 1,
    public readonly limit: number = 50,
    public readonly search?: string,
    public readonly status?: string,
    public readonly userType?: string,
    public readonly roleId?: string,
  ) {}
}
