/**
 * AICButton component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular aic-button.component.ts
 */

// ---------------------------------------------------------------------------
// Variant & Size unions
// ---------------------------------------------------------------------------

/** Visual style variants for the AICButton component. */
export type AICButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "outline"
  | "link";

/** Available size presets for the AICButton component. */
export type AICButtonSize = "sm" | "md" | "lg" | "xl";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Core props for the AICButton component.
 * Framework adapters extend this with their own event/child types.
 */
export interface AICButtonProps<
  OnClick = (e: unknown) => void,
  Children = unknown,
> {
  /** Visual style variant. */
  variant?: AICButtonVariant;
  /** Size preset. */
  size?: AICButtonSize;
  /** Native button type attribute. */
  type?: "button" | "submit" | "reset";
  /** Whether the button is disabled. */
  disabled?: boolean;
  /** Whether the button is in a loading/pending state. */
  loading?: boolean;
  /** Stretch the button to fill its container width. */
  fullWidth?: boolean;
  /** Whether the button is in an active/pressed visual state. */
  active?: boolean;
  /** Prefix icon name. */
  icon?: string;
  /** Suffix icon name. */
  suffixIcon?: string;
  /** Button label text. */
  label?: string;
  /** Keyboard shortcut label. */
  shortcut?: string;
  /** HTML title attribute. */
  title?: string;
  /** Additional CSS class name(s). */
  className?: string;
  /** Click handler. */
  onClick?: OnClick;
  /** Button content (children). */
  children?: Children;
}
