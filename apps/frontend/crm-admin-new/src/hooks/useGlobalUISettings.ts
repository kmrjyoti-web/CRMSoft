"use client";

import { useState, useCallback, useEffect } from "react";

export const GLOBAL_UI_LS_KEY = "crm_global_ui_settings";

export interface GlobalUISettings {
  // ── Sidebar ──────────────────────────────────────────
  /** Whether the filter sidebar is open by default on all tables */
  tableSidebarFilterDefault: boolean;

  // ── View mode visibility ──────────────────────────────
  /** Which view-mode buttons are shown in the table toolbar */
  viewModeTable: boolean;
  viewModeList: boolean;
  viewModeCard: boolean;
  viewModeCalendar: boolean;
  viewModeMap: boolean;
  viewModeBi: boolean;
  viewModeTimeline: boolean;
  viewModeChart: boolean;
  viewModeTree: boolean;
  viewModeKanban: boolean;
}

export const GLOBAL_UI_DEFAULTS: GlobalUISettings = {
  tableSidebarFilterDefault: true,
  viewModeTable: true,
  viewModeList: true,
  viewModeCard: true,
  viewModeCalendar: true,
  viewModeMap: true,
  viewModeBi: true,
  viewModeTimeline: true,
  viewModeChart: true,
  viewModeTree: true,
  viewModeKanban: true,
};

export function readGlobalUISettings(): GlobalUISettings {
  if (typeof window === "undefined") return GLOBAL_UI_DEFAULTS;
  try {
    const raw = localStorage.getItem(GLOBAL_UI_LS_KEY);
    if (raw) return { ...GLOBAL_UI_DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return GLOBAL_UI_DEFAULTS;
}

/**
 * Derives the enabledViews array from settings — ready to pass to AICTableFull.
 * Returns undefined when all views are enabled (no filtering needed).
 */
export function getEnabledViews(s: GlobalUISettings): string[] | undefined {
  const all = [
    s.viewModeTable    && "table",
    s.viewModeList     && "list",
    s.viewModeCard     && "card",
    s.viewModeCalendar && "calendar",
    s.viewModeMap      && "map",
    s.viewModeBi       && "bi",
    s.viewModeTimeline && "timeline",
    s.viewModeChart    && "chart",
    s.viewModeTree     && "tree",
    s.viewModeKanban   && "kanban",
  ].filter(Boolean) as string[];

  // All 10 enabled → pass undefined (AICTableFull shows everything)
  if (all.length === 10) return undefined;
  return all;
}

/**
 * Hook for reading / writing Global UI Settings (localStorage-backed).
 * All consumers re-render together when settings change.
 */
export function useGlobalUISettings() {
  const [settings, setSettings] = useState<GlobalUISettings>(GLOBAL_UI_DEFAULTS);

  // Hydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    setSettings(readGlobalUISettings());
  }, []);

  // Listen for changes dispatched by GlobalUISettings panel
  useEffect(() => {
    const handler = (e: Event) => {
      setSettings((e as CustomEvent<GlobalUISettings>).detail);
    };
    window.addEventListener("globalUISettingsChanged", handler);
    return () => window.removeEventListener("globalUISettingsChanged", handler);
  }, []);

  const updateSetting = useCallback(
    <K extends keyof GlobalUISettings>(key: K, value: GlobalUISettings[K]) => {
      const next = { ...readGlobalUISettings(), [key]: value };
      setSettings(next);
      if (typeof window !== "undefined") {
        try { localStorage.setItem(GLOBAL_UI_LS_KEY, JSON.stringify(next)); } catch {}
        window.dispatchEvent(new CustomEvent("globalUISettingsChanged", { detail: next }));
      }
    },
    [],
  );

  return { settings, updateSetting };
}
