/**
 * React AICBadge component barrel export.
 */

export { AICBadge } from "./AICBadge";
export type { BadgeProps } from "./AICBadge";

// Re-export core types for convenience so consumers don't need to
// depend on @coreui/ui directly for common type imports.
export type {
  BadgeVariant,
  BadgeSize,
} from "@coreui/ui";
