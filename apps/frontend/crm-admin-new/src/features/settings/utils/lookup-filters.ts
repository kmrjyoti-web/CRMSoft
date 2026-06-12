import type { TableFilterConfig } from "@/components/ui";

export const LOOKUP_FILTER_CONFIG: TableFilterConfig = {
  sections: [
    {
      title: "Status & Type",
      defaultOpen: true,
      filters: [
        {
          columnId: "status",
          label: "Status",
          filterType: "master",
          queryParam: "status",
          options: [
            { value: "Active", label: "Active" },
            { value: "Inactive", label: "Inactive" },
          ],
        },
        {
          columnId: "isSystem",
          label: "System",
          filterType: "master",
          queryParam: "isSystem",
          options: [
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
          ],
        },
      ],
    },
    {
      title: "Text Fields",
      defaultOpen: true,
      filters: [
        { columnId: "category", label: "Category Code", filterType: "text", queryParam: "category" },
        { columnId: "displayName", label: "Display Name", filterType: "text", queryParam: "displayName" },
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
