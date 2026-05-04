"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { eventToKeyString } from "../utils/os-keys";
import { useShortcutsStore } from "../stores/shortcuts.store";
import { useShortcuts } from "./useShortcuts";
import type { ShortcutDefinition } from "../types/shortcuts.types";

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function isTypingTarget(e: KeyboardEvent): boolean {
  const target = e.target as HTMLElement;
  if (!target) return false;
  if (INPUT_TAGS.has(target.tagName)) return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useKeyboardListener() {
  const router = useRouter();
  const togglePanel = useShortcutsStore((s) => s.togglePanel);
  const { data: shortcuts } = useShortcuts();

  // Keep shortcuts in a ref so the event handler always has the latest data
  // without needing to re-register the listener on every fetch update
  const shortcutsRef = useRef<ShortcutDefinition[]>([]);
  useEffect(() => {
    shortcutsRef.current = shortcuts ?? [];
  }, [shortcuts]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Toggle shortcut panel: Cmd+/ on Mac, Ctrl+/ on Windows/Linux
      if ((e.ctrlKey || e.metaKey) && e.code === "Slash") {
        e.preventDefault();
        togglePanel();
        return;
      }

      // Skip when typing in form fields
      if (isTypingTarget(e)) return;

      const list = shortcutsRef.current;
      if (!list.length) return;

      const keyString = eventToKeyString(e);
      if (!keyString) return;

      const match = list.find((s) => s.activeKey === keyString);
      if (!match) return;

      // Don't intercept browser reserved keys when no modifier is held
      // (e.g. plain F5 for refresh is fine, but Ctrl+P for print we let through to system)
      const hasModifier = e.ctrlKey || e.metaKey || e.altKey;
      if (!hasModifier && match.isSystem) return;

      e.preventDefault();
      e.stopPropagation();

      switch (match.actionType) {
        case "NAVIGATE":
          if (match.targetPath) router.push(match.targetPath);
          break;
        case "MODAL":
          window.dispatchEvent(
            new CustomEvent("shortcut:modal", { detail: match.targetFunction }),
          );
          break;
        case "FUNCTION":
          window.dispatchEvent(
            new CustomEvent("shortcut:function", { detail: match.targetFunction }),
          );
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // Only register once — shortcutsRef keeps data fresh without re-registering
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, togglePanel]);
}
