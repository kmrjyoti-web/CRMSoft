/**
 * Core Button module barrel export.
 * Re-exports every type, constant, and function from the core sub-modules.
 */

// Types
export type {
  ButtonVariant,
  ButtonSize,
  ButtonState,
  ButtonProps,
} from "./button.types";

// Variant & size style maps
export { variantStyles, sizeStyles } from "./button.variants";

// Style composition
export { getButtonStyles } from "./button.styles";
export type { GetButtonStylesProps } from "./button.styles";

// State logic
export {
  buttonReducer,
  initialButtonState,
  resolveButtonState,
} from "./button.logic";
export type {
  ButtonAction,
  ButtonInternalState,
  ResolveButtonStateProps,
} from "./button.logic";

// Accessibility
export { getButtonA11yProps, getButtonKeyboardHandlers } from "./button.a11y";
export type { ButtonA11yInput, ButtonA11yProps } from "./button.a11y";

// Schema & defaults
export {
  buttonPropsSchema,
  resolveButtonDefaults,
} from "./button.schema";
export type {
  ButtonPropsSchemaInput,
  ButtonPropsSchemaOutput,
} from "./button.schema";
