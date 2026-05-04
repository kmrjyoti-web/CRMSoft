/**
 * React AICSelect component barrel export.
 */

export { AICSelect } from "./AICSelect";
export type { SelectProps } from "./AICSelect";

// Re-export core types for convenience so consumers don't need to
// depend on @coreui/ui directly for common type imports.
export type {
  SelectOption,
  SelectSize,
  SelectState,
} from "@coreui/ui";
