"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { ShortcutBadge } from "./ShortcutBadge";
import { useAdminShortcuts, useAdminSeedShortcuts, useAdminToggleLock, useAdminUpdateShortcut } from "../hooks/useShortcuts";

const CATEGORY_LABELS: Record<string, string> = {
  COMMON: "Common", NAVIGATION: "Navigation", QUICK_ACTIONS: "Quick Actions",
  BILLING_WINDOW: "Billing Window", TOOLS: "Tools", SYSTEM: "System", CUSTOM: "Custom",
};

export function ShortcutAdminPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const { data: shortcuts, isLoading } = useAdminShortcuts();
  const seed = useAdminSeedShortcuts();
  const toggleLock = useAdminToggleLock();
  const updateDef = useAdminUpdateShortcut?.();

  const filtered = shortcuts?.filter((s: any) => {
    const matchSearch = !search || s.label.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "ALL" || s.category === categoryFilter;
    return matchSearch && matchCat;
  }) ?? [];

  const categories = ["ALL", ...new Set(shortcuts?.map((s: any) => s.category) ?? [])].sort();

  return (
    <div style={{ padding: "24px 32px", maxWidth: 960 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Icon name="keyboard" size={22} />
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Keyboard Shortcuts</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>
            Manage default keys and lock/unlock user customization.
          </p>
        </div>
        <button
          onClick={() => seed.mutate()}
          disabled={seed.isPending}
          style={{
            marginLeft: "auto", padding: "8px 16px",
            background: "var(--color-primary, #0ea5e9)", color: "white",
            border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 500,
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <Icon name="refresh-cw" size={14} />
          {seed.isPending ? "Seeding…" : "Seed Defaults"}
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Icon name="search" size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <input
            type="text" placeholder="Search shortcuts…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "8px 12px 8px 32px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <select
          value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, cursor: "pointer" }}
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c === "ALL" ? "All Categories" : (CATEGORY_LABELS[c] ?? c)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
        {/* Header row */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 120px 140px 80px 100px",
          padding: "10px 16px", background: "#f9fafb",
          borderBottom: "1px solid #e5e7eb", fontSize: 11,
          fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "#9ca3af",
        }}>
          <span>Shortcut</span>
          <span>Category</span>
          <span>Default Key</span>
          <span>Overrides</span>
          <span>Locked</span>
        </div>

        {isLoading ? (
          <div style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>No shortcuts found.</div>
        ) : (
          filtered.map((s: any) => (
            <div
              key={s.id}
              style={{
                display: "grid", gridTemplateColumns: "1fr 120px 140px 80px 100px",
                padding: "12px 16px", borderBottom: "1px solid #f3f4f6", alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{s.label}</div>
                {s.description && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{s.description}</div>}
              </div>
              <span style={{
                fontSize: 11, padding: "2px 7px", borderRadius: 12,
                background: "#f3f4f6", color: "#6b7280", width: "fit-content",
              }}>
                {CATEGORY_LABELS[s.category] ?? s.category}
              </span>
              <ShortcutBadge keyString={s.defaultKey} />
              <span style={{ fontSize: 13, color: "#6b7280" }}>
                {s._count?.userOverrides ?? 0} users
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {s.isSystem ? (
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>System</span>
                ) : (
                  <button
                    onClick={() => toggleLock.mutate({ id: s.id, lock: !s.isLocked })}
                    disabled={toggleLock.isPending}
                    title={s.isLocked ? "Unlock (allow users to change)" : "Lock (prevent user changes)"}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12,
                      border: s.isLocked ? "1px solid #fca5a5" : "1px solid #d1d5db",
                      background: s.isLocked ? "#fef2f2" : "white",
                      color: s.isLocked ? "#ef4444" : "#6b7280",
                    }}
                  >
                    <Icon name={s.isLocked ? "lock" : "unlock"} size={11} />
                    {s.isLocked ? "Locked" : "Lock"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 12 }}>
        🔒 Locked = users cannot customize this shortcut. System shortcuts are always locked.
      </p>
    </div>
  );
}
