export declare class UpdateLookupCommand {
    readonly lookupId: string;
    readonly data: {
        displayName?: string;
        description?: string;
    };
    constructor(lookupId: string, data: {
        displayName?: string;
        description?: string;
    });
}
