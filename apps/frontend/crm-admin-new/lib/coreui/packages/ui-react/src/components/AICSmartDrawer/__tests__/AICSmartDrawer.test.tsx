/** @vitest-environment jsdom */
import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { AICDrawer } from "../AICDrawer";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

// ═══════════════════════════════════════════════════════════
// 1. Opens from right (default position)
// ═══════════════════════════════════════════════════════════

describe("AICDrawer", () => {
  it("opens from right (default position)", () => {
    const { getByTestId } = render(
      <AICDrawer isOpen={true} title="Right AICDrawer" />,
    );

    const panel = getByTestId("aic-drawer-panel");
    expect(panel).toBeTruthy();
    // Default drawer position is right — classes should include 'right-0'
    expect(panel.className).toContain("right-0");
  });

  // ═══════════════════════════════════════════════════════════
  // 2. Opens from left (position='left')
  // ═══════════════════════════════════════════════════════════

  it("opens from left (position='left')", () => {
    const { getByTestId } = render(
      <AICDrawer
        isOpen={true}
        title="Left AICDrawer"
        config={{ position: "left" }}
      />,
    );

    const panel = getByTestId("aic-drawer-panel");
    expect(panel.className).toContain("left-0");
  });

  // ═══════════════════════════════════════════════════════════
  // 3. Opens from bottom
  // ═══════════════════════════════════════════════════════════

  it("opens from bottom", () => {
    const { getByTestId } = render(
      <AICDrawer
        isOpen={true}
        title="Bottom AICDrawer"
        config={{ position: "bottom" }}
      />,
    );

    const panel = getByTestId("aic-drawer-panel");
    expect(panel.className).toContain("bottom-0");
  });

  // ═══════════════════════════════════════════════════════════
  // 4. Backdrop click closes
  // ═══════════════════════════════════════════════════════════

  it("backdrop click closes", () => {
    const onClose = vi.fn();
    const { getByTestId } = render(
      <AICDrawer
        isOpen={true}
        title="AICModal AICDrawer"
        config={{ mode: "modal", hasBackdrop: true }}
        onClose={onClose}
      />,
    );

    fireEvent.click(getByTestId("aic-drawer-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ═══════════════════════════════════════════════════════════
  // 5. Close button dismisses
  // ═══════════════════════════════════════════════════════════

  it("close button dismisses", () => {
    const onClose = vi.fn();
    const { getByTestId } = render(
      <AICDrawer
        isOpen={true}
        title="Closable"
        config={{ showClose: true }}
        onClose={onClose}
      />,
    );

    fireEvent.click(getByTestId("aic-drawer-close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ═══════════════════════════════════════════════════════════
  // 6. Escape key closes
  // ═══════════════════════════════════════════════════════════

  it("Escape key closes", () => {
    const onClose = vi.fn();
    render(
      <AICDrawer isOpen={true} title="Escapable" onClose={onClose} />,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ═══════════════════════════════════════════════════════════
  // 7. Title renders
  // ═══════════════════════════════════════════════════════════

  it("title renders", () => {
    const { getByTestId } = render(
      <AICDrawer isOpen={true} title="My Custom Title" />,
    );

    expect(getByTestId("aic-drawer-title").textContent).toBe(
      "My Custom Title",
    );
  });

  // ═══════════════════════════════════════════════════════════
  // 8. Loading shows skeleton
  // ═══════════════════════════════════════════════════════════

  it("loading shows skeleton", () => {
    const { getByTestId } = render(
      <AICDrawer
        isOpen={true}
        title="Loading"
        config={{ isLoading: true }}
      />,
    );

    expect(getByTestId("aic-drawer-skeleton")).toBeTruthy();
  });

  // ═══════════════════════════════════════════════════════════
  // 9. onClose fires callback
  // ═══════════════════════════════════════════════════════════

  it("onClose fires callback", () => {
    const onClose = vi.fn();
    const { getByTestId } = render(
      <AICDrawer isOpen={true} title="Callback Test" onClose={onClose} />,
    );

    fireEvent.click(getByTestId("aic-drawer-close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ═══════════════════════════════════════════════════════════
  // 10. Children render in body
  // ═══════════════════════════════════════════════════════════

  it("children render in body", () => {
    const { getByTestId } = render(
      <AICDrawer isOpen={true} title="With Children">
        <p data-testid="child-content">Hello from children</p>
      </AICDrawer>,
    );

    expect(getByTestId("aic-drawer-body")).toBeTruthy();
    expect(getByTestId("child-content").textContent).toBe(
      "Hello from children",
    );
  });
});
