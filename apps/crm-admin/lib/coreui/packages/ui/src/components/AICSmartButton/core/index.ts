/**
 * Core AICButton module barrel export.
 * Re-exports every type, constant, and function from the core sub-modules.
 */

// Types
export type {
  AICButtonVariant,
  AICButtonSize,
  AICButtonProps,
} from "./aic-button.types";

// Logic
export {
  AIC_BUTTON_VARIANTS,
  AIC_BUTTON_SIZES,
  getAICButtonVariantClasses,
  getAICButtonSizeClasses,
} from "./aic-button.logic";
