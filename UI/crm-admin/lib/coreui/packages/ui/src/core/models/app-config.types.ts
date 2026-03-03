// Pure TypeScript — no framework imports
// Source: core/ui-kit/angular/src/lib/control-library/models/app-config.model.ts

import { z } from "zod";

// ── Types ───────────────────────────────────────────────

export interface LanguageConfig {
  code: string;
  label: string;
}

export interface TransliterationAppConfig {
  defaultLanguage: string;
  languages: LanguageConfig[];
}

export interface ApiEndpointsConfig {
  base: string;
  ai: string;
}

export interface AppConfig {
  transliteration: TransliterationAppConfig;
  apiEndpoints: ApiEndpointsConfig;
}

// ── Zod Schemas ─────────────────────────────────────────

export const LanguageConfigSchema = z.object({
  code: z.string(),
  label: z.string(),
});

export const TransliterationAppConfigSchema = z.object({
  defaultLanguage: z.string(),
  languages: z.array(LanguageConfigSchema),
});

export const ApiEndpointsConfigSchema = z.object({
  base: z.string(),
  ai: z.string(),
});

export const AppConfigSchema = z.object({
  transliteration: TransliterationAppConfigSchema,
  apiEndpoints: ApiEndpointsConfigSchema,
});

// ── Runtime Constant ────────────────────────────────────

export const GLOBAL_APP_CONFIG: AppConfig = {
  transliteration: {
    defaultLanguage: "hi",
    languages: [
      { code: "hi", label: "Hindi" },
      { code: "bn", label: "Bengali" },
      { code: "gu", label: "Gujarati" },
      { code: "mr", label: "Marathi" },
      { code: "ta", label: "Tamil" },
      { code: "te", label: "Telugu" },
      { code: "ml", label: "Malayalam" },
      { code: "kn", label: "Kannada" },
      { code: "pa", label: "Punjabi" },
      { code: "ur", label: "Urdu" },
    ],
  },
  apiEndpoints: {
    base: "",
    ai: "",
  },
};
