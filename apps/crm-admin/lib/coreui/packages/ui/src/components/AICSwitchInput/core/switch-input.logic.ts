/**
 * SwitchInput state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular switch-input.component.ts — exact port.
 */

import type { SwitchInputSize } from "./switch-input.types";

// ---------------------------------------------------------------------------
// Size → track/thumb dimensions
// ---------------------------------------------------------------------------

export interface SwitchSizeConfig {
  track: string;
  thumb: string;
  thumbTranslate: string;
}

export const switchSizeStyles: Record<SwitchInputSize, SwitchSizeConfig> = {
  sm: {
    track: "w-7 h-4",
    thumb: "h-3 w-3 top-[2px] start-[2px]",
    thumbTranslate: "translate-x-3",
  },
  md: {
    track: "w-9 h-5",
    thumb: "h-4 w-4 top-[2px] start-[2px]",
    thumbTranslate: "translate-x-4",
  },
  lg: {
    track: "w-11 h-6",
    thumb: "h-5 w-5 top-[2px] start-[2px]",
    thumbTranslate: "translate-x-5",
  },
};

// ---------------------------------------------------------------------------
// Check if rich layout should be used — port of Angular isRichLayout
// ---------------------------------------------------------------------------

export function isSwitchRichLayout(
  icon?: string,
  image?: string,
  description?: string,
): boolean {
  return !!(icon || image || description);
}
