/**
 * React AICToolbarButton component.
 * A toolbar-specific button that maps color presets to AICButton variants,
 * with icon support, optional label, shortcut badge, and separator.
 *
 * Source: Angular toolbar-button component
 */

import React, { useCallback } from "react";

import {
  cn,
  mapColorToVariant,
  resolveToolbarIcon,
} from "@coreui/ui";

import type {
  ToolbarButtonSize,
  ToolbarButtonColor,
  AICButtonVariant,
} from "@coreui/ui";

import { AICSmartButton } from "../AICSmartButton/AICSmartButton";
import { AICIcon } from "../AICIcon/AICIcon";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * React-specific AICToolbarButton props.
 */
export interface ToolbarButtonProps {
  /** Icon name (primary icon). */
  icon?: string;
  /** Alternative icon name — takes precedence if both are provided. */
  iconName?: string;
  /** Trailing icon name. */
  endIconName?: string;
  /** AICButton label text. */
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
  onClick?: (e: React.MouseEvent) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Design-system AICToolbarButton built on AICButton and AICIcon.
 *
 * Maps toolbar color presets to AICButton variants and supports icons,
 * labels, shortcut badges, active state, and optional separators.
 */
export const AICToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  iconName,
  endIconName,
  label,
  showLabel = false,
  shortcut,
  size = "md",
  color = "default",
  withSeparator = false,
  active = false,
  disabled = false,
  className,
  onClick,
}) => {
  // -----------------------------------------------------------------------
  // Resolve icon and variant
  // -----------------------------------------------------------------------

  const resolvedIcon = resolveToolbarIcon(icon, iconName);
  const variant = mapColorToVariant(color) as AICButtonVariant;

  // -----------------------------------------------------------------------
  // Event handlers
  // -----------------------------------------------------------------------

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      onClick?.(e);
    },
    [disabled, onClick],
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <span
      className="inline-flex items-center"
      data-testid="toolbar-button-wrapper"
    >
      <AICSmartButton
        variant={variant}
        size={size}
        active={active}
        disabled={disabled}
        title={label}
        shortcut={shortcut}
        className={cn(
          "toolbar-button",
          active && "bg-slate-100",
          className,
        )}
        onClick={handleClick}
      >
        {/* Leading icon */}
        {resolvedIcon && (
          <AICIcon
            name={resolvedIcon}
            size={size === "sm" ? "sm" : size === "lg" ? "lg" : "md"}
          />
        )}

        {/* Label */}
        {showLabel && label && (
          <span data-testid="toolbar-button-label">{label}</span>
        )}

        {/* Trailing icon */}
        {endIconName && (
          <AICIcon
            name={endIconName}
            size={size === "sm" ? "sm" : size === "lg" ? "lg" : "md"}
          />
        )}
      </AICSmartButton>

      {/* Separator */}
      {withSeparator && (
        <div
          className="mx-1 h-6 w-px bg-slate-200"
          data-testid="toolbar-button-separator"
        />
      )}
    </span>
  );
};

AICToolbarButton.displayName = "AICToolbarButton";
