/**
 * Button style composition.
 * Combines base classes, variant, size, state modifiers, and custom className
 * into a single Tailwind class string.
 *
 * Framework-agnostic — no React/Angular imports.
 */

import { cn } from "../../../utils/cn";
import { variantStyles, sizeStyles } from "./button.variants";
import type { ButtonVariant, ButtonSize } from "./button.types";

// ---------------------------------------------------------------------------
// Style props accepted by the composer
// ---------------------------------------------------------------------------

export interface GetButtonStylesProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Base classes shared by every button instance
// ---------------------------------------------------------------------------

const BASE_CLASSES =
  "inline-flex items-center justify-center font-medium rounded-[var(--radius-md)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2";

// ---------------------------------------------------------------------------
// getButtonStyles
// ---------------------------------------------------------------------------

/**
 * Returns a single, merged class string for the Button component.
 *
 * @param props - Subset of button props that influence styling.
 * @returns Merged Tailwind class string.
 */
export function getButtonStyles(props: GetButtonStylesProps): string {
  const {
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    fullWidth = false,
    className,
  } = props;

  return cn(
    BASE_CLASSES,
    variantStyles[variant],
    sizeStyles[size],
    disabled && "opacity-50 pointer-events-none",
    loading && "relative !text-transparent pointer-events-none",
    fullWidth && "w-full",
    className,
  );
}
