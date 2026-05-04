/**
 * Select component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 */

// ---------------------------------------------------------------------------
// Option
// ---------------------------------------------------------------------------

/** A single option in the Select dropdown. */
export interface SelectOption {
  /** Unique value used for selection. */
  value: string;
  /** Human-readable display label. */
  label: string;
  /** Whether this option is disabled and cannot be selected. */
  disabled?: boolean;
  /** Optional group name used to visually group options together. */
  group?: string;
}

// ---------------------------------------------------------------------------
// Size & State unions
// ---------------------------------------------------------------------------

/** Available size presets for the Select component. */
export type SelectSize = "sm" | "md" | "lg";

/** Resolved visual state used to determine which style set to apply. */
export type SelectState =
  | "default"
  | "open"
  | "focused"
  | "error"
  | "disabled";

// ---------------------------------------------------------------------------
// SelectProps
// ---------------------------------------------------------------------------

/**
 * Core props for the Select component.
 *
 * `OnChange` is purposely generic so each framework adapter can supply its
 * own event type (e.g. React synthetic event, native Event, etc.).
 */
export interface SelectProps<
  OnChange = (value: string | string[]) => void,
> {
  /** List of options to display in the dropdown. */
  options: SelectOption[];
  /** Currently selected value(s). A string for single select, string[] for multiple. */
  value?: string | string[];
  /** Size preset. */
  size?: SelectSize;
  /** Placeholder text shown when no value is selected. */
  placeholder?: string;
  /** Whether the select is in an error state. */
  error?: boolean;
  /** Error message displayed below the select when `error` is true. */
  errorMessage?: string;
  /** Whether the select is disabled. */
  disabled?: boolean;
  /** Whether to show a search input inside the dropdown for filtering options. */
  searchable?: boolean;
  /** Whether to show a clear button to reset the selection. */
  clearable?: boolean;
  /** Whether multiple values can be selected. */
  multiple?: boolean;
  /** Whether the options are currently loading. */
  loading?: boolean;
  /** Maximum height of the dropdown panel (CSS value). */
  maxHeight?: string;
  /** Additional CSS class name(s). */
  className?: string;
  /** HTML id attribute. */
  id?: string;
  /** HTML name attribute (for form submission). */
  name?: string;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  /** Change handler — generic to stay framework-agnostic. */
  onChange?: OnChange;
}
