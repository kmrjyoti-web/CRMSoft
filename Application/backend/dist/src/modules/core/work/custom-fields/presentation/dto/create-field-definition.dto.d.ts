export declare class CreateFieldDefinitionDto {
    entityType: string;
    fieldName: string;
    fieldLabel: string;
    fieldType: string;
    isRequired?: boolean;
    defaultValue?: string;
    options?: Record<string, unknown>;
    sortOrder?: number;
}
