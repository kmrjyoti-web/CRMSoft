/**
 * Core Radio module barrel export.
 * Re-exports every type, constant, and function from the core sub-modules.
 */

// Types
export type {
  RadioProps,
  RadioGroupProps,
} from "./radio.types";

// Variant style maps
export { radioStateStyles } from "./radio.variants";

// Style composition
export {
  getRadioStyles,
  getRadioWrapperStyles,
  getRadioLabelStyles,
  getRadioDescriptionStyles,
  getRadioGroupStyles,
} from "./radio.styles";
export type {
  GetRadioStylesProps,
  GetRadioWrapperStylesProps,
  GetRadioLabelStylesProps,
  GetRadioGroupStylesProps,
} from "./radio.styles";

// State logic
export { radioGroupReducer } from "./radio.logic";
export type { RadioAction } from "./radio.logic";

// Accessibility
export {
  getRadioA11yProps,
  getRadioGroupA11yProps,
} from "./radio.a11y";
export type {
  RadioA11yInput,
  RadioA11yProps,
  RadioGroupA11yInput,
  RadioGroupA11yProps,
} from "./radio.a11y";

// Schema & defaults
export {
  radioPropsSchema,
  resolveRadioDefaults,
} from "./radio.schema";
export type {
  RadioPropsSchemaInput,
  RadioPropsSchemaOutput,
} from "./radio.schema";
