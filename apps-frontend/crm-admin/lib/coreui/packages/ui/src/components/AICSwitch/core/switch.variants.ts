/**
 * Switch variant and size style maps.
 * Framework-agnostic — returns Tailwind class strings with CSS custom properties.
 */

import type { SwitchSize } from "./switch.types";

// ---------------------------------------------------------------------------
// Track size → Tailwind class map
// ---------------------------------------------------------------------------

/**
 * Maps each `SwitchSize` to the dimensions of the switch track.
 */
export const switchSizeStyles: Record<SwitchSize, string> = {
  sm: "h-4 w-7",
  md: "h-5 w-9",
  lg: "h-6 w-11",
};

// ---------------------------------------------------------------------------
// Thumb size → Tailwind class map
// ---------------------------------------------------------------------------

/**
 * Maps each `SwitchSize` to the dimensions of the switch thumb.
 */
export const thumbSizeStyles: Record<SwitchSize, string> = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

// ---------------------------------------------------------------------------
// Thumb translate → Tailwind class map (checked state)
// ---------------------------------------------------------------------------

/**
 * Maps each `SwitchSize` to the horizontal translation applied to the
 * thumb when the switch is in the checked (on) state.
 */
export const thumbTranslateStyles: Record<SwitchSize, string> = {
  sm: "translate-x-3",
  md: "translate-x-4",
  lg: "translate-x-5",
};
