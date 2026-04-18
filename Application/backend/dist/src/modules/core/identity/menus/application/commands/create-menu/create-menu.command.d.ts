export declare class CreateMenuCommand {
    readonly name: string;
    readonly code?: string | undefined;
    readonly icon?: string | undefined;
    readonly route?: string | undefined;
    readonly parentId?: string | undefined;
    readonly sortOrder?: number | undefined;
    readonly menuType?: string | undefined;
    readonly permissionModule?: string | undefined;
    readonly permissionAction?: string | undefined;
    readonly badgeColor?: string | undefined;
    readonly badgeText?: string | undefined;
    readonly openInNewTab?: boolean | undefined;
    constructor(name: string, code?: string | undefined, icon?: string | undefined, route?: string | undefined, parentId?: string | undefined, sortOrder?: number | undefined, menuType?: string | undefined, permissionModule?: string | undefined, permissionAction?: string | undefined, badgeColor?: string | undefined, badgeText?: string | undefined, openInNewTab?: boolean | undefined);
}
