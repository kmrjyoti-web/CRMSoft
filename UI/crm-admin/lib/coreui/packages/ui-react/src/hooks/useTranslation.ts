// Source: core/ui-kit/angular/src/lib/control-library/services/translation.service.ts
import { create } from "zustand";

// ── Types ───────────────────────────────────────────────

export interface TranslationState {
  locale: string;
  translations: Record<string, Record<string, string>>;
  t: (key: string, params?: Record<string, string>) => string;
  setLocale: (locale: string) => void;
  loadTranslations: (locale: string, data: Record<string, string>) => void;
}

// ── Store ───────────────────────────────────────────────

export const useTranslation = create<TranslationState>((set, get) => ({
  locale: "en",
  translations: {},

  t: (key, params) => {
    const { locale, translations } = get();
    const localeData = translations[locale];
    let text = localeData?.[key] ?? key;

    // Interpolate {{param}} placeholders
    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        text = text.replace(
          new RegExp(`\\{\\{${paramKey}\\}\\}`, "g"),
          paramValue,
        );
      }
    }

    return text;
  },

  setLocale: (locale) => {
    set({ locale });
  },

  loadTranslations: (locale, data) => {
    set({
      translations: { ...get().translations, [locale]: data },
    });
  },
}));
