"use client";

import { useEffect } from "react";
import { useTabStore } from "@/stores/tab.store";

/**
 * Global keyboard handler for the POS workspace.
 * Only active when isPOSMode === true (tabs are open).
 *
 * Shortcuts:
 *  Ctrl+Tab / Ctrl+Shift+Tab  — next / prev tab
 *  Ctrl+W                     — close active tab
 *  Ctrl+1 … Ctrl+9            — switch to tab N
 *  Escape                     — (no-op here; handled by individual dialogs)
 */
export function WorkspaceKeyboard() {
  const isPOSMode = useTabStore((s) => s.isPOSMode);
  const switchToNext = useTabStore((s) => s.switchToNext);
  const switchToPrev = useTabStore((s) => s.switchToPrev);
  const switchToIndex = useTabStore((s) => s.switchToIndex);
  const closeTab = useTabStore((s) => s.closeTab);
  const activeTabId = useTabStore((s) => s.activeTabId);

  useEffect(() => {
    if (!isPOSMode) return;

    const handler = (e: KeyboardEvent) => {
      // Ctrl+Tab — next tab
      if (e.ctrlKey && e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        switchToNext();
        return;
      }
      // Ctrl+Shift+Tab — prev tab
      if (e.ctrlKey && e.shiftKey && e.key === "Tab") {
        e.preventDefault();
        switchToPrev();
        return;
      }
      // Ctrl+W — close active tab
      if (e.ctrlKey && e.key === "w") {
        e.preventDefault();
        if (activeTabId) closeTab(activeTabId);
        return;
      }
      // Ctrl+1…9 — switch to tab by index
      if (e.ctrlKey && e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        switchToIndex(parseInt(e.key, 10) - 1);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isPOSMode, switchToNext, switchToPrev, switchToIndex, closeTab, activeTabId]);

  return null;
}
