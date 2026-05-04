"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import toast from "react-hot-toast";
import { GLOBAL_UI_DEFAULTS, readGlobalUISettings } from "@/hooks/useGlobalUISettings";
import type { GlobalUISettings } from "@/hooks/useGlobalUISettings";

const LS_KEY = "crm_global_ui_settings";

function saveSettings(next: GlobalUISettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("globalUISettingsChanged", { detail: next }));
}

// ── Inline Toggle Button ─────────────────────────────────────────────────────

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        width: 44,
        height: 24,
        borderRadius: 12,
        background: checked ? "var(--color-primary, #2563eb)" : "#d1d5db",
        border: "none",
        cursor: "pointer",
        padding: 2,
        transition: "background 0.2s",
        outline: "none",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          display: "block",
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          transform: checked ? "translateX(20px)" : "translateX(0)",
          transition: "transform 0.2s",
        }}
      />
    </button>
  );
}

// ── Section heading row ──────────────────────────────────────────────────────

function SectionHeading({ icon, label }: { icon: string; label: string }) {
  return (
    <tr style={{ background: "#f9fafb" }}>
      <td colSpan={4} style={{ padding: "10px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <Icon name={icon as any} size={14} />
          {label}
        </div>
      </td>
    </tr>
  );
}

// ── Setting row ──────────────────────────────────────────────────────────────

function SettingRow({
  sn, icon, label, description, value, onChange,
}: {
  sn: number | string;
  icon: string;
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
      <td style={{ padding: "10px 16px", fontSize: 13, color: "#9ca3af", width: 50 }}>{sn}</td>
      <td style={{ padding: "10px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#6b7280" }}><Icon name={icon as any} size={15} /></span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{label}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{description}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: "10px 16px", width: 100 }}>
        <ToggleSwitch checked={value} onChange={onChange} />
      </td>
      <td style={{ padding: "10px 16px", width: 80, fontSize: 11, color: value ? "#16a34a" : "#9ca3af" }}>
        {value ? "Visible" : "Hidden"}
      </td>
    </tr>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function GlobalUISettings() {
  const [cfg, setCfg] = useState<GlobalUISettings>(readGlobalUISettings);

  const toggle = (key: keyof GlobalUISettings) => {
    const next = { ...cfg, [key]: !cfg[key] };
    setCfg(next);
    saveSettings(next);
    toast.success("Saved — takes effect immediately");
  };

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      {/* Info banner */}
      <div style={{
        margin: "12px 16px 0",
        padding: "10px 14px",
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        borderRadius: 8,
        fontSize: 12,
        color: "#1d4ed8",
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
      }}>
        <span style={{ marginTop: 1, flexShrink: 0 }}><Icon name="info" size={14} /></span>
        <span>
          Settings are stored in your browser and apply to your session only.
          Changes take effect immediately — no page reload required.
        </span>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }}>
            <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", width: 50 }}>SN</th>
            <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Setting</th>
            <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", width: 100 }}>Toggle</th>
            <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", width: 80 }}>Status</th>
          </tr>
        </thead>
        <tbody>

          {/* ── Table Layout section ── */}
          <SectionHeading icon="layout" label="Table Layout" />
          <SettingRow
            sn={1}
            icon="panel-left"
            label="Show Sidebar Filter by Default"
            description="Filter panel is open when any list/data page first loads"
            value={cfg.tableSidebarFilterDefault}
            onChange={() => toggle("tableSidebarFilterDefault")}
          />

          {/* ── View Modes section ── */}
          <SectionHeading icon="monitor" label="View Modes" />
          <SettingRow
            sn={2}
            icon="table"
            label="Table View"
            description="Classic spreadsheet-style row/column table"
            value={cfg.viewModeTable}
            onChange={() => toggle("viewModeTable")}
          />
          <SettingRow
            sn={3}
            icon="list"
            label="List View"
            description="Compact vertical list with key fields per item"
            value={cfg.viewModeList}
            onChange={() => toggle("viewModeList")}
          />
          <SettingRow
            sn={4}
            icon="layout-grid"
            label="Card View"
            description="Visual card grid — good for contacts and products"
            value={cfg.viewModeCard}
            onChange={() => toggle("viewModeCard")}
          />
          <SettingRow
            sn={5}
            icon="calendar"
            label="Calendar View"
            description="Date-based calendar layout for activities, follow-ups"
            value={cfg.viewModeCalendar}
            onChange={() => toggle("viewModeCalendar")}
          />
          <SettingRow
            sn={6}
            icon="map"
            label="Map View"
            description="Geographical map plot for location-based data"
            value={cfg.viewModeMap}
            onChange={() => toggle("viewModeMap")}
          />
          <SettingRow
            sn={7}
            icon="bar-chart-3"
            label="BI Dashboard"
            description="Business intelligence — pivot tables, KPI cards, charts"
            value={cfg.viewModeBi}
            onChange={() => toggle("viewModeBi")}
          />
          <SettingRow
            sn={8}
            icon="clock"
            label="Timeline View"
            description="Horizontal timeline / Gantt-style view"
            value={cfg.viewModeTimeline}
            onChange={() => toggle("viewModeTimeline")}
          />
          <SettingRow
            sn={9}
            icon="pie-chart"
            label="Chart View"
            description="Bar, line and pie charts from table data"
            value={cfg.viewModeChart}
            onChange={() => toggle("viewModeChart")}
          />
          <SettingRow
            sn={10}
            icon="network"
            label="Tree View"
            description="Hierarchical tree structure for nested data"
            value={cfg.viewModeTree}
            onChange={() => toggle("viewModeTree")}
          />
          <SettingRow
            sn={11}
            icon="kanban-square"
            label="Kanban View"
            description="Drag-and-drop kanban board grouped by status/field"
            value={cfg.viewModeKanban}
            onChange={() => toggle("viewModeKanban")}
          />

        </tbody>
      </table>
    </div>
  );
}
