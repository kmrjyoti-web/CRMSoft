export class ListRolesQuery {
  constructor(
    public readonly tenantId: string,
    public readonly search?: string,
  ) {}
}
