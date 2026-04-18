export declare class SetFieldValueDto {
    definitionId: string;
    valueText?: string;
    valueNumber?: number;
    valueDate?: string;
    valueBoolean?: boolean;
    valueJson?: Record<string, unknown>;
    valueDropdown?: string;
}
export declare class BulkSetFieldValuesDto {
    values: SetFieldValueDto[];
}
