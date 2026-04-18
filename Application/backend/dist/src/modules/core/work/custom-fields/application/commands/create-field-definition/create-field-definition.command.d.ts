export declare class CreateFieldDefinitionCommand {
    readonly entityType: string;
    readonly fieldName: string;
    readonly fieldLabel: string;
    readonly fieldType: string;
    readonly isRequired?: boolean | undefined;
    readonly defaultValue?: string | undefined;
    readonly options?: Record<string, unknown> | undefined;
    readonly sortOrder?: number | undefined;
    constructor(entityType: string, fieldName: string, fieldLabel: string, fieldType: string, isRequired?: boolean | undefined, defaultValue?: string | undefined, options?: Record<string, unknown> | undefined, sortOrder?: number | undefined);
}
