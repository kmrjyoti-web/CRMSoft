/**
 * React Toast component barrel export.
 */

export { AICToastProvider, useToast, useToastState } from "./aic-toast-context";
export type { ToastAPI, ToastProviderProps } from "./aic-toast-context";

export { AICToastContainer } from "./AICToastContainer";
export type { ToastContainerProps } from "./AICToastContainer";

// Re-export core types for convenience so consumers don't need to
// depend on @coreui/ui directly for common type imports.
export type {
  ToastVariant,
  ToastPosition,
  ToastData,
  ToastConfig,
} from "@coreui/ui";
