/**
 * ToolbarButton component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular toolbar-button component
 */

// ---------------------------------------------------------------------------
// Size & Color unions
// ---------------------------------------------------------------------------

/** Available size presets for the ToolbarButton component. */
export type ToolbarButtonSize = "sm" | "md" | "lg";

/** Color presets mapped to AICButton variants. */
export type ToolbarButtonColor = "default" | "primary" | "danger";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Core props for the ToolbarButton component.
 * Framework adapters extend this with their own event/child types.
 */
export interface ToolbarButtonProps<OnClick = (e: unknown) => void> {
  /** Icon name (primary icon). */
  icon?: string;
  /** Alternative icon name — takes precedence if both are provided. */
  iconName?: string;
  /** Trailing icon name. */
  endIconName?: string;
  /** Button label text. */
  label?: string;
  /** Whether to visually show the label alongside the icon. */
  showLabel?: boolean;
  /** Keyboard shortcut string displayed as a badge. */
  shortcut?: string;
  /** Size preset. */
  size?: ToolbarButtonSize;
  /** Color preset — maps to a AICButton variant. */
  color?: ToolbarButtonColor;
  /** Whether to render a vertical separator after this button. */
  withSeparator?: boolean;
  /** Whether the button is in an active/pressed state. */
  active?: boolean;
  /** Whether the button is disabled. */
  disabled?: boolean;
  /** Additional CSS class name(s). */
  className?: string;
  /** Click handler. */
  onClick?: OnClick;
}
