"use client";

import { useMemo, useCallback, useState } from "react";

import toast from "react-hot-toast";

import { TableFull, Button, Icon, Switch, SelectInput } from "@/components/ui";

import { useConfirmDialog } from "@/components/common/useConfirmDialog";

import { useMaskingPolicies } from "../hooks/useDataMasking";

import type { CreateMaskingPolicyData, MaskingPolicy } from "../types/table-config.types";

// ── Column definitions ──────────────────────────────────

const POLICY_COLUMNS = [
  { id: "tableKey", label: "Table", visible: true },
  { id: "columnId", label: "Column", visible: true },
  { id: "roleName", label: "Role", visible: true },
  { id: "maskType", label: "Mask Type", visible: true },
  { id: "canUnmask", label: "Unmask Mode", visible: true },
  { id: "isActive", label: "Active", visible: true },
];

// ── Table keys ──────────────────────────────────────────

const TABLE_KEYS = [
  { label: "Contacts", value: "contacts" },
  { label: "Organizations", value: "organizations" },
  { label: "Leads", value: "leads" },
  { label: "Activities", value: "activities" },
  { label: "Raw Contacts", value: "raw-contacts" },
  { label: "Users", value: "users" },
];

const MASKABLE_COLUMNS: Record<string, string[]> = {
  contacts: ["email", "phone"],
  organizations: ["phone", "website"],
  leads: [],
  activities: [],
  "raw-contacts": ["email", "phone"],
  users: ["email", "phone"],
};

// ── Mask type labels ────────────────────────────────────

const MASK_TYPE_LABELS: Record<string, string> = {
  FULL: "Full (****)",
  PARTIAL: "Partial (j***n@...)",
  NONE: "No Mask",
};

// ── Helpers ─────────────────────────────────────────────

function flattenPolicies(policies: MaskingPolicy[]): Record<string, unknown>[] {
  return policies.map((p) => ({
    id: p.id,
    tableKey: p.tableKey,
    columnId: p.columnId,
    roleName: p.role?.displayName ?? "All Roles",
    maskType: MASK_TYPE_LABELS[p.maskType] ?? p.maskType,
    canUnmask: p.canUnmask ? "With Unmask Button" : "Without Unmask Button",
    isActive: p.isActive ? "Active" : "Inactive",
  }));
}

// ── Component ───────────────────────────────────────────

export function MaskingPolicyManager() {
  const { policies, isLoading, createPolicy, updatePolicy, deletePolicy } = useMaskingPolicies();
  const { confirm, ConfirmDialogPortal } = useConfirmDialog();

  const [showCreate, setShowCreate] = useState(false);
  const [newPolicy, setNewPolicy] = useState<Partial<CreateMaskingPolicyData>>({
    tableKey: "contacts",
    columnId: "email",
    maskType: "PARTIAL",
    canUnmask: true,
  });

  const tableData = useMemo(() => flattenPolicies(policies), [policies]);

  const handleCreate = useCallback(async () => {
    if (!newPolicy.tableKey || !newPolicy.columnId || !newPolicy.maskType) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      await createPolicy(newPolicy as CreateMaskingPolicyData);
      toast.success("Masking policy created");
      setShowCreate(false);
      setNewPolicy({ tableKey: "contacts", columnId: "email", maskType: "PARTIAL", canUnmask: true });
    } catch {
      toast.error("Failed to create masking policy");
    }
  }, [newPolicy, createPolicy]);

  const handleDelete = useCallback(
    async (row: Record<string, unknown>) => {
      const ok = await confirm({
        title: "Delete Masking Policy",
        message: `Delete masking policy for ${row.tableKey}.${row.columnId}?`,
        type: "danger",
        confirmText: "Delete",
      });
      if (!ok) return;
      try {
        await deletePolicy(row.id as string);
        toast.success("Masking policy deleted");
      } catch {
        toast.error("Failed to delete policy");
      }
    },
    [confirm, deletePolicy],
  );

  const availableColumns = MASKABLE_COLUMNS[newPolicy.tableKey ?? "contacts"] ?? [];

  return (
    <div className="h-full flex flex-col">
      {/* Create form */}
      {showCreate && (
        <div className="p-4 border-b bg-gray-50 space-y-3">
          <h4 className="text-sm font-medium">New Masking Policy</h4>
          <div className="flex flex-wrap gap-3">
            <div style={{ minWidth: 160 }}>
              <SelectInput
                label="Table"
                value={newPolicy.tableKey}
                onChange={(v) =>
                  setNewPolicy((prev) => ({
                    ...prev,
                    tableKey: String(v ?? "contacts"),
                    columnId: MASKABLE_COLUMNS[String(v ?? "contacts")]?.[0] ?? "",
                  }))
                }
                options={TABLE_KEYS.map((t) => ({ value: t.value, label: t.label }))}
              />
            </div>

            <div style={{ minWidth: 140 }}>
              <SelectInput
                label="Column"
                value={newPolicy.columnId}
                onChange={(v) => setNewPolicy((prev) => ({ ...prev, columnId: String(v ?? "") }))}
                options={availableColumns.map((col) => ({ value: col, label: col }))}
              />
            </div>

            <div style={{ minWidth: 220 }}>
              <SelectInput
                label="Mask Type"
                value={newPolicy.maskType}
                onChange={(v) => setNewPolicy((prev) => ({ ...prev, maskType: (v as any) ?? "PARTIAL" }))}
                options={[
                  { value: "FULL", label: "Full Mask (****)" },
                  { value: "PARTIAL", label: "Partial Mask (start + end visible)" },
                  { value: "NONE", label: "No Mask" },
                ]}
              />
            </div>
          </div>

          {/* Unmask mode — two clear options */}
          {newPolicy.maskType !== "NONE" && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Unmask Mode</p>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer border rounded px-3 py-2 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-300">
                  <input
                    type="radio"
                    name="unmaskMode"
                    checked={newPolicy.canUnmask === true}
                    onChange={() => setNewPolicy((prev) => ({ ...prev, canUnmask: true }))}
                    className="text-blue-600"
                  />
                  <div>
                    <span className="font-medium">With Unmask Button</span>
                    <p className="text-xs text-gray-500">User can click to reveal the full value</p>
                  </div>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer border rounded px-3 py-2 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-300">
                  <input
                    type="radio"
                    name="unmaskMode"
                    checked={newPolicy.canUnmask === false}
                    onChange={() => setNewPolicy((prev) => ({ ...prev, canUnmask: false }))}
                    className="text-blue-600"
                  />
                  <div>
                    <span className="font-medium">Without Unmask Button</span>
                    <p className="text-xs text-gray-500">Value stays masked, no reveal option</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Mask type preview */}
          {newPolicy.maskType && newPolicy.maskType !== "NONE" && (
            <div className="text-xs text-gray-500 bg-white border rounded px-3 py-2">
              <span className="font-medium text-gray-700">Preview: </span>
              {newPolicy.maskType === "FULL" && "john@gmail.com → ****"}
              {newPolicy.maskType === "PARTIAL" && newPolicy.columnId === "email" && "john@gmail.com → j***n@gmail.com"}
              {newPolicy.maskType === "PARTIAL" && newPolicy.columnId === "phone" && "9876543210 → 98****3210"}
              {newPolicy.maskType === "PARTIAL" && newPolicy.columnId === "website" && "www.example.com → ww****om"}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleCreate}>
              Create Policy
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 min-h-0">
        <TableFull
          data={tableData as Record<string, any>[]}
          title="Data Masking Policies"
          columns={POLICY_COLUMNS}
          defaultViewMode="table"
          defaultDensity="compact"
          onCreate={() => setShowCreate(true)}
          onRowDelete={handleDelete}
        />
      </div>

      <ConfirmDialogPortal />
    </div>
  );
}
