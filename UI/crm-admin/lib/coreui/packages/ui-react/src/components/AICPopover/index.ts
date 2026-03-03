/**
 * React AICPopover component barrel export.
 */

export { AICPopover } from "./AICPopover";
export type { PopoverProps } from "./AICPopover";

// Re-export core types for convenience so consumers don't need to
// depend on @coreui/ui directly for common type imports.
export type {
  PopoverTrigger,
} from "@coreui/ui";
