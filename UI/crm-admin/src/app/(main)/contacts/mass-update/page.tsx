"use client";

import { MassUpdatePage } from "@/components/common/MassUpdatePage";
import type { CriteriaFieldDef } from "@/components/common/criteria";
import type { BulkEditField } from "@/components/common/BulkEditPanel";
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

const UPDATE_FIELDS: BulkEditField[] = [
  { key: "designation", label: "Designation", type: "text" },
  { key: "department", label: "Department", type: "text" },
];

async function handleSearch() {
  const result = await contactsService.getAll({ limit: 10000 });
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

async function handleUpdate(id: string, values: Record<string, unknown>) {
  return contactsService.update(id, values as any);
}

export default function ContactMassUpdatePage() {
  return (
    <MassUpdatePage
      entityName="contact"
      backPath="/contacts"
      criteriaFields={CRITERIA_FIELDS}
      updateFields={UPDATE_FIELDS}
      onSearch={handleSearch}
      onUpdate={handleUpdate}
    />
  );
}
