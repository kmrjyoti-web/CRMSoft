"use client";

import { MassDeletePage } from "@/components/common/MassDeletePage";
import type { CriteriaFieldDef } from "@/components/common/criteria";
import { organizationsService } from "@/features/organizations/services/organizations.service";
import type { OrganizationListItem } from "@/features/organizations/types/organizations.types";

const CRITERIA_FIELDS: CriteriaFieldDef[] = [
  { key: "name", label: "Name", type: "string" },
  { key: "industry", label: "Industry", type: "string" },
  { key: "city", label: "City", type: "string" },
  { key: "state", label: "State", type: "string" },
  {
    key: "isActive",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "true" },
      { label: "Inactive", value: "false" },
    ],
  },
  { key: "createdAt", label: "Created Date", type: "date" },
];

async function handleSearch() {
  const result = await organizationsService.getAll({ limit: 10000 });
  const raw = result.data;
  const data: OrganizationListItem[] = Array.isArray(raw)
    ? raw
    : (raw as unknown as { data?: OrganizationListItem[] })?.data ?? [];
  return data.map((o) => ({
    id: o.id,
    label: o.name,
    subtitle: [o.industry, o.city].filter(Boolean).join(" · ") || undefined,
  }));
}

async function handleDeactivate(id: string) {
  return organizationsService.softDelete(id);
}

export default function OrganizationMassDeletePage() {
  return (
    <MassDeletePage
      entityName="organization"
      backPath="/organizations"
      criteriaFields={CRITERIA_FIELDS}
      onSearch={handleSearch}
      onDeactivate={handleDeactivate}
    />
  );
}
