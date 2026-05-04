/**
 * React AICDrawer component barrel export.
 */

export { AICDrawer } from "./AICDrawer";
export type { DrawerProps } from "./AICDrawer";

// Re-export core types for convenience so consumers don't need to
// depend on @coreui/ui directly for common type imports.
export type {
  DrawerPosition,
  DrawerSize,
} from "@coreui/ui";
