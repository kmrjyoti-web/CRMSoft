export class GetMenuTreeQuery {
  constructor(
    public readonly includeInactive: boolean = true,
    public readonly tenantId?: string,
    public readonly isSuperAdmin?: boolean,
    public readonly industryCode?: string,
  ) {}
}
