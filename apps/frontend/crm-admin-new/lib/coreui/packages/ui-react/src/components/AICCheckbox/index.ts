/**
 * React AICCheckbox component barrel export.
 */

export { AICCheckbox, AICCheckboxGroup } from "./AICCheckbox";
export type { CheckboxProps, CheckboxGroupProps } from "./AICCheckbox";

// Re-export core types for convenience so consumers don't need to
// depend on @coreui/ui directly for common type imports.
export type { CheckboxState } from "@coreui/ui";
