/**
 * MultiSelectInput component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular multi-select-input.component.ts
 */

import type { IconName } from "../../../core/models";

// ---------------------------------------------------------------------------
// Option
// ---------------------------------------------------------------------------

/** A single option in the MultiSelectInput dropdown. */
export interface MultiSelectOption {
  label: string;
  value: string | number | boolean;
  icon?: IconName;
  description?: string;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Variant, Size, Shape & State
// ---------------------------------------------------------------------------

export type MultiSelectVariant = "outlined" | "filled";
export type MultiSelectSize = "sm" | "md" | "lg";
export type MultiSelectShape = "rounded" | "square";
export type MultiSelectState =
  | "default"
  | "focused"
  | "error"
  | "disabled"
  | "readOnly";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface MultiSelectInputProps<
  OnChange = (values: (string | number | boolean)[]) => void,
> {
  /** Currently selected values. */
  value?: (string | number | boolean)[];
  /** Default values for uncontrolled usage. */
  defaultValue?: (string | number | boolean)[];
  /** Options array. */
  options?: MultiSelectOption[];
  /** Label text. */
  label?: string;
  /** Placeholder text. */
  placeholder?: string;
  /** Visual variant. */
  variant?: MultiSelectVariant;
  /** Size preset. */
  size?: MultiSelectSize;
  /** Corner shape. */
  shape?: MultiSelectShape;
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
  /** Maximum number of selections allowed. */
  maxSelection?: number;
  /** Whether the input is loading options. */
  loading?: boolean;
  /** Additional CSS class name(s). */
  className?: string;
  /** HTML id attribute. */
  id?: string;
  /** HTML name attribute. */
  name?: string;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  /** Value change handler. */
  onChange?: OnChange;
  /** Blur handler. */
  onBlur?: () => void;
  /** Focus handler. */
  onFocus?: () => void;
}
