/**
 * Core AICIcon module barrel export.
 * Re-exports every type, constant, and function from the core sub-modules.
 */

// Types
export type {
  AICIconProvider,
  AICIconSize,
  AICIconProps,
} from "./aic-icon.types";

// Logic
export { resolveIconSize, processSvgForColor } from "./aic-icon.logic";
