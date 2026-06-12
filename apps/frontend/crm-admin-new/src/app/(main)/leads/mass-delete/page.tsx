"use client";

import { MassDeletePage } from "@/components/common/MassDeletePage";
import type { CriteriaFieldDef } from "@/components/common/criteria";
import { leadsService } from "@/features/leads/services/leads.service";
import type { LeadListItem } from "@/features/leads/types/leads.types";

const CRITERIA_FIELDS: CriteriaFieldDef[] = [
  { key: "leadNumber", label: "Lead Number", type: "string" },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "New", value: "NEW" },
      { label: "Verified", value: "VERIFIED" },
      { label: "Allocated", value: "ALLOCATED" },
      { label: "In Progress", value: "IN_PROGRESS" },
      { label: "Demo Scheduled", value: "DEMO_SCHEDULED" },
      { label: "Quotation Sent", value: "QUOTATION_SENT" },
      { label: "Negotiation", value: "NEGOTIATION" },
      { label: "Won", value: "WON" },
      { label: "Lost", value: "LOST" },
      { label: "On Hold", value: "ON_HOLD" },
    ],
  },
  {
    key: "priority",
    label: "Priority",
    type: "select",
    options: [
      { label: "Low", value: "LOW" },
      { label: "Medium", value: "MEDIUM" },
      { label: "High", value: "HIGH" },
      { label: "Urgent", value: "URGENT" },
    ],
  },
  { key: "expectedValue", label: "Expected Value", type: "number" },
  { key: "createdAt", label: "Created Date", type: "date" },
];

async function handleSearch() {
  const result = await leadsService.getAll({ limit: 500 });
  const raw = result.data;
  const data: LeadListItem[] = Array.isArray(raw)
    ? raw
    : (raw as unknown as { data?: LeadListItem[] })?.data ?? [];
  return data.map((l) => ({
    id: l.id,
    label: l.leadNumber,
    subtitle: `${l.contact.firstName} ${l.contact.lastName} · ${l.status}`,
  }));
}

async function handleDeactivate(id: string) {
  return leadsService.softDelete(id);
}

export default function LeadMassDeletePage() {
  return (
    <MassDeletePage
      entityName="lead"
      backPath="/leads"
      criteriaFields={CRITERIA_FIELDS}
      onSearch={handleSearch}
      onDeactivate={handleDeactivate}
    />
  );
}
