"use client";

import { useState, useMemo, useCallback } from "react";

import { Button, Icon, SelectInput, Badge } from "@/components/ui";

import { useTargets, useDeleteTarget } from "../hooks/usePerformance";
import type { Target } from "../types/performance.types";

import { TargetForm } from "./TargetForm";

// ── Component ───────────────────────────────────────────

export function TargetList() {
  const [scopeFilter, setScopeFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<Target | undefined>(undefined);

  const params = useMemo(
    () => (scopeFilter ? { scope: scopeFilter } : undefined),
    [scopeFilter],
  );

  const { data, isLoading } = useTargets(params);
  const deleteMutation = useDeleteTarget();

  const targets = useMemo(() => {
    const raw = data?.data;
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const handleDelete = useCallback(
    (id: string) => {
      if (window.confirm("Delete this target?")) {
        deleteMutation.mutate(id);
      }
    },
    [deleteMutation],
  );

  const handleEdit = useCallback((target: Target) => {
    setEditingTarget(target);
    setFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditingTarget(undefined);
  }, []);

  const scopeOptions = [
    { label: "All Scopes", value: "" },
    { label: "Individual", value: "INDIVIDUAL" },
    { label: "Team", value: "TEAM" },
    { label: "Company", value: "COMPANY" },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Targets</h1>
        <Button
          variant="primary"
          onClick={() => {
            setEditingTarget(undefined);
            setFormOpen(true);
          }}
        >
          <Icon name="plus" size={16} />
          <span style={{ marginLeft: 4 }}>New Target</span>
        </Button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 200 }}>
          <SelectInput
            label="Scope"
            options={scopeOptions}
            value={scopeFilter}
            onChange={(val: string | number | boolean | null) =>
              setScopeFilter(String(val ?? ""))
            }
            leftIcon={<Icon name="users" size={16} />}
          />
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e5e7eb",
          overflowX: "auto",
        }}
      >
        {isLoading ? (
          <div style={{ textAlign: "center", padding: 48, color: "#9ca3af" }}>
            Loading targets...
          </div>
        ) : targets.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48, color: "#9ca3af" }}>
            <Icon name="target" size={40} />
            <p style={{ marginTop: 12, fontSize: 14 }}>No targets defined yet.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
                <th style={{ padding: "8px 12px", fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
                  Name
                </th>
                <th style={{ padding: "8px 12px", fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
                  Metric
                </th>
                <th style={{ padding: "8px 12px", fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
                  Period
                </th>
                <th style={{ padding: "8px 12px", fontSize: 12, color: "#6b7280", fontWeight: 600, textAlign: "right" }}>
                  Target
                </th>
                <th style={{ padding: "8px 12px", fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
                  Scope
                </th>
                <th style={{ padding: "8px 12px", fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
                  Assigned To
                </th>
                <th style={{ padding: "8px 12px", fontSize: 12, color: "#6b7280", fontWeight: 600, textAlign: "center" }}>
                  Active
                </th>
                <th style={{ padding: "8px 12px", fontSize: 12, color: "#6b7280", fontWeight: 600, textAlign: "center" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {targets.map((target) => (
                <tr key={target.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: 500 }}>
                    {target.name}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 13, color: "#6b7280" }}>
                    {target.metric.replace(/_/g, " ")}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 13, color: "#6b7280" }}>
                    {target.period}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontSize: 14, fontWeight: 500 }}>
                    {target.targetValue.toLocaleString()} {target.unit}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <Badge variant="outline">{target.scope}</Badge>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 13, color: "#6b7280" }}>
                    {target.userName ?? target.teamName ?? "--"}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <Badge variant={target.isActive ? "success" : "secondary"}>
                      {target.isActive ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(target)}
                      >
                        <Icon name="pencil" size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(target.id)}
                      >
                        <Icon name="trash-2" size={14} style={{ color: "#ef4444" }} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Target Form Modal */}
      <TargetForm
        open={formOpen}
        onClose={handleCloseForm}
        target={editingTarget}
      />
    </div>
  );
}
