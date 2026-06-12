// ── Types ───────────────────────────────────
export type {
  FormSchema,
  FormFieldConfig,
  RowConfig,
  ControlType,
  SchemaBuilderProps,
  SchemaBuilderState,
  FieldEditorProps,
  TransliterationLanguage,
} from "./schema-builder.types";

export {
  TRANSLITERATION_LANGUAGES,
  AVAILABLE_CONTROL_TYPES,
} from "./schema-builder.types";

// ── Logic ───────────────────────────────────
export {
  createInitialBuilderState,
  getPreviewRows,
  getHeaderRows,
  moveField,
  downloadSchemaAsJson,
  updateFieldValidator,
  updateFieldProp,
  updateFieldTransliteration,
} from "./schema-builder.logic";
