import type { TableFilterConfig } from "@/components/ui";

export const USER_FILTER_CONFIG: TableFilterConfig = {
  sections: [
    {
      title: "Status & Type",
      defaultOpen: true,
      filters: [
        {
          columnId: "status",
          label: "Status",
          filterType: "master",
          options: [
            { value: "ACTIVE", label: "Active" },
            { value: "INACTIVE", label: "Inactive" },
            { value: "SUSPENDED", label: "Suspended" },
          ],
          queryParam: "status",
        },
        {
          columnId: "userType",
          label: "User Type",
          filterType: "master",
          options: [
            { value: "ADMIN", label: "Admin" },
            { value: "EMPLOYEE", label: "Employee" },
            { value: "CUSTOMER", label: "Customer" },
            { value: "REFERRAL_PARTNER", label: "Referral Partner" },
          ],
          queryParam: "userType",
        },
      ],
    },
    {
      title: "Text Fields",
      defaultOpen: true,
      filters: [
        { columnId: "name", label: "Name", filterType: "text", queryParam: "search" },
        { columnId: "email", label: "Email", filterType: "text", queryParam: "email" },
      ],
    },
    {
      title: "Date Fields",
      defaultOpen: false,
      filters: [
        { columnId: "createdAt", label: "Created Date", filterType: "date", queryParam: "createdAt" },
      ],
    },
  ],
};
