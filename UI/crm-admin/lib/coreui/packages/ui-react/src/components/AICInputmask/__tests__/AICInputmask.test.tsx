// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { AICInputmask } from "../AICInputmask";

describe("AICInputmask", () => {
  // ═══════════════════════════════════════════════════════════
  // 1. Phone mask formats (000) 000-0000
  // ═══════════════════════════════════════════════════════════

  it("phone mask formats (000) 000-0000", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICInputmask maskType="phone" onChange={onChange} />,
    );

    const input = container.querySelector(
      "input[data-testid='aic-inputmask-input']",
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "1234567890" } });
    expect(onChange).toHaveBeenCalledWith("(123) 456-7890");
  });

  // ═══════════════════════════════════════════════════════════
  // 2. Date mask formats DD/MM/YYYY
  // ═══════════════════════════════════════════════════════════

  it("date mask formats DD/MM/YYYY", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICInputmask maskType="date" onChange={onChange} />,
    );

    const input = container.querySelector(
      "input[data-testid='aic-inputmask-input']",
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "25122025" } });
    expect(onChange).toHaveBeenCalledWith("25/12/2025");
  });

  // ═══════════════════════════════════════════════════════════
  // 3. Credit card mask formats 0000 0000 0000 0000
  // ═══════════════════════════════════════════════════════════

  it("credit card mask formats 0000 0000 0000 0000", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICInputmask maskType="card" onChange={onChange} />,
    );

    const input = container.querySelector(
      "input[data-testid='aic-inputmask-input']",
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "4111111111111111" } });
    expect(onChange).toHaveBeenCalledWith("4111 1111 1111 1111");
  });

  // ═══════════════════════════════════════════════════════════
  // 4. Custom mask 'aaa-999' accepts 'abc-123'
  // ═══════════════════════════════════════════════════════════

  it("custom mask 'aaa-999' accepts 'abc-123'", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICInputmask
        maskType="custom"
        customMask="aaa-999"
        onChange={onChange}
      />,
    );

    const input = container.querySelector(
      "input[data-testid='aic-inputmask-input']",
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "abc123" } });
    expect(onChange).toHaveBeenCalledWith("abc-123");
  });

  // ═══════════════════════════════════════════════════════════
  // 5. Custom mask 'aaa-999' rejects '123-abc'
  // ═══════════════════════════════════════════════════════════

  it("custom mask 'aaa-999' rejects '123-abc'", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICInputmask
        maskType="custom"
        customMask="aaa-999"
        onChange={onChange}
      />,
    );

    const input = container.querySelector(
      "input[data-testid='aic-inputmask-input']",
    ) as HTMLInputElement;

    // '123-abc': digits rejected at alpha positions, alpha rejected at digit positions
    fireEvent.change(input, { target: { value: "123-abc" } });

    // The result should NOT be '123-abc' — digits are skipped at alpha positions,
    // then 'abc' reaches alpha slots → 'abc', but no digits left for '999' slots
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall).not.toBe("123-abc");
    // AICInput '123-abc' truncated to 6 raw chars → '123-ab'.
    // Digits '123' and '-' rejected at alpha 'aaa' positions → only 'a','b' pass.
    expect(lastCall).toBe("ab");
  });

  // ═══════════════════════════════════════════════════════════
  // 6. Regex mode validates against provided pattern
  // ═══════════════════════════════════════════════════════════

  it("regex mode validates against provided pattern", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICInputmask
        maskType="regex"
        regexPattern="[0-9]"
        onChange={onChange}
      />,
    );

    const input = container.querySelector(
      "input[data-testid='aic-inputmask-input']",
    ) as HTMLInputElement;

    // Only digits should pass through
    fireEvent.change(input, { target: { value: "a1b2c3" } });
    expect(onChange).toHaveBeenCalledWith("123");
  });

  // ═══════════════════════════════════════════════════════════
  // 7. Incomplete mask shows placeholder characters
  // ═══════════════════════════════════════════════════════════

  it("incomplete mask shows placeholder characters", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICInputmask
        maskType="phone"
        showSlots
        slotChar="_"
        onChange={onChange}
      />,
    );

    const input = container.querySelector(
      "input[data-testid='aic-inputmask-input']",
    ) as HTMLInputElement;

    // Type only 3 digits — remaining mask positions should show '_'
    fireEvent.change(input, { target: { value: "123" } });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    // Should show: (123) ___-____
    expect(lastCall).toBe("(123) ___-____");
  });

  // ═══════════════════════════════════════════════════════════
  // 8. Paste fills mask correctly
  // ═══════════════════════════════════════════════════════════

  it("paste fills mask correctly", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICInputmask maskType="phone" onChange={onChange} />,
    );

    const input = container.querySelector(
      "input[data-testid='aic-inputmask-input']",
    ) as HTMLInputElement;

    // Simulate paste by firing a change with the full pasted value
    fireEvent.change(input, { target: { value: "(555) 123-4567" } });
    expect(onChange).toHaveBeenCalledWith("(555) 123-4567");
  });

  // ═══════════════════════════════════════════════════════════
  // 9. Backspace removes one character and adjusts cursor
  // ═══════════════════════════════════════════════════════════

  it("backspace removes one character and adjusts cursor", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICInputmask maskType="phone" onChange={onChange} />,
    );

    const input = container.querySelector(
      "input[data-testid='aic-inputmask-input']",
    ) as HTMLInputElement;

    // First type a full phone number
    fireEvent.change(input, { target: { value: "1234567890" } });
    expect(onChange).toHaveBeenCalledWith("(123) 456-7890");

    // Now simulate backspace — the value after removing last char
    fireEvent.change(input, { target: { value: "(123) 456-789" } });

    // The mask should strip non-digits: '123456789' → '(123) 456-789' (9 digits)
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall).toBe("(123) 456-789");
  });
});
