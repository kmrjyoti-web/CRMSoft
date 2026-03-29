/**
 * SelectInput component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular select-input.component.ts + form-schema.model Option/ApiConfig.
 */

import type { IconName } from "../../../core/models";

// ---------------------------------------------------------------------------
// SelectInput option
// ---------------------------------------------------------------------------

/**
 * A single option in the SelectInput dropdown.
 * Extends the core Option model with group and disabled support.
 */
export interface SelectInputOption {
  /** Display label. */
  label: string;
  /** Stored value when selected. */
  value: string | number | boolean;
  /** Optional icon name. */
  icon?: IconName;
  /** Optional image URL. */
  image?: string;
  /** Optional description text. */
  description?: string;
  /** Whether this option is disabled. */
  disabled?: boolean;
  /** Group name for grouped options. */
  group?: string;
}

/** A group of options with a header label. */
export interface SelectInputOptionGroup {
  /** Group header label. */
  group: string;
  /** Options in this group. */
  options: SelectInputOption[];
}

// ---------------------------------------------------------------------------
// API config for dynamic options
// ---------------------------------------------------------------------------

/** Configuration for loading options from an API endpoint. */
export interface SelectInputApiConfig {
  /** API endpoint URL. */
  endpoint: string;
  /** HTTP method. Default: 'GET'. */
  method?: "GET" | "POST";
  /** Key in API response to use as option label. */
  labelKey: string;
  /** Key in API response to use as option value. */
  valueKey: string;
  /** Field key this select depends on (for cascading). */
  dependency?: string;
  /** Query/body parameter key for the parent value. */
  paramKey?: string;
}

// ---------------------------------------------------------------------------
// Variant, Size, Shape & State
// ---------------------------------------------------------------------------

/** Visual variant of the SelectInput. */
export type SelectInputVariant = "outlined" | "filled";

/** Size preset for the SelectInput. */
export type SelectInputSize = "sm" | "md" | "lg";

/** Shape of the SelectInput container corners. */
export type SelectInputShape = "rounded" | "square";

/** Resolved visual state for styling. */
export type SelectInputState =
  | "default"
  | "focused"
  | "error"
  | "disabled"
  | "readOnly";

// ---------------------------------------------------------------------------
// SelectInputProps
// ---------------------------------------------------------------------------

/**
 * Core props for the SelectInput component.
 */
export interface SelectInputProps<
  OnChange = (value: string | number | boolean | null) => void,
> {
  /** Currently selected value. */
  value?: string | number | boolean | null;
  /** Default value for uncontrolled usage. */
  defaultValue?: string | number | boolean | null;
  /** Static options array. */
  options?: SelectInputOption[];
  /** API config for dynamic options loading. */
  apiConfig?: SelectInputApiConfig;
  /** Parent value for dependent/cascading selects. */
  parentValue?: string | number | boolean | null;
  /** Label text. */
  label?: string;
  /** Placeholder text. */
  placeholder?: string;
  /** Visual variant. */
  variant?: SelectInputVariant;
  /** Size preset. */
  size?: SelectInputSize;
  /** Corner shape. */
  shape?: SelectInputShape;
  /** Whether the input is required. */
  required?: boolean;
  /** Whether the input is disabled. */
  disabled?: boolean;
  /** Whether the input is read-only. */
  readOnly?: boolean;
  /** Whether the input is in error state. */
  error?: boolean;
  /** Error message displayed below the input. */
  errorMessage?: string;
  /** Enable search/filter within the dropdown. */
  searchable?: boolean;
  /** Show clear button when a value is selected. */
  clearable?: boolean;
  /** Whether the dropdown is loading options. */
  loading?: boolean;
  /** Additional CSS class name(s). */
  className?: string;
  /** HTML id attribute. */
  id?: string;
  /** HTML name attribute. */
  name?: string;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  /** Design token overrides. */
  dt?: Record<string, unknown>;
  /** Value change handler. */
  onChange?: OnChange;
  /** Blur handler. */
  onBlur?: () => void;
  /** Focus handler. */
  onFocus?: () => void;
}
