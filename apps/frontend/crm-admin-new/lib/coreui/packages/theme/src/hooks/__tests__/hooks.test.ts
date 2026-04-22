// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { useGlobalTheme } from "../useGlobalTheme";

describe("useGlobalTheme", () => {
  beforeEach(() => {
    useGlobalTheme.setState({ currentTheme: "default", tokens: {} });
    // Clear any CSS variables set on :root
    document.documentElement.removeAttribute("style");
  });

  it("setToken updates single CSS variable", () => {
    useGlobalTheme.getState().setToken("--color-primary", "#3b82f6");
    expect(useGlobalTheme.getState().tokens["--color-primary"]).toBe(
      "#3b82f6",
    );
  });

  it("applyToDocument sets CSS vars on :root", () => {
    useGlobalTheme.getState().setToken("--color-primary", "#3b82f6");
    useGlobalTheme.getState().setToken("--color-bg", "#ffffff");
    useGlobalTheme.getState().applyToDocument();

    const root = document.documentElement;
    expect(root.style.getPropertyValue("--color-primary")).toBe("#3b82f6");
    expect(root.style.getPropertyValue("--color-bg")).toBe("#ffffff");
  });
});
