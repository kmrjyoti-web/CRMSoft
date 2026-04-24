"use client";

import { useState, useMemo, useEffect } from "react";
import { Icon } from "@/components/ui";
import { ShortcutBadge } from "./ShortcutBadge";
import { KeyRecordModal } from "./KeyRecordModal";
import { useShortcuts, useResetAllShortcuts } from "../hooks/useShortcuts";
import { useShortcutsStore } from "../stores/shortcuts.store";
import { eventToKeyString } from "../utils/os-keys";
import type { ShortcutDefinition } from "../types/shortcuts.types";

const CATEGORY_LABELS: Record<string, string> = {
  COMMON: "Common Actions",
  NAVIGATION: "Navigation",
  QUICK_ACTIONS: "Quick Actions",
  BILLING_WINDOW: "Billing Window",
  TOOLS: "Tools",
  SYSTEM: "System (Locked)",
  CUSTOM: "My Custom Shortcuts",
};

export function ShortcutPanel() {
  const { isPanelOpen, closePanel } = useShortcutsStore();
  const [search, setSearch] = useState("");
  const [editingShortcut, setEditingShortcut] = useState<ShortcutDefinition | null>(null);
  const [lastKey, setLastKey] = useState<string>("");
  const { data: shortcuts, isLoading } = useShortcuts();
  const resetAll = useResetAllShortcuts();

  // Key debugger — capture any keydown while panel is open
  useEffect(() => {
    if (!isPanelOpen) return;
    const handler = (e: KeyboardEvent) => {
      const k = eventToKeyString(e);
      if (k) setLastKey(k);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isPanelOpen]);

  const grouped = useMemo(() => {
    if (!shortcuts) return {};
    const filtered = search
      ? shortcuts.filter(
          (s) =>
            s.label.toLowerCase().includes(search.toLowerCase()) ||
            s.activeKey.toLowerCase().includes(search.toLowerCase()) ||
            s.category.toLowerCase().includes(search.toLowerCase()),
        )
      : shortcuts;

    return filtered.reduce<Record<string, ShortcutDefinition[]>>((acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    }, {});
  }, [shortcuts, search]);

  if (!isPanelOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.4)" }}
        onClick={closePanel}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: 560, maxWidth: "95vw",
          background: "white", zIndex: 9999,
          display: "flex", flexDirection: "column",
          boxShadow: "-4px 0 30px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex", alignItems: "center", gap: 12,
            flexShrink: 0,
          }}
        >
          <Icon name="keyboard" size={20} />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Keyboard Shortcuts</h2>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>
              Press <ShortcutBadge keyString="meta+/" /> to toggle this panel
            </p>
          </div>
          <button
            onClick={closePanel}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#6b7280" }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "14px 24px", borderBottom: "1px solid #f3f4f6", flexShrink: 0 }}>
          <div style={{ position: "relative" }}>
            <Icon
              name="search"
              size={14}
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}
            />
            <input
              type="text"
              placeholder="Search shortcuts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px 8px 32px",
                border: "1px solid #e5e7eb", borderRadius: 8,
                fontSize: 13, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Key Debugger */}
        <div style={{ padding: "8px 24px", background: "#f8fafc", borderBottom: "1px solid #f3f4f6", flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 3 }}>Key Tester — press any combo:</div>
          <div style={{
            fontFamily: "monospace", fontSize: 13, fontWeight: 600,
            color: lastKey ? "#0ea5e9" : "#d1d5db",
            background: "#fff", border: "1px solid #e5e7eb",
            borderRadius: 6, padding: "5px 10px", minHeight: 30,
          }}>
            {lastKey || "— press a key —"}
          </div>
          {lastKey && shortcuts && (
            <div style={{ fontSize: 11, marginTop: 4, color: shortcuts.find(s => s.activeKey === lastKey) ? "#10b981" : "#ef4444" }}>
              {shortcuts.find(s => s.activeKey === lastKey)
                ? `✓ Matched: "${shortcuts.find(s => s.activeKey === lastKey)?.label}"`
                : `✗ No match in DB (${shortcuts.length} shortcuts loaded)`}
            </div>
          )}
        </div>

        {/* Shortcut list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 24px" }}>
          {isLoading ? (
            <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
              Loading shortcuts…
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
              No shortcuts found.
            </div>
          ) : (
            Object.entries(grouped)
              .sort(([a], [b]) => (a === "SYSTEM" ? 1 : b === "SYSTEM" ? -1 : a.localeCompare(b)))
              .map(([category, items]) => (
                <div key={category} style={{ paddingTop: 20, paddingBottom: 4 }}>
                  <div
                    style={{
                      fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: 1, color: "#9ca3af", marginBottom: 8,
                    }}
                  >
                    {CATEGORY_LABELS[category] ?? category}
                  </div>
                  {items.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "7px 10px", borderRadius: 6,
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#f9fafb")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
                    >
                      <span style={{ flex: 1, fontSize: 13, color: "#374151" }}>
                        {s.label}
                        {s.isCustomized && (
                          <span style={{ marginLeft: 6, fontSize: 10, color: "#0ea5e9", fontWeight: 500 }}>
                            customized
                          </span>
                        )}
                      </span>
                      <ShortcutBadge keyString={s.activeKey} isCustomized={s.isCustomized} isLocked={s.isLocked} />
                      {s.isLocked ? (
                        <span style={{ color: "#9ca3af", fontSize: 12 }}>🔒</span>
                      ) : (
                        <button
                          onClick={() => setEditingShortcut(s)}
                          title="Edit shortcut"
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "#9ca3af", padding: 2, display: "flex",
                          }}
                        >
                          <Icon name="edit" size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e5e7eb",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            {shortcuts?.length ?? 0} shortcuts · {shortcuts?.filter((s) => s.isCustomized).length ?? 0} customized
          </span>
          <button
            onClick={() => resetAll.mutate()}
            disabled={resetAll.isPending}
            style={{
              fontSize: 12, color: "#6b7280", background: "none",
              border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 10px", cursor: "pointer",
            }}
          >
            Reset All to Defaults
          </button>
        </div>
      </div>

      {/* Edit modal */}
      {editingShortcut && (
        <KeyRecordModal
          shortcut={editingShortcut}
          onClose={() => setEditingShortcut(null)}
        />
      )}
    </>
  );
}
