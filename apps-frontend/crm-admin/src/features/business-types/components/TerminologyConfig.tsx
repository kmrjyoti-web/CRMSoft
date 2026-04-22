"use client";

import { useState, useMemo } from "react";

import toast from "react-hot-toast";

import { Button, Card, Input, Icon, Modal } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import {
  useResolvedTerminology,
  useTerminologyOverrides,
  useUpsertTerminology,
  useDeleteTerminology,
  useBulkUpsertTerminology,
} from "../hooks/useBusinessTypes";
import type { TerminologyOverride } from "../types/business-types.types";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TerminologyConfig() {
  const { data: resolvedData, isLoading: resolvedLoading } = useResolvedTerminology();
  const { data: overridesData, isLoading: overridesLoading } = useTerminologyOverrides();
  const upsertMut = useUpsertTerminology();
  const deleteMut = useDeleteTerminology();
  const bulkMut = useBulkUpsertTerminology();

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTermKey, setNewTermKey] = useState("");
  const [newCustomValue, setNewCustomValue] = useState("");

  // Parse data
  const resolved: Record<string, string> = useMemo(() => {
    const raw = resolvedData?.data ?? resolvedData ?? {};
    return typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, string>) : {};
  }, [resolvedData]);

  const overrides: TerminologyOverride[] = useMemo(() => {
    const raw = overridesData?.data ?? overridesData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [overridesData]);

  // Build merged table rows
  const rows = useMemo(() => {
    const overrideMap = new Map(overrides.map((o) => [o.termKey, o]));
    const entries: { termKey: string; defaultValue: string; customValue: string; hasOverride: boolean }[] = [];

    for (const [key, value] of Object.entries(resolved)) {
      const override = overrideMap.get(key);
      entries.push({
        termKey: key,
        defaultValue: override?.defaultValue ?? value,
        customValue: override?.customValue ?? "",
        hasOverride: !!override,
      });
    }

    // Add overrides that might not be in resolved
    for (const o of overrides) {
      if (!resolved[o.termKey]) {
        entries.push({
          termKey: o.termKey,
          defaultValue: o.defaultValue,
          customValue: o.customValue,
          hasOverride: true,
        });
      }
    }

    return entries.sort((a, b) => a.termKey.localeCompare(b.termKey));
  }, [resolved, overrides]);

  // ── Handlers ────────────────────────────────────────────
  function handleStartEdit(termKey: string, currentCustom: string) {
    setEditingKey(termKey);
    setEditValue(currentCustom);
  }

  function handleSaveEdit() {
    if (!editingKey) return;
    upsertMut.mutate(
      { termKey: editingKey, customValue: editValue },
      {
        onSuccess: () => {
          toast.success("Terminology updated");
          setEditingKey(null);
          setEditValue("");
        },
        onError: () => toast.error("Failed to update terminology"),
      }
    );
  }

  function handleCancelEdit() {
    setEditingKey(null);
    setEditValue("");
  }

  function handleDelete(termKey: string) {
    if (!confirm(`Remove custom terminology for "${termKey}"?`)) return;
    deleteMut.mutate(termKey, {
      onSuccess: () => toast.success("Terminology override removed"),
      onError: () => toast.error("Failed to remove override"),
    });
  }

  function handleAddNew() {
    if (!newTermKey.trim()) {
      toast.error("Enter a term key");
      return;
    }
    upsertMut.mutate(
      { termKey: newTermKey.trim(), customValue: newCustomValue.trim() },
      {
        onSuccess: () => {
          toast.success("Terminology override added");
          setShowAddModal(false);
          setNewTermKey("");
          setNewCustomValue("");
        },
        onError: () => toast.error("Failed to add override"),
      }
    );
  }

  function handleResetAll() {
    if (!confirm("Reset all terminology to defaults? This will remove all custom overrides.")) return;
    bulkMut.mutate(
      { overrides: [] },
      {
        onSuccess: () => toast.success("All terminology reset to defaults"),
        onError: () => toast.error("Failed to reset terminology"),
      }
    );
  }

  // ── Loading ─────────────────────────────────────────────
  if (resolvedLoading || overridesLoading) {
    return (
      <div style={{ padding: "24px", display: "flex", justifyContent: "center" }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>Custom Terminology</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="outline" onClick={handleResetAll} disabled={bulkMut.isPending}>
            <Icon name="rotate-ccw" size={16} /> Reset All
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Icon name="plus" size={16} /> Add Override
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Term Key</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Default Value</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Custom Value</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, width: "160px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: "24px 16px", textAlign: "center", color: "#6b7280" }}>
                    No terminology entries found
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.termKey} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 500, fontFamily: "monospace", fontSize: "13px" }}>
                    {row.termKey}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#6b7280" }}>{row.defaultValue}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {editingKey === row.termKey ? (
                      <Input
                        value={editValue}
                        onChange={(v: string) => setEditValue(v)}
                        label=""
                      />
                    ) : (
                      <span style={{ color: row.customValue ? "#111827" : "#9ca3af" }}>
                        {row.customValue || "\u2014"}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {editingKey === row.termKey ? (
                      <div style={{ display: "flex", gap: "4px" }}>
                        <Button variant="primary" onClick={handleSaveEdit} disabled={upsertMut.isPending}>
                          <Icon name="check" size={14} />
                        </Button>
                        <Button variant="ghost" onClick={handleCancelEdit}>
                          <Icon name="x" size={14} />
                        </Button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "4px" }}>
                        <Button
                          variant="ghost"
                          onClick={() => handleStartEdit(row.termKey, row.customValue)}
                        >
                          <Icon name="pencil" size={14} />
                        </Button>
                        {row.hasOverride && (
                          <Button
                            variant="ghost"
                            onClick={() => handleDelete(row.termKey)}
                            disabled={deleteMut.isPending}
                          >
                            <Icon name="trash-2" size={14} />
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Override Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Terminology Override"
      >
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <Input
            label="Term Key"
            leftIcon={<Icon name="key" size={16} />}
            value={newTermKey}
            onChange={(v: string) => setNewTermKey(v)}
          />
          <Input
            label="Custom Value"
            leftIcon={<Icon name="type" size={16} />}
            value={newCustomValue}
            onChange={(v: string) => setNewCustomValue(v)}
          />
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddNew} disabled={upsertMut.isPending}>
              {upsertMut.isPending ? <LoadingSpinner /> : "Add"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
