export class GetMyMenuQuery {
  constructor(
    public readonly userId: string,
    public readonly roleId: string,
    public readonly roleName: string,
    public readonly isSuperAdmin?: boolean,
    public readonly tenantId?: string,
    public readonly businessTypeCode?: string,
  ) {}
}
