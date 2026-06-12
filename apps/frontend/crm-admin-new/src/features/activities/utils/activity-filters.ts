import type { TableFilterConfig } from "@/components/ui";

export const ACTIVITY_FILTER_CONFIG: TableFilterConfig = {
  sections: [
    {
      title: "Type & Status",
      defaultOpen: true,
      filters: [
        {
          columnId: "type",
          label: "Activity Type",
          filterType: "master",
          options: [
            { value: "CALL", label: "Call" },
            { value: "EMAIL", label: "Email" },
            { value: "MEETING", label: "Meeting" },
            { value: "NOTE", label: "Note" },
            { value: "WHATSAPP", label: "WhatsApp" },
            { value: "SMS", label: "SMS" },
            { value: "VISIT", label: "Visit" },
          ],
          queryParam: "type",
        },
      ],
    },
    {
      title: "Text Fields",
      defaultOpen: true,
      filters: [
        { columnId: "subject", label: "Subject", filterType: "text", queryParam: "search" },
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
