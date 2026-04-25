/**
 * Core Switch module barrel export.
 * Re-exports every type, constant, and function from the core sub-modules.
 */

// Types
export type {
  SwitchSize,
  SwitchProps,
} from "./switch.types";

// Variant & size style maps
export {
  switchSizeStyles,
  thumbSizeStyles,
  thumbTranslateStyles,
} from "./switch.variants";

// Style composition
export {
  getSwitchTrackStyles,
  getSwitchThumbStyles,
  getSwitchWrapperStyles,
  getSwitchLabelStyles,
  getSwitchDescriptionStyles,
} from "./switch.styles";
export type {
  GetSwitchTrackStylesProps,
  GetSwitchThumbStylesProps,
  GetSwitchWrapperStylesProps,
  GetSwitchLabelStylesProps,
} from "./switch.styles";

// State logic
export { switchReducer } from "./switch.logic";
export type { SwitchAction } from "./switch.logic";

// Accessibility
export {
  getSwitchA11yProps,
  getSwitchKeyboardHandlers,
} from "./switch.a11y";
export type {
  SwitchA11yInput,
  SwitchA11yProps,
} from "./switch.a11y";

// Schema & defaults
export {
  switchPropsSchema,
  resolveSwitchDefaults,
} from "./switch.schema";
export type {
  SwitchPropsSchemaInput,
  SwitchPropsSchemaOutput,
} from "./switch.schema";
