export declare class CreateLookupCommand {
    readonly category: string;
    readonly displayName: string;
    readonly description?: string | undefined;
    readonly isSystem?: boolean | undefined;
    constructor(category: string, displayName: string, description?: string | undefined, isSystem?: boolean | undefined);
}
