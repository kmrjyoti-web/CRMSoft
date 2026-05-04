/**
 * AICButtonControl tests.
 * 8 test cases per P10.1 spec.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AICButtonControl } from "../AICButtonControl";

const groupOptions = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
];

const splitOptions = [
  { label: "Save", value: "save" },
  { label: "Save As", value: "save-as" },
  { label: "Export", value: "export" },
];

describe("AICButtonControl", () => {
  // ── 1. Standard button renders AICButton ───────────────
  it("standard button renders AICButton", () => {
    const { container } = render(
      <AICButtonControl buttonType="standard" label="Submit" />,
    );
    const ctrl = container.querySelector(
      "[data-testid='button-control']",
    );
    expect(ctrl).toBeTruthy();

    const aicBtn = container.querySelector(
      "[data-testid='aic-button']",
    );
    expect(aicBtn).toBeTruthy();
    expect(aicBtn?.textContent).toContain("Submit");
  });

  // ── 2. AICButton click fires onClick ────────────────────────
  it("button click fires onClick", () => {
    const onClick = vi.fn();
    const { container } = render(
      <AICButtonControl buttonType="standard" label="Click" onClick={onClick} />,
    );
    const aicBtn = container.querySelector(
      "[data-testid='aic-button']",
    ) as HTMLButtonElement;
    fireEvent.click(aicBtn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // ── 3. Loading state shows spinner ───────────────────────
  it("loading state shows spinner", () => {
    const { container } = render(
      <AICButtonControl buttonType="standard" label="Loading" loading />,
    );
    const spinner = container.querySelector(
      "[data-testid='aic-button-spinner']",
    );
    expect(spinner).toBeTruthy();
  });

  // ── 4. Group mode renders all options ────────────────────
  it("group mode renders all options", () => {
    const { container } = render(
      <AICButtonControl buttonType="group" options={groupOptions} />,
    );
    const ctrl = container.querySelector(
      "[data-testid='button-control']",
    );
    expect(ctrl).toBeTruthy();

    groupOptions.forEach((opt) => {
      const optBtn = container.querySelector(
        `[data-testid='button-group-option-${opt.value}']`,
      );
      expect(optBtn).toBeTruthy();
      expect(optBtn?.textContent).toContain(opt.label);
    });
  });

  // ── 5. Group option click fires onChange with value ──────
  it("group option click fires onChange with value", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICButtonControl
        buttonType="group"
        options={groupOptions}
        onChange={onChange}
      />,
    );
    const centerBtn = container.querySelector(
      "[data-testid='button-group-option-center']",
    ) as HTMLButtonElement;
    fireEvent.click(centerBtn);
    expect(onChange).toHaveBeenCalledWith("center");
  });

  // ── 6. Split button renders main + toggle ────────────────
  it("split button renders main + toggle", () => {
    const { container } = render(
      <AICButtonControl
        buttonType="split"
        label="Save"
        options={splitOptions}
      />,
    );
    const aicBtn = container.querySelector(
      "[data-testid='aic-button']",
    );
    expect(aicBtn).toBeTruthy();

    const toggle = container.querySelector(
      "[data-testid='split-toggle']",
    );
    expect(toggle).toBeTruthy();
  });

  // ── 7. Split toggle opens dropdown ───────────────────────
  it("split toggle opens dropdown", () => {
    const { container } = render(
      <AICButtonControl
        buttonType="split"
        label="Save"
        options={splitOptions}
      />,
    );

    // Dropdown should not be visible initially
    expect(
      container.querySelector("[data-testid='split-dropdown']"),
    ).toBeNull();

    // Click toggle to open
    const toggle = container.querySelector(
      "[data-testid='split-toggle']",
    ) as HTMLButtonElement;
    fireEvent.click(toggle);

    // Dropdown should now be visible
    expect(
      container.querySelector("[data-testid='split-dropdown']"),
    ).toBeTruthy();
  });

  // ── 8. Split dropdown item click fires onChange ──────────
  it("split dropdown item click fires onChange", () => {
    const onChange = vi.fn();
    const { container } = render(
      <AICButtonControl
        buttonType="split"
        label="Save"
        options={splitOptions}
        onChange={onChange}
      />,
    );

    // Open dropdown
    const toggle = container.querySelector(
      "[data-testid='split-toggle']",
    ) as HTMLButtonElement;
    fireEvent.click(toggle);

    // Click an option
    const exportOpt = container.querySelector(
      "[data-testid='split-option-export']",
    ) as HTMLButtonElement;
    fireEvent.click(exportOpt);

    expect(onChange).toHaveBeenCalledWith("export");

    // Dropdown should close after selection
    expect(
      container.querySelector("[data-testid='split-dropdown']"),
    ).toBeNull();
  });
});
