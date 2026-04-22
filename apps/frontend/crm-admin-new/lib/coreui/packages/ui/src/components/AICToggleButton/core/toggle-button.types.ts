/**
 * ToggleButton component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular toggle-button.component.ts
 */

import type { IconName } from "../../../core/models";

// ---------------------------------------------------------------------------
// Size
// ---------------------------------------------------------------------------

export type ToggleButtonSize = "sm" | "md" | "lg";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ToggleButtonProps<
  OnChange = (active: boolean) => void,
> {
  /** Whether the toggle is active. */
  active?: boolean;
  /** Default active state for uncontrolled usage. */
  defaultActive?: boolean;
  /** Button label text. */
  label?: string;
  /** Description text below the button. */
  description?: string;
  /** Prefix icon name. */
  icon?: IconName;
  /** Size preset. */
  size?: ToggleButtonSize;
  /** Whether the button is disabled. */
  disabled?: boolean;
  /** Whether the button is in error state. */
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
