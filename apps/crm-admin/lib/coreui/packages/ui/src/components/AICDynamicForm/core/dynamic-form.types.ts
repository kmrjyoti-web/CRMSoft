/**
 * DynamicForm component types.
 * Framework-agnostic.
 * Renders a complete form from a FormSchema configuration.
 */

import type { FormSchema, TabConfig, RowConfig, FormFieldConfig } from "../../../core/models";

export type { FormSchema, TabConfig, RowConfig };

export type FormLayout = "standard" | "tabs";

export interface DynamicFormProps {
  schema: FormSchema;
  values?: Record<string, unknown>;
  errors?: Record<string, string>;
  onChange?: (key: string, value: unknown) => void;
  onSubmit?: (values: Record<string, unknown>) => void;
  onReset?: () => void;
  onAction?: (key: string, action: string) => void;
  disabled?: boolean;
  className?: string;
}

export interface FormState {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  dirty: boolean;
  valid: boolean;
}
