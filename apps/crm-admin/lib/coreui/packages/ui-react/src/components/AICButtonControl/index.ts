/**
 * React AICButtonControl component barrel export.
 */

export { AICButtonControl } from "./AICButtonControl";
export type { ButtonControlProps } from "./AICButtonControl";

// Re-export core types for convenience so consumers don't need to
// depend on @coreui/ui directly for common type imports.
export type {
  ButtonType,
  ButtonOption,
} from "@coreui/ui";
