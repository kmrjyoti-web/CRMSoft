/**
 * Core Avatar module barrel export.
 * Re-exports every type, constant, and function from the core sub-modules.
 */

// Types
export type {
  AvatarSize,
  AvatarShape,
  AvatarStatus,
  AvatarImageState,
  AvatarProps,
  AvatarGroupSpacing,
  AvatarGroupProps,
} from "./avatar.types";

// Variant & size style maps
export {
  sizeStyles,
  shapeStyles,
  statusStyles,
  statusSizeStyles,
  fallbackStyles,
  groupSpacingStyles,
} from "./avatar.variants";

// Style composition
export {
  getAvatarStyles,
  getAvatarImageStyles,
  getAvatarFallbackStyles,
  getAvatarStatusStyles,
  getAvatarGroupStyles,
  getAvatarOverflowStyles,
  getAvatarFallbackText,
} from "./avatar.styles";
export type {
  GetAvatarStylesProps,
  GetAvatarStatusStylesProps,
  GetAvatarGroupStylesProps,
  GetAvatarOverflowStylesProps,
} from "./avatar.styles";

// State logic
export {
  avatarReducer,
  initialAvatarState,
  shouldShowFallback,
} from "./avatar.logic";
export type {
  AvatarAction,
  AvatarInternalState,
} from "./avatar.logic";

// Accessibility
export {
  getAvatarA11yProps,
  getAvatarImageA11yProps,
  getAvatarGroupA11yProps,
} from "./avatar.a11y";
export type {
  AvatarA11yInput,
  AvatarA11yProps,
  AvatarImageA11yProps,
  AvatarGroupA11yProps,
} from "./avatar.a11y";

// Schema & defaults
export {
  avatarPropsSchema,
  resolveAvatarDefaults,
  avatarGroupPropsSchema,
  resolveAvatarGroupDefaults,
} from "./avatar.schema";
export type {
  AvatarPropsSchemaInput,
  AvatarPropsSchemaOutput,
  AvatarGroupPropsSchemaInput,
  AvatarGroupPropsSchemaOutput,
} from "./avatar.schema";
