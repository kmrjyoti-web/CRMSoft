"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { Modal, SelectInput, Input, Button, Icon } from "@/components/ui";
import { UserSelect } from "@/components/common/UserSelect";

import { useAssignOwner } from "../hooks/useOwnership";
import type { EntityType, OwnerType } from "../types/ownership.types";

// ── Owner type options ─────────────────────────────────────

const OWNER_TYPE_OPTIONS: { value: OwnerType; label: string }[] = [
  { value: "PRIMARY_OWNER", label: "Primary Owner" },
  { value: "CO_OWNER", label: "Co-Owner" },
  { value: "WATCHER", label: "Watcher" },
  { value: "DELEGATED_OWNER", label: "Delegated Owner" },
  { value: "TEAM_OWNER", label: "Team Owner" },
];

// ── Props ──────────────────────────────────────────────────

interface AssignmentModalProps {
  open: boolean;
  onClose: () => void;
  entityType: EntityType;
  entityId: string;
}

// ── Component ──────────────────────────────────────────────

export function AssignmentModal({
  open,
  onClose,
  entityType,
  entityId,
}: AssignmentModalProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [ownerType, setOwnerType] = useState<OwnerType>("PRIMARY_OWNER");
  const [reason, setReason] = useState("");

  const assignMut = useAssignOwner();

  const resetForm = () => {
    setUserId(null);
    setOwnerType("PRIMARY_OWNER");
    setReason("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!userId) {
      toast.error("Please select a user");
      return;
    }

    assignMut.mutate(
      {
        entityType,
        entityId,
        userId,
        ownerType,
        reason: reason.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Owner assigned successfully");
          resetForm();
          onClose();
        },
        onError: () => {
          toast.error("Failed to assign owner");
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Assign Owner"
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!userId || assignMut.isPending}
          >
            {assignMut.isPending ? "Assigning..." : "Assign"}
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <UserSelect
          value={userId}
          onChange={(v) => setUserId(v as string | null)}
          label="Select User"
          required
          leftIcon={<Icon name="user" size={16} />}
        />

        <SelectInput
          label="Owner Type"
          leftIcon={<Icon name="shield" size={16} />}
          options={OWNER_TYPE_OPTIONS}
          value={ownerType}
          onChange={(v) => setOwnerType(v as OwnerType)}
        />

        <Input
          label="Reason (optional)"
          leftIcon={<Icon name="message-square" size={16} />}
          value={reason}
          onChange={setReason}
          placeholder="Enter reason for assignment..."
        />
      </div>
    </Modal>
  );
}
