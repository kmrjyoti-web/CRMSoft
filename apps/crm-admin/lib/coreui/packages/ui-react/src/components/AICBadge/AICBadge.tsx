/**
 * React AICBadge component.
 * Thin wrapper around the framework-agnostic core from @coreui/ui.
 */

import React, { useReducer, useCallback } from "react";

import {
  getBadgeStyles,
  getBadgeRemoveButtonStyles,
  getBadgeA11yProps,
  getBadgeRemoveA11yProps,
  getBadgeKeyboardHandlers,
  badgeReducer,
  initialBadgeState,
} from "@coreui/ui";

import type {
  BadgeVariant,
  BadgeSize,
  BadgeAction,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * React-specific AICBadge props.
 * - `children` accepts any `ReactNode`.
 * - The component also accepts all native `<span>` HTML attributes.
 */
export interface BadgeProps
  extends Omit<
    React.HTMLAttributes<HTMLSpanElement>,
    "children"
  > {
  /** Visual style variant. */
  variant?: BadgeVariant;
  /** Size preset. */
  size?: BadgeSize;
  /** Render as a small dot indicator instead of a text badge. */
  dot?: boolean;
  /** Whether the badge includes a remove/dismiss button. */
  removable?: boolean;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  /** AICBadge content. */
  children?: React.ReactNode;
  /** Callback when the remove button is clicked. */
  onRemove?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Design-system AICBadge built on the shared core logic from `@coreui/ui`.
 *
 * Uses `React.forwardRef` so consumers can attach refs to the underlying
 * DOM element.
 */
export const AICBadge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (props, ref) => {
    const {
      variant = "default",
      size = "md",
      dot = false,
      removable = false,
      ariaLabel,
      children,
      className,
      onRemove,
      ...rest
    } = props;

    // -----------------------------------------------------------------------
    // Internal interaction state
    // -----------------------------------------------------------------------

    const [internalState, dispatch] = useReducer(
      badgeReducer,
      initialBadgeState,
    );

    // If removed, render nothing
    if (internalState.isRemoved) {
      return null;
    }

    // -----------------------------------------------------------------------
    // Styles & a11y
    // -----------------------------------------------------------------------

    const classes = getBadgeStyles({
      variant,
      size,
      dot,
      removable,
      className,
    });

    const a11yProps = getBadgeA11yProps({
      removable,
      ariaLabel,
    });

    const removeA11yProps = removable
      ? getBadgeRemoveA11yProps(
          typeof children === "string" ? children : ariaLabel,
        )
      : null;

    const removeClasses = removable
      ? getBadgeRemoveButtonStyles(size)
      : "";

    const keyMap = getBadgeKeyboardHandlers();

    // -----------------------------------------------------------------------
    // Event handlers
    // -----------------------------------------------------------------------

    const handleRemoveClick = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        e.stopPropagation();
        dispatch({ type: "REMOVE" });
        onRemove?.();
      },
      [onRemove],
    );

    const handleRemoveKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLSpanElement>) => {
        const actionType = keyMap[e.key] as BadgeAction["type"] | undefined;
        if (actionType) {
          e.preventDefault();
          e.stopPropagation();
          dispatch({ type: actionType });
          onRemove?.();
        }
      },
      [keyMap, onRemove],
    );

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    // Dot mode — render just the dot indicator
    if (dot) {
      return (
        <span
          ref={ref}
          className={classes}
          {...a11yProps}
          {...rest}
        />
      );
    }

    return (
      <span
        ref={ref}
        className={classes}
        {...a11yProps}
        {...rest}
      >
        {/* AICBadge content */}
        {children}

        {/* Remove button */}
        {removable && (
          <span
            className={removeClasses}
            {...removeA11yProps}
            onClick={handleRemoveClick}
            onKeyDown={handleRemoveKeyDown}
          >
            <svg
              className="h-full w-full"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </span>
        )}
      </span>
    );
  },
);

AICBadge.displayName = "AICBadge";
