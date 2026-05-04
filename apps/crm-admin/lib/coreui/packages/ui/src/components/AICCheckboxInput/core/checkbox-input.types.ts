/**
 * CheckboxInput component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular checkbox-input.component.ts
 */

import type { IconName } from "../../../core/models";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export type CheckboxInputState =
  | "default"
  | "checked"
  | "indeterminate"
  | "disabled"
  | "error";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CheckboxInputProps<
  OnChange = (checked: boolean) => void,
> {
  /** Whether the checkbox is checked. */
  checked?: boolean;
  /** Default checked state for uncontrolled usage. */
  defaultChecked?: boolean;
  /** Whether the checkbox is in indeterminate state. */
  indeterminate?: boolean;
  /** Label text. */
  label?: string;
  /** Description text (for rich layout). */
  description?: string;
  /** Icon name (activates rich layout). */
  icon?: IconName;
  /** Image URL (activates rich layout). */
  image?: string;
  /** Whether the checkbox is required. */
  required?: boolean;
  /** Whether the checkbox is disabled. */
  disabled?: boolean;
  /** Whether the checkbox is in error state. */
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
  /** Change handler. */
  onChange?: OnChange;
}
