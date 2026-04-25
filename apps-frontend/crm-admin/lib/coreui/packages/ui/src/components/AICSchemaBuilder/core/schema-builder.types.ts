import type { FormSchema, FormFieldConfig, RowConfig, ControlType } from "../../../core/models";

export type { FormSchema, FormFieldConfig, RowConfig, ControlType };

// ── Schema Builder Props ────────────────────
export interface SchemaBuilderProps {
  initialSchema?: FormSchema | null;
  onSchemaChange?: (schema: FormSchema) => void;
  onDownload?: (schema: FormSchema) => void;
  onGenerateFromImage?: (images: Array<{ data: string; mimeType: string }>) => Promise<FormSchema>;
  onGenerateFromHtml?: (html: string) => Promise<FormSchema>;
  className?: string;
}

// ── Schema Builder State ────────────────────
export interface SchemaBuilderState {
  schema: FormSchema | null;
  loading: boolean;
  selectedField: FormFieldConfig | null;
  isTabbedMode: boolean;
  isDragging: boolean;
  draggedItem: { rowIndex: number; colIndex: number } | null;
}

// ── Field Editor Props ──────────────────────
export interface FieldEditorProps {
  field: FormFieldConfig | null;
  onFieldChange?: () => void;
  className?: string;
}

// ── Transliteration Languages ───────────────
export const TRANSLITERATION_LANGUAGES = [
  'Hindi',
  'Gujarati',
  'Marathi',
  'Urdu',
  'Bengali',
  'Tamil',
  'Telugu',
  'Kannada',
  'Punjabi',
  'Arabic',
] as const;

export type TransliterationLanguage = typeof TRANSLITERATION_LANGUAGES[number];

// ── Available Control Types ─────────────────
export const AVAILABLE_CONTROL_TYPES: ControlType[] = [
  'text', 'number', 'email', 'password', 'textarea',
  'select', 'multi-select',
  'checkbox', 'radio-group', 'switch',
  'date', 'mobile', 'currency',
  'rating', 'slider', 'tags', 'segment',
  'file-upload', 'signature', 'otp',
  'button', 'confirm-dialog', 'alert-dialog',
];
