import type { TableFilterConfig } from "@/components/ui";

export const DEMO_FILTER_CONFIG: TableFilterConfig = {
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
            { value: "RESCHEDULED", label: "Rescheduled" },
            { value: "COMPLETED", label: "Completed" },
            { value: "CANCELLED", label: "Cancelled" },
            { value: "NO_SHOW", label: "No Show" },
          ],
          queryParam: "status",
        },
        {
          columnId: "mode",
          label: "Mode",
          filterType: "master",
          options: [
            { value: "ONLINE", label: "Online" },
            { value: "OFFLINE", label: "Offline" },
          ],
          queryParam: "mode",
        },
      ],
    },
    {
      title: "Result",
      defaultOpen: false,
      filters: [
        {
          columnId: "result",
          label: "Result",
          filterType: "master",
          options: [
            { value: "INTERESTED", label: "Interested" },
            { value: "NOT_INTERESTED", label: "Not Interested" },
            { value: "FOLLOW_UP", label: "Follow Up" },
            { value: "NO_SHOW", label: "No Show" },
          ],
          queryParam: "result",
        },
      ],
    },
    {
      title: "Date Fields",
      defaultOpen: false,
      filters: [
        { columnId: "scheduledAt", label: "Scheduled Date", filterType: "date", queryParam: "scheduledAt" },
        { columnId: "createdAt", label: "Created Date", filterType: "date", queryParam: "createdAt" },
      ],
    },
  ],
};
