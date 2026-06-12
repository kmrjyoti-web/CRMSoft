/** @vitest-environment jsdom */
import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { AICDialog } from "../AICDialog";

describe("AICDialog", () => {
  afterEach(() => {
    cleanup();
    // Remove any portal remnants from document.body
    document.body.innerHTML = "";
  });

  // ═══════════════════════════════════════════════════════════
  // 1. Opens with content
  // ═══════════════════════════════════════════════════════════

  it("opens with content", () => {
    render(
      <AICDialog
        isOpen={true}
        title="Test Title"
        message="Test message content"
      />,
    );

    const panel = document.querySelector('[data-testid="aic-dialog-panel"]')!;
    expect(panel).not.toBeNull();

    const title = document.querySelector('[data-testid="aic-dialog-title"]')!;
    expect(title.textContent).toBe("Test Title");

    const body = document.querySelector('[data-testid="aic-dialog-body"]')!;
    expect(body.textContent).toBe("Test message content");
  });

  // ═══════════════════════════════════════════════════════════
  // 2. Close X dismisses (fires onCancel)
  // ═══════════════════════════════════════════════════════════

  it("close X dismisses and fires onCancel", () => {
    const onCancel = vi.fn();
    render(
      <AICDialog
        isOpen={true}
        message="Hello"
        onCancel={onCancel}
      />,
    );

    const closeBtn = document.querySelector('[data-testid="aic-dialog-close"]')!;
    fireEvent.click(closeBtn);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  // ═══════════════════════════════════════════════════════════
  // 3. Escape key dismisses
  // ═══════════════════════════════════════════════════════════

  it("Escape key dismisses", () => {
    const onCancel = vi.fn();
    render(
      <AICDialog
        isOpen={true}
        message="Hello"
        onCancel={onCancel}
      />,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  // ═══════════════════════════════════════════════════════════
  // 4. Backdrop click dismisses
  // ═══════════════════════════════════════════════════════════

  it("backdrop click dismisses", () => {
    const onCancel = vi.fn();
    render(
      <AICDialog
        isOpen={true}
        message="Hello"
        closeOnOverlayClick={true}
        onCancel={onCancel}
      />,
    );

    // Click on the position container (acts as backdrop)
    const posContainer = document.querySelector('[data-testid="aic-dialog-position-container"]')!;
    fireEvent.click(posContainer);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  // ═══════════════════════════════════════════════════════════
  // 5. Size/width applies correct width
  // ═══════════════════════════════════════════════════════════

  it("applies custom width", () => {
    render(
      <AICDialog
        isOpen={true}
        message="Hello"
        width="600px"
      />,
    );

    const panel = document.querySelector('[data-testid="aic-dialog-panel"]') as HTMLElement;
    expect(panel.style.width).toBe("600px");
  });

  // ═══════════════════════════════════════════════════════════
  // 6. Position 'top' aligns to top
  // ═══════════════════════════════════════════════════════════

  it("position 'top' aligns to top", () => {
    render(
      <AICDialog
        isOpen={true}
        message="Hello"
        position="top"
      />,
    );

    const container = document.querySelector('[data-testid="aic-dialog-position-container"]') as HTMLElement;
    expect(container.style.alignItems).toBe("flex-start");
    expect(container.style.justifyContent).toBe("center");
  });

  // ═══════════════════════════════════════════════════════════
  // 7. Icon variant 'success' shows green
  // ═══════════════════════════════════════════════════════════

  it("icon variant success shows green", () => {
    render(
      <AICDialog
        isOpen={true}
        message="Done!"
        icon="check"
        dialogVariant="success"
        iconStyle="soft-circle"
      />,
    );

    const iconBadge = document.querySelector('[data-testid="aic-dialog-icon"]')!;
    expect(iconBadge.className).toContain("bg-green-100");
  });

  // ═══════════════════════════════════════════════════════════
  // 8. onConfirm fires callback
  // ═══════════════════════════════════════════════════════════

  it("onConfirm fires callback", () => {
    const onConfirm = vi.fn();
    render(
      <AICDialog
        isOpen={true}
        message="Confirm?"
        onConfirm={onConfirm}
      />,
    );

    const confirmBtn = document.querySelector('[data-testid="aic-dialog-confirm"]')!;
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  // ═══════════════════════════════════════════════════════════
  // 9. onCancel fires callback
  // ═══════════════════════════════════════════════════════════

  it("onCancel fires callback via cancel button", () => {
    const onCancel = vi.fn();
    render(
      <AICDialog
        isOpen={true}
        message="Cancel?"
        onCancel={onCancel}
      />,
    );

    const cancelBtn = document.querySelector('[data-testid="aic-dialog-cancel"]')!;
    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
