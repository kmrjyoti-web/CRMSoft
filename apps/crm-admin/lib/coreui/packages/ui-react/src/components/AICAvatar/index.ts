/**
 * React AICAvatar component barrel export.
 */

export { AICAvatar } from "./AICAvatar";
export type { AvatarProps } from "./AICAvatar";

export { AICAvatarGroup } from "./AICAvatarGroup";
export type { AvatarGroupProps } from "./AICAvatarGroup";

// Re-export core types for convenience so consumers don't need to
// depend on @coreui/ui directly for common type imports.
export type {
  AvatarSize,
  AvatarShape,
  AvatarStatus,
  AvatarGroupSpacing,
} from "@coreui/ui";
