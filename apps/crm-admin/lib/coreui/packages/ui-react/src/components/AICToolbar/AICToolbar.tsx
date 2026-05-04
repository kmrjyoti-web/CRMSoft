/**
 * React AICToolbar component.
 * A toolbar with title on the left and action buttons on the right,
 * including an optional primary action with dropdown chevron.
 *
 * Source: Angular aic-toolbar component
 */

import React, { useCallback } from "react";

import {
  cn,
  getPrimaryActionVariant,
} from "@coreui/ui";

import type {
  AICToolbarAction,
  ToolbarButtonColor,
} from "@coreui/ui";

import { AICIcon } from "../AICIcon/AICIcon";
import { AICToolbarButton } from "../AICToolbarButton/AICToolbarButton";
import { AICButton } from "../AICButton/AICButton";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * React-specific AICToolbar props.
 */
export interface AICToolbarProps {
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
  onActionClick?: (actionId: string) => void;
  /** Callback when the primary action dropdown chevron is clicked. */
  onPrimaryDropdownClick?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Design-system AICToolbar with title on the left and action buttons on
 * the right. Supports a primary action button with an attached dropdown
 * chevron button.
 */
export const AICToolbar: React.FC<AICToolbarProps> = ({
  title,
  titleIcon,
  actions = [],
  primaryAction,
  className,
  onActionClick,
  onPrimaryDropdownClick,
}) => {
  // -----------------------------------------------------------------------
  // Event handlers
  // -----------------------------------------------------------------------

  const handleActionClick = useCallback(
    (actionId: string) => (e: React.MouseEvent) => {
      onActionClick?.(actionId);
    },
    [onActionClick],
  );

  const handlePrimaryClick = useCallback(
    (e: React.MouseEvent) => {
      if (primaryAction) {
        onActionClick?.(primaryAction.id);
      }
    },
    [primaryAction, onActionClick],
  );

  const handleDropdownClick = useCallback(
    (e: React.MouseEvent) => {
      onPrimaryDropdownClick?.();
    },
    [onPrimaryDropdownClick],
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const primaryVariant = getPrimaryActionVariant(primaryAction) as ToolbarButtonColor;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-4 py-2 border-b border-slate-200 bg-white",
        className,
      )}
      data-testid="aic-toolbar"
    >
      {/* ── Left: Title ───────────────────────────────────── */}
      <div className="flex items-center gap-2 min-w-0" data-testid="aic-toolbar-title">
        {titleIcon && (
          <AICIcon name={titleIcon} size="md" />
        )}
        <h2 className="text-lg font-semibold text-slate-800 truncate">
          {title}
        </h2>
      </div>

      {/* ── Right: Actions ────────────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0" data-testid="aic-toolbar-actions">
        {/* Regular actions */}
        {actions.map((action) => (
          <AICToolbarButton
            key={action.id}
            iconName={action.icon}
            label={action.label}
            showLabel={action.showLabel}
            shortcut={action.shortcut}
            color={action.variant || "default"}
            size={action.size || "md"}
            onClick={handleActionClick(action.id)}
          />
        ))}

        {/* Primary action with dropdown */}
        {primaryAction && (
          <span
            className="inline-flex items-center"
            data-testid="aic-toolbar-primary-action"
          >
            <AICButton
              variant={primaryVariant === "danger" ? "danger" : primaryVariant === "default" ? "ghost" : "primary"}
              size={primaryAction.size || "md"}
              onClick={handlePrimaryClick}
              className="rounded-r-none"
            >
              <AICIcon
                name={primaryAction.icon}
                size={primaryAction.size === "sm" ? "sm" : primaryAction.size === "lg" ? "lg" : "md"}
              />
              {primaryAction.showLabel !== false && (
                <span>{primaryAction.label}</span>
              )}
            </AICButton>
            <AICButton
              variant={primaryVariant === "danger" ? "danger" : primaryVariant === "default" ? "ghost" : "primary"}
              size={primaryAction.size || "md"}
              onClick={handleDropdownClick}
              className="rounded-l-none border-l border-white/30 px-2"
              data-testid="aic-toolbar-dropdown-trigger"
            >
              <AICIcon name="chevronDown" size="sm" />
            </AICButton>
          </span>
        )}
      </div>
    </div>
  );
};

AICToolbar.displayName = "AICToolbar";
