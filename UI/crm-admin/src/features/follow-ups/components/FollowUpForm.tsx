"use client";

import { useState, useEffect } from "react";

import { Button, Input, SelectInput, DatePicker, Icon } from "@/components/ui";
import { UserSelect } from "@/components/common/UserSelect";

import { useFollowUp, useCreateFollowUp, useUpdateFollowUp } from "../hooks/useFollowUps";

// ── Props ───────────────────────────────────────────────

interface FollowUpFormProps {
  followUpId?: string;
  entityType?: string;
  entityId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ── Component ───────────────────────────────────────────

export function FollowUpForm({
  followUpId,
  entityType: defaultEntityType,
  entityId: defaultEntityId,
  onSuccess,
  onCancel,
}: FollowUpFormProps) {
  const isEdit = !!followUpId;
  const { data: existing } = useFollowUp(followUpId ?? "");
  const createMutation = useCreateFollowUp();
  const updateMutation = useUpdateFollowUp();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<string>("MEDIUM");
  const [assignedToId, setAssignedToId] = useState<string | null>(null);
  const [entityType, setEntityType] = useState(defaultEntityType ?? "");
  const [entityId, setEntityId] = useState(defaultEntityId ?? "");

  // Pre-fill on edit
  useEffect(() => {
    if (isEdit && existing?.data) {
      const fu = existing.data;
      setTitle(fu.title);
      setDescription(fu.description ?? "");
      setDueDate(fu.dueDate);
      setPriority(fu.priority);
      setAssignedToId(fu.assignedToId);
      setEntityType(fu.entityType);
      setEntityId(fu.entityId);
    }
  }, [isEdit, existing]);

  const handleSubmit = () => {
    if (!title.trim() || !dueDate) return;

    const dto = {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      priority: priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
      assignedToId: assignedToId ?? "",
      entityType,
      entityId,
    };

    if (isEdit && followUpId) {
      updateMutation.mutate(
        { id: followUpId, dto },
        { onSuccess: () => onSuccess?.() },
      );
    } else {
      createMutation.mutate(dto, {
        onSuccess: () => {
          onSuccess?.();
          setTitle("");
          setDescription("");
          setDueDate("");
          setPriority("MEDIUM");
          setAssignedToId(null);
          if (!defaultEntityType) setEntityType("");
          if (!defaultEntityId) setEntityId("");
        },
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const priorityOptions = [
    { label: "Low", value: "LOW" },
    { label: "Medium", value: "MEDIUM" },
    { label: "High", value: "HIGH" },
    { label: "Urgent", value: "URGENT" },
  ];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 20,
        border: "1px solid #e5e7eb",
      }}
    >
      <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 600 }}>
        {isEdit ? "Edit Follow-up" : "New Follow-up"}
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Input
          label="Title"
          value={title}
          onChange={(val: string) => setTitle(val)}
          leftIcon={<Icon name="file-text" size={16} />}
          required
        />

        <div>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 500,
              color: "#374151",
              marginBottom: 4,
            }}
          >
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 8,
              border: "1px solid #d1d5db",
              fontSize: 14,
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
        </div>

        <DatePicker
          label="Due Date"
          value={dueDate}
          onChange={(v: string) => setDueDate(v)}
          required
        />

        <SelectInput
          label="Priority"
          options={priorityOptions}
          value={priority}
          onChange={(val: string | number | boolean | null) => setPriority(String(val ?? "MEDIUM"))}
          leftIcon={<Icon name="alert-triangle" size={16} />}
        />

        <UserSelect
          label="Assigned To"
          value={assignedToId}
          onChange={(val: string | number | boolean | null) =>
            setAssignedToId(val ? String(val) : null)
          }
        />

        <Input
          label="Entity Type"
          value={entityType}
          onChange={(val: string) => setEntityType(val)}
          leftIcon={<Icon name="tag" size={16} />}
          disabled={!!defaultEntityType}
        />

        <Input
          label="Entity ID"
          value={entityId}
          onChange={(val: string) => setEntityId(val)}
          leftIcon={<Icon name="hash" size={16} />}
          disabled={!!defaultEntityId}
        />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!title.trim() || !dueDate || isSubmitting}
        >
          {isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  );
}
