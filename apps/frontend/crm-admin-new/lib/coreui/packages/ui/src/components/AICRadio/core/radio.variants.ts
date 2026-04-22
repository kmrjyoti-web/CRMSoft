/**
 * Radio visual state style maps.
 * Framework-agnostic — returns Tailwind class strings with CSS custom properties.
 */

// ---------------------------------------------------------------------------
// State → Tailwind class map
// ---------------------------------------------------------------------------

/**
 * Maps each radio visual state to the corresponding Tailwind utility classes.
 * All colors reference CSS custom properties so themes can be swapped at runtime.
 */
export const radioStateStyles: Record<"unchecked" | "checked", string> = {
  unchecked:
    "border-2 border-[var(--color-border)] bg-[var(--color-bg)]",
  checked:
    "border-2 border-[var(--color-primary)] bg-[var(--color-primary)]",
};
