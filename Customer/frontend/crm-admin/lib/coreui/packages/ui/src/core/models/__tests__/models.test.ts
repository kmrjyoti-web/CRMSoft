import { describe, it, expect } from "vitest";
import {
  CONTROL_TYPES,
  ControlTypeSchema,
  FormFieldConfigSchema,
  FormSchemaSchema,
  GLOBAL_UI_CONFIG,
  CONTROL_SIZES,
  GLOBAL_APP_CONFIG,
  DEFAULT_EDITOR_CONFIG,
  ICON_NAMES,
  ConfirmDialogConfigSchema,
} from "../index";
import type {
  ControlType,
  FormFieldConfig,
  FormSchema,
  ConfirmDialogConfig,
  DialogType,
} from "../index";

// ── CONTROL_TYPES ───────────────────────────────────────

describe("CONTROL_TYPES", () => {
  it("has exactly 34 entries", () => {
    expect(CONTROL_TYPES).toHaveLength(34);
  });

  it("all 34 types create valid FormFieldConfig objects", () => {
    for (const type of CONTROL_TYPES) {
      const field: FormFieldConfig = { key: `test_${type}`, type, label: type };
      const result = FormFieldConfigSchema.safeParse(field);
      expect(result.success).toBe(true);
    }
  });
});

// ── ControlTypeSchema ───────────────────────────────────

describe("ControlTypeSchema", () => {
  it("accepts all 34 valid types", () => {
    for (const type of CONTROL_TYPES) {
      const result = ControlTypeSchema.safeParse(type);
      expect(result.success).toBe(true);
    }
  });

  it('rejects "invalid-type"', () => {
    const result = ControlTypeSchema.safeParse("invalid-type");
    expect(result.success).toBe(false);
  });

  it("rejects empty string", () => {
    const result = ControlTypeSchema.safeParse("");
    expect(result.success).toBe(false);
  });
});

// ── GLOBAL_UI_CONFIG ────────────────────────────────────

describe("GLOBAL_UI_CONFIG", () => {
  it('floatingMode === "ON"', () => {
    expect(GLOBAL_UI_CONFIG.floatingMode).toBe("ON");
  });

  it("has all required string properties (non-empty)", () => {
    const requiredKeys: (keyof typeof GLOBAL_UI_CONFIG)[] = [
      "container",
      "input",
      "inputOutlined",
      "inputFilled",
      "inputStandard",
      "label",
      "labelOutlined",
      "labelFilled",
      "labelStandard",
      "activeOn",
      "activeIn",
      "idle",
      "iconPrefixWrapper",
      "iconSuffixWrapper",
      "inputHasPrefix",
      "inputHasSuffix",
      "labelHasPrefix",
      "error",
      "switchWrapper",
      "switchTrack",
      "mobileGroup",
      "mobileCountrySelect",
      "mobileInput",
      "colorPreview",
      "optionGroupContainer",
      "optionCard",
      "optionCardSelected",
      "optionCardHover",
      "optionContent",
      "optionLabel",
      "optionDescription",
      "optionIcon",
      "optionImage",
      "editorContainer",
      "editorToolbar",
      "editorBtn",
      "editorBtnActive",
      "editorContent",
      "segmentContainer",
      "segmentButton",
      "segmentButtonActive",
      "segmentButtonIdle",
      "fileUploadDropzone",
      "fileUploadPreview",
      "signaturePad",
      "signatureClearBtn",
      "otpContainer",
      "otpInput",
      "actionButton",
      "buttonGroup",
      "buttonGroupItem",
      "splitButtonContainer",
      "splitButtonMain",
      "splitButtonToggle",
      "dropdownMenu",
      "dropdownItem",
      "fieldsetContainer",
      "fieldsetHeader",
      "fieldsetLegend",
      "fieldsetContent",
      "fieldsetToggleIcon",
      "fieldsetOutline",
      "fieldsetOutlineLegend",
    ];

    for (const key of requiredKeys) {
      const value = GLOBAL_UI_CONFIG[key];
      expect(typeof value).toBe("string");
      // mobileButton is intentionally empty string — skip length check for it
      if (key !== "mobileButton") {
        expect((value as string).length).toBeGreaterThan(0);
      }
    }
  });
});

// ── CONTROL_SIZES ───────────────────────────────────────

describe("CONTROL_SIZES", () => {
  it("has all 5 sizes with non-empty input/button/icon", () => {
    const sizes = ["large", "medium", "small", "xsmall", "tiny"] as const;
    for (const size of sizes) {
      const config = CONTROL_SIZES[size];
      expect(config).toBeDefined();
      expect(config.input.length).toBeGreaterThan(0);
      expect(config.button.length).toBeGreaterThan(0);
      expect(config.icon.length).toBeGreaterThan(0);
    }
  });
});

// ── FormSchema Zod Validation ───────────────────────────

describe("FormSchemaSchema", () => {
  it("standard layout FormSchema passes Zod validation", () => {
    const schema: FormSchema = {
      title: "Test Form",
      description: "A test form",
      layout: "standard",
      rows: [
        {
          columns: [
            {
              span: "col-span-12",
              field: { key: "name", type: "text", label: "Name" },
            },
          ],
        },
      ],
    };
    const result = FormSchemaSchema.safeParse(schema);
    expect(result.success).toBe(true);
  });

  it("tabs layout FormSchema passes Zod validation", () => {
    const schema: FormSchema = {
      title: "Tabbed Form",
      layout: "tabs",
      tabs: [
        {
          id: "tab1",
          label: "Tab 1",
          icon: "user",
          rows: [
            {
              columns: [
                {
                  span: "col-span-6",
                  field: { key: "email", type: "email", label: "Email" },
                },
              ],
            },
          ],
        },
      ],
    };
    const result = FormSchemaSchema.safeParse(schema);
    expect(result.success).toBe(true);
  });
});

// ── FormFieldConfigSchema ───────────────────────────────

describe("FormFieldConfigSchema", () => {
  it("complete FormFieldConfig with all optional fields passes Zod validation", () => {
    const field: FormFieldConfig = {
      key: "full_field",
      type: "text",
      label: "Full Field",
      placeholder: "Enter value",
      defaultValue: "hello",
      options: [
        {
          label: "Option 1",
          value: "opt1",
          icon: "user",
          description: "Desc",
        },
      ],
      api: {
        endpoint: "/api/data",
        method: "GET",
        labelKey: "name",
        valueKey: "id",
        dependency: "country",
        paramKey: "countryId",
      },
      validators: {
        required: true,
        minLength: 2,
        maxLength: 100,
        pattern: "^[a-zA-Z]+$",
        min: 0,
        max: "2025-12-31",
        email: false,
      },
      hidden: false,
      props: { rows: 4, layout: "grid" },
      prefixIcon: "user",
      suffixIcon: "search",
      suffixAction: "search",
      transliteration: {
        enabled: true,
        languages: [{ code: "hi", label: "Hindi" }],
        defaultLanguage: "hi",
        showControls: true,
        autoConvert: false,
      },
      size: "medium",
      tooltip: "Enter your name",
      previousControl: "prev_field",
      nextControl: "next_field",
    };
    const result = FormFieldConfigSchema.safeParse(field);
    expect(result.success).toBe(true);
  });

  it("minimal FormFieldConfig (key + type + label only) passes Zod validation", () => {
    const field: FormFieldConfig = {
      key: "minimal",
      type: "text",
      label: "Minimal",
    };
    const result = FormFieldConfigSchema.safeParse(field);
    expect(result.success).toBe(true);
  });

  it("rejects field with invalid type", () => {
    const result = FormFieldConfigSchema.safeParse({
      key: "bad",
      type: "nonexistent-control",
      label: "Bad",
    });
    expect(result.success).toBe(false);
  });
});

// ── GLOBAL_APP_CONFIG ───────────────────────────────────

describe("GLOBAL_APP_CONFIG", () => {
  it("has 10 languages", () => {
    expect(GLOBAL_APP_CONFIG.transliteration.languages).toHaveLength(10);
  });

  it('transliteration.defaultLanguage === "hi"', () => {
    expect(GLOBAL_APP_CONFIG.transliteration.defaultLanguage).toBe("hi");
  });
});

// ── DEFAULT_EDITOR_CONFIG ───────────────────────────────

describe("DEFAULT_EDITOR_CONFIG", () => {
  it("has all 11 toolbar toggles set to true", () => {
    const toggles = DEFAULT_EDITOR_CONFIG.showToolbar;
    const keys = Object.keys(toggles) as (keyof typeof toggles)[];
    expect(keys).toHaveLength(11);
    for (const key of keys) {
      expect(toggles[key]).toBe(true);
    }
  });

  it("has 10 templates, 5 headings, 9 fonts, 4 fontSizes", () => {
    const opts = DEFAULT_EDITOR_CONFIG.dropdownOptions;
    expect(opts.templates).toHaveLength(10);
    expect(opts.headings).toHaveLength(5);
    expect(opts.fonts).toHaveLength(9);
    expect(opts.fontSizes).toHaveLength(4);
  });
});

// ── ConfirmDialogConfig ─────────────────────────────────

describe("ConfirmDialogConfig", () => {
  it("type compiles with all 4 DialogType variants", () => {
    const variants: DialogType[] = ["info", "success", "warning", "danger"];
    for (const variant of variants) {
      const config: ConfirmDialogConfig = {
        title: "Test",
        message: "Are you sure?",
        type: variant,
      };
      const result = ConfirmDialogConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    }
  });
});

// ── ICON_NAMES ──────────────────────────────────────────

describe("ICON_NAMES", () => {
  it("has 57 entries", () => {
    expect(ICON_NAMES).toHaveLength(57);
  });
});
