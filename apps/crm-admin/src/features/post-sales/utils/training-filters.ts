import type { TableFilterConfig } from "@/components/ui";

export const TRAINING_FILTER_CONFIG: TableFilterConfig = {
  sections: [
    {
      title: "Status & Mode",
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
        {
          columnId: "mode",
          label: "Mode",
          filterType: "master",
          options: [
            { value: "ONSITE", label: "Onsite" },
            { value: "REMOTE", label: "Remote" },
            { value: "HYBRID", label: "Hybrid" },
          ],
          queryParam: "mode",
        },
      ],
    },
    {
      title: "Text Fields",
      defaultOpen: true,
      filters: [
        { columnId: "title", label: "Title", filterType: "text", queryParam: "search" },
        { columnId: "trainerName", label: "Trainer", filterType: "text", queryParam: "trainerName" },
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
