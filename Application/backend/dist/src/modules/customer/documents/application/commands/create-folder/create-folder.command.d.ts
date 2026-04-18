export declare class CreateFolderCommand {
    readonly name: string;
    readonly userId: string;
    readonly description?: string | undefined;
    readonly parentId?: string | undefined;
    readonly color?: string | undefined;
    readonly icon?: string | undefined;
    constructor(name: string, userId: string, description?: string | undefined, parentId?: string | undefined, color?: string | undefined, icon?: string | undefined);
}
