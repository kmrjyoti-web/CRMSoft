import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useFormStore } from "../useFormStore";
import { useConfirmDialog } from "../useConfirmDialog";
import { useTranslation } from "../useTranslation";
import { useToastStore } from "../useToast";
import { useDialog } from "../useDialog";
import type { FormSchema } from "@coreui/ui";

// ── Helpers ─────────────────────────────────────────────

const testSchema: FormSchema = {
  title: "Test Form",
  layout: "standard",
  rows: [
    {
      columns: [
        {
          span: "col-span-6",
          field: {
            key: "name",
            type: "text",
            label: "Name",
            validators: { required: true },
          },
        },
        {
          span: "col-span-6",
          field: {
            key: "email",
            type: "email",
            label: "Email",
            validators: { required: true, email: true },
          },
        },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════
// useFormStore
// ═══════════════════════════════════════════════════════════

describe("useFormStore", () => {
  beforeEach(() => {
    useFormStore.getState().reset();
    useFormStore.setState({ schema: null });
  });

  it("setValue stores value at key", () => {
    useFormStore.getState().setValue("name", "John");
    expect(useFormStore.getState().values.name).toBe("John");
  });

  it("getValues returns all stored values", () => {
    useFormStore.getState().setValue("name", "John");
    useFormStore.getState().setValue("email", "john@test.com");
    const values = useFormStore.getState().getValues();
    expect(values).toEqual({ name: "John", email: "john@test.com" });
  });

  it("validateField returns error for empty required field", () => {
    useFormStore.getState().setValue("name", "");
    const error = useFormStore
      .getState()
      .validateField("name", { required: true });
    expect(error).toBeTruthy();
    expect(typeof error).toBe("string");
  });

  it("validateField returns null for valid field", () => {
    useFormStore.getState().setValue("name", "John");
    const error = useFormStore
      .getState()
      .validateField("name", { required: true });
    expect(error).toBeNull();
  });

  it("validateAll returns false when errors exist", () => {
    useFormStore.getState().loadSchema(testSchema);
    // name and email are empty (defaults to ""), both required
    const isValid = useFormStore.getState().validateAll();
    expect(isValid).toBe(false);
  });

  it("setTouched marks field as touched", () => {
    useFormStore.getState().setTouched("name");
    expect(useFormStore.getState().touched.name).toBe(true);
  });

  it("reset clears all values/errors/touched", () => {
    useFormStore.getState().setValue("name", "John");
    useFormStore.getState().setTouched("name");
    useFormStore.getState().setError("name", "Some error");
    useFormStore.getState().setDirty("name");

    useFormStore.getState().reset();

    const state = useFormStore.getState();
    expect(state.values).toEqual({});
    expect(state.errors).toEqual({});
    expect(state.touched).toEqual({});
    expect(state.dirty).toEqual({});
  });
});

// ═══════════════════════════════════════════════════════════
// useConfirmDialog
// ═══════════════════════════════════════════════════════════

describe("useConfirmDialog", () => {
  beforeEach(() => {
    useConfirmDialog.setState({ isOpen: false, config: null });
  });

  it("open sets isOpen=true and config", () => {
    const config = { title: "Delete?", message: "Are you sure?" };
    // Fire and forget the promise for this test
    useConfirmDialog.getState().open(config);
    const state = useConfirmDialog.getState();
    expect(state.isOpen).toBe(true);
    expect(state.config).toEqual(config);
  });

  it("confirm resolves promise with true", async () => {
    const config = { title: "Confirm", message: "Proceed?" };
    const promise = useConfirmDialog.getState().open(config);
    useConfirmDialog.getState().confirm();
    const result = await promise;
    expect(result).toBe(true);
  });

  it("cancel resolves promise with false", async () => {
    const config = { title: "Confirm", message: "Proceed?" };
    const promise = useConfirmDialog.getState().open(config);
    useConfirmDialog.getState().cancel();
    const result = await promise;
    expect(result).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════
// useTranslation
// ═══════════════════════════════════════════════════════════

describe("useTranslation", () => {
  beforeEach(() => {
    useTranslation.setState({ locale: "en", translations: {} });
  });

  it("t returns key when no translation found", () => {
    const result = useTranslation.getState().t("missing.key");
    expect(result).toBe("missing.key");
  });

  it("t interpolates {{param}} in translated string", () => {
    useTranslation.getState().loadTranslations("en", {
      hello: "Hello {{name}}, welcome to {{place}}!",
    });
    const result = useTranslation
      .getState()
      .t("hello", { name: "John", place: "CoreUI" });
    expect(result).toBe("Hello John, welcome to CoreUI!");
  });

  it("setLocale changes active locale", () => {
    useTranslation.getState().loadTranslations("fr", {
      greeting: "Bonjour",
    });
    useTranslation.getState().setLocale("fr");
    expect(useTranslation.getState().locale).toBe("fr");
    expect(useTranslation.getState().t("greeting")).toBe("Bonjour");
  });
});

// ═══════════════════════════════════════════════════════════
// useToastStore
// ═══════════════════════════════════════════════════════════

describe("useToastStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useToastStore.getState().clearAll();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("addToast adds toast to queue", () => {
    const id = useToastStore
      .getState()
      .addToast({ type: "info", message: "Test" });
    expect(typeof id).toBe("string");
    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(useToastStore.getState().toasts[0].message).toBe("Test");
  });

  it("success creates toast with type='success'", () => {
    useToastStore.getState().success("It worked!");
    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].type).toBe("success");
    expect(toasts[0].message).toBe("It worked!");
  });

  it("auto-removes toast after duration", () => {
    useToastStore
      .getState()
      .addToast({ type: "info", message: "Temp", duration: 1000 });
    expect(useToastStore.getState().toasts).toHaveLength(1);

    vi.advanceTimersByTime(1000);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it("removeToast removes specific toast", () => {
    const id = useToastStore
      .getState()
      .addToast({ type: "info", message: "Remove me", duration: 0 });
    expect(useToastStore.getState().toasts).toHaveLength(1);

    useToastStore.getState().removeToast(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it("clearAll empties queue", () => {
    useToastStore
      .getState()
      .addToast({ type: "info", message: "A", duration: 0 });
    useToastStore
      .getState()
      .addToast({ type: "warning", message: "B", duration: 0 });
    expect(useToastStore.getState().toasts).toHaveLength(2);

    useToastStore.getState().clearAll();
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════
// useDialog
// ═══════════════════════════════════════════════════════════

describe("useDialog", () => {
  beforeEach(() => {
    useDialog.setState({ isOpen: false, data: null });
  });

  it("open sets isOpen=true", () => {
    useDialog.getState().open({ id: 42 });
    expect(useDialog.getState().isOpen).toBe(true);
    expect(useDialog.getState().data).toEqual({ id: 42 });
  });

  it("close sets isOpen=false and clears data", () => {
    useDialog.getState().open({ id: 42 });
    useDialog.getState().close();
    expect(useDialog.getState().isOpen).toBe(false);
    expect(useDialog.getState().data).toBeNull();
  });
});
