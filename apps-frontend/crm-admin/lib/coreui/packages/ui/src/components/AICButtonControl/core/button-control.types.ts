/**
 * ButtonControl component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular button-control.component.ts
 */

import type {
  ButtonVariant,
  ButtonSize,
} from "../../AICButton/core";

// ---------------------------------------------------------------------------
// Button type union
// ---------------------------------------------------------------------------

/** The rendering mode for ButtonControl. */
export type ButtonType = "standard" | "group" | "split";

// ---------------------------------------------------------------------------
// Option shape (for group / split modes)
// ---------------------------------------------------------------------------

/** A single option in a button group or split dropdown. */
export interface ButtonOption {
  /** Display label for the option. */
  label: string;
  /** Value emitted when the option is selected. */
  value: string;
  /** Optional icon name. */
  icon?: string;
  /** Optional command identifier. */
  command?: string;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Core props for the ButtonControl component.
 * Framework adapters extend this with their own event types.
 */
export interface ButtonControlProps<
  OnChange = (value: string | boolean) => void,
  OnClick = (e: unknown) => void,
> {
  /** Rendering mode: standard button, button group, or split button. */
  buttonType?: ButtonType;
  /** Visual style variant passed to AICButton. */
  variant?: ButtonVariant;
  /** Size preset passed to AICButton. */
  size?: ButtonSize;
  /** Primary label text. */
  label?: string;
  /** Button label text (alias for label). */
  buttonLabel?: string;
  /** Prefix icon name. */
  icon?: string;
  /** Suffix icon name. */
  suffixIcon?: string;
  /** Image URL for button content. */
  image?: string;
  /** Keyboard shortcut label. */
  shortcut?: string;
  /** Stretch the button to fill its container width. */
  fullWidth?: boolean;
  /** Whether the button acts as a toggle. */
  toggle?: boolean;
  /** Options for group or split modes. */
  options?: ButtonOption[];
  /** Current value (string for group/split, boolean for toggle). */
  value?: string | boolean;
  /** Whether the button is disabled. */
  disabled?: boolean;
  /** Additional CSS class name(s). */
  className?: string;
  /** Change handler for group/split/toggle interactions. */
  onChange?: OnChange;
  /** Click handler for standard mode. */
  onClick?: OnClick;
}
