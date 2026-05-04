// ── Icon Types ──────────────────────────────────────────
export type { IconName } from "./icon.types";
export { ICON_NAMES } from "./icon.types";

// ── UI Config ───────────────────────────────────────────
export type {
  FloatingMode,
  ControlSize,
  ControlSizeConfig,
  UiConfig,
} from "./ui-config.types";
export {
  FloatingModeSchema,
  ControlSizeSchema,
  UiConfigSchema,
  CONTROL_SIZES,
  GLOBAL_UI_CONFIG,
} from "./ui-config.types";

// ── Form Schema ─────────────────────────────────────────
export type {
  ControlType,
  SuffixAction,
  ValidationConfig,
  ApiConfig,
  Option,
  TransliterationConfig,
  FormFieldConfig,
  ColumnConfig,
  RowConfig,
  TabConfig,
  FormSchema,
} from "./form-schema.types";
export {
  CONTROL_TYPES,
  ControlTypeSchema,
  ValidationConfigSchema,
  ApiConfigSchema,
  OptionSchema,
  TransliterationConfigSchema,
  FormFieldConfigSchema,
  ColumnConfigSchema,
  RowConfigSchema,
  TabConfigSchema,
  FormSchemaSchema,
} from "./form-schema.types";

// ── App Config ──────────────────────────────────────────
export type {
  LanguageConfig,
  TransliterationAppConfig,
  ApiEndpointsConfig,
  AppConfig,
} from "./app-config.types";
export {
  LanguageConfigSchema,
  TransliterationAppConfigSchema,
  ApiEndpointsConfigSchema,
  AppConfigSchema,
  GLOBAL_APP_CONFIG,
} from "./app-config.types";

// ── Editor Config ───────────────────────────────────────
export type {
  EditorOption,
  EditorToolbarVisibility,
  EditorConfig,
} from "./editor-config.types";
export {
  EditorOptionSchema,
  EditorToolbarVisibilitySchema,
  EditorConfigSchema,
  DEFAULT_EDITOR_CONFIG,
} from "./editor-config.types";

// ── Confirm Dialog ──────────────────────────────────────
export type { DialogType, ConfirmDialogConfig } from "./confirm-dialog.types";
export {
  DialogTypeSchema,
  ConfirmDialogConfigSchema,
} from "./confirm-dialog.types";
