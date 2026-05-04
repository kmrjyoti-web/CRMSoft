export class CreateMenuCategoryCommand {
  constructor(
    public readonly tenantId: string,
    public readonly adminId: string,
    public readonly name: string,
    public readonly enabledRoutes: string[],
    public readonly nameHi?: string,
    public readonly description?: string,
    public readonly icon?: string,
    public readonly color?: string,
    public readonly isDefault?: boolean,
    public readonly sortOrder?: number,
  ) {}
}
