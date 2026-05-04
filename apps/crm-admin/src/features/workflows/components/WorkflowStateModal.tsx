"use client";

import { useState, useEffect, useCallback } from "react";

import toast from "react-hot-toast";

import { Button, Modal, Input, SelectInput, ColorPicker } from "@/components/ui";

import type { WorkflowState } from "../types/workflows.types";

// ── Constants ──────────────────────────────────────────────

export const STATE_TYPE_OPTIONS = [
  { label: "Initial", value: "INITIAL" },
  { label: "Intermediate", value: "INTERMEDIATE" },
  { label: "Terminal", value: "TERMINAL" },
];

export const CATEGORY_OPTIONS = [
  { label: "Success", value: "SUCCESS" },
  { label: "Failure", value: "FAILURE" },
  { label: "Paused", value: "PAUSED" },
];

// ── Props ──────────────────────────────────────────────────

export interface WorkflowStateSavePayload {
  editingState: WorkflowState | null;
  name: string;
  code: string;
  stateType: string;
  stateCategory: string;
  stateColor: string;
  stateSortOrder: string;
}

export interface WorkflowStateModalProps {
  open: boolean;
  editingState: WorkflowState | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (payload: WorkflowStateSavePayload) => Promise<void>;
}

// ── WorkflowStateModal ────────────────────────────────────

export function WorkflowStateModal({
  open,
  editingState,
  isSaving,
  onClose,
  onSave,
}: WorkflowStateModalProps) {
  const [stateName, setStateName] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [stateType, setStateType] = useState("INITIAL");
  const [stateCategory, setStateCategory] = useState("");
  const [stateColor, setStateColor] = useState("#3b82f6");
  const [stateSortOrder, setStateSortOrder] = useState("0");

  // Sync form fields whenever the modal opens or the editing target changes
  useEffect(() => {
    if (!open) return;
    if (editingState) {
      setStateName(editingState.name);
      setStateCode(editingState.code);
      setStateType(editingState.stateType);
      setStateCategory(editingState.category ?? "");
      setStateColor(editingState.color ?? "#3b82f6");
      setStateSortOrder(String(editingState.sortOrder));
    } else {
      setStateName("");
      setStateCode("");
      setStateType("INITIAL");
      setStateCategory("");
      setStateColor("#3b82f6");
      setStateSortOrder("0");
    }
  }, [open, editingState]);

  const handleSave = useCallback(async () => {
    if (!stateName.trim() || !stateCode.trim()) {
      toast.error("Name and code are required");
      return;
    }
    await onSave({
      editingState,
      name: stateName,
      code: stateCode,
      stateType,
      stateCategory,
      stateColor,
      stateSortOrder,
    });
  }, [editingState, stateName, stateCode, stateType, stateCategory, stateColor, stateSortOrder, onSave]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingState ? "Edit State" : "Add State"}
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
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Name
          </label>
          <Input
            value={stateName}
            onChange={(v: string) => setStateName(v)}
            placeholder="State name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Code
          </label>
          <Input
            value={stateCode}
            onChange={(v: string) => setStateCode(v)}
            placeholder="STATE_CODE"
            disabled={!!editingState}
          />
        </div>
        <SelectInput
          label="State Type"
          options={STATE_TYPE_OPTIONS}
          value={stateType}
          onChange={(v) => setStateType(String(v ?? "INITIAL"))}
          disabled={!!editingState}
        />
        {stateType === "TERMINAL" && (
          <SelectInput
            label="Category"
            options={CATEGORY_OPTIONS}
            value={stateCategory}
            onChange={(v) => setStateCategory(String(v ?? ""))}
          />
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Color
          </label>
          <ColorPicker
            value={stateColor}
            onChange={(v: string) => setStateColor(v)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Sort Order
          </label>
          <Input
            value={stateSortOrder}
            onChange={(v: string) => setStateSortOrder(v)}
            placeholder="0"
          />
        </div>
      </div>
    </Modal>
  );
}
