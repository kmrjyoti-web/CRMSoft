export interface MenuSeedItem {
  name: string;
  code: string;
  icon?: string;
  route?: string;
  menuType?: string;
  permissionModule?: string;
  permissionAction?: string;
  badgeColor?: string;
  badgeText?: string;
  openInNewTab?: boolean;
  isAdminOnly?: boolean;
  children?: MenuSeedItem[];
}

export class BulkSeedMenusCommand {
  constructor(
    public readonly menus: MenuSeedItem[],
    public readonly tenantId?: string,
    public readonly isSuperAdmin?: boolean,
  ) {}
}
