/**
 * React AICTooltip component barrel export.
 */

export { AICTooltip } from "./AICTooltip";
export type { TooltipProps } from "./AICTooltip";

// Re-export core types for convenience so consumers don't need to
// depend on @coreui/ui directly for common type imports.
export type {
  TooltipTrigger,
} from "@coreui/ui";
