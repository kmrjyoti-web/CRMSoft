/**
 * Fieldset state logic.
 * Framework-agnostic.
 * Source: Angular fieldset in dynamic-field.component.ts
 */

import type { FieldsetAppearance } from "./fieldset.types";

/** Get container class based on appearance. */
export function getFieldsetContainerClass(
  appearance: FieldsetAppearance,
  panelClass: string,
): string {
  if (appearance === "panel") {
    return panelClass;
  }
  return "relative border border-gray-300 rounded-lg bg-white mt-4";
}
