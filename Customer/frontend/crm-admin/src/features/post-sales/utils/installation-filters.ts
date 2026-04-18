import type { TableFilterConfig } from "@/components/ui";

export const INSTALLATION_FILTER_CONFIG: TableFilterConfig = {
  sections: [
    {
      title: "Status",
      defaultOpen: true,
      filters: [
        {
          columnId: "status",
          label: "Status",
          filterType: "master",
          options: [
            { value: "SCHEDULED", label: "Scheduled" },
            { value: "IN_PROGRESS", label: "In Progress" },
            { value: "COMPLETED", label: "Completed" },
            { value: "CANCELLED", label: "Cancelled" },
          ],
          queryParam: "status",
        },
      ],
    },
    {
      title: "Text Fields",
      defaultOpen: true,
      filters: [
        { columnId: "title", label: "Title", filterType: "text", queryParam: "search" },
      ],
    },
    {
      title: "Date Fields",
      defaultOpen: false,
      filters: [
        { columnId: "scheduledDate", label: "Scheduled Date", filterType: "date", queryParam: "scheduledDate" },
        { columnId: "createdAt", label: "Created Date", filterType: "date", queryParam: "createdAt" },
      ],
    },
  ],
};
