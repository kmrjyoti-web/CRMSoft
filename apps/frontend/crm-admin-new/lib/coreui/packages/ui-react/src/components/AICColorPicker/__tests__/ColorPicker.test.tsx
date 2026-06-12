/**
 * AICColorPicker component tests.
 * 5 test cases per P5.1 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICColorPicker } from "../AICColorPicker";
import { isValidHex, hexToRgb, rgbToHex, addRecentColor } from "@coreui/ui";

describe("AICColorPicker", () => {
  // ── 1. Swatch click sets color ───────────────────────────
  it("swatch click sets color", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICColorPicker
        palette={["#ff0000", "#00ff00", "#0000ff"]}
        onChange={onChange}
      />,
    );

    const redSwatch = container.querySelector(
      "[data-testid='color-swatch-ff0000']",
    ) as HTMLElement;
    expect(redSwatch).toBeTruthy();

    fireEvent.click(redSwatch);
    expect(onChange).toHaveBeenCalledWith("#ff0000");

    // Preview should update
    const preview = container.querySelector(
      "[data-testid='color-preview']",
    ) as HTMLElement;
    expect(preview.style.backgroundColor).toBe("rgb(255, 0, 0)");
  });

  // ── 2. Hex input validates #RRGGBB format ────────────────
  it("hex input validates #RRGGBB format", () => {
    // Pure logic tests
    expect(isValidHex("#ff0000")).toBe(true);
    expect(isValidHex("#FFF")).toBe(true);
    expect(isValidHex("abc123")).toBe(true);
    expect(isValidHex("#ZZZZZZ")).toBe(false);
    expect(isValidHex("")).toBe(false);
    expect(isValidHex("#12345")).toBe(false);

    const onChange = vi.fn();
    const { container } = render(<AICColorPicker onChange={onChange} />);

    const hexInput = container.querySelector(
      "[data-testid='color-hex-input']",
    ) as HTMLInputElement;

    // Type valid hex
    fireEvent.change(hexInput, { target: { value: "ff5500" } });
    expect(onChange).toHaveBeenCalledWith("#ff5500");

    // Type invalid hex — should show error
    fireEvent.change(hexInput, { target: { value: "ZZZZZZ" } });
    const error = container.querySelector(
      "[data-testid='color-hex-error']",
    );
    expect(error).toBeTruthy();
  });

  // ── 3. RGB sliders update preview in real-time ───────────
  it("RGB sliders update preview in real-time", () => {
    // Pure logic tests
    expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(rgbToHex(255, 128, 0)).toBe("#ff8000");
    expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });

    const onChange = vi.fn();
    const { container } = render(
      <AICColorPicker value="#000000" onChange={onChange} />,
    );

    // Move red slider — from #000000, setting R=255 → #ff0000
    const redSlider = container.querySelector(
      "[data-testid='color-slider-r']",
    ) as HTMLInputElement;
    fireEvent.change(redSlider, { target: { value: "255" } });
    expect(onChange).toHaveBeenCalledWith("#ff0000");

    // Move green slider — from #000000 (controlled), setting G=128 → #008000
    const greenSlider = container.querySelector(
      "[data-testid='color-slider-g']",
    ) as HTMLInputElement;
    fireEvent.change(greenSlider, { target: { value: "128" } });
    expect(onChange).toHaveBeenCalledWith("#008000");

    // Verify slider values reflect the controlled value
    const rValue = container.querySelector(
      "[data-testid='color-value-r']",
    );
    expect(rValue?.textContent).toBe("0");
  });

  // ── 4. Recent colors track last 10 ──────────────────────
  it("recent colors track last 10", () => {
    // Pure logic test
    let recent: string[] = [];
    for (let i = 0; i < 12; i++) {
      const hex = `#${i.toString(16).padStart(2, "0")}0000`;
      recent = addRecentColor(recent, hex, 10);
    }
    expect(recent.length).toBe(10);
    // Most recent should be first
    expect(recent[0]).toBe("#0b0000");

    // Duplicate should not increase count
    recent = addRecentColor(recent, "#0b0000", 10);
    expect(recent.length).toBe(10);
    expect(recent[0]).toBe("#0b0000");

    // Component test — clicking swatches adds to recent
    const { container } = render(
      <AICColorPicker palette={["#ff0000", "#00ff00", "#0000ff"]} />,
    );

    fireEvent.click(
      container.querySelector(
        "[data-testid='color-swatch-ff0000']",
      ) as HTMLElement,
    );
    fireEvent.click(
      container.querySelector(
        "[data-testid='color-swatch-00ff00']",
      ) as HTMLElement,
    );

    const recentSection = container.querySelector(
      "[data-testid='color-recent']",
    );
    expect(recentSection).toBeTruthy();
  });

  // ── 5. onChange fires with hex string ────────────────────
  it("onChange fires with hex string", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICColorPicker
        palette={["#abcdef"]}
        onChange={onChange}
      />,
    );

    // Click swatch
    fireEvent.click(
      container.querySelector(
        "[data-testid='color-swatch-abcdef']",
      ) as HTMLElement,
    );
    expect(onChange).toHaveBeenCalledWith("#abcdef");
    expect(typeof onChange.mock.calls[0][0]).toBe("string");

    // Hex input
    const hexInput = container.querySelector(
      "[data-testid='color-hex-input']",
    ) as HTMLInputElement;
    fireEvent.change(hexInput, { target: { value: "112233" } });
    expect(onChange).toHaveBeenCalledWith("#112233");
  });
});
