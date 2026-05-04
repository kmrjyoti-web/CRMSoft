"use client";

import { useState } from "react";

import toast from "react-hot-toast";

import { Button, Card, Input, SelectInput, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import { useCreateReminder } from "../hooks/useReminders";
import type { ReminderPriority, ReminderChannel } from "../types/reminders.types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ReminderFormProps {
  entityType?: string;
  entityId?: string;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRIORITY_OPTIONS: { label: string; value: ReminderPriority }[] = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
  { label: "Urgent", value: "URGENT" },
];

const CHANNEL_LIST: { label: string; value: ReminderChannel }[] = [
  { label: "Email", value: "EMAIL" },
  { label: "Notification", value: "NOTIFICATION" },
  { label: "SMS", value: "SMS" },
  { label: "WhatsApp", value: "WHATSAPP" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReminderForm({ entityType, entityId, onClose }: ReminderFormProps) {
  const createMut = useCreateReminder();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [remindAt, setRemindAt] = useState("");
  const [priority, setPriority] = useState<ReminderPriority>("MEDIUM");
  const [channels, setChannels] = useState<ReminderChannel[]>(["NOTIFICATION"]);
  const [formEntityType, setFormEntityType] = useState(entityType ?? "");
  const [formEntityId, setFormEntityId] = useState(entityId ?? "");

  function toggleChannel(ch: ReminderChannel) {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!remindAt) {
      toast.error("Remind at date/time is required");
      return;
    }

    createMut.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        remindAt: new Date(remindAt).toISOString(),
        priority,
        channels: channels.length > 0 ? channels : undefined,
        entityType: formEntityType.trim() || undefined,
        entityId: formEntityId.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Reminder created");
          onClose();
        },
        onError: () => toast.error("Failed to create reminder"),
      }
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "550px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>Create Reminder</h2>
        <Button variant="ghost" onClick={onClose}>
          <Icon name="x" size={16} />
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Title */}
            <Input
              label="Title"
              leftIcon={<Icon name="bell" size={16} />}
              value={title}
              onChange={(v: string) => setTitle(v)}
            />

            {/* Description */}
            <Input
              label="Description"
              leftIcon={<Icon name="file-text" size={16} />}
              value={description}
              onChange={(v: string) => setDescription(v)}
            />

            {/* Remind At */}
            <Input
              label="Remind At"
              leftIcon={<Icon name="calendar" size={16} />}
              type="datetime-local"
              value={remindAt}
              onChange={(v: string) => setRemindAt(v)}
            />

            {/* Priority */}
            <SelectInput
              label="Priority"
              leftIcon={<Icon name="flag" size={16} />}
              value={priority}
              onChange={(v) => setPriority(v as ReminderPriority)}
              options={PRIORITY_OPTIONS}
            />

            {/* Channels */}
            <div>
              <p style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 500 }}>Notification Channels</p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {CHANNEL_LIST.map((ch) => (
                  <Button
                    key={ch.value}
                    type="button"
                    variant={channels.includes(ch.value) ? "primary" : "outline"}
                    onClick={() => toggleChannel(ch.value)}
                  >
                    {ch.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Optional Entity Linking */}
            {!entityType && !entityId && (
              <>
                <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "16px", marginTop: "4px" }}>
                  <p style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#6b7280" }}>
                    Optional: Link to an entity
                  </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <Input
                    label="Entity Type"
                    leftIcon={<Icon name="box" size={16} />}
                    value={formEntityType}
                    onChange={(v: string) => setFormEntityType(v)}
                  />
                  <Input
                    label="Entity ID"
                    leftIcon={<Icon name="hash" size={16} />}
                    value={formEntityId}
                    onChange={(v: string) => setFormEntityId(v)}
                  />
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={createMut.isPending}>
              {createMut.isPending ? <LoadingSpinner /> : "Create Reminder"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
