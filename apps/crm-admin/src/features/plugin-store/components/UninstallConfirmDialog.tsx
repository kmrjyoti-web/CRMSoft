"use client";

import { useState } from "react";

import { Button, Icon, Input, Modal } from "@/components/ui";

// ── Props ────────────────────────────────────────────────────────────

interface UninstallConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  pluginName: string;
  pluginCode: string;
  onConfirm: () => Promise<void>;
}

// ── Component ────────────────────────────────────────────────────────

export function UninstallConfirmDialog({
  open,
  onClose,
  pluginName,
  pluginCode,
  onConfirm,
}: UninstallConfirmDialogProps) {
  const [typed, setTyped] = useState("");
  const [loading, setLoading] = useState(false);

  const canConfirm = typed === pluginCode;

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setLoading(true);
    try {
      await onConfirm();
      setTyped("");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setTyped("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Uninstall Plugin"
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} disabled={!canConfirm || loading}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="trash-2" size={14} />
              {loading ? "Uninstalling…" : "Uninstall"}
            </span>
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            padding: "14px 16px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 8,
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <Icon name="alert-triangle" size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 13, color: "#991b1b", lineHeight: 1.5 }}>
            This will permanently remove <strong>{pluginName}</strong> and all its stored
            credentials, settings, and webhook configurations. This action cannot be undone.
          </div>
        </div>

        <div style={{ fontSize: 13, color: "#374151" }}>
          Type <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace" }}>
            {pluginCode}
          </code>{" "}
          to confirm:
        </div>

        <Input
          label="Plugin code"
          value={typed}
          onChange={setTyped}
          leftIcon={<Icon name="terminal" size={16} />}
          placeholder={pluginCode}
        />
      </div>
    </Modal>
  );
}
