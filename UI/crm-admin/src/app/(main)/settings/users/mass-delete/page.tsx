"use client";

import { MassDeletePage } from "@/components/common/MassDeletePage";
import type { CriteriaFieldDef } from "@/components/common/criteria";
import { usersService } from "@/features/settings/services/users.service";
import type { UserListItem } from "@/features/settings/types/settings.types";

const CRITERIA_FIELDS: CriteriaFieldDef[] = [
  { key: "firstName", label: "First Name", type: "string" },
  { key: "lastName", label: "Last Name", type: "string" },
  { key: "email", label: "Email", type: "string" },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "ACTIVE" },
      { label: "Inactive", value: "INACTIVE" },
      { label: "Suspended", value: "SUSPENDED" },
    ],
  },
  {
    key: "userType",
    label: "User Type",
    type: "select",
    options: [
      { label: "Admin", value: "ADMIN" },
      { label: "Employee", value: "EMPLOYEE" },
      { label: "Customer", value: "CUSTOMER" },
      { label: "Referral Partner", value: "REFERRAL_PARTNER" },
    ],
  },
  { key: "createdAt", label: "Created Date", type: "date" },
];

async function handleSearch() {
  const result = await usersService.getAll({ limit: 500 });
  const raw = result.data;
  const data: UserListItem[] = Array.isArray(raw)
    ? raw
    : (raw as unknown as { data?: UserListItem[] })?.data ?? [];
  return data.map((u) => ({
    id: u.id,
    label: `${u.firstName} ${u.lastName}`,
    subtitle: u.email,
  }));
}

async function handleDeactivate(id: string) {
  return usersService.softDelete(id);
}

export default function UserMassDeletePage() {
  return (
    <MassDeletePage
      entityName="user"
      backPath="/settings/users"
      criteriaFields={CRITERIA_FIELDS}
      onSearch={handleSearch}
      onDeactivate={handleDeactivate}
    />
  );
}
