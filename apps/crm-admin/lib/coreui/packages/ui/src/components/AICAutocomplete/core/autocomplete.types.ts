/**
 * Autocomplete component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular autocomplete.component.ts + aic-autocomplete-core models.
 */

// ---------------------------------------------------------------------------
// View modes & operators
// ---------------------------------------------------------------------------

/** View mode for the autocomplete dropdown panel. */
export type AutocompleteViewMode = "general" | "table" | "card";

/** Matching operator for search. */
export type AutocompleteOperator = "contains" | "startsWith" | "equals";

/** Selection mode. */
export type AutocompleteSelectionMode = "single" | "multi";

// ---------------------------------------------------------------------------
// Option / Result
// ---------------------------------------------------------------------------

/** A single autocomplete result item. */
export interface AutocompleteOption {
  /** Display label. */
  label: string;
  /** Value used for selection. */
  value: string | number;
  /** Optional image URL (for card view). */
  image?: string;
  /** Optional description text. */
  description?: string;
  /** Whether this option is disabled. */
  disabled?: boolean;
  /** Raw data object for table view columns. */
  data?: Record<string, unknown>;
}

/** Column definition for table view. */
export interface AutocompleteTableColumn {
  /** Column header text. */
  header: string;
  /** Key in the option data object. */
  field: string;
  /** Column width (CSS). */
  width?: string;
  /** Text alignment. */
  align?: "left" | "right" | "center";
}

// ---------------------------------------------------------------------------
// Variant, Size & State
// ---------------------------------------------------------------------------

export type AutocompleteVariant = "outlined" | "filled";
export type AutocompleteSize = "sm" | "md" | "lg";
export type AutocompleteShape = "rounded" | "square";
export type AutocompleteState =
  | "default"
  | "focused"
  | "error"
  | "disabled"
  | "readOnly";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AutocompleteProps<
  OnChange = (value: AutocompleteOption | AutocompleteOption[] | null) => void,
> {
  /** Currently selected value (single mode) or values (multi mode). */
  value?: string | number | (string | number)[] | null;
  /** Default value for uncontrolled usage. */
  defaultValue?: string | number | null;
  /** Static options array. */
  options?: AutocompleteOption[];
  /** Label text. */
  label?: string;
  /** Placeholder text. */
  placeholder?: string;
  /** Visual variant. */
  variant?: AutocompleteVariant;
  /** Size preset. */
  size?: AutocompleteSize;
  /** Corner shape. */
  shape?: AutocompleteShape;
  /** View mode for the dropdown panel. */
  viewMode?: AutocompleteViewMode;
  /** Selection mode. */
  selectionMode?: AutocompleteSelectionMode;
  /** Match operator. */
  operator?: AutocompleteOperator;
  /** Table columns for table view. */
  tableColumns?: AutocompleteTableColumn[];
  /** Debounce delay in ms. Default: 300. */
  debounceMs?: number;
  /** Minimum characters before triggering search. Default: 1. */
  minChars?: number;
  /** Whether the input is required. */
  required?: boolean;
  /** Whether the input is disabled. */
  disabled?: boolean;
  /** Whether the input is read-only. */
  readOnly?: boolean;
  /** Whether the input is in error state. */
  error?: boolean;
  /** Error message. */
  errorMessage?: string;
  /** Whether options are loading. */
  loading?: boolean;
  /** Additional CSS class name(s). */
  className?: string;
  /** HTML id attribute. */
  id?: string;
  /** HTML name attribute. */
  name?: string;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  /** Selection change handler. */
  onChange?: OnChange;
  /** Callback fired when search query changes (for API-driven). */
  onSearch?: (query: string) => void;
  /** Blur handler. */
  onBlur?: () => void;
  /** Focus handler. */
  onFocus?: () => void;
}
