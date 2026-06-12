/**
 * React AICModal component barrel export.
 */

export { AICModal } from "./AICModal";
export type { ModalProps } from "./AICModal";

// Re-export core types for convenience so consumers don't need to
// depend on @coreui/ui directly for common type imports.
export type {
  ModalSize,
  ModalMode,
} from "@coreui/ui";
