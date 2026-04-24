/**
 * Drawer variant and size style maps.
 * Framework-agnostic — returns Tailwind class strings with CSS custom properties.
 */

import type { DrawerPosition, DrawerSize } from "./drawer.types";
import type { AnimationType } from "../../../utils/animation";

// ---------------------------------------------------------------------------
// Horizontal size styles (for left / right drawers)
// ---------------------------------------------------------------------------

/**
 * Maps each `DrawerSize` to width classes for horizontal (left/right) drawers.
 */
export const drawerHorizontalSizeStyles: Record<DrawerSize, string> = {
  sm: "w-[280px]",
  md: "w-[360px]",
  lg: "w-[480px]",
  xl: "w-[640px]",
  full: "w-screen",
};

// ---------------------------------------------------------------------------
// Vertical size styles (for top / bottom drawers)
// ---------------------------------------------------------------------------

/**
 * Maps each `DrawerSize` to height classes for vertical (top/bottom) drawers.
 */
export const drawerVerticalSizeStyles: Record<DrawerSize, string> = {
  sm: "h-[200px]",
  md: "h-[320px]",
  lg: "h-[480px]",
  xl: "h-[640px]",
  full: "h-screen",
};

// ---------------------------------------------------------------------------
// Position styles
// ---------------------------------------------------------------------------

/**
 * Maps each `DrawerPosition` to the fixed positioning classes that anchor
 * the drawer to the correct screen edge.
 */
export const drawerPositionStyles: Record<DrawerPosition, string> = {
  left: "top-0 left-0 h-full",
  right: "top-0 right-0 h-full",
  top: "top-0 left-0 w-full",
  bottom: "bottom-0 left-0 w-full",
};

// ---------------------------------------------------------------------------
// Position → AnimationType mapping
// ---------------------------------------------------------------------------

/**
 * Maps each `DrawerPosition` to the corresponding animation type.
 *
 * - "slide-left" means the element slides in from the left (starts off-screen left).
 * - "slide-right" means the element slides in from the right (starts off-screen right).
 * - "slide-down" means the element slides in from the top (starts off-screen above).
 * - "slide-up" means the element slides in from the bottom (starts off-screen below).
 */
export const drawerPositionAnimations: Record<DrawerPosition, AnimationType> = {
  left: "slide-left",
  right: "slide-right",
  top: "slide-down",
  bottom: "slide-up",
};
