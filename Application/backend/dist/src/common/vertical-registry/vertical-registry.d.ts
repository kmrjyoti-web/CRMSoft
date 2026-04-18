export interface VerticalField {
    key: string;
    label: string;
    labelHi: string;
    type: 'text' | 'number' | 'select' | 'multi-select' | 'boolean' | 'date' | 'textarea';
    required?: boolean;
    options?: string[];
    pattern?: string;
}
export interface VerticalSchema {
    fields: VerticalField[];
}
export type EntityKey = 'CONTACT' | 'LEAD' | 'PRODUCT';
export declare const VERTICAL_SCHEMAS: Record<EntityKey, Record<string, VerticalSchema>>;
export declare function getVerticalSchema(entity: EntityKey, businessType: string): VerticalSchema;
export declare function validateVerticalData(data: Record<string, unknown>, schema: VerticalSchema): string[];
