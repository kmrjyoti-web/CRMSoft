/** @vitest-environment jsdom */
import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, cleanup } from "@testing-library/react";
import { AICTypography } from "../AICTypography";

describe("AICTypography", () => {
  afterEach(() => {
    cleanup();
  });

  // ═══════════════════════════════════════════════════════════
  // 1. Renders all heading levels (h1 tag for heading level=1)
  // ═══════════════════════════════════════════════════════════

  it("renders h1 tag for heading variant with level=1", () => {
    const { getByTestId } = render(
      <AICTypography variant="heading" level={1}>
        Heading 1
      </AICTypography>,
    );

    const el = getByTestId("aic-typography");
    expect(el.tagName.toLowerCase()).toBe("h1");
    expect(el.textContent).toBe("Heading 1");
    expect(el.className).toContain("h1");
  });

  it("renders h3 tag for heading variant with level=3", () => {
    const { getByTestId } = render(
      <AICTypography variant="heading" level={3}>
        Heading 3
      </AICTypography>,
    );

    const el = getByTestId("aic-typography");
    expect(el.tagName.toLowerCase()).toBe("h3");
    expect(el.className).toContain("h3");
  });

  it("renders h2 tag for display variant with level=2", () => {
    const { getByTestId } = render(
      <AICTypography variant="display" level={2}>
        Display 2
      </AICTypography>,
    );

    const el = getByTestId("aic-typography");
    expect(el.tagName.toLowerCase()).toBe("h2");
    expect(el.className).toContain("display-2");
  });

  // ═══════════════════════════════════════════════════════════
  // 2. Font weight applies correctly (bold class)
  // ═══════════════════════════════════════════════════════════

  it("font weight applies correctly with bold prop", () => {
    const { getByTestId } = render(
      <AICTypography bold>Bold text</AICTypography>,
    );

    const el = getByTestId("aic-typography");
    expect(el.className).toContain("font-bold");
  });

  it("font weight applies correctly with weight prop", () => {
    const { getByTestId } = render(
      <AICTypography weight="semibold">Semibold text</AICTypography>,
    );

    const el = getByTestId("aic-typography");
    expect(el.className).toContain("font-semibold");
  });

  // ═══════════════════════════════════════════════════════════
  // 3. Size control changes font-size (inline style)
  // ═══════════════════════════════════════════════════════════

  it("size control applies font-size as inline style", () => {
    const { getByTestId } = render(
      <AICTypography size="2rem">Custom size</AICTypography>,
    );

    const el = getByTestId("aic-typography");
    expect(el.style.fontSize).toBe("2rem");
  });

  // ═══════════════════════════════════════════════════════════
  // 4. Text variant renders span
  // ═══════════════════════════════════════════════════════════

  it("text variant renders span tag", () => {
    const { getByTestId } = render(
      <AICTypography variant="text">Plain text</AICTypography>,
    );

    const el = getByTestId("aic-typography");
    expect(el.tagName.toLowerCase()).toBe("span");
    expect(el.className).toContain("text");
  });

  // ═══════════════════════════════════════════════════════════
  // 5. Caption renders small tag
  // ═══════════════════════════════════════════════════════════

  it("caption variant renders small tag", () => {
    const { getByTestId } = render(
      <AICTypography variant="caption">Small caption</AICTypography>,
    );

    const el = getByTestId("aic-typography");
    expect(el.tagName.toLowerCase()).toBe("small");
    expect(el.className).toContain("caption");
  });
});
