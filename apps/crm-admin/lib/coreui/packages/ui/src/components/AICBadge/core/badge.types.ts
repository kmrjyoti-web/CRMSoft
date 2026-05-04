/**
 * Badge component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 */

// ---------------------------------------------------------------------------
// Variant & Size unions
// ---------------------------------------------------------------------------

/** Visual style variants for the Badge component. */
export type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "outline";

/** Available size presets for the Badge component. */
export type BadgeSize = "sm" | "md" | "lg";

// ---------------------------------------------------------------------------
// BadgeProps
// ---------------------------------------------------------------------------

/**
 * Core props for the Badge component.
 *
 * `OnRemove` is purposely generic so each framework adapter can supply its
 * own event type.
 */
export interface BadgeProps<OnRemove = () => void> {
  /** Visual style variant. */
  variant?: BadgeVariant;
  /** Size preset. */
  size?: BadgeSize;
  /** Render as a small dot indicator instead of a text badge. */
  dot?: boolean;
  /** Whether the badge includes a remove/dismiss button. */
  removable?: boolean;
  /** Additional CSS class name(s). */
  className?: string;
  /** Text / label content of the badge. */
  children?: string;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  /** Callback when the remove button is clicked. */
  onRemove?: OnRemove;
}
