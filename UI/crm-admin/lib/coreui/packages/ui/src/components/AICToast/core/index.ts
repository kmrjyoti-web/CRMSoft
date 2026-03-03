/**
 * Core Toast module barrel export.
 * Re-exports every type, constant, and function from the core sub-modules.
 */

// Types
export type {
  ToastVariant,
  ToastPosition,
  ToastData,
  ToastConfig,
} from "./toast.types";

// Variant & position style maps
export {
  toastVariantStyles,
  toastVariantIconColors,
  toastPositionStyles,
} from "./toast.variants";

// Style composition
export {
  getToastStyles,
  getToastContainerStyles,
  getToastDismissButtonStyles,
  getToastIconStyles,
  getToastActionButtonStyles,
} from "./toast.styles";
export type {
  GetToastStylesProps,
  GetToastContainerStylesProps,
  GetToastIconStylesProps,
} from "./toast.styles";

// State logic
export {
  toastReducer,
  initialToastState,
  generateToastId,
  createToast,
} from "./toast.logic";
export type {
  ToastAction,
  ToastInternalState,
} from "./toast.logic";

// Store
export {
  createToastStore,
} from "./toast.store";
export type {
  ToastStore,
  ToastStoreListener,
} from "./toast.store";

// Accessibility
export { getToastA11yProps, getToastRegionA11yProps } from "./toast.a11y";
export type {
  ToastA11yInput,
  ToastA11yProps,
  ToastRegionA11yProps,
} from "./toast.a11y";

// Schema & defaults
export {
  toastConfigSchema,
  resolveToastDefaults,
} from "./toast.schema";
export type {
  ToastConfigSchemaInput,
  ToastConfigSchemaOutput,
} from "./toast.schema";
