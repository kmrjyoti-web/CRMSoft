// Source: core/ui-kit/angular/src/lib/control-library/services/ai-assistant.service.ts
import { create } from "zustand";
import type { ControlType, FormFieldConfig, FormSchema } from "@coreui/ui";
import { GLOBAL_APP_CONFIG } from "@coreui/ui";

// ── Types ───────────────────────────────────────────────

export interface AiAssistantState {
  loading: boolean;
  error: string | null;
  generateConfig: (
    prompt: string,
    controlType: ControlType,
  ) => Promise<Partial<FormFieldConfig>>;
  generateFormSchema: (prompt: string) => Promise<FormSchema>;
}

// ── Default / Mock responses ────────────────────────────

function getMockConfig(controlType: ControlType): Partial<FormFieldConfig> {
  return {
    key: "generated",
    type: controlType,
    label: "Generated Field",
    placeholder: "Enter value...",
  };
}

function getMockSchema(): FormSchema {
  return {
    title: "Generated Form (Fallback)",
    description:
      "AI generation failed or API endpoint not configured. This is a fallback schema.",
    layout: "standard",
    rows: [
      {
        columns: [
          {
            span: "col-span-12 md:col-span-6",
            field: {
              key: "firstName",
              type: "text",
              label: "First Name",
              placeholder: "John",
            },
          },
          {
            span: "col-span-12 md:col-span-6",
            field: {
              key: "lastName",
              type: "text",
              label: "Last Name",
              placeholder: "Doe",
            },
          },
        ],
      },
    ],
  };
}

// ── Store ───────────────────────────────────────────────

export const useAiAssistant = create<AiAssistantState>((set, get) => ({
  loading: false,
  error: null,

  generateConfig: async (prompt, controlType) => {
    const endpoint = GLOBAL_APP_CONFIG.apiEndpoints.ai;

    if (!endpoint) {
      return getMockConfig(controlType);
    }

    set({ loading: true, error: null });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, controlType, action: "generateConfig" }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = (await response.json()) as Partial<FormFieldConfig>;
      set({ loading: false });
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";
      set({ loading: false, error: message });
      return getMockConfig(controlType);
    }
  },

  generateFormSchema: async (prompt) => {
    const endpoint = GLOBAL_APP_CONFIG.apiEndpoints.ai;

    if (!endpoint) {
      return getMockSchema();
    }

    set({ loading: true, error: null });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, action: "generateSchema" }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = (await response.json()) as FormSchema;
      set({ loading: false });
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";
      set({ loading: false, error: message });
      return getMockSchema();
    }
  },
}));
