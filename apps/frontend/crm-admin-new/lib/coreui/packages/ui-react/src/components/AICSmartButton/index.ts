/**
 * React AICButton component barrel export.
 */

export { AICSmartButton } from "./AICSmartButton";
export type { AICSmartButtonProps } from "./AICSmartButton";

// Re-export core types for convenience so consumers don't need to
// depend on @coreui/ui directly for common type imports.
export type {
  AICButtonVariant,
  AICButtonSize,
} from "@coreui/ui";
