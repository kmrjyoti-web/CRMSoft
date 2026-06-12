/**
 * CheckboxGroup component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular checkbox-group.component.ts
 */

import type { IconName } from "../../../core/models";

// ---------------------------------------------------------------------------
// Option
// ---------------------------------------------------------------------------

/** A single option in the CheckboxGroup. */
export interface CheckboxGroupOption {
  label: string;
  value: string | number | boolean;
  icon?: IconName;
  image?: string;
  description?: string;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Layout variant
// ---------------------------------------------------------------------------

export type CheckboxGroupVariant = "grid" | "list";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CheckboxGroupProps<
  OnChange = (values: (string | number | boolean)[]) => void,
> {
  /** Currently selected values. */
  value?: (string | number | boolean)[];
  /** Default values for uncontrolled usage. */
  defaultValue?: (string | number | boolean)[];
  /** Options array. */
  options?: CheckboxGroupOption[];
  /** Label text. */
  label?: string;
  /** Layout variant. Default: 'grid'. */
  variant?: CheckboxGroupVariant;
  /** Number of grid columns (1-4). */
  cols?: number;
  /** Max height for list variant. Default: '250px'. */
  maxHeight?: string;
  /** Minimum number of selections required. */
  minSelection?: number;
  /** Maximum number of selections allowed. */
  maxSelection?: number;
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
