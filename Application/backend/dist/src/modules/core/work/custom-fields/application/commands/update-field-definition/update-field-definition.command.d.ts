export declare class UpdateFieldDefinitionCommand {
    readonly id: string;
    readonly data: {
        fieldLabel?: string;
        isRequired?: boolean;
        defaultValue?: string;
        options?: Record<string, unknown>;
        sortOrder?: number;
        isActive?: boolean;
    };
    constructor(id: string, data: {
        fieldLabel?: string;
        isRequired?: boolean;
        defaultValue?: string;
        options?: Record<string, unknown>;
        sortOrder?: number;
        isActive?: boolean;
    });
}
