/**
 * Switch component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 */

// ---------------------------------------------------------------------------
// Size union
// ---------------------------------------------------------------------------

/** Available size presets for the Switch component. */
export type SwitchSize = "sm" | "md" | "lg";

// ---------------------------------------------------------------------------
// SwitchProps
// ---------------------------------------------------------------------------

/**
 * Core props for the Switch component.
 *
 * `OnChange` is purposely generic so each framework adapter can supply its
 * own event type.
 */
export interface SwitchProps<OnChange = (checked: boolean) => void> {
  /** Whether the switch is toggled on. */
  checked?: boolean;
  /** Whether the switch is disabled. */
  disabled?: boolean;
  /** Visible label text. */
  label?: string;
  /** Secondary description text rendered below the label. */
  description?: string;
  /** Size preset for the switch. */
  size?: SwitchSize;
  /** Position of the label relative to the switch track. */
  labelPosition?: "left" | "right";
  /** Additional CSS class name(s). */
  className?: string;
  /** HTML id attribute. */
  id?: string;
  /** HTML name attribute for the underlying input. */
  name?: string;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  /** Change handler — generic to stay framework-agnostic. */
  onChange?: OnChange;
}
