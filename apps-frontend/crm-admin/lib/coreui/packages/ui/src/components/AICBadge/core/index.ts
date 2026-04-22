/**
 * Core Badge module barrel export.
 * Re-exports every type, constant, and function from the core sub-modules.
 */

// Types
export type {
  BadgeVariant,
  BadgeSize,
  BadgeProps,
} from "./badge.types";

// Variant & size style maps
export { variantStyles, sizeStyles, dotSizeStyles } from "./badge.variants";

// Style composition
export { getBadgeStyles, getBadgeRemoveButtonStyles } from "./badge.styles";
export type { GetBadgeStylesProps } from "./badge.styles";

// State logic
export {
  badgeReducer,
  initialBadgeState,
} from "./badge.logic";
export type {
  BadgeAction,
  BadgeInternalState,
} from "./badge.logic";

// Accessibility
export {
  getBadgeA11yProps,
  getBadgeRemoveA11yProps,
  getBadgeKeyboardHandlers,
} from "./badge.a11y";
export type {
  BadgeA11yInput,
  BadgeA11yProps,
  BadgeRemoveA11yProps,
} from "./badge.a11y";

// Schema & defaults
export {
  badgePropsSchema,
  resolveBadgeDefaults,
} from "./badge.schema";
export type {
  BadgePropsSchemaInput,
  BadgePropsSchemaOutput,
} from "./badge.schema";
