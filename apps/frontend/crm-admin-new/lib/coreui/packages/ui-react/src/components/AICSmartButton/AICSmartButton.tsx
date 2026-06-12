/**
 * React AICButton component.
 * Standalone reusable button with variant, size, loading, icon support.
 *
 * Source: Angular aic-button.component.ts
 */

import React, { useCallback } from "react";

import {
  cn,
  getAICButtonVariantClasses,
  getAICButtonSizeClasses,
} from "@coreui/ui";

import type { AICButtonVariant, AICButtonSize } from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * React-specific AICButton props.
 */
export interface AICSmartButtonProps {
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
  /** AICButton label text. */
  label?: string;
  /** Keyboard shortcut label. */
  shortcut?: string;
  /** HTML title attribute. */
  title?: string;
  /** Additional CSS class name(s). */
  className?: string;
  /** Click handler. */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** AICButton content. */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Design-system AICButton built on the shared core logic from `@coreui/ui`.
 *
 * Supports variants, sizes, loading spinner, icons, shortcut badges, and
 * active state styling.
 */
export const AICSmartButton = React.forwardRef<HTMLButtonElement, AICSmartButtonProps>(
  (props, ref) => {
    const {
      variant = "primary",
      size = "md",
      type = "button",
      disabled = false,
      loading = false,
      fullWidth = false,
      active = false,
      icon,
      suffixIcon,
      label,
      shortcut,
      title,
      className,
      onClick,
      children,
    } = props;

    // -----------------------------------------------------------------------
    // Event handlers
    // -----------------------------------------------------------------------

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || loading) return;
        onClick?.(e);
      },
      [disabled, loading, onClick],
    );

    // -----------------------------------------------------------------------
    // Style composition
    // -----------------------------------------------------------------------

    const variantClasses = getAICButtonVariantClasses(variant);
    const sizeClasses = getAICButtonSizeClasses(size);

    const classes = cn(
      "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 relative",
      variantClasses,
      sizeClasses,
      fullWidth && "w-full flex",
      active && "ring-2 ring-offset-1",
      (disabled || loading) && "opacity-50 cursor-not-allowed",
      className,
    );

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        title={title}
        className={classes}
        onClick={handleClick}
        data-testid="aic-button"
      >
        {/* Loading spinner */}
        {loading && (
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
            data-testid="aic-button-spinner"
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
        )}

        {/* Prefix icon */}
        {icon && !loading && (
          <span className="inline-flex shrink-0" data-testid="aic-button-icon">
            {icon}
          </span>
        )}

        {/* Label / children */}
        {label && <span>{label}</span>}
        {children}

        {/* Suffix icon */}
        {suffixIcon && (
          <span
            className="inline-flex shrink-0"
            data-testid="aic-button-suffix-icon"
          >
            {suffixIcon}
          </span>
        )}

        {/* Keyboard shortcut */}
        {shortcut && (
          <kbd
            className="ml-1 px-1.5 py-0.5 text-xs font-mono bg-black/10 rounded"
            data-testid="aic-button-shortcut"
          >
            {shortcut}
          </kbd>
        )}
      </button>
    );
  },
);

AICSmartButton.displayName = "AICSmartButton";
