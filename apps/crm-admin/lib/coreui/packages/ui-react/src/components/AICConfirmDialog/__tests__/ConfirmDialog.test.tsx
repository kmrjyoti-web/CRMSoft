/**
 * AICConfirmDialog tests.
 * 6 test cases per P10.3 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICConfirmDialog } from "../AICConfirmDialog";

describe("AICConfirmDialog", () => {
  const baseProps = {
    title: "Delete Item",
    message: "Are you sure you want to delete this item?",
    type: "danger" as const,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  // ── 1. Renders when isOpen is true ───────────────────────
  it("renders when isOpen is true", () => {
    const { container } = render(
      <AICConfirmDialog {...baseProps} isOpen={true} />,
    );
    const overlay = container.querySelector(
      "[data-testid='confirm-dialog-overlay']",
    );
    expect(overlay).toBeTruthy();

    const panel = container.querySelector(
      "[data-testid='confirm-dialog-panel']",
    );
    expect(panel).toBeTruthy();
  });

  // ── 2. Does not render when isOpen is false ──────────────
  it("does not render when isOpen is false", () => {
    const { container } = render(
      <AICConfirmDialog {...baseProps} isOpen={false} />,
    );
    const overlay = container.querySelector(
      "[data-testid='confirm-dialog-overlay']",
    );
    expect(overlay).toBeNull();
  });

  // ── 3. Displays title and message ────────────────────────
  it("displays title and message", () => {
    const { container } = render(
      <AICConfirmDialog {...baseProps} isOpen={true} />,
    );
    const titleEl = container.querySelector(
      "[data-testid='confirm-dialog-title']",
    );
    expect(titleEl?.textContent).toBe("Delete Item");

    const messageEl = container.querySelector(
      "[data-testid='confirm-dialog-message']",
    );
    expect(messageEl?.textContent).toBe(
      "Are you sure you want to delete this item?",
    );
  });

  // ── 4. Confirm button fires onConfirm ───────────────────
  it("confirm button fires onConfirm", () => {
    const onConfirm = vi.fn();
    const { container } = render(
      <AICConfirmDialog
        {...baseProps}
        isOpen={true}
        onConfirm={onConfirm}
      />,
    );
    const confirmBtn = container.querySelector(
      "[data-testid='confirm-dialog-confirm']",
    ) as HTMLButtonElement;
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  // ── 5. Cancel button fires onCancel ──────────────────────
  it("cancel button fires onCancel", () => {
    const onCancel = vi.fn();
    const { container } = render(
      <AICConfirmDialog
        {...baseProps}
        isOpen={true}
        onCancel={onCancel}
      />,
    );
    const cancelBtn = container.querySelector(
      "[data-testid='confirm-dialog-cancel']",
    ) as HTMLButtonElement;
    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  // ── 6. Escape key fires onCancel ─────────────────────────
  it("escape key fires onCancel", () => {
    const onCancel = vi.fn();
    render(
      <AICConfirmDialog
        {...baseProps}
        isOpen={true}
        onCancel={onCancel}
      />,
    );

    // Fire Escape key on document
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
