/** @vitest-environment jsdom */
import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, fireEvent, act, cleanup } from "@testing-library/react";
import { AICToast } from "../AICToast";
import type { AICToastMessage } from "@coreui/ui";

describe("AICToast", () => {
  afterEach(() => {
    cleanup();
    // Remove any portal remnants from document.body
    document.body.innerHTML = "";
  });

  // ═══════════════════════════════════════════════════════════
  // 1. Success toast shows green
  // ═══════════════════════════════════════════════════════════

  it("success toast shows green styles", () => {
    const messages: AICToastMessage[] = [
      { id: "t1", severity: "success", detail: "Success!", life: 0 },
    ];

    render(<AICToast messages={messages} />);

    const item = document.querySelector('[data-testid="aic-toast-item-t1"]')!;
    expect(item).not.toBeNull();
    expect(item.className).toContain("border-l-green-500");
    expect(item.className).toContain("bg-green-50");

    const icon = document.querySelector('[data-testid="aic-toast-icon-t1"]')!;
    expect(icon.className).toContain("text-green-500");
  });

  // ═══════════════════════════════════════════════════════════
  // 2. Error toast shows red
  // ═══════════════════════════════════════════════════════════

  it("error toast shows red styles", () => {
    const messages: AICToastMessage[] = [
      { id: "t2", severity: "error", detail: "Error!", life: 0 },
    ];

    render(<AICToast messages={messages} />);

    const item = document.querySelector('[data-testid="aic-toast-item-t2"]')!;
    expect(item).not.toBeNull();
    expect(item.className).toContain("border-l-red-500");
    expect(item.className).toContain("bg-red-50");

    const icon = document.querySelector('[data-testid="aic-toast-icon-t2"]')!;
    expect(icon.className).toContain("text-red-500");
  });

  // ═══════════════════════════════════════════════════════════
  // 3. Auto-dismiss after timeout
  // ═══════════════════════════════════════════════════════════

  it("auto-dismiss after timeout", () => {
    vi.useFakeTimers();

    const onRemove = vi.fn();
    const messages: AICToastMessage[] = [
      { id: "t3", severity: "info", detail: "Auto-dismiss", life: 2000 },
    ];

    render(<AICToast messages={messages} onRemove={onRemove} />);

    // Not dismissed yet
    expect(onRemove).not.toHaveBeenCalled();

    // Advance past the life duration
    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(onRemove).toHaveBeenCalledWith("t3");

    vi.useRealTimers();
  });

  // ═══════════════════════════════════════════════════════════
  // 4. Close X removes toast
  // ═══════════════════════════════════════════════════════════

  it("close button removes toast", () => {
    const onRemove = vi.fn();
    const messages: AICToastMessage[] = [
      { id: "t4", severity: "warning", detail: "Close me", life: 0 },
    ];

    render(<AICToast messages={messages} onRemove={onRemove} />);

    const closeBtn = document.querySelector('[data-testid="aic-toast-close-t4"]')!;
    fireEvent.click(closeBtn);
    expect(onRemove).toHaveBeenCalledWith("t4");
  });

  // ═══════════════════════════════════════════════════════════
  // 5. Multiple toasts stack
  // ═══════════════════════════════════════════════════════════

  it("multiple toasts stack vertically", () => {
    const messages: AICToastMessage[] = [
      { id: "s1", severity: "success", detail: "First", life: 0 },
      { id: "s2", severity: "info", detail: "Second", life: 0 },
      { id: "s3", severity: "error", detail: "Third", life: 0 },
    ];

    render(<AICToast messages={messages} />);

    const container = document.querySelector('[data-testid="aic-toast-container"]')!;
    expect(container).not.toBeNull();
    expect(container.children.length).toBe(3);

    // Verify each toast exists
    expect(document.querySelector('[data-testid="aic-toast-item-s1"]')).not.toBeNull();
    expect(document.querySelector('[data-testid="aic-toast-item-s2"]')).not.toBeNull();
    expect(document.querySelector('[data-testid="aic-toast-item-s3"]')).not.toBeNull();
  });

  // ═══════════════════════════════════════════════════════════
  // 6. Summary shows when provided
  // ═══════════════════════════════════════════════════════════

  it("summary shows when provided", () => {
    const messages: AICToastMessage[] = [
      {
        id: "t6",
        severity: "info",
        summary: "Title Here",
        detail: "Detail here",
        life: 0,
      },
    ];

    render(<AICToast messages={messages} />);

    const summary = document.querySelector('[data-testid="aic-toast-summary-t6"]')!;
    expect(summary).not.toBeNull();
    expect(summary.textContent).toBe("Title Here");

    const detail = document.querySelector('[data-testid="aic-toast-detail-t6"]')!;
    expect(detail.textContent).toBe("Detail here");
  });

  // ═══════════════════════════════════════════════════════════
  // 7. Renders in fixed position
  // ═══════════════════════════════════════════════════════════

  it("renders in fixed position", () => {
    const messages: AICToastMessage[] = [
      { id: "t7", severity: "success", detail: "Fixed", life: 0 },
    ];

    render(<AICToast messages={messages} />);

    const container = document.querySelector('[data-testid="aic-toast-container"]')!;
    expect(container).not.toBeNull();
    expect(container.className).toContain("fixed");
    expect(container.className).toContain("top-4");
    expect(container.className).toContain("right-4");
  });
});
