"use client";

import { MassUpdatePage } from "@/components/common/MassUpdatePage";
import type { CriteriaFieldDef } from "@/components/common/criteria";
import type { BulkEditField } from "@/components/common/BulkEditPanel";
import { activitiesService } from "@/features/activities/services/activities.service";
import type { ActivityListItem } from "@/features/activities/types/activities.types";

const CRITERIA_FIELDS: CriteriaFieldDef[] = [
  {
    key: "type",
    label: "Activity Type",
    type: "select",
    options: [
      { label: "Call", value: "CALL" },
      { label: "Email", value: "EMAIL" },
      { label: "Meeting", value: "MEETING" },
      { label: "Note", value: "NOTE" },
      { label: "WhatsApp", value: "WHATSAPP" },
      { label: "SMS", value: "SMS" },
      { label: "Visit", value: "VISIT" },
    ],
  },
  { key: "subject", label: "Subject", type: "string" },
  { key: "scheduledAt", label: "Scheduled Date", type: "date" },
  { key: "createdAt", label: "Created Date", type: "date" },
];

const UPDATE_FIELDS: BulkEditField[] = [
  {
    key: "type",
    label: "Type",
    type: "select",
    options: [
      { label: "Call", value: "CALL" },
      { label: "Email", value: "EMAIL" },
      { label: "Meeting", value: "MEETING" },
      { label: "Note", value: "NOTE" },
      { label: "WhatsApp", value: "WHATSAPP" },
      { label: "SMS", value: "SMS" },
      { label: "Visit", value: "VISIT" },
    ],
  },
  { key: "subject", label: "Subject", type: "text" },
];

async function handleSearch() {
  const result = await activitiesService.getAll({ limit: 500 });
  const raw = result.data;
  const data: ActivityListItem[] = Array.isArray(raw)
    ? raw
    : (raw as unknown as { data?: ActivityListItem[] })?.data ?? [];
  return data.map((a) => ({
    id: a.id,
    label: a.subject,
    subtitle: `${a.type} · ${a.scheduledAt ? new Date(a.scheduledAt).toLocaleDateString() : "—"}`,
  }));
}

async function handleUpdate(id: string, values: Record<string, unknown>) {
  return activitiesService.update(id, values as any);
}

export default function ActivityMassUpdatePage() {
  return (
    <MassUpdatePage
      entityName="activity"
      backPath="/activities"
      criteriaFields={CRITERIA_FIELDS}
      updateFields={UPDATE_FIELDS}
      onSearch={handleSearch}
      onUpdate={handleUpdate}
    />
  );
}
