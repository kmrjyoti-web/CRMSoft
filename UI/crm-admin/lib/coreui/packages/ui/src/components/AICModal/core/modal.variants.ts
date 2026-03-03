/**
 * Modal variant, size, and mode style maps.
 * Framework-agnostic — returns Tailwind class strings with CSS custom properties.
 */

import type { ModalSize, ModalMode } from "./modal.types";
import type { AnimationType } from "../../../utils/animation";

// ---------------------------------------------------------------------------
// Size → Tailwind class map
// ---------------------------------------------------------------------------

/**
 * Maps each `ModalSize` to the corresponding max-width and layout classes.
 */
export const modalSizeStyles: Record<ModalSize, string> = {
  sm: "max-w-[400px]",
  md: "max-w-[560px]",
  lg: "max-w-[720px]",
  xl: "max-w-[900px]",
  full: "max-w-full mx-4 my-4 min-h-[calc(100vh-2rem)]",
};

// ---------------------------------------------------------------------------
// Mode → Base layout class map
// ---------------------------------------------------------------------------

/**
 * Maps each `ModalMode` to the Tailwind classes controlling positioning
 * and layout of the modal content panel.
 */
export const modalModeBaseStyles: Record<ModalMode, string> = {
  center: "mx-auto my-auto",
  "slide-panel": "ml-auto mr-0 my-0 h-full max-h-screen rounded-none",
  "top-dropdown": "mx-auto mt-0 mb-auto rounded-t-none",
};

// ---------------------------------------------------------------------------
// Mode → Animation type map
// ---------------------------------------------------------------------------

/**
 * Maps each `ModalMode` to the `AnimationType` used for enter/exit
 * transitions, allowing each mode to animate differently.
 */
export const modalModeAnimations: Record<ModalMode, AnimationType> = {
  center: "scale",
  "slide-panel": "slide-right",
  "top-dropdown": "slide-down",
};
