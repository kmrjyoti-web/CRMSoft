"use client";

import { MassDeletePage } from "@/components/common/MassDeletePage";
import type { CriteriaFieldDef } from "@/components/common/criteria";
import { contactsService } from "@/features/contacts/services/contacts.service";
import type { ContactListItem } from "@/features/contacts/types/contacts.types";

const CRITERIA_FIELDS: CriteriaFieldDef[] = [
  { key: "firstName", label: "First Name", type: "string" },
  { key: "lastName", label: "Last Name", type: "string" },
  { key: "designation", label: "Designation", type: "string" },
  { key: "department", label: "Department", type: "string" },
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
  const result = await contactsService.getAll({ limit: 500 });
  const raw = result.data;
  const data: ContactListItem[] = Array.isArray(raw)
    ? raw
    : (raw as unknown as { data?: ContactListItem[] })?.data ?? [];
  return data.map((c) => ({
    id: c.id,
    label: `${c.firstName} ${c.lastName}`,
    subtitle: c.designation ?? c.department ?? undefined,
  }));
}

async function handleDeactivate(id: string) {
  return contactsService.softDelete(id);
}

export default function ContactMassDeletePage() {
  return (
    <MassDeletePage
      entityName="contact"
      backPath="/contacts"
      criteriaFields={CRITERIA_FIELDS}
      onSearch={handleSearch}
      onDeactivate={handleDeactivate}
    />
  );
}
