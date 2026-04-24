/**
 * AICSlider component tests.
 * 7 test cases per P7.2 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICSlider } from "../AICSlider";
import {
  sliderPercentage,
  snapToStep,
  clampSliderValue,
  generateTicks,
} from "@coreui/ui";

describe("AICSlider", () => {
  // ── 1. Drag changes value ───────────────────────────────
  it("drag changes value", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICSlider min={0} max={100} value={50} label="Volume" onChange={onChange} />,
    );

    const input = container.querySelector(
      "[data-testid='slider-input']",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "75" } });
    expect(onChange).toHaveBeenCalledWith(75);
  });

  // ── 2. Step snaps to nearest ────────────────────────────
  it("step snaps to nearest", () => {
    // Pure logic test
    expect(snapToStep(7, 0, 5)).toBe(5);
    expect(snapToStep(8, 0, 5)).toBe(10);
    expect(snapToStep(12, 0, 5)).toBe(10);
    expect(snapToStep(13, 0, 5)).toBe(15);
  });

  // ── 3. Range mode has two handles ───────────────────────
  it("range mode has two handles", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICSlider range value={[20, 80]} onChange={onChange} />,
    );

    expect(
      container.querySelector("[data-testid='slider-thumb-low']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='slider-thumb-high']"),
    ).toBeTruthy();

    const lowInput = container.querySelector(
      "[data-testid='slider-input-low']",
    ) as HTMLInputElement;
    fireEvent.change(lowInput, { target: { value: "30" } });
    expect(onChange).toHaveBeenCalledWith([30, 80]);
  });

  // ── 4. Min/max enforced ─────────────────────────────────
  it("min/max enforced", () => {
    // Pure logic test
    expect(clampSliderValue(-10, 0, 100)).toBe(0);
    expect(clampSliderValue(150, 0, 100)).toBe(100);
    expect(clampSliderValue(50, 0, 100)).toBe(50);
  });

  // ── 5. Tick marks render at step intervals ──────────────
  it("tick marks render at step intervals", () => {
    // Pure logic test
    const ticks = generateTicks(0, 100, 25);
    expect(ticks).toEqual([0, 25, 50, 75, 100]);

    const { container } = render(
      <AICSlider min={0} max={100} step={25} showTicks />,
    );

    const tickMarks = container.querySelectorAll(
      "[data-testid='slider-tick']",
    );
    expect(tickMarks.length).toBe(5);
  });

  // ── 6. Vertical mode rotates ────────────────────────────
  it("vertical mode rotates", () => {
    const { container } = render(
      <AICSlider orientation="vertical" value={50} />,
    );

    const slider = container.querySelector(
      "[data-testid='slider']",
    ) as HTMLElement;
    expect(slider.className).toContain("h-48");
  });

  // ── 7. onChange fires with value(s) ─────────────────────
  it("onChange fires with value(s)", () => {
    // Pure logic
    expect(sliderPercentage(50, 0, 100)).toBe(50);
    expect(sliderPercentage(0, 0, 100)).toBe(0);
    expect(sliderPercentage(100, 0, 100)).toBe(100);

    const onChange = vi.fn();
    const { container } = render(
      <AICSlider onChange={onChange} />,
    );

    const input = container.querySelector(
      "[data-testid='slider-input']",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "42" } });
    expect(onChange).toHaveBeenCalledWith(42);
  });
});
