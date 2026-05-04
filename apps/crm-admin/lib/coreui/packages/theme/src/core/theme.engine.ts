import type { ThemeConfig, ColorTokens } from "./theme.types";

/** Maps a camelCase color key to a CSS variable name. */
function colorKeyToVar(key: string): string {
  return `--color-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
}

/** Generate CSS custom property declarations from a ThemeConfig. */
export function generateCSSVariables(theme: ThemeConfig): string {
  const lines: string[] = [];

  // Colors
  for (const [key, value] of Object.entries(theme.colors)) {
    lines.push(`  ${colorKeyToVar(key)}: ${value};`);
  }

  // Fonts
  lines.push(`  --font-sans: ${theme.fonts.sans};`);
  lines.push(`  --font-serif: ${theme.fonts.serif};`);
  lines.push(`  --font-mono: ${theme.fonts.mono};`);
  lines.push(`  --font-heading: ${theme.fonts.heading};`);

  // Border radius
  for (const [key, value] of Object.entries(theme.radius)) {
    lines.push(`  --radius-${key}: ${value};`);
  }

  // Spacing
  for (const [key, value] of Object.entries(theme.spacing)) {
    lines.push(`  --spacing-${key}: ${value};`);
  }

  // Shadows
  for (const [key, value] of Object.entries(theme.shadows)) {
    lines.push(`  --shadow-${key}: ${value};`);
  }

  return `:root {\n${lines.join("\n")}\n}`;
}

/** Generate only the color variable overrides (useful for dark mode). */
export function generateColorOverrides(
  colors: Partial<ColorTokens>,
  selector = "[data-theme='dark']",
): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(colors)) {
    if (value !== undefined) {
      lines.push(`  ${colorKeyToVar(key)}: ${value};`);
    }
  }
  return `${selector} {\n${lines.join("\n")}\n}`;
}
