"use client";

import { MassUpdatePage } from "@/components/common/MassUpdatePage";
import type { CriteriaFieldDef } from "@/components/common/criteria";
import type { BulkEditField } from "@/components/common/BulkEditPanel";
import { organizationsService } from "@/features/organizations/services/organizations.service";
import type { OrganizationListItem } from "@/features/organizations/types/organizations.types";

const CRITERIA_FIELDS: CriteriaFieldDef[] = [
  { key: "name", label: "Name", type: "string" },
  { key: "industry", label: "Industry", type: "string" },
  { key: "city", label: "City", type: "string" },
  { key: "state", label: "State", type: "string" },
  { key: "country", label: "Country", type: "string" },
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

const UPDATE_FIELDS: BulkEditField[] = [
  { key: "industry", label: "Industry", type: "text" },
  { key: "city", label: "City", type: "text" },
  { key: "country", label: "Country", type: "text" },
];

async function handleSearch() {
  const result = await organizationsService.getAll({ limit: 500 });
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

async function handleUpdate(id: string, values: Record<string, unknown>) {
  return organizationsService.update(id, values as any);
}

export default function OrganizationMassUpdatePage() {
  return (
    <MassUpdatePage
      entityName="organization"
      backPath="/organizations"
      criteriaFields={CRITERIA_FIELDS}
      updateFields={UPDATE_FIELDS}
      onSearch={handleSearch}
      onUpdate={handleUpdate}
    />
  );
}
