/**
 * RadioGroup state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular radio-group.component.ts — exact port.
 */

import type { RadioGroupOption } from "./radio-group.types";

// ---------------------------------------------------------------------------
// Get grid columns class — shared with CheckboxGroup
// ---------------------------------------------------------------------------

export function getRadioGridColsClass(cols?: number): string {
  if (!cols) return "md:grid-cols-2";
  switch (cols) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-2";
    case 3:
      return "grid-cols-3";
    default:
      return "grid-cols-4";
  }
}

// ---------------------------------------------------------------------------
// Navigate selection with keyboard arrows
// ---------------------------------------------------------------------------

export function getNextRadioValue(
  options: RadioGroupOption[],
  currentValue: string | number | boolean | null,
  direction: "next" | "prev",
): string | number | boolean | null {
  const enabledOptions = options.filter((o) => !o.disabled);
  if (enabledOptions.length === 0) return currentValue;

  const currentIndex = enabledOptions.findIndex(
    (o) => o.value === currentValue,
  );

  if (currentIndex === -1) {
    return enabledOptions[0].value;
  }

  if (direction === "next") {
    const next =
      currentIndex < enabledOptions.length - 1 ? currentIndex + 1 : 0;
    return enabledOptions[next].value;
  }

  const prev =
    currentIndex > 0 ? currentIndex - 1 : enabledOptions.length - 1;
  return enabledOptions[prev].value;
}
