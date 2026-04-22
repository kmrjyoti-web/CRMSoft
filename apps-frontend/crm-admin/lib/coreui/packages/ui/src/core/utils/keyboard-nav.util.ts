// Pure TypeScript — no framework imports (DOM access only)
// Source: core/ui-kit/angular/src/lib/control-library/utility/keyboard-nav.util.ts

/**
 * Utility class to handle keyboard navigation between form controls.
 */
export class KeyboardNavUtil {
  /**
   * Focuses the element with the given ID.
   * @param elementId The ID of the form control to focus (usually the field key).
   */
  static focus(elementId: string): void {
    if (!elementId) return;

    const element = document.getElementById(elementId);

    if (element) {
      // Focus the element
      element.focus();

      // If it's an input or textarea, optionally select the text for quick editing
      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement
      ) {
        // Checking if select is supported (e.g. not 'email' or 'number' in some browsers/contexts)
        try {
          element.select();
        } catch (_e) {
          // Ignore selection errors for types that don't support it
        }
      }
    } else {
      console.warn(`[KeyboardNav] Element with ID '${elementId}' not found.`);
    }
  }

  /**
   * Returns the nextControl key for the given field, or null.
   */
  static getNextControl(
    currentKey: string,
    fields: { key: string; nextControl?: string }[],
  ): string | null {
    const field = fields.find((f) => f.key === currentKey);
    return field?.nextControl ?? null;
  }

  /**
   * Returns the previousControl key for the given field, or null.
   */
  static getPreviousControl(
    currentKey: string,
    fields: { key: string; previousControl?: string }[],
  ): string | null {
    const field = fields.find((f) => f.key === currentKey);
    return field?.previousControl ?? null;
  }
}
