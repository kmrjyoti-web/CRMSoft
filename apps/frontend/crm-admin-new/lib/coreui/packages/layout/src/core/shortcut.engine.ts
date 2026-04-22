/** Modifier keys. */
export type ModifierKey = "ctrl" | "alt" | "shift" | "meta";

/** A keyboard shortcut definition. */
export interface ShortcutDefinition {
  key: string;
  modifiers?: ModifierKey[];
  description: string;
  action: string;
}

/** Shortcut registry for managing keyboard shortcuts. */
export class ShortcutEngine {
  private shortcuts: Map<string, ShortcutDefinition> = new Map();

  /** Build a normalized key string from a shortcut definition. */
  private buildKey(def: Pick<ShortcutDefinition, "key" | "modifiers">): string {
    const mods = [...(def.modifiers ?? [])].sort().join("+");
    return mods ? `${mods}+${def.key.toLowerCase()}` : def.key.toLowerCase();
  }

  /** Register a new keyboard shortcut. */
  register(definition: ShortcutDefinition): void {
    const key = this.buildKey(definition);
    this.shortcuts.set(key, definition);
  }

  /** Unregister a keyboard shortcut. */
  unregister(key: string, modifiers?: ModifierKey[]): void {
    const normalizedKey = this.buildKey({ key, modifiers });
    this.shortcuts.delete(normalizedKey);
  }

  /** Find the matching shortcut for a given key event. */
  match(key: string, modifiers?: ModifierKey[]): ShortcutDefinition | undefined {
    const normalizedKey = this.buildKey({ key, modifiers });
    return this.shortcuts.get(normalizedKey);
  }

  /** List all registered shortcuts. */
  list(): ShortcutDefinition[] {
    return Array.from(this.shortcuts.values());
  }
}
