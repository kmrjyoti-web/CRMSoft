import type { FormSchema, RowConfig, FormFieldConfig } from "./schema-builder.types";

// ── Initial State ───────────────────────────
export function createInitialBuilderState() {
  return {
    schema: null as FormSchema | null,
    loading: false,
    selectedField: null as FormFieldConfig | null,
    isTabbedMode: false,
    isDragging: false,
    draggedItem: null as { rowIndex: number; colIndex: number } | null,
  };
}

// ── Get Preview Rows ────────────────────────
export function getPreviewRows(schema: FormSchema | null): RowConfig[] {
  if (!schema) return [];
  if (schema.layout === 'tabs' && schema.tabs && schema.tabs.length > 0) {
    return schema.tabs[0].rows ?? [];
  }
  return schema.rows ?? [];
}

// ── Get Header Rows (for tabbed layout) ─────
export function getHeaderRows(schema: FormSchema | null): RowConfig[] {
  if (!schema) return [];
  if (schema.layout === 'tabs' && schema.rows) {
    return schema.rows;
  }
  return [];
}

// ── Move Field (Drag & Drop) ────────────────
export function moveField(
  schema: FormSchema,
  fromRowIdx: number,
  fromColIdx: number,
  toRowIdx: number,
  toColIdx: number
): FormSchema {
  const newSchema = JSON.parse(JSON.stringify(schema)) as FormSchema;

  let rows: RowConfig[];
  if (newSchema.layout === 'tabs' && newSchema.tabs && newSchema.tabs.length > 0) {
    rows = newSchema.tabs[0].rows;
  } else {
    rows = newSchema.rows ?? [];
  }

  if (!rows) return newSchema;

  const sourceRow = rows[fromRowIdx];
  const targetRow = rows[toRowIdx];
  if (!sourceRow || !targetRow) return newSchema;

  const itemToMove = sourceRow.columns[fromColIdx];
  sourceRow.columns.splice(fromColIdx, 1);
  targetRow.columns.splice(toColIdx, 0, itemToMove);

  return newSchema;
}

// ── Download Schema as JSON ─────────────────
export function downloadSchemaAsJson(schema: FormSchema): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(schema, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", dataStr);
  link.setAttribute("download", "form-schema.json");
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// ── Field Editor Helpers ────────────────────
export function updateFieldValidator(
  field: FormFieldConfig,
  key: string,
  value: boolean
): FormFieldConfig {
  const updated = { ...field };
  if (!updated.validators) updated.validators = {};
  (updated.validators as Record<string, unknown>)[key] = value;
  return updated;
}

export function updateFieldProp(
  field: FormFieldConfig,
  key: string,
  value: unknown
): FormFieldConfig {
  const updated = { ...field };
  if (!updated.props) updated.props = {};
  updated.props[key] = value;
  return updated;
}

export function updateFieldTransliteration(
  field: FormFieldConfig,
  key: string,
  value: unknown
): FormFieldConfig {
  const updated = { ...field };
  if (!updated.transliteration) {
    updated.transliteration = { enabled: false, defaultLanguage: 'Hindi' };
  }
  (updated.transliteration as unknown as Record<string, unknown>)[key] = value;
  if (key === 'enabled' && value === false) {
    delete updated.transliteration;
  }
  return updated;
}
