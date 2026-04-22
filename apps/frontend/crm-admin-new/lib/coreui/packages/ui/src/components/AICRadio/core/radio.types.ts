/**
 * Radio component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 */

// ---------------------------------------------------------------------------
// RadioProps
// ---------------------------------------------------------------------------

/**
 * Core props for a single Radio component.
 *
 * `OnChange` is purposely generic so each framework adapter can supply its
 * own event type.
 */
export interface RadioProps<OnChange = (value: string) => void> {
  /** The value this radio represents. */
  value?: string;
  /** Whether the radio is currently selected. */
  checked?: boolean;
  /** Whether the radio is disabled. */
  disabled?: boolean;
  /** Visible label text. */
  label?: string;
  /** Secondary description text rendered below the label. */
  description?: string;
  /** HTML name attribute — should match across a radio group. */
  name?: string;
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
// RadioGroupProps
// ---------------------------------------------------------------------------

/**
 * Core props for a Radio group container.
 *
 * `OnChange` is purposely generic so each framework adapter can supply its
 * own callback signature.
 */
export interface RadioGroupProps<OnChange = (value: string) => void> {
  /** HTML name attribute shared by all radios in the group. */
  name?: string;
  /** Currently selected value (single selection). */
  value?: string;
  /** Change handler called with the newly selected value. */
  onChange?: OnChange;
  /** Layout direction of the group items. */
  orientation?: "horizontal" | "vertical";
  /** Whether the group is in an error state. */
  error?: boolean;
  /** Error message to display below the group. */
  errorMessage?: string;
  /** Whether all radios in the group are disabled. */
  disabled?: boolean;
}
