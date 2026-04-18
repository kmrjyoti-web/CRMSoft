export declare class SetFieldValueCommand {
    readonly entityType: string;
    readonly entityId: string;
    readonly values: {
        definitionId: string;
        valueText?: string;
        valueNumber?: number;
        valueDate?: string;
        valueBoolean?: boolean;
        valueJson?: Record<string, unknown>;
        valueDropdown?: string;
    }[];
    constructor(entityType: string, entityId: string, values: {
        definitionId: string;
        valueText?: string;
        valueNumber?: number;
        valueDate?: string;
        valueBoolean?: boolean;
        valueJson?: Record<string, unknown>;
        valueDropdown?: string;
    }[]);
}
