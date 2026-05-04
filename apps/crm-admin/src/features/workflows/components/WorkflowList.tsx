"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TableFull, Badge, Button, Icon } from "@/components/ui";
import { useWorkflowsList } from "../hooks/useWorkflows";
import type { WorkflowListItem } from "../types/workflows.types";

const WORKFLOW_COLUMNS = [
  { id: "name", label: "Name", visible: true },
  { id: "code", label: "Code", visible: true },
  { id: "entityType", label: "Entity Type", visible: true },
  { id: "states", label: "States", visible: true },
  { id: "transitions", label: "Transitions", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "isDefault", label: "Default", visible: true },
];

function flattenWorkflows(workflows: WorkflowListItem[]): Record<string, unknown>[] {
  return workflows.map((w) => ({
    id: w.id,
    name: <span style={{ fontWeight: 600 }}>{w.name}</span>,
    code: <Badge variant="outline">{w.code}</Badge>,
    entityType: <Badge variant="secondary">{w.entityType}</Badge>,
    states: <Badge variant="outline">{w._count?.states ?? 0}</Badge>,
    transitions: <Badge variant="outline">{w._count?.transitions ?? 0}</Badge>,
    status: w.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="default">Draft</Badge>,
    isDefault: w.isDefault ? <Badge variant="primary">Default</Badge> : "—",
    _rawName: w.name,
  }));
}

interface ViewModeDialogProps {
  workflowName: string;
  isCreate?: boolean;
  onClose: () => void;
  onSelect: (mode: "visual" | "form") => void;
}

function ViewModeDialog({ workflowName, isCreate, onClose, onSelect }: ViewModeDialogProps) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff", borderRadius: 16, padding: "28px 28px 24px",
          width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          display: "flex", flexDirection: "column", gap: 20,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
              {isCreate ? "Create Workflow" : "Open Workflow"}
            </div>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              {isCreate
                ? "Choose how you want to build the workflow"
                : <><strong style={{ color: "#1e293b" }}>{workflowName}</strong> — choose how to open it</>}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", padding: 4, borderRadius: 6, lineHeight: 1 }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Options */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {/* Visual Editor */}
          <button
            onClick={() => onSelect("visual")}
            style={{
              border: "2px solid #e2e8f0", borderRadius: 12, padding: "18px 14px",
              background: "#f8fafc", cursor: "pointer", textAlign: "left",
              transition: "all 0.15s ease", display: "flex", flexDirection: "column", gap: 10,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-primary)";
              (e.currentTarget as HTMLButtonElement).style.background = "#f0f9ff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
              (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc";
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #667eea, #764ba2)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
            }}>
              <Icon name="git-branch" size={20} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 3 }}>Visual Editor</div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>
                Drag &amp; drop flow canvas with states and transitions
              </div>
            </div>
          </button>

          {/* Form View */}
          <button
            onClick={() => onSelect("form")}
            style={{
              border: "2px solid #e2e8f0", borderRadius: 12, padding: "18px 14px",
              background: "#f8fafc", cursor: "pointer", textAlign: "left",
              transition: "all 0.15s ease", display: "flex", flexDirection: "column", gap: 10,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-primary)";
              (e.currentTarget as HTMLButtonElement).style.background = "#f0fdf4";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
              (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc";
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #06b6d4, #0891b2)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
            }}>
              <Icon name="list" size={20} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 3 }}>Form View</div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>
                Edit states, transitions and settings in a structured form
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export function WorkflowList() {
  const router = useRouter();
  const { data, isLoading } = useWorkflowsList({ page: 1, limit: 50 });
  const [selectedWorkflow, setSelectedWorkflow] = useState<{ id: string; name: string } | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const workflows: WorkflowListItem[] = useMemo(() => {
    const raw = data?.data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const rows = useMemo(
    () => (isLoading ? [] : flattenWorkflows(workflows)),
    [workflows, isLoading],
  );

  const handleRowClick = (row: Record<string, any>) => {
    setSelectedWorkflow({ id: row.id, name: row._rawName ?? "Workflow" });
  };

  const handleSelect = (mode: "visual" | "form") => {
    if (!selectedWorkflow) return;
    if (mode === "visual") {
      router.push(`/workflows/${selectedWorkflow.id}/visual`);
    } else {
      router.push(`/workflows/${selectedWorkflow.id}`);
    }
    setSelectedWorkflow(null);
  };

  const handleCreateSelect = (mode: "visual" | "form") => {
    setShowCreateDialog(false);
    if (mode === "visual") {
      router.push("/workflows/visual/new");
    } else {
      router.push("/workflows/new");
    }
  };

  return (
    <>
      <TableFull
        data={rows}
        title="Workflows"
        tableKey="workflows-list"
        columns={WORKFLOW_COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        onRowEdit={handleRowClick}
        onCreate={() => setShowCreateDialog(true)}
      />

      {selectedWorkflow && (
        <ViewModeDialog
          workflowName={selectedWorkflow.name}
          onClose={() => setSelectedWorkflow(null)}
          onSelect={handleSelect}
        />
      )}

      {showCreateDialog && (
        <ViewModeDialog
          workflowName="New Workflow"
          isCreate
          onClose={() => setShowCreateDialog(false)}
          onSelect={handleCreateSelect}
        />
      )}
    </>
  );
}
