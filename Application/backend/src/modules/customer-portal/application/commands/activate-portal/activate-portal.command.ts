export class ActivatePortalCommand {
  constructor(
    public readonly tenantId: string,
    public readonly adminId: string,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly menuCategoryId?: string,
  ) {}
}
