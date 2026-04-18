export declare class UpdatePortalUserCommand {
    readonly customerUserId: string;
    readonly menuCategoryId?: string | undefined;
    readonly pageOverrides?: Record<string, boolean> | undefined;
    readonly isActive?: boolean | undefined;
    constructor(customerUserId: string, menuCategoryId?: string | undefined, pageOverrides?: Record<string, boolean> | undefined, isActive?: boolean | undefined);
}
