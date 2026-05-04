export class CreateMenuCommand {
  constructor(
    public readonly name: string,
    public readonly code?: string,
    public readonly icon?: string,
    public readonly route?: string,
    public readonly parentId?: string,
    public readonly sortOrder?: number,
    public readonly menuType?: string,
    public readonly permissionModule?: string,
    public readonly permissionAction?: string,
    public readonly badgeColor?: string,
    public readonly badgeText?: string,
    public readonly openInNewTab?: boolean,
  ) {}
}
