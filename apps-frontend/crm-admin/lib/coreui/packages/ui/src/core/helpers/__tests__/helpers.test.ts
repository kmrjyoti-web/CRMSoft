import { describe, it, expect } from "vitest";
import { StyleHelper } from "../style.helper";
import { IconHelper, getIcon, getIconSafe } from "../icon.helper";

// ── StyleHelper ─────────────────────────────────────────

describe("StyleHelper", () => {
  it('flattenObject flattens { a: { b: "1" } } to { "a.b": "1" }', () => {
    const result = StyleHelper.flattenObject({ a: { b: "1" } });
    expect(result).toEqual({ "a.b": "1" });
  });

  it("generateCssVariables produces --p-inputtext-background", () => {
    const result = StyleHelper.generateCssVariables({
      inputtext: { background: "#fff" },
    });
    expect(result["--p-inputtext-background"]).toBe("#fff");
  });

  it("buildTokenStyles returns inline style object", () => {
    const result = StyleHelper.buildTokenStyles({
      button: { color: "red" },
    });
    expect(result["--p-button-color"]).toBe("red");
  });
});

// ── IconHelper ──────────────────────────────────────────

describe("IconHelper", () => {
  it("has 57 icon entries", () => {
    expect(Object.keys(IconHelper)).toHaveLength(57);
  });

  it("getIcon('search') returns SVG string containing '<svg'", () => {
    const svg = getIcon("search");
    expect(svg).toContain("<svg");
  });

  it("getIcon('user') returns SVG string containing 'M15.75 6'", () => {
    const svg = getIcon("user");
    expect(svg).toContain("M15.75 6");
  });

  it("getIconSafe('nonexistent') returns null", () => {
    expect(getIconSafe("nonexistent")).toBeNull();
  });
});
