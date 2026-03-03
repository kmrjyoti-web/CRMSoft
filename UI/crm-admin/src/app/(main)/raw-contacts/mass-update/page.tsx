"use client";

import { MassUpdatePage } from "@/components/common/MassUpdatePage";
import type { CriteriaFieldDef } from "@/components/common/criteria";
import type { BulkEditField } from "@/components/common/BulkEditPanel";
import { rawContactsService } from "@/features/raw-contacts/services/raw-contacts.service";
import type { RawContactListItem } from "@/features/raw-contacts/types/raw-contacts.types";

const CRITERIA_FIELDS: CriteriaFieldDef[] = [
  { key: "firstName", label: "First Name", type: "string" },
  { key: "lastName", label: "Last Name", type: "string" },
  { key: "companyName", label: "Company", type: "string" },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Raw", value: "RAW" },
      { label: "Verified", value: "VERIFIED" },
      { label: "Rejected", value: "REJECTED" },
      { label: "Duplicate", value: "DUPLICATE" },
    ],
  },
  {
    key: "source",
    label: "Source",
    type: "select",
    options: [
      { label: "Manual", value: "MANUAL" },
      { label: "Bulk Import", value: "BULK_IMPORT" },
      { label: "Web Form", value: "WEB_FORM" },
      { label: "Referral", value: "REFERRAL" },
      { label: "API", value: "API" },
    ],
  },
  { key: "createdAt", label: "Created Date", type: "date" },
];

const UPDATE_FIELDS: BulkEditField[] = [
  { key: "designation", label: "Designation", type: "text" },
  { key: "department", label: "Department", type: "text" },
  { key: "companyName", label: "Company Name", type: "text" },
];

async function handleSearch() {
  const result = await rawContactsService.getAll({ limit: 10000 });
  const raw = result.data;
  const data: RawContactListItem[] = Array.isArray(raw)
    ? raw
    : (raw as unknown as { data?: RawContactListItem[] })?.data ?? [];
  return data.map((c) => ({
    id: c.id,
    label: `${c.firstName} ${c.lastName}`,
    subtitle: c.companyName ?? c.designation ?? undefined,
  }));
}

async function handleUpdate(id: string, values: Record<string, unknown>) {
  return rawContactsService.update(id, values as any);
}

export default function RawContactMassUpdatePage() {
  return (
    <MassUpdatePage
      entityName="raw contact"
      backPath="/raw-contacts"
      criteriaFields={CRITERIA_FIELDS}
      updateFields={UPDATE_FIELDS}
      onSearch={handleSearch}
      onUpdate={handleUpdate}
    />
  );
}
