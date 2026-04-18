export declare class UpdateMenuCommand {
    readonly id: string;
    readonly data: {
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
    };
    constructor(id: string, data: {
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
    });
}
