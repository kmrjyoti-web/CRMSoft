"use client";

import { MassDeletePage } from "@/components/common/MassDeletePage";
import type { CriteriaFieldDef } from "@/components/common/criteria";
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

async function handleDelete(id: string) {
  return activitiesService.softDelete(id);
}

export default function ActivityMassDeletePage() {
  return (
    <MassDeletePage
      entityName="activity"
      backPath="/activities"
      criteriaFields={CRITERIA_FIELDS}
      onSearch={handleSearch}
      onDeactivate={handleDelete}
    />
  );
}
