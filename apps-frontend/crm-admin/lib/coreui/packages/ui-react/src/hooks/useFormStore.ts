// Source: core/ui-kit/angular/src/lib/control-library/services/form.store.ts
import { create } from "zustand";
import type {
  FormSchema,
  FormFieldConfig,
  ValidationConfig,
  RowConfig,
} from "@coreui/ui";
import { ValidationUtil } from "@coreui/ui";
import type { ControlLike } from "@coreui/ui";

// ── Types ───────────────────────────────────────────────

export interface FormStoreState {
  values: Record<string, unknown>;
  errors: Record<string, string | null>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  schema: FormSchema | null;

  // Actions
  setValue: (key: string, value: unknown) => void;
  setError: (key: string, error: string | null) => void;
  setTouched: (key: string) => void;
  setDirty: (key: string) => void;
  validateField: (
    key: string,
    validators?: ValidationConfig,
  ) => string | null;
  validateAll: () => boolean;
  getValues: () => Record<string, unknown>;
  reset: (defaults?: Record<string, unknown>) => void;
  loadSchema: (schema: FormSchema) => void;
}

// ── Helpers ─────────────────────────────────────────────

/**
 * Recursively extract all FormFieldConfig entries from a schema
 * (handles both standard rows and tabbed layouts).
 */
function extractFields(schema: FormSchema): FormFieldConfig[] {
  const fields: FormFieldConfig[] = [];

  const processRows = (rows: RowConfig[]) => {
    rows.forEach((row) => {
      row.columns.forEach((col) => {
        fields.push(col.field);
      });
    });
  };

  if (schema.rows) processRows(schema.rows);
  if (schema.tabs) {
    schema.tabs.forEach((tab) => {
      processRows(tab.rows);
    });
  }

  return fields;
}

// ── Store ───────────────────────────────────────────────

export const useFormStore = create<FormStoreState>((set, get) => ({
  values: {},
  errors: {},
  touched: {},
  dirty: {},
  schema: null,

  setValue: (key, value) => {
    set({ values: { ...get().values, [key]: value } });
  },

  setError: (key, error) => {
    set({ errors: { ...get().errors, [key]: error } });
  },

  setTouched: (key) => {
    set({ touched: { ...get().touched, [key]: true } });
  },

  setDirty: (key) => {
    set({ dirty: { ...get().dirty, [key]: true } });
  },

  validateField: (key, validators) => {
    const state = get();
    const value = state.values[key];

    // Use provided validators or find from schema
    let validationConfig = validators;
    if (!validationConfig && state.schema) {
      const fields = extractFields(state.schema);
      const field = fields.find((f) => f.key === key);
      validationConfig = field?.validators;
    }

    if (!validationConfig) return null;

    const errors = ValidationUtil.validate(value, validationConfig);

    if (errors) {
      const controlLike: ControlLike = {
        value,
        errors,
        invalid: true,
        dirty: state.dirty[key] ?? false,
        touched: state.touched[key] ?? false,
      };
      const message = ValidationUtil.getErrorMessage(controlLike);
      set({ errors: { ...state.errors, [key]: message } });
      return message;
    } else {
      set({ errors: { ...state.errors, [key]: null } });
      return null;
    }
  },

  validateAll: () => {
    const state = get();
    if (!state.schema) return true;

    const fields = extractFields(state.schema);
    let allValid = true;

    fields.forEach((field) => {
      if (field.validators) {
        const error = get().validateField(field.key, field.validators);
        if (error) allValid = false;
      }
    });

    return allValid;
  },

  getValues: () => {
    return { ...get().values };
  },

  reset: (defaults) => {
    set({
      values: defaults ?? {},
      errors: {},
      touched: {},
      dirty: {},
    });
  },

  loadSchema: (schema) => {
    const fields = extractFields(schema);
    const values: Record<string, unknown> = {};
    const errors: Record<string, string | null> = {};
    const touched: Record<string, boolean> = {};
    const dirty: Record<string, boolean> = {};

    fields.forEach((field) => {
      values[field.key] = field.defaultValue ?? "";
      errors[field.key] = null;
      touched[field.key] = false;
      dirty[field.key] = false;
    });

    set({ schema, values, errors, touched, dirty });
  },
}));
