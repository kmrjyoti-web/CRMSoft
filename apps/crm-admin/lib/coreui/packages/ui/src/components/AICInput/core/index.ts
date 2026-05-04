/**
 * Core Input module barrel export.
 * Re-exports every type, constant, and function from the core sub-modules.
 */

// Types
export type {
  InputType,
  InputSize,
  InputState,
  InputProps,
} from "./input.types";

// Size & state style maps
export { sizeStyles, stateStyles } from "./input.variants";

// Style composition
export {
  getInputStyles,
  getInputWrapperStyles,
  getInputErrorStyles,
} from "./input.styles";
export type { GetInputStylesProps } from "./input.styles";

// State logic
export {
  inputReducer,
  initialInputState,
  resolveInputState,
  shouldShowClear,
} from "./input.logic";
export type {
  InputAction,
  InputInternalState,
  ResolveInputStateProps,
  ShouldShowClearProps,
} from "./input.logic";

// Accessibility
export { getInputA11yProps, getInputKeyboardHandlers } from "./input.a11y";
export type { InputA11yInput, InputA11yProps } from "./input.a11y";

// Schema & defaults
export {
  inputPropsSchema,
  resolveInputDefaults,
} from "./input.schema";
export type {
  InputPropsSchemaInput,
  InputPropsSchemaOutput,
} from "./input.schema";
