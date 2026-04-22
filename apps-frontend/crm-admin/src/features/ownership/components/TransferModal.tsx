"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { Modal, Input, Button, Icon } from "@/components/ui";
import { UserSelect } from "@/components/common/UserSelect";

import { useTransferOwner } from "../hooks/useOwnership";
import type { EntityType } from "../types/ownership.types";

// ── Props ──────────────────────────────────────────────────

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
  entityType: EntityType;
  entityId: string;
  fromUserId: string;
}

// ── Component ──────────────────────────────────────────────

export function TransferModal({
  open,
  onClose,
  entityType,
  entityId,
  fromUserId,
}: TransferModalProps) {
  const [toUserId, setToUserId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const transferMut = useTransferOwner();

  const resetForm = () => {
    setToUserId(null);
    setReason("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!toUserId) {
      toast.error("Please select a new owner");
      return;
    }

    if (toUserId === fromUserId) {
      toast.error("New owner must be different from current owner");
      return;
    }

    transferMut.mutate(
      {
        entityType,
        entityId,
        fromUserId,
        toUserId,
        reason: reason.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Ownership transferred successfully");
          resetForm();
          onClose();
        },
        onError: () => {
          toast.error("Failed to transfer ownership");
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Transfer Ownership"
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!toUserId || transferMut.isPending}
          >
            {transferMut.isPending ? "Transferring..." : "Transfer"}
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <UserSelect
          value={toUserId}
          onChange={(v) => setToUserId(v as string | null)}
          label="New Owner"
          required
          leftIcon={<Icon name="user-plus" size={16} />}
        />

        <Input
          label="Reason (optional)"
          leftIcon={<Icon name="message-square" size={16} />}
          value={reason}
          onChange={setReason}
          placeholder="Enter reason for transfer..."
        />
      </div>
    </Modal>
  );
}
