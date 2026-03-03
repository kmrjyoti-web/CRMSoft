"use client";

import { MassDeletePage } from "@/components/common/MassDeletePage";
import type { CriteriaFieldDef } from "@/components/common/criteria";
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

async function handleDeactivate(id: string) {
  return rawContactsService.softDelete(id);
}

export default function RawContactMassDeletePage() {
  return (
    <MassDeletePage
      entityName="raw contact"
      backPath="/raw-contacts"
      criteriaFields={CRITERIA_FIELDS}
      onSearch={handleSearch}
      onDeactivate={handleDeactivate}
    />
  );
}
