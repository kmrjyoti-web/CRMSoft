/**
 * React AICToolbarButton component barrel export.
 */

export { AICToolbarButton } from "./AICToolbarButton";
export type { ToolbarButtonProps } from "./AICToolbarButton";

// Re-export core types for convenience so consumers don't need to
// depend on @coreui/ui directly for common type imports.
export type {
  ToolbarButtonSize,
  ToolbarButtonColor,
} from "@coreui/ui";
