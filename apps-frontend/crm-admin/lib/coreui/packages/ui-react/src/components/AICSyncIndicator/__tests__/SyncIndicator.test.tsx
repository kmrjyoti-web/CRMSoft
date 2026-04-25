/** @vitest-environment jsdom */
import { describe, it, expect, afterEach } from "vitest";
import React from "react";
import { render, cleanup } from "@testing-library/react";
import { AICSyncIndicator } from "../AICSyncIndicator";

afterEach(() => {
  cleanup();
});

// ═══════════════════════════════════════════════════════════
// 1. Shows green dot when synced
// ═══════════════════════════════════════════════════════════

describe("AICSyncIndicator", () => {
  it("shows green dot when synced", () => {
    const { getByTestId } = render(<AICSyncIndicator status="synced" />);

    const dot = getByTestId("sync-indicator-dot");
    expect(dot.className).toContain("bg-green-500");
  });

  // ═══════════════════════════════════════════════════════════
  // 2. Shows red dot when offline
  // ═══════════════════════════════════════════════════════════

  it("shows red dot when offline", () => {
    const { getByTestId } = render(<AICSyncIndicator status="offline" />);

    const dot = getByTestId("sync-indicator-dot");
    expect(dot.className).toContain("bg-red-500");
  });

  // ═══════════════════════════════════════════════════════════
  // 3. "Syncing..." shows during syncing
  // ═══════════════════════════════════════════════════════════

  it('"Syncing..." shows during syncing', () => {
    const { getByTestId } = render(<AICSyncIndicator status="syncing" />);

    const label = getByTestId("sync-indicator-label");
    expect(label.textContent).toBe("Syncing...");
  });

  // ═══════════════════════════════════════════════════════════
  // 4. Pending count displays correctly
  // ═══════════════════════════════════════════════════════════

  it("pending count displays correctly", () => {
    const { getByTestId } = render(
      <AICSyncIndicator status="synced" pendingCount={5} />,
    );

    const label = getByTestId("sync-indicator-label");
    expect(label.textContent).toBe("5 Pending");
  });

  // ═══════════════════════════════════════════════════════════
  // 5. Status text renders correctly
  // ═══════════════════════════════════════════════════════════

  it("status text renders correctly", () => {
    const { getByTestId } = render(<AICSyncIndicator status="synced" />);

    const label = getByTestId("sync-indicator-label");
    expect(label.textContent).toBe("Synced");
  });
});
