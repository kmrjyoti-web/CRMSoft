export class UpdateMenuCommand {
  constructor(
    public readonly id: string,
    public readonly data: {
      name?: string;
      icon?: string;
      route?: string;
      parentId?: string;
      sortOrder?: number;
      menuType?: string;
      permissionModule?: string;
      permissionAction?: string;
      badgeColor?: string;
      badgeText?: string;
      openInNewTab?: boolean;
      isActive?: boolean;
    },
  ) {}
}
