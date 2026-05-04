/**
 * AICSwitchInput component tests.
 * 5 test cases per P4.4 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICSwitchInput } from "../AICSwitchInput";

describe("AICSwitchInput", () => {
  // ── 1. Toggle on/off ───────────────────────────────────
  it("toggles on and off when clicked", () => {
    const { container } = render(<AICSwitchInput label="Enable" />);

    const input = container.querySelector(
      "[data-testid='switch-input']",
    ) as HTMLInputElement;
    expect(input.checked).toBe(false);

    fireEvent.click(input);
    expect(input.checked).toBe(true);

    fireEvent.click(input);
    expect(input.checked).toBe(false);
  });

  // ── 2. Shows correct on/off label state ────────────────
  it("displays correct on/off label text", () => {
    const { container, rerender } = render(
      <AICSwitchInput label="Mode" onLabel="Active" offLabel="Inactive" />,
    );

    const stateLabel = container.querySelector(
      "[data-testid='switch-state-label']",
    );
    expect(stateLabel?.textContent).toBe("Inactive");

    // Turn on
    const input = container.querySelector(
      "[data-testid='switch-input']",
    ) as HTMLInputElement;
    fireEvent.click(input);

    const updatedLabel = container.querySelector(
      "[data-testid='switch-state-label']",
    );
    expect(updatedLabel?.textContent).toBe("Active");
  });

  // ── 3. Disabled prevents toggle ────────────────────────
  it("prevents toggle when disabled", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICSwitchInput label="Disabled" disabled onChange={onChange} />,
    );

    const input = container.querySelector(
      "[data-testid='switch-input']",
    ) as HTMLInputElement;
    expect(input.disabled).toBe(true);

    fireEvent.click(input);
    expect(onChange).not.toHaveBeenCalled();
  });

  // ── 4. Custom color applies ────────────────────────────
  it("applies custom active color to track", () => {
    const { container } = render(
      <AICSwitchInput label="Color" checked activeColor="#ff5500" />,
    );

    const track = container.querySelector(
      "[data-testid='switch-track']",
    ) as HTMLElement;
    expect(track.style.backgroundColor).toBe("rgb(255, 85, 0)");
  });

  // ── 5. onChange fires with boolean ─────────────────────
  it("fires onChange with correct boolean value", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICSwitchInput label="Test" onChange={onChange} />,
    );

    const input = container.querySelector(
      "[data-testid='switch-input']",
    ) as HTMLInputElement;

    fireEvent.click(input);
    expect(onChange).toHaveBeenCalledWith(true);

    fireEvent.click(input);
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
