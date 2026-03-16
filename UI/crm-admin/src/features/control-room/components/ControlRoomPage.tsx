"use client";

import { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";

import { Icon, Switch, SelectInput, Input, NumberInput } from "@/components/ui";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { useContentPanel } from "@/hooks/useEntityPanel";
import { controlRoomCache } from "@/lib/control-room-cache";

import { Button } from "@/components/ui";
import {
  useControlRoomRules, useControlRoomAudit,
  useSaveControlRoomDraft, usePendingDrafts, useDiscardDraft, useDiscardAllDrafts, useApplyAllDrafts,
} from "../hooks/useControlRoom";
import type { ControlRoomRule, ControlRoomAuditEntry } from "../types/control-room.types";

// ── Category sidebar config ─────────────────────────────

const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  GENERAL:     { label: "General",       icon: "settings" },
  SALE:        { label: "Sale",          icon: "shopping-cart" },
  PURCHASE:    { label: "Purchase",      icon: "truck" },
  ACCOUNTING:  { label: "Accounting",    icon: "calculator" },
  INVENTORY:   { label: "Inventory",     icon: "package" },
  TAXATION:    { label: "Taxation",      icon: "percent" },
  TRANSACTION: { label: "Transaction",   icon: "repeat" },
  MASTER:      { label: "Master",        icon: "database" },
  EMAIL_SMS:   { label: "Email / SMS",   icon: "mail" },
  INTEGRATION: { label: "Integration",   icon: "link" },
  WORKFLOW:    { label: "Workflow",       icon: "git-branch" },
  ADDITIONAL:  { label: "Additional",    icon: "plus-circle" },
};

// ── Parse JSON value safely ─────────────────────────────

function parseValue(val: string | null | undefined): unknown {
  if (val === null || val === undefined) return null;
  try { return JSON.parse(val); } catch { return val; }
}

// ── Audit Trail Panel ───────────────────────────────────

function AuditTrailContent({ ruleCode, label }: { ruleCode: string; label: string }) {
  const { data, isLoading } = useControlRoomAudit(ruleCode);

  const entries: ControlRoomAuditEntry[] = useMemo(() => {
    if (!data) return [];
    const raw = data as any;
    if (Array.isArray(raw)) return raw;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    return [];
  }, [data]);

  if (isLoading) return <PageSkeleton variant="table" />;

  if (entries.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>
        <Icon name="clock" size={32} />
        <p style={{ marginTop: 8 }}>No changes recorded for this rule.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: "#374151" }}>
        Audit Trail: {label}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {entries.map((e) => (
          <div key={e.id} style={{ padding: 12, background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280" }}>
              <span>{e.changedByUserName}</span>
              <span>{new Date(e.createdAt).toLocaleString()}</span>
            </div>
            <div style={{ marginTop: 6, fontSize: 13 }}>
              <span style={{ color: "#ef4444", textDecoration: "line-through" }}>
                {e.previousValue ? String(parseValue(e.previousValue)) : "(default)"}
              </span>
              <span style={{ margin: "0 8px", color: "#9ca3af" }}>&rarr;</span>
              <span style={{ color: "#16a34a", fontWeight: 500 }}>
                {String(parseValue(e.newValue))}
              </span>
            </div>
            {e.changeReason && (
              <div style={{ marginTop: 4, fontSize: 11, color: "#6b7280", fontStyle: "italic" }}>
                Reason: {e.changeReason}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Rule Value Editor ───────────────────────────────────

function RuleValueEditor({
  rule,
  onUpdate,
  updating,
}: {
  rule: ControlRoomRule;
  onUpdate: (value: unknown) => void;
  updating: boolean;
}) {
  const val = parseValue(rule.effectiveValue);

  if (rule.valueType === "BOOLEAN") {
    return (
      <Switch
        checked={val === true || val === "true"}
        onChange={() => onUpdate(!(val === true || val === "true"))}
        disabled={updating}
      />
    );
  }

  if (rule.valueType === "SELECT" && rule.selectOptions && rule.selectOptions.length > 0) {
    return (
      <div style={{ minWidth: 180 }}>
        <SelectInput
          options={rule.selectOptions}
          value={val != null ? String(val) : ""}
          onChange={(v) => onUpdate(v)}
          disabled={updating}
        />
      </div>
    );
  }

  if (rule.valueType === "NUMBER") {
    return (
      <div style={{ width: 130 }}>
        <NumberInput
          value={val != null ? Number(val) : null}
          onChange={(v) => onUpdate(v)}
          min={rule.minValue ?? undefined}
          max={rule.maxValue ?? undefined}
          disabled={updating}
        />
      </div>
    );
  }

  // STRING / fallback
  return (
    <div style={{ minWidth: 200 }}>
      <Input
        value={val != null ? String(val) : ""}
        onChange={(v: string) => onUpdate(v)}
        disabled={updating}
      />
    </div>
  );
}

// ── Main Component ──────────────────────────────────────

export function ControlRoomPage() {
  const { data, isLoading } = useControlRoomRules();
  const saveDraftMutation = useSaveControlRoomDraft();
  const { data: draftsData } = usePendingDrafts();
  const discardDraftMutation = useDiscardDraft();
  const discardAllMutation = useDiscardAllDrafts();
  const applyAllMutation = useApplyAllDrafts();
  const { openContent } = useContentPanel();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [updatingCode, setUpdatingCode] = useState<string | null>(null);
  const [applyReason, setApplyReason] = useState("");

  // Parse grouped response: Record<category, rule[]>
  const grouped = useMemo<Record<string, ControlRoomRule[]>>(() => {
    if (!data) return {};
    const raw = (data as any)?.data ?? data;
    if (typeof raw === "object" && !Array.isArray(raw)) return raw;
    return {};
  }, [data]);

  const categories = useMemo(() => Object.keys(grouped), [grouped]);

  // Default to first category
  const selectedCategory = activeCategory ?? categories[0] ?? null;

  const filteredRules = useMemo(() => {
    if (!selectedCategory || !grouped[selectedCategory]) return [];
    if (!search.trim()) return grouped[selectedCategory];
    const q = search.toLowerCase();
    return grouped[selectedCategory].filter(
      (r) => r.label.toLowerCase().includes(q) || r.ruleCode.toLowerCase().includes(q),
    );
  }, [grouped, selectedCategory, search]);

  // Drafts list
  const pendingDrafts = useMemo(() => {
    if (!draftsData) return [];
    const raw = (draftsData as any)?.data ?? draftsData;
    return Array.isArray(raw) ? raw : [];
  }, [draftsData]);

  const handleUpdate = useCallback(
    async (rule: ControlRoomRule, newValue: unknown) => {
      setUpdatingCode(rule.ruleCode);
      try {
        await saveDraftMutation.mutateAsync({
          ruleCode: rule.ruleCode,
          data: { value: newValue, level: "CONTROL_ROOM" },
        });
        toast.success(`${rule.label} — draft saved`);
      } catch {
        toast.error(`Failed to save draft for ${rule.label}`);
      } finally {
        setUpdatingCode(null);
      }
    },
    [saveDraftMutation],
  );

  const handleApplyAll = useCallback(async () => {
    if (!applyReason.trim()) { toast.error("Please enter a reason for the changes"); return; }
    try {
      const result = await applyAllMutation.mutateAsync(applyReason);
      const count = (result as any)?.data?.appliedCount ?? pendingDrafts.length;
      // Reload cache immediately so this admin's cache version stays current
      // (prevents the sync hook from logging out the admin who just applied changes)
      try { await controlRoomCache.loadAllRules(); } catch { /* non-critical */ }
      toast.success(`${count} change${count !== 1 ? "s" : ""} applied. Other users will be prompted to log in again.`);
      setApplyReason("");
    } catch {
      toast.error("Failed to apply changes");
    }
  }, [applyAllMutation, applyReason, pendingDrafts.length]);

  const openAudit = useCallback(
    (rule: ControlRoomRule) => {
      openContent({
        id: `cr-audit-${rule.ruleCode}`,
        title: `History: ${rule.label}`,
        icon: "clock",
        width: 400,
        content: <AuditTrailContent ruleCode={rule.ruleCode} label={rule.label} />,
      });
    },
    [openContent],
  );

  if (isLoading) return <PageSkeleton variant="table" />;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb", overflow: "hidden" }}>
      {/* ── Sidebar + Content row ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      {/* ── Sidebar ── */}
      <div style={{ width: 240, minWidth: 240, borderRight: "1px solid #e5e7eb", background: "#fafbfc", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb", fontWeight: 600, fontSize: 14, color: "#374151", display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="sliders" size={18} />
          Control Room
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat] ?? { label: cat, icon: "folder" };
            const isActive = cat === selectedCategory;
            return (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setSearch(""); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%",
                  padding: "10px 12px", marginBottom: 2, borderRadius: 6, border: "none",
                  cursor: "pointer", fontSize: 13, fontWeight: isActive ? 600 : 400,
                  background: isActive ? "var(--color-primary-50, #eff6ff)" : "transparent",
                  color: isActive ? "var(--color-primary, #2563eb)" : "#4b5563",
                  transition: "all 0.15s",
                }}
              >
                <Icon name={meta.icon as any} size={16} />
                <span style={{ flex: 1, textAlign: "left" }}>{meta.label}</span>
                <span style={{ fontSize: 11, color: "#9ca3af", background: "#f3f4f6", borderRadius: 10, padding: "1px 7px" }}>
                  {grouped[cat]?.length ?? 0}
                </span>
              </button>
            );
          })}
        </div>
        {/* Footer warning */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #e5e7eb", background: "#fffbeb", fontSize: 11, color: "#92400e", display: "flex", alignItems: "flex-start", gap: 6 }}>
          <span style={{ marginTop: 1, flexShrink: 0 }}><Icon name="alert-triangle" size={14} /></span>
          <span>Changing any rule will log out all active users for this company.</span>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "12px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#111827", margin: 0 }}>
            {CATEGORY_META[selectedCategory ?? ""]?.label ?? selectedCategory} Settings
          </h2>
          <div style={{ flex: 1 }} />
          <div style={{ position: "relative", width: 240 }}>
            <span style={{ position: "absolute", left: 10, top: 9, color: "#9ca3af" }}><Icon name="search" size={14} /></span>
            <input
              type="text"
              placeholder="Search rules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "7px 10px 7px 32px", border: "1px solid #e5e7eb",
                borderRadius: 6, fontSize: 13, outline: "none", background: "#fafbfc",
              }}
            />
          </div>
        </div>

        {/* Rules Table */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filteredRules.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>
              <Icon name="search" size={32} />
              <p style={{ marginTop: 8 }}>No rules found.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }}>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", width: 50 }}>SN</th>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Particulars</th>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", width: 250 }}>Action</th>
                  <th style={{ padding: "10px 16px", textAlign: "center", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.map((rule, idx) => (
                  <tr key={rule.ruleCode} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#9ca3af" }}>{idx + 1}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{rule.label}</div>
                      {rule.description && (
                        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{rule.description}</div>
                      )}
                      {rule.effectiveLevel !== "DEFAULT" && (
                        <span style={{
                          display: "inline-block", marginTop: 3, fontSize: 10, padding: "1px 6px",
                          borderRadius: 4, background: "#dbeafe", color: "#1d4ed8",
                        }}>
                          Set at {rule.effectiveLevel}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <RuleValueEditor
                        rule={rule}
                        onUpdate={(val) => handleUpdate(rule, val)}
                        updating={updatingCode === rule.ruleCode}
                      />
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                        {rule.description && (
                          <button
                            title={rule.description}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, borderRadius: 4 }}
                          >
                            <Icon name="help-circle" size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => openAudit(rule)}
                          title="View change history"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, borderRadius: 4 }}
                        >
                          <Icon name="clock" size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      </div>{/* end sidebar+content row */}

      {/* ── Pending Changes Bar ── */}
      {pendingDrafts.length > 0 && (
        <div style={{
          background: "#fffbeb", borderTop: "2px solid #f59e0b",
          padding: "16px 20px", flexShrink: 0,
          boxShadow: "0 -4px 12px rgba(0,0,0,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Icon name="alert-triangle" size={16} className="text-amber-600" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>
              {pendingDrafts.length} change{pendingDrafts.length > 1 ? "s" : ""} pending
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12, maxHeight: 80, overflowY: "auto" }}>
            {pendingDrafts.map((d: any) => (
              <div key={d.id} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "4px 10px",
                background: "#fff", borderRadius: 6, border: "1px solid #fde68a", fontSize: 12,
              }}>
                <span style={{ fontWeight: 500, color: "#374151" }}>{d.rule?.label ?? d.ruleCode}</span>
                <span style={{ color: "#9ca3af" }}>&rarr;</span>
                <span style={{ color: "#059669", fontWeight: 500 }}>{d.newValue}</span>
                <button
                  onClick={() => discardDraftMutation.mutate(d.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 2, marginLeft: 4 }}
                  title="Remove"
                >
                  <Icon name="x" size={12} />
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="text"
              placeholder="Reason for changes (required)..."
              value={applyReason}
              onChange={(e) => setApplyReason(e.target.value)}
              style={{
                flex: 1, padding: "8px 12px", border: "1px solid #fde68a", borderRadius: 6,
                fontSize: 13, outline: "none", background: "#fff",
              }}
            />
            <Button variant="outline" onClick={() => discardAllMutation.mutate()} disabled={discardAllMutation.isPending}>
              Discard All
            </Button>
            <Button variant="primary" onClick={handleApplyAll} loading={applyAllMutation.isPending} disabled={!applyReason.trim()}>
              Apply All Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
