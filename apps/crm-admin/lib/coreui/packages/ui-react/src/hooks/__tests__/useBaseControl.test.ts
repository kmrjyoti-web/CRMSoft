// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBaseControl } from "../useBaseControl";
import type { BaseControlProps, ControlLike, FormFieldConfig } from "@coreui/ui";
import { CONTROL_SIZES, GLOBAL_UI_CONFIG } from "@coreui/ui";

// Helper to resolve props through the hook
function resolve(props: BaseControlProps) {
  const { result } = renderHook(() => useBaseControl(props));
  return result.current;
}

describe("useBaseControl", () => {
  it("uses directControl when control prop provided", () => {
    const control: ControlLike = {
      value: "hello",
      errors: null,
      invalid: false,
      dirty: false,
      touched: false,
    };

    const result = resolve({ control });
    expect(result.value).toBe("hello");
  });

  it("reads value from formValues[field.key] when no direct control", () => {
    const field: FormFieldConfig = {
      key: "name",
      type: "text",
      label: "Name",
    };

    const result = resolve({
      field,
      formValues: { name: "John" },
    });
    expect(result.value).toBe("John");
  });

  it("direct props override field config (label, disabled, etc.)", () => {
    const field: FormFieldConfig = {
      key: "name",
      type: "text",
      label: "Field Label",
    };

    const result = resolve({
      field,
      label: "Override Label",
      disabled: true,
    });
    expect(result.label).toBe("Override Label");
    expect(result.disabled).toBe(true);
  });

  it("resolves size to 'medium' when not specified", () => {
    const result = resolve({});
    expect(result.size).toBe("medium");
  });

  it("resolves size styles from CONTROL_SIZES", () => {
    const result = resolve({ size: "small" });
    expect(result.sizeStyles).toEqual(CONTROL_SIZES["small"]);
  });

  it("merges field.ui over GLOBAL_UI_CONFIG", () => {
    const field: FormFieldConfig = {
      key: "test",
      type: "text",
      label: "Test",
      ui: { container: "custom-container" } as any,
    };

    const result = resolve({ field });
    expect(result.uiConfig.container).toBe("custom-container");
    // Other props should fall through from GLOBAL_UI_CONFIG
    expect(result.uiConfig.input).toBe(GLOBAL_UI_CONFIG.input);
  });

  it("applies dt prop as tokenStyles CSS variables", () => {
    const result = resolve({
      dt: { inputtext: { background: "#fff" } },
    });
    expect(result.tokenStyles["--p-inputtext-background"]).toBe("#fff");
  });

  it("returns error from manual override when provided", () => {
    const result = resolve({ error: "Manual error" });
    expect(result.error).toBe("Manual error");
  });

  it("returns error from formErrors when no manual override", () => {
    const field: FormFieldConfig = {
      key: "email",
      type: "email",
      label: "Email",
    };

    const result = resolve({
      field,
      formErrors: { email: "Invalid email format" },
    });
    expect(result.error).toBe("Invalid email format");
  });

  it("returns touched from formTouched", () => {
    const field: FormFieldConfig = {
      key: "name",
      type: "text",
      label: "Name",
    };

    const result = resolve({
      field,
      formTouched: { name: true },
    });
    expect(result.touched).toBe(true);
  });

  it("builds validators from field.validators + direct props", () => {
    const field: FormFieldConfig = {
      key: "age",
      type: "number",
      label: "Age",
      validators: { required: true, min: 0 },
    };

    const result = resolve({
      field,
      max: 150,
    });

    expect(result.validators.required).toBe(true);
    expect(result.validators.min).toBe(0);
    expect(result.validators.max).toBe(150);
  });
});
