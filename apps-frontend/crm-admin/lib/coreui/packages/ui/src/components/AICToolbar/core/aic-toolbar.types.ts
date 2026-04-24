/**
 * AICToolbar component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular aic-toolbar component
 */

import type { ToolbarButtonColor, ToolbarButtonSize } from "../../AICToolbarButton/core/toolbar-button.types";

// ---------------------------------------------------------------------------
// Action type
// ---------------------------------------------------------------------------

/** A single action item within a AICToolbar. */
export interface AICToolbarAction {
  /** Unique identifier for the action. */
  id: string;
  /** Display label for the action. */
  label: string;
  /** Icon name for the action. */
  icon: string;
  /** Keyboard shortcut string. */
  shortcut?: string;
  /** Color variant for the action button. */
  variant?: ToolbarButtonColor;
  /** Size preset for the action button. */
  size?: ToolbarButtonSize;
  /** Whether to visually show the label alongside the icon. */
  showLabel?: boolean;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Core props for the AICToolbar component.
 * Framework adapters extend this with their own event/child types.
 */
export interface AICToolbarProps<
  OnActionClick = (actionId: string) => void,
  OnPrimaryDropdownClick = () => void,
> {
  /** Toolbar title text. */
  title: string;
  /** Icon name for the toolbar title. */
  titleIcon?: string;
  /** Array of action items rendered on the right side. */
  actions?: AICToolbarAction[];
  /** Primary action with optional dropdown. */
  primaryAction?: AICToolbarAction;
  /** Additional CSS class name(s). */
  className?: string;
  /** Callback when an action button is clicked. */
  onActionClick?: OnActionClick;
  /** Callback when the primary action dropdown chevron is clicked. */
  onPrimaryDropdownClick?: OnPrimaryDropdownClick;
}
