"use client";

import { Button, Icon } from "@/components/ui";

interface BulkActionsBarProps {
  count: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onClear: () => void;
  isRunning?: boolean;
  entityName?: string;
}

/**
 * Fixed bottom bar that appears when 1+ bulk items are selected.
 * Shows selection count and bulk action buttons.
 */
export function BulkActionsBar({
  count,
  onEdit,
  onDelete,
  onClear,
  isRunning = false,
  entityName = "record",
}: BulkActionsBarProps) {
  if (count === 0) return null;

  const label = `${count} ${entityName}${count !== 1 ? "s" : ""} selected`;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 200,
        background: "#1e293b",
        color: "#fff",
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.24)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 20px",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>

      <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.2)" }} />

      {onEdit && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onEdit}
          disabled={isRunning}
          style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}
        >
          <Icon name="edit" size={14} /> Edit
        </Button>
      )}

      {onDelete && (
        <Button
          size="sm"
          variant="danger"
          onClick={onDelete}
          disabled={isRunning}
          loading={isRunning}
        >
          <Icon name="trash-2" size={14} /> Delete
        </Button>
      )}

      <button
        onClick={onClear}
        disabled={isRunning}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.6)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          padding: 4,
        }}
        title="Clear selection"
      >
        <Icon name="x" size={16} />
      </button>
    </div>
  );
}
