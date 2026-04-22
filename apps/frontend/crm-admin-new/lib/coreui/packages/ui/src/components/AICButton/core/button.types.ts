/**
 * Button component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 */

// ---------------------------------------------------------------------------
// Variant, Size & State unions
// ---------------------------------------------------------------------------

/** Visual style variants for the Button component. */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "link";

/** Available size presets for the Button component. */
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Resolved visual state used to determine which style set to apply. */
export type ButtonState =
  | "default"
  | "hover"
  | "active"
  | "focused"
  | "disabled"
  | "loading";

// ---------------------------------------------------------------------------
// ButtonProps
// ---------------------------------------------------------------------------

/**
 * Core props for the Button component.
 *
 * `OnClick` is purposely generic so each framework adapter can supply its
 * own event type (e.g. React.MouseEvent, PointerEvent, etc.).
 */
export interface ButtonProps<OnClick = () => void> {
  /** Visual style variant. */
  variant?: ButtonVariant;
  /** Size preset. */
  size?: ButtonSize;
  /** Whether the button is disabled. */
  disabled?: boolean;
  /** Whether the button is in a loading / pending state. */
  loading?: boolean;
  /** Stretch the button to fill its container width. */
  fullWidth?: boolean;
  /** Icon identifier rendered before the label. */
  leftIcon?: string;
  /** Icon identifier rendered after the label. */
  rightIcon?: string;
  /** Native button type attribute. */
  type?: "button" | "submit" | "reset";
  /** Additional CSS class name(s). */
  className?: string;
  /** Text / label content of the button. */
  children?: string;
  /** The HTML element tag to render (e.g. "a", "button", "div"). */
  as?: string;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  /** Click handler — generic to stay framework-agnostic. */
  onClick?: OnClick;
}
