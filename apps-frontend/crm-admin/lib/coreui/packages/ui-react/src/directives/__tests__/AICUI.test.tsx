// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import {
  AICContainer,
  AICLabel,
  AICPrefix,
  AICSuffix,
  AICError,
} from "../AICUI";
import type { ResolvedControlConfig } from "@coreui/ui";
import { CONTROL_SIZES, GLOBAL_UI_CONFIG } from "@coreui/ui";

// ── Helper: builds a minimal ResolvedControlConfig ──────

function makeConfig(
  overrides: Partial<ResolvedControlConfig> = {},
): ResolvedControlConfig {
  return {
    key: "test",
    label: "Test Label",
    placeholder: "",
    type: "text",
    value: "",
    disabled: false,
    readonly: false,
    required: false,
    error: null,
    touched: false,
    dirty: false,
    size: "medium",
    sizeStyles: CONTROL_SIZES["medium"],
    variant: "default",
    uiConfig: GLOBAL_UI_CONFIG,
    validators: {},
    options: [],
    props: {},
    tokenStyles: {},
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════
// AICContainer
// ═══════════════════════════════════════════════════════════

describe("AICContainer", () => {
  it("renders with correct container class", () => {
    const config = makeConfig();
    const { container } = render(
      <AICContainer config={config}>
        <span>child</span>
      </AICContainer>,
    );

    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain(GLOBAL_UI_CONFIG.container);
  });
});

// ═══════════════════════════════════════════════════════════
// AICLabel
// ═══════════════════════════════════════════════════════════

describe("AICLabel", () => {
  it("positions correctly for variant 'outlined'", () => {
    const config = makeConfig({ variant: "outlined" });
    const { container } = render(
      <AICContainer config={config}>
        <AICLabel />
      </AICContainer>,
    );

    const label = container.querySelector("label") as HTMLLabelElement;
    expect(label.className).toContain(GLOBAL_UI_CONFIG.labelOutlined);
    expect(label.className).toContain("peer-focus:top-0");
    expect(label.className).toContain("peer-focus:-translate-y-1/2");
  });
});

// ═══════════════════════════════════════════════════════════
// AICPrefix
// ═══════════════════════════════════════════════════════════

describe("AICPrefix", () => {
  it("renders icon when prefixIcon provided", () => {
    const config = makeConfig({ prefixIcon: "user" });
    const { container } = render(
      <AICContainer config={config}>
        <AICPrefix />
      </AICContainer>,
    );

    const wrapper = container.querySelector("span");
    expect(wrapper).not.toBeNull();
    expect(wrapper!.className).toContain(GLOBAL_UI_CONFIG.iconPrefixWrapper);
    // Should contain SVG from the icon helper
    expect(wrapper!.innerHTML).toContain("svg");
  });
});

// ═══════════════════════════════════════════════════════════
// AICSuffix
// ═══════════════════════════════════════════════════════════

describe("AICSuffix", () => {
  it("renders clear button when suffixAction='clear'", () => {
    const config = makeConfig({ suffixAction: "clear" });
    const { container } = render(
      <AICContainer config={config}>
        <AICSuffix />
      </AICContainer>,
    );

    const button = container.querySelector("button");
    expect(button).not.toBeNull();
    expect(button!.getAttribute("aria-label")).toBe("clear");
  });
});

// ═══════════════════════════════════════════════════════════
// AICError
// ═══════════════════════════════════════════════════════════

describe("AICError", () => {
  it("renders error message when error is non-null and touched", () => {
    const config = makeConfig({
      error: "This field is required",
      touched: true,
    });
    const { container } = render(
      <AICContainer config={config}>
        <AICError />
      </AICContainer>,
    );

    const errorEl = container.querySelector("p");
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe("This field is required");
    expect(errorEl!.className).toContain(GLOBAL_UI_CONFIG.error);
  });

  it("hides when error is null", () => {
    const config = makeConfig({ error: null, touched: true });
    const { container } = render(
      <AICContainer config={config}>
        <AICError />
      </AICContainer>,
    );

    const errorEl = container.querySelector("p");
    expect(errorEl).toBeNull();
  });
});
