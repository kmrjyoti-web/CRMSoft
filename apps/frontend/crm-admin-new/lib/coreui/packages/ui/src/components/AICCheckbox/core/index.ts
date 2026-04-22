/**
 * Core Checkbox module barrel export.
 * Re-exports every type, constant, and function from the core sub-modules.
 */

// Types
export type {
  CheckboxState,
  CheckboxProps,
  CheckboxGroupProps,
} from "./checkbox.types";

// Variant style maps
export { checkboxStateStyles } from "./checkbox.variants";

// Style composition
export {
  getCheckboxStyles,
  getCheckboxWrapperStyles,
  getCheckboxGroupStyles,
  getCheckboxLabelStyles,
  getCheckboxDescriptionStyles,
} from "./checkbox.styles";
export type {
  GetCheckboxStylesProps,
  GetCheckboxWrapperStylesProps,
  GetCheckboxGroupStylesProps,
  GetCheckboxLabelStylesProps,
} from "./checkbox.styles";

// State logic
export {
  checkboxReducer,
  resolveCheckboxVisualState,
} from "./checkbox.logic";
export type { CheckboxAction } from "./checkbox.logic";

// Accessibility
export {
  getCheckboxA11yProps,
  getCheckboxKeyboardHandlers,
} from "./checkbox.a11y";
export type {
  CheckboxA11yInput,
  CheckboxA11yProps,
} from "./checkbox.a11y";

// Schema & defaults
export {
  checkboxPropsSchema,
  resolveCheckboxDefaults,
} from "./checkbox.schema";
export type {
  CheckboxPropsSchemaInput,
  CheckboxPropsSchemaOutput,
} from "./checkbox.schema";
