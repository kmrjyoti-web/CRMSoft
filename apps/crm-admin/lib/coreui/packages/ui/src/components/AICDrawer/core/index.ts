/**
 * Core Drawer module barrel export.
 * Re-exports every type, constant, and function from the core sub-modules.
 */

// Types
export type {
  DrawerPosition,
  DrawerSize,
  DrawerProps,
} from "./drawer.types";

// Variant & size style maps
export {
  drawerHorizontalSizeStyles,
  drawerVerticalSizeStyles,
  drawerPositionStyles,
  drawerPositionAnimations,
} from "./drawer.variants";

// Style composition
export {
  getDrawerOverlayStyles,
  getDrawerContentStyles,
  getDrawerHeaderStyles,
  getDrawerBodyStyles,
  getDrawerCloseButtonStyles,
  getDrawerResizeHandleStyles,
} from "./drawer.styles";
export type { GetDrawerContentStylesProps } from "./drawer.styles";

// State logic
export {
  drawerReducer,
  initialDrawerState,
} from "./drawer.logic";
export type {
  DrawerAction,
  DrawerInternalState,
  DrawerReducerConfig,
} from "./drawer.logic";

// Accessibility
export { getDrawerA11yProps, getDrawerKeyboardHandlers } from "./drawer.a11y";
export type { DrawerA11yInput, DrawerA11yProps } from "./drawer.a11y";

// Schema & defaults
export {
  drawerPropsSchema,
  resolveDrawerDefaults,
} from "./drawer.schema";
export type {
  DrawerPropsSchemaInput,
  DrawerPropsSchemaOutput,
} from "./drawer.schema";
