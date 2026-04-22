"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/ui";
import { ShortcutBadge } from "./ShortcutBadge";
import { eventToKeyString } from "../utils/os-keys";
import { shortcutsService } from "../services/shortcuts.service";
import { useUpsertShortcut, useRemoveShortcut } from "../hooks/useShortcuts";
import type { ShortcutDefinition } from "../types/shortcuts.types";

interface KeyRecordModalProps {
  shortcut: ShortcutDefinition;
  onClose: () => void;
}

export function KeyRecordModal({ shortcut, onClose }: KeyRecordModalProps) {
  const [recording, setRecording] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [conflict, setConflict] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [saved, setSaved] = useState(false);

  const upsert = useUpsertShortcut();
  const reset = useRemoveShortcut();

  useEffect(() => {
    if (!recording) return;
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const key = eventToKeyString(e);
      // Ignore modifier-only presses
      if (!key || ["ctrl", "alt", "shift", "meta"].includes(key)) return;
      setRecording(false);
      setNewKey(key);
      setConflict(null);
      // Check conflict
      setChecking(true);
      shortcutsService.checkConflict(key, shortcut.id)
        .then((r) => {
          setConflict(r.hasConflict ? (r.conflictsWith ?? "another shortcut") : null);
        })
        .catch(() => {})
        .finally(() => setChecking(false));
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [recording, shortcut.id]);

  const handleSave = async () => {
    if (!newKey || conflict) return;
    await upsert.mutateAsync({ id: shortcut.id, dto: { customKey: newKey } });
    setSaved(true);
    setTimeout(onClose, 600);
  };

  const handleReset = async () => {
    await reset.mutateAsync(shortcut.id);
    setSaved(true);
    setTimeout(onClose, 600);
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "white", borderRadius: 12, padding: 28,
          width: 400, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <Icon name="keyboard" size={18} />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Edit Shortcut</h3>
          <button
            onClick={onClose}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", padding: 4 }}
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>Shortcut</div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{shortcut.label}</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>Current key</div>
          <ShortcutBadge keyString={shortcut.activeKey} isCustomized={shortcut.isCustomized} size="md" />
          {shortcut.isCustomized && (
            <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 8 }}>
              (default: {shortcut.defaultKey})
            </span>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>New key</div>
          {recording ? (
            <div
              style={{
                padding: "14px 16px", border: "2px solid #0ea5e9", borderRadius: 8,
                background: "rgba(14,165,233,0.05)", textAlign: "center",
                fontSize: 13, color: "#0ea5e9",
                animation: "pulse 1.5s infinite",
              }}
            >
              Press any key combination…
            </div>
          ) : newKey ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShortcutBadge keyString={newKey} size="md" />
              <button
                onClick={() => { setNewKey(""); setConflict(null); }}
                style={{ fontSize: 11, color: "#6b7280", background: "none", border: "none", cursor: "pointer" }}
              >
                Clear
              </button>
            </div>
          ) : (
            <button
              onClick={() => setRecording(true)}
              style={{
                padding: "10px 16px", border: "1px dashed #d1d5db", borderRadius: 8,
                background: "none", cursor: "pointer", width: "100%", fontSize: 13, color: "#6b7280",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <Icon name="keyboard" size={14} />
              Click to record key combination
            </button>
          )}

          {checking && (
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>Checking for conflicts…</div>
          )}
          {conflict && (
            <div style={{ fontSize: 12, color: "#ef4444", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
              <Icon name="alert-circle" size={12} />
              Conflicts with &quot;{conflict}&quot; — change that shortcut first
            </div>
          )}
        </div>

        {saved && (
          <div style={{ fontSize: 13, color: "#10b981", marginBottom: 12, display: "flex", alignItems: "center", gap: 4 }}>
            <Icon name="check-circle" size={14} />
            Saved!
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleSave}
            disabled={!newKey || !!conflict || checking || upsert.isPending}
            style={{
              flex: 1, padding: "9px 16px",
              background: "var(--color-primary, #0ea5e9)", color: "white",
              border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 500,
              opacity: (!newKey || !!conflict || checking) ? 0.5 : 1,
            }}
          >
            Save
          </button>
          {shortcut.isCustomized && (
            <button
              onClick={handleReset}
              disabled={reset.isPending}
              style={{
                padding: "9px 14px", background: "none",
                border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer", fontSize: 13,
              }}
            >
              Reset
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              padding: "9px 14px", background: "none",
              border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer", fontSize: 13,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
