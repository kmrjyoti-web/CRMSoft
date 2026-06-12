/**
 * React AICButton component barrel export.
 */

export { AICButton } from "./AICButton";
export type { ButtonProps } from "./AICButton";

// Re-export core types for convenience so consumers don't need to
// depend on @coreui/ui directly for common type imports.
export type {
  ButtonVariant,
  ButtonSize,
  ButtonState,
} from "@coreui/ui";
