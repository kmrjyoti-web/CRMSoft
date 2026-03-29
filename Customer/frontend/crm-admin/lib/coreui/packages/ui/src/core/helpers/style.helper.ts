// Pure TypeScript — no framework imports
// Source: core/ui-kit/angular/src/lib/control-library/helpers/style.helper.ts

export class StyleHelper {
  /**
   * Flattens a nested object into a single-level object with dot-notation keys.
   * Example: { a: { b: '1' } } -> { 'a.b': '1' }
   */
  static flattenObject(
    obj: Record<string, any>,
    prefix = "",
  ): Record<string, string> {
    const result: Record<string, string> = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (value && typeof value === "object" && !Array.isArray(value)) {
          const flattened = this.flattenObject(value, newKey);
          Object.assign(result, flattened);
        } else {
          result[newKey] = String(value);
        }
      }
    }
    return result;
  }

  /**
   * Generates CSS variables from a token object.
   * Maps 'inputtext.background' -> '--p-inputtext-background'
   * @param tokens The design token configuration object (can be nested or flat).
   * @param prefix The global prefix for CSS variables (default: 'p').
   */
  static generateCssVariables(
    tokens: Record<string, any>,
    prefix = "p",
  ): Record<string, string> {
    const flatTokens = this.flattenObject(tokens);
    const style: Record<string, string> = {};

    for (const key in flatTokens) {
      // Convert 'inputtext.background' to '--p-inputtext-background'
      const cssVarName = `--${prefix}-${key.replace(/\./g, "-")}`;
      style[cssVarName] = flatTokens[key];
    }

    return style;
  }

  /**
   * Convenience wrapper that generates inline CSS variable object from a `dt` prop.
   */
  static buildTokenStyles(dt: Record<string, any>): Record<string, string> {
    return this.generateCssVariables(dt);
  }
}
