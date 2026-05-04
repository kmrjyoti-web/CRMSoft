"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Button, Badge, Icon, Modal, SelectInput, NumberInput } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  useSyncPolicies,
  useToggleSyncPolicy,
  useUpdateSyncPolicy,
} from "../hooks/useOfflineSync";
import type { SyncPolicy, UpdatePolicyDto } from "../types/offline-sync.types";

// ── Helpers ──────────────────────────────────────────────────────────────────

const DIRECTION_LABELS: Record<string, string> = {
  BIDIRECTIONAL:     "Bidirectional",
  SERVER_TO_CLIENT:  "Server → Client",
  CLIENT_TO_SERVER:  "Client → Server",
};

const DIRECTION_COLORS: Record<string, string> = {
  BIDIRECTIONAL:    "#3b82f6",
  SERVER_TO_CLIENT: "#8b5cf6",
  CLIENT_TO_SERVER: "#f59e0b",
};

const CONFLICT_LABELS: Record<string, string> = {
  SERVER_WINS: "Server Wins",
  CLIENT_WINS: "Client Wins",
  MANUAL:      "Manual",
};

const DIRECTION_OPTIONS = [
  { label: "Bidirectional",    value: "BIDIRECTIONAL" },
  { label: "Server → Client",  value: "SERVER_TO_CLIENT" },
  { label: "Client → Server",  value: "CLIENT_TO_SERVER" },
];

const CONFLICT_OPTIONS = [
  { label: "Server Wins", value: "SERVER_WINS" },
  { label: "Client Wins", value: "CLIENT_WINS" },
  { label: "Manual",      value: "MANUAL" },
];

// ── Toggle Switch ─────────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

function ToggleSwitch({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        border: "none",
        background: checked ? "#22c55e" : "#cbd5e1",
        cursor: disabled ? "not-allowed" : "pointer",
        position: "relative",
        transition: "background 0.2s",
        outline: "none",
        opacity: disabled ? 0.6 : 1,
      }}
      aria-checked={checked}
      role="switch"
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 21 : 3,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

interface EditModalProps {
  policy: SyncPolicy | null;
  onClose: () => void;
}

function EditPolicyModal({ policy, onClose }: EditModalProps) {
  const [direction, setDirection] = useState(policy?.syncDirection ?? "BIDIRECTIONAL");
  const [conflict, setConflict] = useState(policy?.conflictResolution ?? "SERVER_WINS");
  const [maxRecords, setMaxRecords] = useState<number | null>(policy?.maxRecords ?? null);
  const [syncInterval, setSyncInterval] = useState<number | null>(policy?.syncInterval ?? null);
  const [priority, setPriority] = useState<number | null>(policy?.priority ?? null);

  const updateMutation = useUpdateSyncPolicy();

  const handleSave = async () => {
    if (!policy) return;
    const dto: UpdatePolicyDto = {
      syncDirection: direction as UpdatePolicyDto["syncDirection"],
      conflictResolution: conflict as UpdatePolicyDto["conflictResolution"],
      ...(maxRecords != null && { maxRecords }),
      ...(syncInterval != null && { syncInterval }),
      ...(priority != null && { priority }),
    };
    try {
      await updateMutation.mutateAsync({ id: policy.id, dto });
      toast.success("Policy updated");
      onClose();
    } catch {
      toast.error("Failed to update policy");
    }
  };

  return (
    <Modal
      open={!!policy}
      onClose={onClose}
      title={`Edit Policy — ${policy?.entityName ?? ""}`}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "8px 0" }}>
        <SelectInput
          label="Sync Direction"
          leftIcon={<Icon name="repeat" size={15} />}
          options={DIRECTION_OPTIONS}
          value={direction}
          onChange={(v) => setDirection(String(v ?? "BIDIRECTIONAL"))}
        />
        <SelectInput
          label="Conflict Resolution"
          leftIcon={<Icon name="alert-triangle" size={15} />}
          options={CONFLICT_OPTIONS}
          value={conflict}
          onChange={(v) => setConflict(String(v ?? "SERVER_WINS"))}
        />
        <NumberInput
          label="Max Records"
          leftIcon={<Icon name="hash" size={15} />}
          value={maxRecords}
          onChange={setMaxRecords}
        />
        <NumberInput
          label="Sync Interval (seconds)"
          leftIcon={<Icon name="clock" size={15} />}
          value={syncInterval}
          onChange={setSyncInterval}
        />
        <NumberInput
          label="Priority"
          leftIcon={<Icon name="trending-up" size={15} />}
          value={priority}
          onChange={setPriority}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? <LoadingSpinner size="sm" /> : "Save Changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function SyncPolicyList() {
  const [editPolicy, setEditPolicy] = useState<SyncPolicy | null>(null);

  const { data, isLoading } = useSyncPolicies();
  const toggleMutation = useToggleSyncPolicy();

  const policies = useMemo(() => {
    const raw = data?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]) as SyncPolicy[];

  const handleToggle = async (policy: SyncPolicy) => {
    try {
      await toggleMutation.mutateAsync(policy.id);
      toast.success(`Policy ${policy.isEnabled ? "disabled" : "enabled"}`);
    } catch {
      toast.error("Failed to toggle policy");
    }
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Sync Policies
        </h2>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
          Configure per-entity sync rules and conflict resolution
        </p>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {[
                "Entity",
                "Enabled",
                "Direction",
                "Conflict Resolution",
                "Max Records",
                "Sync Interval",
                "Priority",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: "1px solid #e2e8f0",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {policies.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}
                >
                  No sync policies configured.
                </td>
              </tr>
            ) : (
              policies.map((policy) => (
                <tr
                  key={policy.id}
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#1e293b" }}>
                      {policy.entityName}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <ToggleSwitch
                      checked={policy.isEnabled}
                      onChange={() => handleToggle(policy)}
                      disabled={toggleMutation.isPending}
                    />
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <Badge
                      style={{
                        background: `${DIRECTION_COLORS[policy.syncDirection]}20`,
                        color: DIRECTION_COLORS[policy.syncDirection],
                        border: `1px solid ${DIRECTION_COLORS[policy.syncDirection]}40`,
                        fontSize: 12,
                      }}
                    >
                      {DIRECTION_LABELS[policy.syncDirection] ?? policy.syncDirection}
                    </Badge>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151" }}>
                    {CONFLICT_LABELS[policy.conflictResolution] ?? policy.conflictResolution}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#64748b" }}>
                    {policy.maxRecords != null ? policy.maxRecords.toLocaleString() : "—"}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#64748b" }}>
                    {policy.syncInterval != null ? `${policy.syncInterval}s` : "—"}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#374151",
                        background: "#f1f5f9",
                        padding: "2px 8px",
                        borderRadius: 8,
                      }}
                    >
                      {policy.priority}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditPolicy(policy)}
                    >
                      <Icon name="edit" size={13} />
                      Edit
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <EditPolicyModal policy={editPolicy} onClose={() => setEditPolicy(null)} />
    </div>
  );
}
