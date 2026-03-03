/**
 * AICOTPInput component tests.
 * 6 test cases per P5.2 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { AICOTPInput } from "../AICOTPInput";
import {
  handleDigitInput,
  handleBackspace,
  isOTPComplete,
  formatTimer,
} from "@coreui/ui";

describe("AICOTPInput", () => {
  // ── 1. Auto-focus next on digit entry ───────────────────
  it("auto-focus next on digit entry", () => {
    // Pure logic test
    const digits = ["", "", "", "", "", ""];
    const result = handleDigitInput(digits, 0, "5");
    expect(result.digits[0]).toBe("5");
    expect(result.focusIndex).toBe(1);

    const { container } = render(<AICOTPInput length={4} />);
    const digit0 = container.querySelector(
      "[data-testid='otp-digit-0']",
    ) as HTMLInputElement;

    fireEvent.change(digit0, { target: { value: "3" } });

    // Digit 0 should now have value "3"
    const updated0 = container.querySelector(
      "[data-testid='otp-digit-0']",
    ) as HTMLInputElement;
    expect(updated0.value).toBe("3");
  });

  // ── 2. Backspace moves to previous ──────────────────────
  it("backspace moves to previous", () => {
    // Pure logic test
    const digits = ["1", "", "", ""];
    const result = handleBackspace(digits, 1);
    expect(result.digits[0]).toBe("");
    expect(result.focusIndex).toBe(0);

    // Non-empty: just clears current
    const digits2 = ["1", "2", "", ""];
    const result2 = handleBackspace(digits2, 1);
    expect(result2.digits[1]).toBe("");
    expect(result2.focusIndex).toBe(1);
  });

  // ── 3. Paste fills all digits ───────────────────────────
  it("paste fills all digits", () => {
    // Pure logic test
    const digits = ["", "", "", ""];
    const result = handleDigitInput(digits, 0, "1234");
    expect(result.digits).toEqual(["1", "2", "3", "4"]);
    expect(result.focusIndex).toBe(3);

    // Component test
    const onComplete = vi.fn();
    const { container } = render(
      <AICOTPInput length={4} onComplete={onComplete} />,
    );

    const digit0 = container.querySelector(
      "[data-testid='otp-digit-0']",
    ) as HTMLInputElement;

    fireEvent.paste(digit0, {
      clipboardData: { getData: () => "5678" },
    });

    expect(onComplete).toHaveBeenCalledWith("5678");
  });

  // ── 4. Timer counts down ────────────────────────────────
  it("timer counts down", async () => {
    // Pure logic test
    expect(formatTimer(90)).toBe("01:30");
    expect(formatTimer(5)).toBe("00:05");
    expect(formatTimer(0)).toBe("00:00");

    vi.useFakeTimers();
    const { container } = render(<AICOTPInput resendTimer={3} />);

    const timer = container.querySelector(
      "[data-testid='otp-timer']",
    );
    expect(timer).toBeTruthy();
    expect(timer?.textContent).toContain("00:03");

    act(() => { vi.advanceTimersByTime(1000); });
    const timer2 = container.querySelector("[data-testid='otp-timer']");
    expect(timer2?.textContent).toContain("00:02");

    act(() => { vi.advanceTimersByTime(2000); });

    vi.useRealTimers();
  });

  // ── 5. Resend button appears after timer ────────────────
  it("resend button appears after timer", () => {
    vi.useFakeTimers();
    const onResend = vi.fn();
    const { container } = render(
      <AICOTPInput resendTimer={2} onResend={onResend} />,
    );

    // Timer should be showing
    expect(container.querySelector("[data-testid='otp-timer']")).toBeTruthy();
    expect(container.querySelector("[data-testid='otp-resend']")).toBeNull();

    // Advance past timer
    act(() => { vi.advanceTimersByTime(3000); });

    expect(container.querySelector("[data-testid='otp-timer']")).toBeNull();
    const resendBtn = container.querySelector(
      "[data-testid='otp-resend']",
    ) as HTMLElement;
    expect(resendBtn).toBeTruthy();

    fireEvent.click(resendBtn);
    expect(onResend).toHaveBeenCalled();

    vi.useRealTimers();
  });

  // ── 6. onComplete fires with full code ──────────────────
  it("onComplete fires with full code", () => {
    // Pure logic test
    expect(isOTPComplete(["1", "2", "3", "4"])).toBe(true);
    expect(isOTPComplete(["1", "", "3", "4"])).toBe(false);

    const onComplete = vi.fn();
    const onChange = vi.fn();
    const { container } = render(
      <AICOTPInput length={4} onComplete={onComplete} onChange={onChange} />,
    );

    // Fill all digits via paste
    const digit0 = container.querySelector(
      "[data-testid='otp-digit-0']",
    ) as HTMLInputElement;
    fireEvent.paste(digit0, {
      clipboardData: { getData: () => "9876" },
    });

    expect(onComplete).toHaveBeenCalledWith("9876");
    expect(onChange).toHaveBeenCalledWith("9876");
  });
});
