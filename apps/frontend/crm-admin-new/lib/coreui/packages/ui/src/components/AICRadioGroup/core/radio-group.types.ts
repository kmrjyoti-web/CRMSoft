/**
 * RadioGroup component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular radio-group.component.ts
 */

import type { IconName } from "../../../core/models";

// ---------------------------------------------------------------------------
// Option
// ---------------------------------------------------------------------------

/** A single option in the RadioGroup. */
export interface RadioGroupOption {
  label: string;
  value: string | number | boolean;
  icon?: IconName;
  image?: string;
  description?: string;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface RadioGroupProps<
  OnChange = (value: string | number | boolean) => void,
> {
  /** Currently selected value. */
  value?: string | number | boolean | null;
  /** Default value for uncontrolled usage. */
  defaultValue?: string | number | boolean | null;
  /** Options array. */
  options?: RadioGroupOption[];
  /** Label text. */
  label?: string;
  /** Number of grid columns (1-4). */
  cols?: number;
  /** Whether the group is required. */
  required?: boolean;
  /** Whether the group is disabled. */
  disabled?: boolean;
  /** Whether the group is in error state. */
  error?: boolean;
  /** Error message. */
  errorMessage?: string;
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
}
