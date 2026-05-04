/**
 * ToolbarButtonGroup component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular toolbar-button-group component
 */

import type { ToolbarButtonColor, ToolbarButtonSize } from "../../AICToolbarButton/core/toolbar-button.types";

// ---------------------------------------------------------------------------
// Item type
// ---------------------------------------------------------------------------

/** A single button item within a ToolbarButtonGroup. */
export interface ToolbarButtonGroupItem {
  /** Unique identifier for the button. */
  id: string;
  /** Button label text. */
  label?: string;
  /** Icon name for the button. */
  iconName?: string;
  /** Trailing icon name. */
  endIconName?: string;
  /** Keyboard shortcut string. */
  shortcut?: string;
  /** Color preset for the button. */
  color?: ToolbarButtonColor;
  /** Size preset for the button. */
  size?: ToolbarButtonSize;
  /** Whether to visually show the label alongside the icon. */
  showLabel?: boolean;
  /** Whether the button is disabled. */
  disabled?: boolean;
  /** Whether to render a separator after this button. */
  withSeparator?: boolean;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Core props for the ToolbarButtonGroup component.
 * Framework adapters extend this with their own event/child types.
 */
export interface ToolbarButtonGroupProps<OnButtonClick = (id: string) => void> {
  /** Array of button items to render in the group. */
  buttons: ToolbarButtonGroupItem[];
  /** ID of the currently active button. */
  activeId?: string;
  /** Default size for all buttons in the group. */
  size?: ToolbarButtonSize;
  /** Default color for all buttons in the group. */
  color?: ToolbarButtonColor;
  /** Additional CSS class name(s). */
  className?: string;
  /** Callback when a button in the group is clicked. */
  onButtonClick?: OnButtonClick;
}
