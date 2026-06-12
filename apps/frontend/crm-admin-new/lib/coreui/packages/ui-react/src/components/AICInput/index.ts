/**
 * React AICInput component barrel export.
 */

export { AICInput } from "./AICInput";
export type { InputProps } from "./AICInput";

// Re-export core types for convenience so consumers don't need to
// depend on @coreui/ui directly for common type imports.
export type {
  InputType,
  InputSize,
  InputState,
} from "@coreui/ui";
