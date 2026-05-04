"use client";

import { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { Button, Badge, Icon, Input, Modal, SelectInput } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import {
  useAllOverrides,
  useGrantPermission,
  useDenyPermission,
  useRevokeOverride,
} from "../hooks/useUserOverrides";
import type { UserOverride } from "../types/user-overrides.types";

// ── Styles ────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  padding: 24,
};

const toolbarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 20,
  gap: 12,
  flexWrap: "wrap",
};

const titleGroupStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const tableContainerStyle: React.CSSProperties = {
  overflowX: "auto",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};

const thStyle: React.CSSProperties = {
  background: "#f9fafb",
  padding: "10px 14px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 600,
  textTransform: "uppercase",
  color: "#6b7280",
  letterSpacing: "0.04em",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderTop: "1px solid #f3f4f6",
  verticalAlign: "middle",
};

const modalBodyStyle: React.CSSProperties = {
  padding: "0 24px 24px",
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const radioGroupStyle: React.CSSProperties = {
  display: "flex",
  gap: 20,
  alignItems: "center",
  padding: "10px 0",
};

const radioOptionStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 500,
};

// ── Type Badge ─────────────────────────────────────────────

function TypeBadge({ type }: { type: "GRANT" | "DENY" }) {
  return (
    <Badge variant={type === "GRANT" ? "success" : "danger"}>
      {type}
    </Badge>
  );
}

// ── Add Override Modal ────────────────────────────────────

interface AddOverrideModalProps {
  open: boolean;
  onClose: () => void;
}

function AddOverrideModal({ open, onClose }: AddOverrideModalProps) {
  const [userId, setUserId] = useState("");
  const [action, setAction] = useState("");
  const [reason, setReason] = useState("");
  const [overrideType, setOverrideType] = useState<"GRANT" | "DENY">("GRANT");

  const grantMutation = useGrantPermission();
  const denyMutation = useDenyPermission();

  const isPending = grantMutation.isPending || denyMutation.isPending;

  const handleSubmit = async () => {
    if (!userId.trim()) {
      toast.error("User ID is required");
      return;
    }
    if (!action.trim()) {
      toast.error("Action is required");
      return;
    }

    try {
      if (overrideType === "GRANT") {
        await grantMutation.mutateAsync({ userId: userId.trim(), dto: { action: action.trim(), reason: reason || undefined } });
        toast.success("Permission granted successfully");
      } else {
        await denyMutation.mutateAsync({ userId: userId.trim(), dto: { action: action.trim(), reason: reason || undefined } });
        toast.success("Permission denied successfully");
      }
      setUserId("");
      setAction("");
      setReason("");
      setOverrideType("GRANT");
      onClose();
    } catch {
      toast.error(`Failed to ${overrideType === "GRANT" ? "grant" : "deny"} permission`);
    }
  };

  const handleClose = () => {
    setUserId("");
    setAction("");
    setReason("");
    setOverrideType("GRANT");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Permission Override"
      footer={
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="primary" onClick={handleSubmit} disabled={isPending}>
            {isPending ? <LoadingSpinner size="sm" /> : <Icon name="check" size={14} />}
            Apply Override
          </Button>
          <Button variant="ghost" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
        </div>
      }
    >
      <div style={modalBodyStyle}>
        <Input
          label="User ID"
          value={userId}
          onChange={setUserId}
          leftIcon={<Icon name="user" size={16} />}
        />
        <Input
          label="Action (e.g. contacts:create)"
          value={action}
          onChange={setAction}
          leftIcon={<Icon name="shield" size={16} />}
        />
        <Input
          label="Reason (optional)"
          value={reason}
          onChange={setReason}
          leftIcon={<Icon name="file-text" size={16} />}
        />

        {/* Override Type Radio */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
            Override Type
          </label>
          <div style={radioGroupStyle}>
            <label style={radioOptionStyle}>
              <input
                type="radio"
                name="overrideType"
                value="GRANT"
                checked={overrideType === "GRANT"}
                onChange={() => setOverrideType("GRANT")}
              />
              <Badge variant="success">GRANT</Badge>
              <span style={{ color: "#6b7280", fontSize: 13 }}>Allow the action</span>
            </label>
            <label style={radioOptionStyle}>
              <input
                type="radio"
                name="overrideType"
                value="DENY"
                checked={overrideType === "DENY"}
                onChange={() => setOverrideType("DENY")}
              />
              <Badge variant="danger">DENY</Badge>
              <span style={{ color: "#6b7280", fontSize: 13 }}>Block the action</span>
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Component ─────────────────────────────────────────

export function OverrideList() {
  const [showModal, setShowModal] = useState(false);
  const { data, isLoading } = useAllOverrides();
  const revokeMutation = useRevokeOverride();

  const overrides = useMemo(() => {
    const raw = data?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const handleRevoke = useCallback(async (override: UserOverride) => {
    try {
      await revokeMutation.mutateAsync({ userId: override.userId, action: override.action });
      toast.success("Override revoked successfully");
    } catch {
      toast.error("Failed to revoke override");
    }
  }, [revokeMutation]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={containerStyle}>
      {/* Toolbar */}
      <div style={toolbarStyle}>
        <div style={titleGroupStyle}>
          <Icon name="shield" size={22} />
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Permission Overrides</h2>
          <Badge variant="secondary">{overrides.length}</Badge>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
          <Icon name="plus" size={14} />
          Add Override
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && overrides.length === 0 && (
        <EmptyState
          icon="shield"
          title="No permission overrides"
          description="Add overrides to grant or deny specific actions for individual users."
          action={{ label: "Add Override", onClick: () => setShowModal(true) }}
        />
      )}

      {/* Table */}
      {!isLoading && overrides.length > 0 && (
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Action</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Granted By</th>
                <th style={thStyle}>Date</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {overrides.map((override: UserOverride) => (
                <tr key={override.id}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{override.userName ?? override.userId}</div>
                    {override.userEmail && (
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>{override.userEmail}</div>
                    )}
                  </td>
                  <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: 13, color: "#374151" }}>
                    {override.action}
                  </td>
                  <td style={tdStyle}>
                    <TypeBadge type={override.type} />
                  </td>
                  <td style={{ ...tdStyle, color: "#6b7280", fontSize: 13 }}>
                    {override.grantedByName ?? override.grantedBy ?? "—"}
                  </td>
                  <td style={{ ...tdStyle, color: "#9ca3af", fontSize: 12, whiteSpace: "nowrap" }}>
                    {formatDate(override.createdAt)}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleRevoke(override)}
                      disabled={revokeMutation.isPending}
                    >
                      <Icon name="x" size={13} /> Revoke
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Override Modal */}
      <AddOverrideModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
