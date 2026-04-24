// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, fireEvent, act } from "@testing-library/react";
import { AICNumber } from "../AICNumber";

// ═══════════════════════════════════════════════════════════
// 1. Renders with label and initial value
// ═══════════════════════════════════════════════════════════

describe("AICNumber", () => {
  it("renders with label and initial value", () => {
    const { container, getByLabelText } = render(
      <AICNumber label="Quantity" value={42} id="qty" />,
    );

    const label = container.querySelector("label");
    expect(label).not.toBeNull();
    expect(label!.textContent).toBe("Quantity");

    const input = getByLabelText("Quantity") as HTMLInputElement;
    // When not focused, should display formatted value
    expect(input.value).toContain("42");
  });

  // ═══════════════════════════════════════════════════════════
  // 2. Increment button increases value by step
  // ═══════════════════════════════════════════════════════════

  it("increment button increases value by step", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICNumber value={10} step={5} onChange={onChange} />,
    );

    const buttons = container.querySelectorAll("button");
    // Default layout is "right" — [decrease, increase]
    const increaseBtn = Array.from(buttons).find(
      (btn) => btn.getAttribute("aria-label") === "Increase",
    );
    expect(increaseBtn).toBeDefined();

    fireEvent.click(increaseBtn!);
    expect(onChange).toHaveBeenCalledWith(15);
  });

  // ═══════════════════════════════════════════════════════════
  // 3. Decrement button decreases value by step
  // ═══════════════════════════════════════════════════════════

  it("decrement button decreases value by step", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICNumber value={10} step={3} onChange={onChange} />,
    );

    const decreaseBtn = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.getAttribute("aria-label") === "Decrease",
    );
    expect(decreaseBtn).toBeDefined();

    fireEvent.click(decreaseBtn!);
    expect(onChange).toHaveBeenCalledWith(7);
  });

  // ═══════════════════════════════════════════════════════════
  // 4. Value stops at max boundary
  // ═══════════════════════════════════════════════════════════

  it("value stops at max boundary", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICNumber value={99} step={5} max={100} onChange={onChange} />,
    );

    const increaseBtn = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.getAttribute("aria-label") === "Increase",
    );

    // Should be disabled since 99 + 5 > 100
    expect(increaseBtn!.hasAttribute("disabled")).toBe(true);

    // Clicking a disabled button should NOT trigger onChange
    fireEvent.click(increaseBtn!);
    expect(onChange).not.toHaveBeenCalled();
  });

  // ═══════════════════════════════════════════════════════════
  // 5. Value stops at min boundary
  // ═══════════════════════════════════════════════════════════

  it("value stops at min boundary", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICNumber value={2} step={5} min={0} onChange={onChange} />,
    );

    const decreaseBtn = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.getAttribute("aria-label") === "Decrease",
    );

    // 2 - 5 = -3, which is < 0 (min), so button should be disabled
    expect(decreaseBtn!.hasAttribute("disabled")).toBe(true);

    fireEvent.click(decreaseBtn!);
    expect(onChange).not.toHaveBeenCalled();
  });

  // ═══════════════════════════════════════════════════════════
  // 6. ArrowUp key increments value
  // ═══════════════════════════════════════════════════════════

  it("ArrowUp key increments value", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICNumber value={10} step={1} onChange={onChange} />,
    );

    const input = container.querySelector("input[role='spinbutton']") as HTMLInputElement;
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(onChange).toHaveBeenCalledWith(11);
  });

  // ═══════════════════════════════════════════════════════════
  // 7. ArrowDown key decrements value
  // ═══════════════════════════════════════════════════════════

  it("ArrowDown key decrements value", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICNumber value={10} step={1} onChange={onChange} />,
    );

    const input = container.querySelector("input[role='spinbutton']") as HTMLInputElement;
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(onChange).toHaveBeenCalledWith(9);
  });

  // ═══════════════════════════════════════════════════════════
  // 8. Currency mode shows ₹ prefix
  // ═══════════════════════════════════════════════════════════

  it("currency mode shows ₹ prefix", () => {
    const { container } = render(
      <AICNumber value={1000} currency="₹" />,
    );

    const currencySpan = container.querySelector(
      "[data-testid='aic-number-container'] span",
    );
    expect(currencySpan).not.toBeNull();
    expect(currencySpan!.textContent).toBe("₹");
  });

  // ═══════════════════════════════════════════════════════════
  // 9. Decimal step 0.5 works correctly
  // ═══════════════════════════════════════════════════════════

  it("decimal step 0.5 works correctly", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICNumber value={1} step={0.5} precision={1} onChange={onChange} />,
    );

    const increaseBtn = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.getAttribute("aria-label") === "Increase",
    );

    fireEvent.click(increaseBtn!);
    expect(onChange).toHaveBeenCalledWith(1.5);
  });

  // ═══════════════════════════════════════════════════════════
  // 10. Disabled state prevents interaction
  // ═══════════════════════════════════════════════════════════

  it("disabled state prevents interaction", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICNumber value={10} disabled onChange={onChange} />,
    );

    // AICInput should be disabled
    const input = container.querySelector("input[role='spinbutton']") as HTMLInputElement;
    expect(input.disabled).toBe(true);

    // All spinner buttons should be disabled
    const buttons = container.querySelectorAll("button");
    buttons.forEach((btn) => {
      expect(btn.hasAttribute("disabled")).toBe(true);
    });

    // ArrowUp should not trigger onChange
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(onChange).not.toHaveBeenCalled();
  });

  // ═══════════════════════════════════════════════════════════
  // 11. Long-press auto-repeats
  // ═══════════════════════════════════════════════════════════

  it("long-press auto-repeats", () => {
    vi.useFakeTimers();

    const onChange = vi.fn();
    const { container } = render(
      <AICNumber value={0} step={1} onChange={onChange} />,
    );

    const increaseBtn = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.getAttribute("aria-label") === "Increase",
    );

    // mouseDown triggers the first call immediately
    fireEvent.mouseDown(increaseBtn!);
    expect(onChange).toHaveBeenCalledTimes(1);

    // After delay (400ms), interval kicks in at 80ms
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Two more intervals (80ms each = 160ms)
    act(() => {
      vi.advanceTimersByTime(160);
    });

    // Should have been called at least 3 times (initial + 2 intervals)
    expect(onChange.mock.calls.length).toBeGreaterThanOrEqual(3);

    // mouseUp stops the interval
    fireEvent.mouseUp(increaseBtn!);

    const callCount = onChange.mock.calls.length;
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // No more calls after mouseUp
    expect(onChange.mock.calls.length).toBe(callCount);

    vi.useRealTimers();
  });
});
