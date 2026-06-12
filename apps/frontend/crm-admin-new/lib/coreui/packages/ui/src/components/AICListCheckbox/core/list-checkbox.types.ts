/**
 * ListCheckbox component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular list-checkbox.component.ts
 */

import type { IconName } from "../../../core/models";

// ---------------------------------------------------------------------------
// Option
// ---------------------------------------------------------------------------

/** A single option in the ListCheckbox. */
export interface ListCheckboxOption {
  label: string;
  value: string | number | boolean;
  icon?: IconName;
  description?: string;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export type ListCheckboxState =
  | "default"
  | "focused"
  | "error"
  | "disabled"
  | "readOnly";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ListCheckboxProps<
  OnChange = (values: (string | number | boolean)[]) => void,
> {
  /** Currently selected values. */
  value?: (string | number | boolean)[];
  /** Default values for uncontrolled usage. */
  defaultValue?: (string | number | boolean)[];
  /** Options array. */
  options?: ListCheckboxOption[];
  /** Label text. */
  label?: string;
  /** Placeholder for search input. */
  placeholder?: string;
  /** Whether the input is required. */
  required?: boolean;
  /** Whether the input is disabled. */
  disabled?: boolean;
  /** Whether the input is read-only. */
  readOnly?: boolean;
  /** Whether the input is in error state. */
  error?: boolean;
  /** Error message displayed below the component. */
  errorMessage?: string;
  /** Max height of the scrollable list. Default: '250px'. */
  maxHeight?: string;
  /** Max number of chips to display. Default: 5. */
  maxChips?: number;
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
