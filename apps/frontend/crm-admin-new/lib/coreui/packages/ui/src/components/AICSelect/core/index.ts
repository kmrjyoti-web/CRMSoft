/**
 * Core Select module barrel export.
 * Re-exports every type, constant, and function from the core sub-modules.
 */

// Types
export type {
  SelectOption,
  SelectSize,
  SelectState,
  SelectProps,
} from "./select.types";

// Size & state style maps
export { sizeStyles, stateStyles, dropdownStyles } from "./select.variants";

// Style composition
export {
  getSelectTriggerStyles,
  getSelectDropdownStyles,
  getSelectOptionStyles,
  getSelectTagStyles,
  getSelectErrorStyles,
  getSelectWrapperStyles,
} from "./select.styles";
export type {
  GetSelectTriggerStylesProps,
  GetSelectDropdownStylesProps,
} from "./select.styles";

// State logic
export {
  selectReducer,
  initialSelectState,
  getFilteredOptions,
  getGroupedOptions,
} from "./select.logic";
export type {
  SelectAction,
  SelectInternalState,
  OptionGroup,
} from "./select.logic";

// Accessibility
export {
  getSelectTriggerA11yProps,
  getSelectListboxA11yProps,
  getSelectOptionA11yProps,
  getSelectKeyboardHandlers,
} from "./select.a11y";
export type {
  SelectTriggerA11yInput,
  SelectTriggerA11yProps,
  SelectListboxA11yInput,
  SelectListboxA11yProps,
  SelectOptionA11yInput,
  SelectOptionA11yProps,
  SelectKeyboardHandler,
} from "./select.a11y";

// Schema & defaults
export {
  selectPropsSchema,
  resolveSelectDefaults,
} from "./select.schema";
export type {
  SelectPropsSchemaInput,
  SelectPropsSchemaOutput,
} from "./select.schema";
