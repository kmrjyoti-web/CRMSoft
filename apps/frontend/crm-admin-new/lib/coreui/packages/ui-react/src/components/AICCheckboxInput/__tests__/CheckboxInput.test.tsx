/**
 * AICCheckboxInput component tests.
 * 5 test cases per P4.1 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICCheckboxInput } from "../AICCheckboxInput";

describe("AICCheckboxInput", () => {
  // ── 1. Toggle on/off ───────────────────────────────────
  it("toggles on/off when clicked", () => {
    const { container } = render(<AICCheckboxInput label="Accept terms" />);

    const input = container.querySelector(
      "[data-testid='checkbox-input']",
    ) as HTMLInputElement;
    expect(input.checked).toBe(false);

    fireEvent.click(input);
    expect(input.checked).toBe(true);

    fireEvent.click(input);
    expect(input.checked).toBe(false);
  });

  // ── 2. Indeterminate renders dash icon ─────────────────
  it("renders dash icon in indeterminate state", () => {
    const { container } = render(
      <AICCheckboxInput label="Partial" indeterminate />,
    );

    const dashIcon = container.querySelector(
      "[data-testid='checkbox-indeterminate-icon']",
    );
    expect(dashIcon).toBeTruthy();

    // Check aria-checked is "mixed"
    const input = container.querySelector(
      "[data-testid='checkbox-input']",
    ) as HTMLInputElement;
    expect(input.getAttribute("aria-checked")).toBe("mixed");
  });

  // ── 3. Disabled prevents toggle ────────────────────────
  it("prevents toggle when disabled", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICCheckboxInput label="Disabled" disabled onChange={onChange} />,
    );

    const input = container.querySelector(
      "[data-testid='checkbox-input']",
    ) as HTMLInputElement;
    expect(input.disabled).toBe(true);

    fireEvent.click(input);
    expect(onChange).not.toHaveBeenCalled();
  });

  // ── 4. Label click toggles ─────────────────────────────
  it("toggles when label is clicked", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICCheckboxInput label="Click me" id="test-cb" onChange={onChange} />,
    );

    const label = container.querySelector(
      "[data-testid='checkbox-label']",
    ) as HTMLElement;
    expect(label).toBeTruthy();
    expect(label.textContent).toContain("Click me");

    // Clicking the label triggers onChange via the for/id link
    const input = container.querySelector(
      "[data-testid='checkbox-input']",
    ) as HTMLInputElement;
    fireEvent.click(input);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  // ── 5. onChange fires with boolean ─────────────────────
  it("fires onChange with correct boolean value", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICCheckboxInput label="Test" onChange={onChange} />,
    );

    const input = container.querySelector(
      "[data-testid='checkbox-input']",
    ) as HTMLInputElement;

    fireEvent.click(input);
    expect(onChange).toHaveBeenCalledWith(true);

    fireEvent.click(input);
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
