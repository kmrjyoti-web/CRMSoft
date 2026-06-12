import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

// Read CSS files as strings for validation
const tokensDir = resolve(__dirname, "..");
const stylesDir = resolve(__dirname, "../../styles");

const controlTokensCSS = readFileSync(
  resolve(tokensDir, "control-tokens.css"),
  "utf-8",
);
const componentTokensCSS = readFileSync(
  resolve(tokensDir, "component-tokens.css"),
  "utf-8",
);
const baseCSS = readFileSync(resolve(stylesDir, "base.css"), "utf-8");

// Helper: extract all --st-* custom property names from CSS
function extractCustomProperties(css: string): string[] {
  const matches = css.match(/--st-[\w-]+/g) ?? [];
  return [...new Set(matches)];
}

// ═══════════════════════════════════════════════════════════
// 1. control-tokens.css loads and contains :root block
// ═══════════════════════════════════════════════════════════

describe("control-tokens.css", () => {
  it("contains a :root selector", () => {
    expect(controlTokensCSS).toContain(":root");
  });

  it("defines all core input tokens", () => {
    const required = [
      "--st-bg",
      "--st-bg-focus",
      "--st-border",
      "--st-border-focus",
      "--st-text",
      "--st-placeholder",
      "--st-focus-ring",
      "--st-disabled-bg",
      "--st-disabled-text",
      "--st-error-border",
      "--st-error-text",
      "--st-label-text",
    ];
    for (const token of required) {
      expect(controlTokensCSS).toContain(token);
    }
  });

  it("defines checkbox, switch, select, and radio tokens", () => {
    const required = [
      "--st-checkbox-bg",
      "--st-checkbox-checked-bg",
      "--st-switch-track-bg",
      "--st-switch-thumb-bg",
      "--st-select-bg",
      "--st-select-dropdown-bg",
      "--st-radio-border",
      "--st-radio-checked-bg",
    ];
    for (const token of required) {
      expect(controlTokensCSS).toContain(token);
    }
  });

  it("defines button variant tokens", () => {
    const required = [
      "--st-button-primary-bg",
      "--st-button-primary-text",
      "--st-button-secondary-bg",
      "--st-button-danger-bg",
      "--st-button-ghost-text",
      "--st-button-outline-text",
    ];
    for (const token of required) {
      expect(controlTokensCSS).toContain(token);
    }
  });

  it("uses correct default values matching Angular source", () => {
    // Verify specific values from Angular aic-textbox.tokens.css
    expect(controlTokensCSS).toContain("--st-bg: #f8fafc");
    expect(controlTokensCSS).toContain("--st-border: #94a3b8");
    expect(controlTokensCSS).toContain("--st-text: #1e293b");
    expect(controlTokensCSS).toContain("--st-border-focus: #4f46e5");
    expect(controlTokensCSS).toContain("--st-placeholder: #64748b");
    expect(controlTokensCSS).toContain("--st-label-text: #475569");
  });
});

// ═══════════════════════════════════════════════════════════
// 2. component-tokens.css — complex component tokens
// ═══════════════════════════════════════════════════════════

describe("component-tokens.css", () => {
  it("defines table tokens", () => {
    const required = [
      "--st-table-header-bg",
      "--st-table-row-bg",
      "--st-table-row-hover",
      "--st-table-row-selected",
      "--st-table-border",
      "--st-table-stripe-bg",
    ];
    for (const token of required) {
      expect(componentTokensCSS).toContain(token);
    }
  });

  it("defines dialog, drawer, toast, and toolbar tokens", () => {
    const required = [
      "--st-dialog-bg",
      "--st-dialog-overlay",
      "--st-dialog-shadow",
      "--st-drawer-bg",
      "--st-drawer-shadow",
      "--st-drawer-border",
      "--st-toast-success-bg",
      "--st-toast-error-bg",
      "--st-toast-warning-bg",
      "--st-toast-info-bg",
      "--st-toast-text",
      "--st-toolbar-bg",
      "--st-toolbar-border",
      "--st-toolbar-text",
    ];
    for (const token of required) {
      expect(componentTokensCSS).toContain(token);
    }
  });

  it("uses correct Angular-sourced default values", () => {
    // Values from Angular aic-drawer and aic-toast inline styles
    expect(componentTokensCSS).toContain("--st-drawer-border: #cbd5e1");
    expect(componentTokensCSS).toContain("--st-drawer-accent: #2563eb");
    expect(componentTokensCSS).toContain("--st-drawer-text: #0f172a");
    expect(componentTokensCSS).toContain("--st-toolbar-text: #1f2937");
    expect(componentTokensCSS).toContain("--st-toolbar-border: #e5e7eb");
  });
});

// ═══════════════════════════════════════════════════════════
// 3. base.css — master stylesheet
// ═══════════════════════════════════════════════════════════

describe("base.css", () => {
  it("imports both token files", () => {
    expect(baseCSS).toContain("control-tokens.css");
    expect(baseCSS).toContain("component-tokens.css");
  });

  it("defines keyframe animations from Angular components", () => {
    const required = [
      "st-fade-in",
      "st-fade-out",
      "st-slide-in-right",
      "st-zoom-in",
      "st-spin",
    ];
    for (const name of required) {
      expect(baseCSS).toContain(`@keyframes ${name}`);
    }
  });

  it("defines animation utility classes", () => {
    const required = [
      ".st-animate-fade-in",
      ".st-animate-slide-right",
      ".st-animate-zoom-in",
      ".st-animate-spin",
    ];
    for (const cls of required) {
      expect(baseCSS).toContain(cls);
    }
  });

  it("defines .st-button base and variant classes", () => {
    const required = [
      ".st-button ",
      ".st-button-primary",
      ".st-button-secondary",
      ".st-button-danger",
      ".st-button-ghost",
      ".st-button-outline",
    ];
    for (const cls of required) {
      expect(baseCSS).toContain(cls);
    }
  });
});

// ═══════════════════════════════════════════════════════════
// 4. Token naming convention
// ═══════════════════════════════════════════════════════════

describe("token naming convention", () => {
  it("all custom properties in control-tokens follow --st-* pattern", () => {
    const props = extractCustomProperties(controlTokensCSS);
    expect(props.length).toBeGreaterThan(50);
    for (const prop of props) {
      expect(prop).toMatch(/^--st-/);
    }
  });

  it("all custom properties in component-tokens follow --st-* pattern", () => {
    const props = extractCustomProperties(componentTokensCSS);
    expect(props.length).toBeGreaterThan(20);
    for (const prop of props) {
      expect(prop).toMatch(/^--st-/);
    }
  });
});
