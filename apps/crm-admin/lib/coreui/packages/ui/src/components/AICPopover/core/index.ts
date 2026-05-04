/**
 * Core Popover module barrel export.
 * Re-exports every type, constant, and function from the core sub-modules.
 */

// Types
export type {
  PopoverTrigger,
  PopoverProps,
} from "./popover.types";

// Variant & arrow position maps
export {
  popoverArrowPositionStyles,
  popoverArrowDirectionStyles,
} from "./popover.variants";

// Style composition
export {
  getPopoverContentStyles,
  getPopoverArrowStyles,
} from "./popover.styles";
export type { GetPopoverContentStylesProps } from "./popover.styles";

// State logic
export {
  popoverReducer,
  initialPopoverState,
} from "./popover.logic";
export type {
  PopoverAction,
  PopoverReducerConfig,
  PopoverInternalState,
} from "./popover.logic";

// Accessibility
export {
  getPopoverA11yProps,
  getPopoverTriggerA11yProps,
} from "./popover.a11y";
export type {
  PopoverA11yInput,
  PopoverA11yProps,
  PopoverTriggerA11yInput,
  PopoverTriggerA11yProps,
} from "./popover.a11y";

// Schema & defaults
export {
  popoverPropsSchema,
  resolvePopoverDefaults,
} from "./popover.schema";
export type {
  PopoverPropsSchemaInput,
  PopoverPropsSchemaOutput,
} from "./popover.schema";
