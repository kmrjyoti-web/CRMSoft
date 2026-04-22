/**
 * SegmentedControl component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular segmented-control.component.ts
 */

import type { IconName } from "../../../core/models";

// ---------------------------------------------------------------------------
// Option
// ---------------------------------------------------------------------------

/** A single segment option. */
export interface SegmentOption {
  label: string;
  value: string | number | boolean;
  icon?: IconName;
  image?: string;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Size
// ---------------------------------------------------------------------------

export type SegmentedControlSize = "sm" | "md" | "lg";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SegmentedControlProps<
  OnChange = (value: string | number | boolean) => void,
> {
  /** Currently selected value. */
  value?: string | number | boolean | null;
  /** Default value for uncontrolled usage. */
  defaultValue?: string | number | boolean | null;
  /** Options array. */
  options?: SegmentOption[];
  /** Label text. */
  label?: string;
  /** Size preset. */
  size?: SegmentedControlSize;
  /** Whether the control is required. */
  required?: boolean;
  /** Whether the control is disabled. */
  disabled?: boolean;
  /** Whether the control is in error state. */
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
