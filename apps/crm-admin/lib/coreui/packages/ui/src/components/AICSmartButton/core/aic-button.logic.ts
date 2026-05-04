/**
 * AICButton state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular aic-button.component.ts — exact port.
 */

import type { AICButtonVariant, AICButtonSize } from "./aic-button.types";

// ---------------------------------------------------------------------------
// Variant classes — port of Angular variant-based styles
// ---------------------------------------------------------------------------

export const AIC_BUTTON_VARIANTS: Record<AICButtonVariant, string> = {
  primary:
    "bg-primary border-primary text-white hover:bg-blue-600 focus:ring-blue-200",
  secondary:
    "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-200",
  danger:
    "bg-red-600 border-red-600 text-white hover:bg-red-700 focus:ring-red-200",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-200 shadow-none",
  outline:
    "bg-transparent border border-primary text-primary hover:bg-blue-50 focus:ring-blue-200",
  link:
    "bg-transparent text-primary hover:underline shadow-none p-0 h-auto",
};

/**
 * Returns the Tailwind classes for a given AICButton variant.
 */
export function getAICButtonVariantClasses(
  variant: AICButtonVariant,
): string {
  return AIC_BUTTON_VARIANTS[variant] ?? AIC_BUTTON_VARIANTS.primary;
}

// ---------------------------------------------------------------------------
// Size classes — port of Angular size-based styles
// ---------------------------------------------------------------------------

export const AIC_BUTTON_SIZES: Record<AICButtonSize, string> = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-1.5 text-base",
  lg: "px-5 py-2 text-lg",
  xl: "px-6 py-2.5 text-xl",
};

/**
 * Returns the Tailwind classes for a given AICButton size.
 */
export function getAICButtonSizeClasses(size: AICButtonSize): string {
  return AIC_BUTTON_SIZES[size] ?? AIC_BUTTON_SIZES.md;
}
