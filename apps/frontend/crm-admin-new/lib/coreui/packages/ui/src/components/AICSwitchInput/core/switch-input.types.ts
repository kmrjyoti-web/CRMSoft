/**
 * SwitchInput component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular switch-input.component.ts
 */

import type { IconName } from "../../../core/models";

// ---------------------------------------------------------------------------
// Size
// ---------------------------------------------------------------------------

export type SwitchInputSize = "sm" | "md" | "lg";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SwitchInputProps<
  OnChange = (checked: boolean) => void,
> {
  /** Whether the switch is on. */
  checked?: boolean;
  /** Default checked state for uncontrolled usage. */
  defaultChecked?: boolean;
  /** Label text. */
  label?: string;
  /** Description text (activates rich layout). */
  description?: string;
  /** Icon name (activates rich layout). */
  icon?: IconName;
  /** Image URL (activates rich layout). */
  image?: string;
  /** Text shown when switch is on. */
  onLabel?: string;
  /** Text shown when switch is off. */
  offLabel?: string;
  /** Size preset. */
  size?: SwitchInputSize;
  /** Custom active color (CSS color value). */
  activeColor?: string;
  /** Whether the switch is required. */
  required?: boolean;
  /** Whether the switch is disabled. */
  disabled?: boolean;
  /** Whether the switch is in error state. */
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
