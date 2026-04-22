/**
 * AICDialogButton tests.
 * 4 test cases per P10.2 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICDialogButton } from "../AICDialogButton";
import { AICConfirmDialog } from "../../AICConfirmDialog/AICConfirmDialog";

describe("AICDialogButton", () => {
  // ── 1. Renders button with label ─────────────────────────
  it("renders button with label", () => {
    const { container } = render(
      <AICDialogButton label="Delete" dialogType="danger" />,
    );
    const btn = container.querySelector(
      "[data-testid='dialog-button']",
    ) as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.textContent).toContain("Delete");
  });

  // ── 2. Click opens confirm dialog ────────────────────────
  it("click opens confirm dialog", () => {
    const { container } = render(
      <AICDialogButton
        label="Delete"
        dialogTitle="Confirm Delete"
        dialogMessage="Are you sure you want to delete?"
        dialogType="danger"
      />,
    );

    // Dialog should not be visible initially
    expect(
      container.querySelector("[data-testid='confirm-dialog-overlay']"),
    ).toBeNull();

    // Click button to open dialog
    const btn = container.querySelector(
      "[data-testid='dialog-button']",
    ) as HTMLButtonElement;
    fireEvent.click(btn);

    // Dialog should now be visible (AICConfirmDialog renders inside same container)
    const overlay = container.querySelector(
      "[data-testid='confirm-dialog-overlay']",
    );
    expect(overlay).toBeTruthy();
  });

  // ── 3. Confirm fires onConfirm ──────────────────────────
  // Tests AICConfirmDialog directly since AICDialogButton composes it
  it("confirm fires onConfirm", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const { container } = render(
      <AICConfirmDialog
        isOpen
        title="Confirm"
        message="Sure?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    const confirmBtn = container.querySelector(
      "[data-testid='confirm-dialog-confirm']",
    ) as HTMLButtonElement;
    expect(confirmBtn).toBeTruthy();

    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  // ── 4. Cancel fires onCancel ─────────────────────────────
  it("cancel fires onCancel", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const { container } = render(
      <AICConfirmDialog
        isOpen
        title="Confirm"
        message="Sure?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    const cancelBtn = container.querySelector(
      "[data-testid='confirm-dialog-cancel']",
    ) as HTMLButtonElement;
    expect(cancelBtn).toBeTruthy();

    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
