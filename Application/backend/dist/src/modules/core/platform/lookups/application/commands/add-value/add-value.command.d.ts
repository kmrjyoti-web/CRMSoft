export declare class AddValueCommand {
    readonly lookupId: string;
    readonly value: string;
    readonly label: string;
    readonly icon?: string | undefined;
    readonly color?: string | undefined;
    readonly isDefault?: boolean | undefined;
    readonly parentId?: string | undefined;
    readonly configJson?: Record<string, unknown> | undefined;
    constructor(lookupId: string, value: string, label: string, icon?: string | undefined, color?: string | undefined, isDefault?: boolean | undefined, parentId?: string | undefined, configJson?: Record<string, unknown> | undefined);
}
