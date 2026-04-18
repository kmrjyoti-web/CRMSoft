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
export declare class BulkSeedMenusCommand {
    readonly menus: MenuSeedItem[];
    readonly tenantId?: string | undefined;
    readonly isSuperAdmin?: boolean | undefined;
    constructor(menus: MenuSeedItem[], tenantId?: string | undefined, isSuperAdmin?: boolean | undefined);
}
