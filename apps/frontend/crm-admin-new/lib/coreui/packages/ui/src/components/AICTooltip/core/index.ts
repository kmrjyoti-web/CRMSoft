/**
 * Core Tooltip module barrel export.
 * Re-exports every type, constant, and function from the core sub-modules.
 */

// Types
export type {
  TooltipTrigger,
  TooltipProps,
} from "./tooltip.types";

// Variant & arrow position maps
export { arrowPositionStyles, arrowDirectionStyles } from "./tooltip.variants";

// Style composition
export {
  getTooltipStyles,
  getTooltipInlineStyles,
  getTooltipArrowStyles,
} from "./tooltip.styles";
export type { GetTooltipStylesProps } from "./tooltip.styles";

// State logic
export {
  tooltipReducer,
  initialTooltipState,
} from "./tooltip.logic";
export type {
  TooltipAction,
  TooltipOpenedVia,
  TooltipInternalState,
} from "./tooltip.logic";

// Accessibility
export {
  getTooltipA11yProps,
  getTooltipTriggerA11yProps,
} from "./tooltip.a11y";
export type {
  TooltipA11yInput,
  TooltipA11yProps,
  TooltipTriggerA11yInput,
  TooltipTriggerA11yProps,
} from "./tooltip.a11y";

// Schema & defaults
export {
  tooltipPropsSchema,
  resolveTooltipDefaults,
} from "./tooltip.schema";
export type {
  TooltipPropsSchemaInput,
  TooltipPropsSchemaOutput,
} from "./tooltip.schema";
