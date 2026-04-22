/**
 * React AICButton component.
 * Thin wrapper around the framework-agnostic core from @coreui/ui.
 */

import React, { useReducer, useCallback } from "react";

import {
  getButtonStyles,
  getButtonA11yProps,
  getButtonKeyboardHandlers,
  buttonReducer,
  initialButtonState,
  resolveButtonState,
} from "@coreui/ui";

import type {
  ButtonVariant,
  ButtonSize,
  ButtonAction,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * React-specific AICButton props.
 * - `leftIcon` / `rightIcon` are widened to `ReactNode` (core uses `string`).
 * - `children` accepts any `ReactNode`.
 * - The component also accepts all native `<button>` HTML attributes.
 */
export interface ButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "type" | "children"
  > {
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
  /** Icon rendered before the label. */
  leftIcon?: React.ReactNode;
  /** Icon rendered after the label. */
  rightIcon?: React.ReactNode;
  /** Native button type attribute. */
  type?: "button" | "submit" | "reset";
  /** The HTML element tag to render. Defaults to "button". */
  as?: React.ElementType;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  /** AICButton content. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Design-system AICButton built on the shared core logic from `@coreui/ui`.
 *
 * Uses `React.forwardRef` so consumers can attach refs to the underlying
 * DOM element.
 */
export const AICButton = React.forwardRef<HTMLElement, ButtonProps>(
  (props, ref) => {
    const {
      variant = "primary",
      size = "md",
      disabled = false,
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      type = "button",
      as,
      ariaLabel,
      children,
      className,
      onClick,
      onKeyDown,
      onMouseDown,
      onMouseUp,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      ...rest
    } = props;

    // -----------------------------------------------------------------------
    // Internal interaction state
    // -----------------------------------------------------------------------

    const [internalState, dispatch] = useReducer(
      buttonReducer,
      initialButtonState,
    );

    const _visualState = resolveButtonState(
      { disabled, loading },
      internalState,
    );

    // -----------------------------------------------------------------------
    // Styles & a11y
    // -----------------------------------------------------------------------

    const classes = getButtonStyles({
      variant,
      size,
      disabled,
      loading,
      fullWidth,
      className,
    });

    const a11yProps = getButtonA11yProps({
      disabled,
      loading,
      ariaLabel,
      as: typeof as === "string" ? as : undefined,
    });

    const keyMap = getButtonKeyboardHandlers();

    // -----------------------------------------------------------------------
    // Event handlers
    // -----------------------------------------------------------------------

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        if (disabled || loading) return;
        onClick?.(e as React.MouseEvent<HTMLButtonElement>);
      },
      [disabled, loading, onClick],
    );

    const handleMouseDown = useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        dispatch({ type: "PRESS" });
        onMouseDown?.(e as React.MouseEvent<HTMLButtonElement>);
      },
      [onMouseDown],
    );

    const handleMouseUp = useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        dispatch({ type: "RELEASE" });
        onMouseUp?.(e as React.MouseEvent<HTMLButtonElement>);
      },
      [onMouseUp],
    );

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        dispatch({ type: "MOUSE_ENTER" });
        onMouseEnter?.(e as React.MouseEvent<HTMLButtonElement>);
      },
      [onMouseEnter],
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        dispatch({ type: "MOUSE_LEAVE" });
        onMouseLeave?.(e as React.MouseEvent<HTMLButtonElement>);
      },
      [onMouseLeave],
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLElement>) => {
        dispatch({ type: "FOCUS" });
        onFocus?.(e as React.FocusEvent<HTMLButtonElement>);
      },
      [onFocus],
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLElement>) => {
        dispatch({ type: "BLUR" });
        onBlur?.(e as React.FocusEvent<HTMLButtonElement>);
      },
      [onBlur],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLElement>) => {
        if (disabled || loading) return;

        const actionType = keyMap[e.key] as ButtonAction["type"] | undefined;
        if (actionType) {
          e.preventDefault();
          dispatch({ type: actionType });
          // For keyboard activation, also fire the click handler.
          if (actionType === "PRESS") {
            onClick?.(e as unknown as React.MouseEvent<HTMLButtonElement>);
          }
        }
        onKeyDown?.(e as React.KeyboardEvent<HTMLButtonElement>);
      },
      [disabled, loading, keyMap, onClick, onKeyDown],
    );

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    const Component = as ?? "button";

    const elementProps: Record<string, unknown> = {
      ref,
      className: classes,
      ...a11yProps,
      ...rest,
      onClick: handleClick,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
    };

    // Only pass `type` and `disabled` to native button elements.
    if (Component === "button") {
      elementProps.type = type;
      elementProps.disabled = disabled || loading;
    }

    return (
      <Component {...elementProps}>
        {/* Left icon */}
        {leftIcon && (
          <span className="inline-flex shrink-0 mr-2">{leftIcon}</span>
        )}

        {/* Label */}
        {children}

        {/* Right icon */}
        {rightIcon && (
          <span className="inline-flex shrink-0 ml-2">{rightIcon}</span>
        )}

        {/* Loading spinner overlay */}
        {loading && (
          <span className="absolute inset-0 inline-flex items-center justify-center">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </span>
        )}
      </Component>
    );
  },
);

AICButton.displayName = "AICButton";
