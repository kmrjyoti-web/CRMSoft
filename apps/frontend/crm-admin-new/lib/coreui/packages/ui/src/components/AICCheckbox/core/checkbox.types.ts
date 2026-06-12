/**
 * Checkbox component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 */

// ---------------------------------------------------------------------------
// State union
// ---------------------------------------------------------------------------

/** Visual state of the checkbox. */
export type CheckboxState = "unchecked" | "checked" | "indeterminate";

// ---------------------------------------------------------------------------
// CheckboxProps
// ---------------------------------------------------------------------------

/**
 * Core props for the Checkbox component.
 *
 * `OnChange` is purposely generic so each framework adapter can supply its
 * own event type.
 */
export interface CheckboxProps<OnChange = (checked: boolean) => void> {
  /** Whether the checkbox is checked. */
  checked?: boolean;
  /** Whether the checkbox is in the indeterminate (mixed) state. */
  indeterminate?: boolean;
  /** Whether the checkbox is disabled. */
  disabled?: boolean;
  /** Visible label text. */
  label?: string;
  /** Secondary description text rendered below the label. */
  description?: string;
  /** Whether the checkbox is in an error state. */
  error?: boolean;
  /** HTML name attribute for the underlying input. */
  name?: string;
  /** HTML value attribute for the underlying input. */
  value?: string;
  /** Additional CSS class name(s). */
  className?: string;
  /** HTML id attribute. */
  id?: string;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  /** Change handler — generic to stay framework-agnostic. */
  onChange?: OnChange;
}

// ---------------------------------------------------------------------------
// CheckboxGroupProps
// ---------------------------------------------------------------------------

/**
 * Core props for a group of Checkbox components.
 *
 * `OnChange` is purposely generic so each framework adapter can supply its
 * own callback signature.
 */
export interface CheckboxGroupProps<OnChange = (values: string[]) => void> {
  /** Currently selected values. */
  values?: string[];
  /** Change handler called with the updated array of selected values. */
  onChange?: OnChange;
  /** Layout direction of the group items. */
  orientation?: "horizontal" | "vertical";
  /** Whether all checkboxes in the group are disabled. */
  disabled?: boolean;
  /** Whether all checkboxes in the group are in an error state. */
  error?: boolean;
  /** HTML name attribute shared by all checkboxes in the group. */
  name?: string;
}
