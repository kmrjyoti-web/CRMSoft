/**
 * AICAutocomplete component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Advanced autocomplete with multiple view modes, operator-based query parsing,
 * keyboard navigation, and helper dropdown.
 */

// ── View Modes ──────────────────────────────
export type AICAutocompleteViewMode = "table" | "cards" | "general";

export type AutocompleteWildcardOperator =
  | "AUTO"
  | "CONTAINS"
  | "STARTS_WITH"
  | "ENDS_WITH"
  | "EXACT";

export type AutocompleteConditionalOperator = "AND" | "NOT" | "AND_NOT";

// ── Search Params ───────────────────────────
export interface AutoCompleteSearchParam {
  parameter_name?: string;
  parameter_code?: string;
  conditional_operator?: string;
  wildcard_operator?: string;
  parameter_value?: string;
}

export interface AutoCompleteRequest {
  take: number;
  base_filters: AutoCompleteSearchParam[];
  search_filters: AutoCompleteSearchParam[];
}

// ── Table/Card Schema ───────────────────────
export interface AutocompleteTableColumn {
  header: string;
  field: string;
  width?: string;
  align?: "left" | "right" | "center";
  cardHeader?: boolean;
  cardRow?: boolean;
  cardOrder?: number;
  cardLabel?: string;
  columnType?: "TEXT" | "IMAGE";
}

export interface AutocompleteFieldConfig {
  code: string;
  label: string;
  parameterName: string;
  defaultWildcard?: AutocompleteWildcardOperator;
  allowNot?: boolean;
}

// ── Feature Flags ───────────────────────────
export interface AICAutocompleteFeatureFlags {
  shiftHelperEnabled: boolean;
  fieldBadgesEnabled: boolean;
  shortcutsEnabled: boolean;
}

// ── Source Config ────────────────────────────
export interface AutocompleteSelectionConfig {
  closeOnSelect?: boolean;
  displayMode?: "single" | "multi";
  displayField?: string;
  displayFields?: string[];
  displaySeparator?: string;
}

export interface AutocompletePanelConfig {
  maxHeight?: string;
  minWidth?: string;
  maxWidth?: string;
}

export interface AutocompleteSourceConfig {
  key: string;
  apiUrl?: string;
  fetchFn?: (params: { query: string; payload: unknown }) => Promise<unknown>;
  takeDefault?: number;
  fields: AutocompleteFieldConfig[];
  viewMode: AICAutocompleteViewMode;
  showClear?: boolean;
  tableColumns?: AutocompleteTableColumn[];
  featureFlags?: Partial<AICAutocompleteFeatureFlags>;
  baseFilters?: Record<string, unknown>;
  selectionConfig?: AutocompleteSelectionConfig;
  panelConfig?: AutocompletePanelConfig;
}

// ── Control Config ──────────────────────────
export interface AICAutocompleteControlConfig {
  sourceKey: string;
  minLength?: number;
  placeholder?: string;
  readonly?: boolean;
  showClear?: boolean;
  viewMode?: AICAutocompleteViewMode;
  showFilterSummary?: boolean;
  panelWidth?: string;
  panelMaxHeight?: string;
  overrideBaseFilters?: Record<string, unknown>;
}

// ── Helper Items ────────────────────────────
export type HelperItemType = "field" | "wildcard";

export interface FieldHelperItem {
  type: "field";
  code: string;
  label: string;
}

export interface WildcardHelperItem {
  type: "wildcard";
  wildKind: string;
  label: string;
}

export type HelperItem = FieldHelperItem | WildcardHelperItem;

// ── Keyboard Actions ────────────────────────
export type AutocompleteKeyAction =
  | "moveUp"
  | "moveDown"
  | "select"
  | "toggleHelper"
  | "closeHelper"
  | "none";

// ── Component Props ─────────────────────────
export interface AICAutocompleteProps {
  sourceConfig: AutocompleteSourceConfig;
  controlConfig?: AICAutocompleteControlConfig;
  value?: unknown;
  label?: string;
  icon?: string;
  required?: boolean;
  baseFilters?: Record<string, unknown>;
  className?: string;
  onSelect?: (row: unknown) => void;
  onAddNew?: () => void;
  onReset?: () => void;
  onChange?: (value: unknown) => void;
}
