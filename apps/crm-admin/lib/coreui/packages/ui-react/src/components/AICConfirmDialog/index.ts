/**
 * React AICConfirmDialog component barrel export.
 */

export { AICConfirmDialog } from "./AICConfirmDialog";
export type { ConfirmDialogProps } from "./AICConfirmDialog";

// Re-export core types for convenience so consumers don't need to
// depend on @coreui/ui directly for common type imports.
export type {
  DialogType,
  ConfirmDialogConfig,
} from "@coreui/ui";
