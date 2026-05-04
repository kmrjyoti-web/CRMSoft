/**
 * AICButton tests.
 * 8 test cases per P10.1 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICButton } from "../AICButton";

describe("AICButton", () => {
  // ── 1. Renders with label ────────────────────────────────
  it("renders with label", () => {
    const { container } = render(<AICButton label="Save" />);
    const btn = container.querySelector(
      "[data-testid='aic-button']",
    ) as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.textContent).toContain("Save");
  });

  // ── 2. Click fires onClick ───────────────────────────────
  it("click fires onClick", () => {
    const onClick = vi.fn();
    const { container } = render(
      <AICButton label="Click Me" onClick={onClick} />,
    );
    const btn = container.querySelector(
      "[data-testid='aic-button']",
    ) as HTMLButtonElement;
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // ── 3. Disabled prevents click ───────────────────────────
  it("disabled prevents click", () => {
    const onClick = vi.fn();
    const { container } = render(
      <AICButton label="Disabled" disabled onClick={onClick} />,
    );
    const btn = container.querySelector(
      "[data-testid='aic-button']",
    ) as HTMLButtonElement;
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
    expect(btn.disabled).toBe(true);
  });

  // ── 4. Loading shows spinner ─────────────────────────────
  it("loading state shows spinner and disables button", () => {
    const onClick = vi.fn();
    const { container } = render(
      <AICButton label="Loading" loading onClick={onClick} />,
    );
    const spinner = container.querySelector(
      "[data-testid='aic-button-spinner']",
    );
    expect(spinner).toBeTruthy();

    const btn = container.querySelector(
      "[data-testid='aic-button']",
    ) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  // ── 5. Renders icon ──────────────────────────────────────
  it("renders prefix icon", () => {
    const { container } = render(
      <AICButton label="Save" icon="save-icon" />,
    );
    const iconEl = container.querySelector(
      "[data-testid='aic-button-icon']",
    );
    expect(iconEl).toBeTruthy();
    expect(iconEl?.textContent).toContain("save-icon");
  });

  // ── 6. Renders suffix icon ───────────────────────────────
  it("renders suffix icon", () => {
    const { container } = render(
      <AICButton label="Next" suffixIcon="arrow-right" />,
    );
    const suffixEl = container.querySelector(
      "[data-testid='aic-button-suffix-icon']",
    );
    expect(suffixEl).toBeTruthy();
    expect(suffixEl?.textContent).toContain("arrow-right");
  });

  // ── 7. Renders shortcut ──────────────────────────────────
  it("renders keyboard shortcut", () => {
    const { container } = render(
      <AICButton label="Save" shortcut="Ctrl+S" />,
    );
    const kbd = container.querySelector(
      "[data-testid='aic-button-shortcut']",
    );
    expect(kbd).toBeTruthy();
    expect(kbd?.textContent).toBe("Ctrl+S");
  });

  // ── 8. FullWidth applies class ───────────────────────────
  it("fullWidth applies w-full class", () => {
    const { container } = render(
      <AICButton label="Full" fullWidth />,
    );
    const btn = container.querySelector(
      "[data-testid='aic-button']",
    ) as HTMLButtonElement;
    expect(btn.className).toContain("w-full");
  });
});
