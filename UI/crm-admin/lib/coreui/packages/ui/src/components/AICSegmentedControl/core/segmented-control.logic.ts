/**
 * SegmentedControl state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular segmented-control.component.ts — exact port.
 */

import type { SegmentedControlSize } from "./segmented-control.types";

// ---------------------------------------------------------------------------
// Size styles — port of Angular sizeStyles()
// ---------------------------------------------------------------------------

export interface SegmentedControlSizeConfig {
  button: string;
  icon: string;
}

export const segmentedControlSizeStyles: Record<
  SegmentedControlSize,
  SegmentedControlSizeConfig
> = {
  sm: {
    button: "px-3 py-1 text-sm",
    icon: "w-4 h-4",
  },
  md: {
    button: "px-4 py-1.5 text-base",
    icon: "w-5 h-5",
  },
  lg: {
    button: "px-5 py-2 text-lg",
    icon: "w-6 h-6",
  },
};
