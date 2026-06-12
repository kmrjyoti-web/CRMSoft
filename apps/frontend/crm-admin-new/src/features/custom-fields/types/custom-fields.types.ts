// ── Enums ────────────────────────────────────────────────

export type FieldType =
  | "TEXT" | "TEXTAREA" | "NUMBER" | "DECIMAL" | "DATE" | "DATETIME"
  | "SELECT" | "MULTI_SELECT" | "CHECKBOX" | "RADIO"
  | "EMAIL" | "PHONE" | "URL" | "CURRENCY" | "LOOKUP" | "FILE";

export type EntityTypeForFields = "lead" | "contact" | "organization" | "quotation" | "product";

// ── Entities ─────────────────────────────────────────────

export interface CustomField {
  id: string;
  entityType: EntityTypeForFields;
  fieldName: string;
  fieldLabel: string;
  fieldType: FieldType;
  description?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  isRequired: boolean;
  isUnique: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  defaultValue?: unknown;
  sortOrder: number;
  section?: string;
  columnWidth?: "FULL" | "HALF" | "THIRD";
  isVisibleInList: boolean;
  isSearchable: boolean;
  isActive: boolean;
  isSystemField: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FormSchema {
  entityType: EntityTypeForFields;
  sections: {
    name: string;
    label: string;
    fields: CustomField[];
  }[];
}

export interface FieldValue {
  fieldId: string;
  fieldName: string;
  value: unknown;
}

// ── DTOs ─────────────────────────────────────────────────

export interface CreateCustomFieldDto {
  entityType: EntityTypeForFields;
  fieldName: string;
  fieldLabel: string;
  fieldType: FieldType;
  description?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  isRequired?: boolean;
  isUnique?: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  defaultValue?: unknown;
  section?: string;
  columnWidth?: "FULL" | "HALF" | "THIRD";
  isVisibleInList?: boolean;
  isSearchable?: boolean;
  sortOrder?: number;
}
