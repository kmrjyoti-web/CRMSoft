"use client";

import { useState, useEffect } from "react";

import { Button, Input, SelectInput, DatePicker, Icon, TextareaInput } from "@/components/ui";
import { UserSelect } from "@/components/common/UserSelect";

import { useFollowUp, useCreateFollowUp, useUpdateFollowUp } from "../hooks/useFollowUps";

// ── Props ───────────────────────────────────────────────

interface FollowUpFormProps {
  followUpId?: string;
  entityType?: string;
  entityId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ── Component ───────────────────────────────────────────

export function FollowUpForm({
  followUpId,
  entityType: defaultEntityType,
  entityId: defaultEntityId,
  mode,
  panelId,
  onSuccess,
  onCancel,
}: FollowUpFormProps) {
  const isEdit = !!followUpId;
  const isPanel = mode === "panel";
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

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
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

  const formContent = (
    <div className="flex flex-col gap-4">
      <Input
        label="Title"
        value={title}
        onChange={(val: string) => setTitle(val)}
        leftIcon={<Icon name="file-text" size={16} />}
        required
      />

      <TextareaInput
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />

      <DatePicker
        label="Due Date"
        value={dueDate}
        onChange={(v: string | Date | null) => setDueDate(v ? String(v) : "")}
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
  );

  // Panel mode: wrap in form with ID for SidePanel footer save button
  if (isPanel) {
    return (
      <form
        id={`sp-form-follow-up-${followUpId || "new"}`}
        onSubmit={handleSubmit}
        className="p-4"
      >
        {formContent}
      </form>
    );
  }

  // Standalone mode: card with header + footer buttons
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200">
      <h3 className="text-base font-semibold mb-4">
        {isEdit ? "Edit Follow-up" : "New Follow-up"}
      </h3>

      {formContent}

      <div className="flex gap-2 mt-5 justify-end">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button
          variant="primary"
          onClick={() => handleSubmit()}
          disabled={!title.trim() || !dueDate || isSubmitting}
        >
          {isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  );
}
