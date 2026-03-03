// Pure TypeScript — no framework imports (DOM access only)
// Source: core/ui-kit/angular/src/lib/control-library/utility/shortcut-manager.util.ts

export type ShortcutCallback = (event: KeyboardEvent) => void;

export class ShortcutManager {
  private static listeners: {
    combo: string;
    callback: ShortcutCallback;
    stopPropagation: boolean;
  }[] = [];
  private static initialized = false;

  /**
   * Initialize the global keydown listener.
   * Typically called once at app startup, but safe to call multiple times.
   */
  static init() {
    if (this.initialized) return;
    window.addEventListener("keydown", (e) => this.handleKey(e));
    this.initialized = true;
  }

  /**
   * Register a new shortcut.
   * @param combo Key combination string (e.g., "ctrl+s", "delete", "shift+enter"). keys must be lowercase.
   * @param callback Function to execute when shortcut is triggered.
   * @param stopPropagation Whether to stop event propagation/default behavior. Default true.
   */
  static register(
    combo: string,
    callback: ShortcutCallback,
    stopPropagation: boolean = true,
  ) {
    this.init();
    this.listeners.push({
      combo: combo.toLowerCase(),
      callback,
      stopPropagation,
    });
  }

  /**
   * Unregister a specific shortcut by combo string.
   */
  static unregister(combo: string) {
    const lowerCombo = combo.toLowerCase();
    this.listeners = this.listeners.filter((l) => l.combo !== lowerCombo);
  }

  /**
   * Clear all registered shortcuts.
   */
  static clear() {
    this.listeners = [];
  }

  /**
   * Returns current listener count (for testing).
   */
  static get listenerCount(): number {
    return this.listeners.length;
  }

  private static handleKey(e: KeyboardEvent) {
    // Determine active element to prevent triggering shortcuts while typing in inputs
    // Unless modifiers (Ctrl/Alt/Meta) are used.
    const activeElement = document.activeElement as HTMLElement;
    const isInput =
      activeElement.tagName === "INPUT" ||
      activeElement.tagName === "TEXTAREA" ||
      activeElement.tagName === "SELECT" ||
      activeElement.isContentEditable;

    // Build the current key combination string
    const parts: string[] = [];
    if (e.ctrlKey) parts.push("ctrl");
    if (e.altKey) parts.push("alt");
    if (e.shiftKey) parts.push("shift");
    if (e.metaKey) parts.push("meta");

    // Ignore modifier keys themselves
    if (["Control", "Alt", "Shift", "Meta"].includes(e.key)) return;

    // Add the specific key
    parts.push(e.key.toLowerCase());

    const currentCombo = parts.join("+");

    // Check for matches
    const match = this.listeners.find((l) => l.combo === currentCombo);

    if (match) {
      // Logic to prevent firing simple shortcuts (like single letters) while typing in an input
      const hasModifier = e.ctrlKey || e.altKey || e.metaKey;

      // Allow F-keys, Escape, Enter even in inputs if registered
      const isSpecialKey = [
        "escape",
        "enter",
        "f1",
        "f2",
        "f3",
        "f4",
        "f5",
        "f6",
        "f7",
        "f8",
        "f9",
        "f10",
        "f11",
        "f12",
        "delete",
      ].includes(e.key.toLowerCase());

      if (isInput && !hasModifier && !isSpecialKey) {
        return;
      }

      if (match.stopPropagation) {
        e.preventDefault();
        e.stopPropagation();
      }

      match.callback(e);
    }
  }
}
