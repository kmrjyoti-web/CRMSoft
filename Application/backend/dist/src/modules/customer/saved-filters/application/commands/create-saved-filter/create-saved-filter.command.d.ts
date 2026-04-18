export declare class CreateSavedFilterCommand {
    readonly name: string;
    readonly entityType: string;
    readonly filterConfig: any;
    readonly createdById: string;
    readonly description?: string | undefined;
    readonly isDefault?: boolean | undefined;
    readonly isShared?: boolean | undefined;
    readonly sharedWithRoles?: string[] | undefined;
    constructor(name: string, entityType: string, filterConfig: any, createdById: string, description?: string | undefined, isDefault?: boolean | undefined, isShared?: boolean | undefined, sharedWithRoles?: string[] | undefined);
}
