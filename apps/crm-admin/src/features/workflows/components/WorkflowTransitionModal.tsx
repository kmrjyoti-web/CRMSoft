"use client";

import { useState, useEffect, useCallback } from "react";

import toast from "react-hot-toast";

import { Button, Modal, Input, SelectInput } from "@/components/ui";

import type { WorkflowTransition } from "../types/workflows.types";

// ── Constants ──────────────────────────────────────────────

export const TRIGGER_TYPE_OPTIONS = [
  { label: "Manual", value: "MANUAL" },
  { label: "Auto", value: "AUTO" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Approval", value: "APPROVAL" },
];

// ── Types ──────────────────────────────────────────────────

export interface StateOption {
  label: string;
  value: string;
}

export interface WorkflowTransitionSavePayload {
  editingTransition: WorkflowTransition | null;
  fromStateId: string;
  toStateId: string;
  name: string;
  code: string;
  triggerType: string;
  permission: string;
  role: string;
}

export interface WorkflowTransitionModalProps {
  open: boolean;
  editingTransition: WorkflowTransition | null;
  stateOptions: StateOption[];
  /** Pre-selected fromStateId when opening from a state card */
  initialFromStateId: string;
  /** Pre-filled transition name when opening from a state card */
  initialName: string;
  /** Pre-filled transition code when opening from a state card */
  initialCode: string;
  isSaving: boolean;
  onClose: () => void;
  onSave: (payload: WorkflowTransitionSavePayload) => Promise<void>;
}

// ── WorkflowTransitionModal ───────────────────────────────

export function WorkflowTransitionModal({
  open,
  editingTransition,
  stateOptions,
  initialFromStateId,
  initialName,
  initialCode,
  isSaving,
  onClose,
  onSave,
}: WorkflowTransitionModalProps) {
  const [fromStateId, setFromStateId] = useState("");
  const [toStateId, setToStateId] = useState("");
  const [transName, setTransName] = useState("");
  const [transCode, setTransCode] = useState("");
  const [transTriggerType, setTransTriggerType] = useState("MANUAL");
  const [transPermission, setTransPermission] = useState("");
  const [transRole, setTransRole] = useState("");

  // Sync form fields whenever the modal opens or the editing target changes
  useEffect(() => {
    if (!open) return;
    if (editingTransition) {
      setFromStateId(editingTransition.fromStateId);
      setToStateId(editingTransition.toStateId);
      setTransName(editingTransition.name);
      setTransCode(editingTransition.code);
      setTransTriggerType(editingTransition.triggerType);
      setTransPermission(editingTransition.requiredPermission ?? "");
      setTransRole(editingTransition.requiredRole ?? "");
    } else {
      setFromStateId(initialFromStateId);
      setToStateId("");
      setTransName(initialName);
      setTransCode(initialCode);
      setTransTriggerType("MANUAL");
      setTransPermission("");
      setTransRole("");
    }
  }, [open, editingTransition, initialFromStateId, initialName, initialCode]);

  const handleSave = useCallback(async () => {
    if (!transName.trim() || !transCode.trim() || !fromStateId || !toStateId) {
      toast.error("Name, code, from state, and to state are required");
      return;
    }
    await onSave({
      editingTransition,
      fromStateId,
      toStateId,
      name: transName,
      code: transCode,
      triggerType: transTriggerType,
      permission: transPermission,
      role: transRole,
    });
  }, [
    editingTransition,
    fromStateId,
    toStateId,
    transName,
    transCode,
    transTriggerType,
    transPermission,
    transRole,
    onSave,
  ]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingTransition ? "Edit Transition" : "Add Transition"}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} loading={isSaving}>
            Save
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <SelectInput
          label="From State"
          options={stateOptions}
          value={fromStateId}
          onChange={(v) => setFromStateId(String(v ?? ""))}
          disabled={!!editingTransition}
        />
        <SelectInput
          label="To State"
          options={stateOptions}
          value={toStateId}
          onChange={(v) => setToStateId(String(v ?? ""))}
          disabled={!!editingTransition}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Name
          </label>
          <Input
            value={transName}
            onChange={(v: string) => setTransName(v)}
            placeholder="Transition name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Code
          </label>
          <Input
            value={transCode}
            onChange={(v: string) => setTransCode(v)}
            placeholder="TRANSITION_CODE"
            disabled={!!editingTransition}
          />
        </div>
        <SelectInput
          label="Trigger Type"
          options={TRIGGER_TYPE_OPTIONS}
          value={transTriggerType}
          onChange={(v) => setTransTriggerType(String(v ?? "MANUAL"))}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Required Permission
          </label>
          <Input
            value={transPermission}
            onChange={(v: string) => setTransPermission(v)}
            placeholder="Optional permission code"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Required Role
          </label>
          <Input
            value={transRole}
            onChange={(v: string) => setTransRole(v)}
            placeholder="Optional role code"
          />
        </div>
      </div>
    </Modal>
  );
}
