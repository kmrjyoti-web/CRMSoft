/**
 * AICDatePicker component tests.
 * 10 test cases per P6.1 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICDatePicker } from "../AICDatePicker";
import { getShapeClass, isDateEmpty, formatDateForInput } from "@coreui/ui";

describe("AICDatePicker", () => {
  // ── 1. Renders with label ──────────────────────────────
  it("renders with label", () => {
    const { container } = render(<AICDatePicker label="Birth Date" id="dob" />);

    const label = container.querySelector(
      "[data-testid='date-picker-label']",
    ) as HTMLElement;
    expect(label).toBeTruthy();
    expect(label.textContent).toBe("Birth Date");
  });

  // ── 2. Native date input renders type="date" ──────────
  it("native date input renders type=\"date\"", () => {
    const { container } = render(<AICDatePicker />);

    const input = container.querySelector(
      "[data-testid='date-picker-input']",
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.type).toBe("date");
  });

  // ── 3. onChange fires on date selection ────────────────
  it("onChange fires on date selection", () => {
    const onChange = vi.fn();
    const { container } = render(<AICDatePicker onChange={onChange} />);

    const input = container.querySelector(
      "[data-testid='date-picker-input']",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "2025-06-15" } });

    expect(onChange).toHaveBeenCalledWith("2025-06-15");
    expect(typeof onChange.mock.calls[0][0]).toBe("string");
  });

  // ── 4. min/max attributes applied ─────────────────────
  it("min/max attributes applied", () => {
    const { container } = render(
      <AICDatePicker min="2024-01-01" max="2025-12-31" />,
    );

    const input = container.querySelector(
      "[data-testid='date-picker-input']",
    ) as HTMLInputElement;
    expect(input.min).toBe("2024-01-01");
    expect(input.max).toBe("2025-12-31");
  });

  // ── 5. Calendar icon click triggers showPicker ────────
  it("calendar icon click triggers showPicker", () => {
    const { container } = render(<AICDatePicker />);

    const input = container.querySelector(
      "[data-testid='date-picker-input']",
    ) as HTMLInputElement;

    // Mock showPicker on the input element
    const showPickerMock = vi.fn();
    input.showPicker = showPickerMock;

    const calendarIcon = container.querySelector(
      "[data-testid='date-picker-calendar-icon']",
    ) as HTMLElement;
    fireEvent.click(calendarIcon);

    expect(showPickerMock).toHaveBeenCalled();
  });

  // ── 6. Floating label floats on focus ─────────────────
  it("floating label floats on focus", () => {
    const { container } = render(
      <AICDatePicker label="Date" id="date-test" />,
    );

    const input = container.querySelector(
      "[data-testid='date-picker-input']",
    ) as HTMLInputElement;
    const label = container.querySelector(
      "[data-testid='date-picker-label']",
    ) as HTMLElement;

    // Before focus — label should have idle class
    expect(label.className).toContain("scale-100");

    // Focus the input
    fireEvent.focus(input);

    // After focus — label should have active class
    expect(label.className).toContain("scale-90");
  });

  // ── 7. Floating label floats when has value ───────────
  it("floating label floats when has value", () => {
    const { container } = render(
      <AICDatePicker label="Date" value="2025-06-15" />,
    );

    const label = container.querySelector(
      "[data-testid='date-picker-label']",
    ) as HTMLElement;

    // Label should be active (floated) because value is present
    expect(label.className).toContain("scale-90");
  });

  // ── 8. Shape variants apply correct classes ───────────
  it("shape variants apply correct classes", () => {
    // Pure logic tests
    expect(getShapeClass("rounded")).toBe("rounded-lg");
    expect(getShapeClass("square")).toBe("rounded-none");
    expect(getShapeClass("circle")).toBe("rounded-full");
    expect(getShapeClass(undefined)).toBe("rounded-lg");

    // Component test — square shape
    const { container: squareContainer } = render(
      <AICDatePicker shape="square" />,
    );
    const squareInput = squareContainer.querySelector(
      "[data-testid='date-picker-input']",
    ) as HTMLInputElement;
    expect(squareInput.className).toContain("rounded-none");

    // Component test — circle shape
    const { container: circleContainer } = render(
      <AICDatePicker shape="circle" />,
    );
    const circleInput = circleContainer.querySelector(
      "[data-testid='date-picker-input']",
    ) as HTMLInputElement;
    expect(circleInput.className).toContain("rounded-full");
  });

  // ── 9. Disabled state ─────────────────────────────────
  it("disabled state", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICDatePicker disabled onChange={onChange} />,
    );

    const input = container.querySelector(
      "[data-testid='date-picker-input']",
    ) as HTMLInputElement;
    expect(input.disabled).toBe(true);

    // Calendar icon should also be disabled
    const calendarBtn = container.querySelector(
      "[data-testid='date-picker-calendar-icon']",
    ) as HTMLButtonElement;
    expect(calendarBtn.disabled).toBe(true);
  });

  // ── 10. Error state displays error message ────────────
  it("error state displays error message", () => {
    // Pure logic tests
    expect(isDateEmpty("")).toBe(true);
    expect(isDateEmpty(undefined)).toBe(true);
    expect(isDateEmpty("2025-01-01")).toBe(false);
    expect(formatDateForInput("2025-01-01")).toBe("2025-01-01");
    expect(formatDateForInput("")).toBe("");
    expect(formatDateForInput(null)).toBe("");

    const { container } = render(
      <AICDatePicker
        error
        errorMessage="Date is required"
        id="err-date"
      />,
    );

    const errorEl = container.querySelector(
      "[data-testid='date-picker-error']",
    ) as HTMLElement;
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toBe("Date is required");
    expect(errorEl.getAttribute("role")).toBe("alert");

    // AICInput should have error styling
    const input = container.querySelector(
      "[data-testid='date-picker-input']",
    ) as HTMLInputElement;
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });
});
