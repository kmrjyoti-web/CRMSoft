"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Icon, Button, Switch } from "@/components/ui";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { pujaService } from "../services/puja.service";
import { PujaOverlay } from "./PujaOverlay";
import { PUJA_ITEMS_META } from "../types/puja.types";
import type { ReligiousModeConfig, ReligionCode, ReligionPreset } from "../types/puja.types";
import { rolesService } from "@/features/settings/services/roles.service";
import type { RoleListItem } from "@/features/settings/types/settings.types";

const RELIGION_OPTIONS: { code: ReligionCode; label: string; emoji: string }[] = [
  { code: "HINDU", label: "Hindu", emoji: "🕉️" },
  { code: "SIKH", label: "Sikh", emoji: "☬" },
  { code: "JAIN", label: "Jain", emoji: "🙏" },
  { code: "BUDDHIST", label: "Buddhist", emoji: "☸️" },
  { code: "MUSLIM", label: "Muslim", emoji: "🌙" },
  { code: "CHRISTIAN", label: "Christian", emoji: "✝️" },
  { code: "UNIVERSAL", label: "Universal", emoji: "🌍" },
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, h) => [
  `${String(h).padStart(2, "0")}:00`,
  `${String(h).padStart(2, "0")}:30`,
]).flat();

export function ReligiousModeSettings() {
  const [config, setConfig] = useState<ReligiousModeConfig | null>(null);
  const [presets, setPresets] = useState<Record<string, ReligionPreset>>({});
  const [analytics, setAnalytics] = useState<any>(null);
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    Promise.all([
      pujaService.getConfig(),
      pujaService.getPresets(),
      pujaService.getAnalytics(),
      rolesService.getAll(),
    ]).then(([cfg, prs, anl, rolesResp]) => {
      setConfig(cfg);
      setPresets(prs as any);
      setAnalytics(anl);
      setRoles((rolesResp as any)?.data ?? []);
    }).catch(() => toast.error("Failed to load religious mode settings"));
  }, []);

  const patch = (changes: Partial<ReligiousModeConfig>) => {
    if (!config) return;
    setConfig((prev) => prev ? { ...prev, ...changes } : prev);
  };

  const handleReligionChange = (religion: ReligionCode) => {
    if (!config) return;
    const preset = presets[religion];
    const firstDeity = preset?.deities?.[0];
    setConfig((prev) => prev ? {
      ...prev,
      religion,
      deity: firstDeity?.code ?? "",
      pujaItems: preset?.pujaItems ?? prev.pujaItems,
      greeting: {
        primary: firstDeity?.greeting ?? prev.greeting.primary,
        secondary: prev.greeting.secondary,
      },
    } : prev);
  };

  const handleDeityChange = (deityCode: string) => {
    if (!config) return;
    const preset = presets[config.religion];
    const deity = preset?.deities?.find((d) => d.code === deityCode);
    setConfig((prev) => prev ? {
      ...prev,
      deity: deityCode,
      greeting: { ...prev.greeting, primary: deity?.greeting ?? prev.greeting.primary },
    } : prev);
  };

  const togglePujaItem = (code: string) => {
    if (!config) return;
    const items = config.pujaItems.includes(code)
      ? config.pujaItems.filter((i) => i !== code)
      : [...config.pujaItems, code];
    patch({ pujaItems: items });
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const saved = await pujaService.updateConfig(config);
      setConfig(saved);
      toast.success("Religious mode settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (!config) return <LoadingSpinner fullPage />;

  const currentPreset = presets[config.religion];
  const currentDeities = currentPreset?.deities ?? [];
  const allPujaItems = currentPreset?.pujaItems ?? config.pujaItems;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader
        title="Religious / Spiritual Mode"
        subtitle="Show a devotional puja screen when team members open the app during office hours."
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              variant="outline"
              onClick={() => setPreview(true)}
            >
              <Icon name="eye" size={14} />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        }
      />

      {/* Master toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: config.enabled ? "#fffbeb" : "#f9fafb",
          border: `1.5px solid ${config.enabled ? "#fcd34d" : "#e5e7eb"}`,
          borderRadius: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <p style={{ fontWeight: 600, fontSize: 15, color: config.enabled ? "#92400e" : "#374151" }}>
            {config.enabled ? "🙏 Religious Mode is ON" : "Religious Mode"}
          </p>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
            {config.enabled
              ? "Team members will see the puja screen on app open."
              : "Enable to show puja overlay during office hours."}
          </p>
        </div>
        <Switch
          checked={config.enabled}
          onChange={async (v) => {
            patch({ enabled: v });
            try {
              await pujaService.updateConfig({ ...config, enabled: v });
              toast.success(v ? "Religious mode enabled" : "Religious mode disabled");
            } catch {
              patch({ enabled: !v }); // revert on failure
              toast.error("Failed to update");
            }
          }}
        />
      </div>

      {/* Always show full form — enabled toggle controls activation only */}
      <>
          {/* Religion selection */}
          <Section title="Religion">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {RELIGION_OPTIONS.map((r) => (
                <button
                  key={r.code}
                  onClick={() => handleReligionChange(r.code)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 20,
                    border: config.religion === r.code
                      ? "2px solid #f59e0b"
                      : "1.5px solid #e5e7eb",
                    background: config.religion === r.code ? "#fffbeb" : "#fff",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: config.religion === r.code ? 600 : 400,
                    color: config.religion === r.code ? "#92400e" : "#374151",
                  }}
                >
                  {r.emoji} {r.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Deity selection */}
          {currentDeities.length > 0 && (
            <Section title="Deity">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {currentDeities.map((d) => (
                  <button
                    key={d.code}
                    onClick={() => handleDeityChange(d.code)}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 12,
                      border: config.deity === d.code
                        ? "2px solid #f59e0b"
                        : "1.5px solid #e5e7eb",
                      background: config.deity === d.code
                        ? "linear-gradient(135deg, #fffbeb, #fef3c7)"
                        : "#fff",
                      cursor: "pointer",
                      textAlign: "center",
                      minWidth: 90,
                    }}
                  >
                    <div style={{ fontSize: 22 }}>{d.emoji}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginTop: 4 }}>
                      {d.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{d.nameHi}</div>
                  </button>
                ))}
              </div>
            </Section>
          )}

          {/* Office hours */}
          <Section title="Office Hours (IST)">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label style={{ fontSize: 13, color: "#6b7280" }}>From</label>
              <select
                value={config.officeHours.from}
                onChange={(e) => patch({ officeHours: { ...config.officeHours, from: e.target.value } })}
                style={selectStyle}
              >
                {TIME_OPTIONS.map((t) => <option key={t}>{t}</option>)}
              </select>
              <label style={{ fontSize: 13, color: "#6b7280" }}>To</label>
              <select
                value={config.officeHours.to}
                onChange={(e) => patch({ officeHours: { ...config.officeHours, to: e.target.value } })}
                style={selectStyle}
              >
                {TIME_OPTIONS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </Section>

          {/* Greeting text */}
          <Section title="Greeting">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={labelStyle}>Primary (mantra)</label>
                <input
                  value={config.greeting.primary}
                  onChange={(e) => patch({ greeting: { ...config.greeting, primary: e.target.value } })}
                  style={inputStyle}
                  placeholder="ॐ श्री गणेशाय नमः"
                />
              </div>
              <div>
                <label style={labelStyle}>Secondary</label>
                <input
                  value={config.greeting.secondary}
                  onChange={(e) => patch({ greeting: { ...config.greeting, secondary: e.target.value } })}
                  style={inputStyle}
                  placeholder="शुभ प्रभात! 🙏"
                />
              </div>
            </div>
          </Section>

          {/* Puja items */}
          <Section title="Puja Items">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {allPujaItems.map((code) => {
                const item = PUJA_ITEMS_META[code];
                if (!item) return null;
                const selected = config.pujaItems.includes(code);
                return (
                  <button
                    key={code}
                    onClick={() => togglePujaItem(code)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 10,
                      border: selected ? "2px solid #f59e0b" : "1.5px solid #e5e7eb",
                      background: selected ? "#fffbeb" : "#fff",
                      cursor: "pointer",
                      fontSize: 13,
                      color: selected ? "#92400e" : "#6b7280",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    {item.nameHi}
                    {selected && <span style={{ color: "#16a34a" }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Behaviour options */}
          <Section title="Behaviour">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <ToggleRow
                label="Sound effects"
                description="Play a gentle chime when puja items are offered"
                checked={config.soundEnabled}
                onChange={(v) => patch({ soundEnabled: v })}
              />
              <ToggleRow
                label="Show once per day"
                description="Only show the puja screen once per day per user"
                checked={config.showOncePerDay}
                onChange={(v) => patch({ showOncePerDay: v })}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>
                    Auto-close after (seconds)
                  </p>
                  <p style={{ fontSize: 12, color: "#9ca3af" }}>
                    0 = user must manually close
                  </p>
                </div>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={config.autoCloseAfterSeconds}
                  onChange={(e) => patch({ autoCloseAfterSeconds: Number(e.target.value) })}
                  style={{ ...inputStyle, width: 72, textAlign: "center" }}
                />
              </div>
            </div>
          </Section>

          {/* Show to */}
          <Section title="Show To">
            <div style={{ display: "flex", gap: 8 }}>
              {(["ALL_USERS", "ADMIN_ONLY", "SELECTED_ROLES"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => patch({ allowedFor: opt })}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 20,
                    border: config.allowedFor === opt
                      ? "2px solid #f59e0b"
                      : "1.5px solid #e5e7eb",
                    background: config.allowedFor === opt ? "#fffbeb" : "#fff",
                    cursor: "pointer",
                    fontSize: 13,
                    color: config.allowedFor === opt ? "#92400e" : "#374151",
                    fontWeight: config.allowedFor === opt ? 600 : 400,
                  }}
                >
                  {opt === "ALL_USERS" ? "All Users" : opt === "ADMIN_ONLY" ? "Admins Only" : "Selected Roles"}
                </button>
              ))}
            </div>
          </Section>

          {/* Role selector — visible only when SELECTED_ROLES */}
          {config.allowedFor === "SELECTED_ROLES" && (
            <Section title="Select Roles">
              {roles.length === 0 ? (
                <p style={{ fontSize: 13, color: "#9ca3af" }}>Loading roles…</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {roles.map((role) => {
                    const selected = config.allowedRoleIds.includes(role.id);
                    return (
                      <label
                        key={role.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: selected ? "1.5px solid #f59e0b" : "1.5px solid #e5e7eb",
                          background: selected ? "#fffbeb" : "#fff",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            const ids = selected
                              ? config.allowedRoleIds.filter((id) => id !== role.id)
                              : [...config.allowedRoleIds, role.id];
                            patch({ allowedRoleIds: ids });
                          }}
                          style={{ width: 16, height: 16, accentColor: "#f59e0b", cursor: "pointer" }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>
                            {role.displayName}
                          </p>
                          {role.description && (
                            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                              {role.description}
                            </p>
                          )}
                        </div>
                        {selected && (
                          <Icon name="check" size={14} />
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </Section>
          )}

          {/* Analytics */}
          {analytics && (
            <Section title="Team Engagement (Last 7 Days)">
              <div
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: "16px 20px",
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  <Stat label="Total Interactions" value={analytics.totalInteractions ?? 0} />
                  <Stat label="Users Today" value={analytics.uniqueUsersToday ?? 0} />
                  <Stat
                    label="Streak"
                    value={`${analytics.streakDays ?? 0} days`}
                  />
                </div>
                {analytics.topItems?.length > 0 && (
                  <div style={{ marginTop: 12, fontSize: 13, color: "#6b7280" }}>
                    <strong>Most offered:</strong>{" "}
                    {analytics.topItems.map((t: any) => {
                      const item = PUJA_ITEMS_META[t.item];
                      return item ? `${item.icon} ${item.nameHi} (${t.count})` : "";
                    }).filter(Boolean).join("  •  ")}
                  </div>
                )}
                {analytics.avgDurationSeconds > 0 && (
                  <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>
                    Avg. session: {analytics.avgDurationSeconds}s
                  </p>
                )}
              </div>
            </Section>
          )}
      </>

      {/* Preview overlay */}
      {preview && (
        <PujaOverlay config={config} onClose={() => setPreview(false)} />
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>{label}</p>
        <p style={{ fontSize: 12, color: "#9ca3af" }}>{description}</p>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#1f2937" }}>{value}</div>
      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────

const selectStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "1.5px solid #e5e7eb",
  fontSize: 13,
  background: "#fff",
  cursor: "pointer",
  outline: "none",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: 8,
  border: "1.5px solid #e5e7eb",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  background: "#fff",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 500,
  color: "#6b7280",
  marginBottom: 4,
};
