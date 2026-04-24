/**
 * React AICToolbarButtonGroup component.
 * Renders an array of AICToolbarButton items in a grouped container with
 * shared border and active-state management.
 *
 * Source: Angular toolbar-button-group component
 */

import React, { useCallback } from "react";

import {
  cn,
  resolveGroupButtonSize,
  resolveGroupButtonColor,
  isButtonActive,
} from "@coreui/ui";

import type {
  ToolbarButtonGroupItem,
  ToolbarButtonSize,
  ToolbarButtonColor,
} from "@coreui/ui";

import { AICToolbarButton } from "../AICToolbarButton/AICToolbarButton";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * React-specific AICToolbarButtonGroup props.
 */
export interface ToolbarButtonGroupProps {
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
  onButtonClick?: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Design-system AICToolbarButtonGroup built on AICToolbarButton.
 *
 * Renders buttons in a grouped container with shared border, spacing,
 * and active-state tracking.
 */
export const AICToolbarButtonGroup: React.FC<ToolbarButtonGroupProps> = ({
  buttons,
  activeId,
  size,
  color,
  className,
  onButtonClick,
}) => {
  // -----------------------------------------------------------------------
  // Event handler
  // -----------------------------------------------------------------------

  const handleButtonClick = useCallback(
    (id: string) => (e: React.MouseEvent) => {
      onButtonClick?.(id);
    },
    [onButtonClick],
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1",
        className,
      )}
      data-testid="toolbar-button-group"
      role="group"
    >
      {buttons.map((item) => (
        <AICToolbarButton
          key={item.id}
          iconName={item.iconName}
          endIconName={item.endIconName}
          label={item.label}
          showLabel={item.showLabel}
          shortcut={item.shortcut}
          size={resolveGroupButtonSize(item, size)}
          color={resolveGroupButtonColor(item, color)}
          active={isButtonActive(item.id, activeId)}
          disabled={item.disabled}
          withSeparator={item.withSeparator}
          onClick={handleButtonClick(item.id)}
        />
      ))}
    </div>
  );
};

AICToolbarButtonGroup.displayName = "AICToolbarButtonGroup";
