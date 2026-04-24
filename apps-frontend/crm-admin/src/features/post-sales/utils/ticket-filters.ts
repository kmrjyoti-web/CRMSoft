import type { TableFilterConfig } from "@/components/ui";

export const TICKET_FILTER_CONFIG: TableFilterConfig = {
  sections: [
    {
      title: "Status & Priority",
      defaultOpen: true,
      filters: [
        {
          columnId: "status",
          label: "Status",
          filterType: "master",
          options: [
            { value: "OPEN", label: "Open" },
            { value: "IN_PROGRESS", label: "In Progress" },
            { value: "ON_HOLD", label: "On Hold" },
            { value: "RESOLVED", label: "Resolved" },
            { value: "CLOSED", label: "Closed" },
            { value: "REOPENED", label: "Reopened" },
          ],
          queryParam: "status",
        },
        {
          columnId: "priority",
          label: "Priority",
          filterType: "master",
          options: [
            { value: "LOW", label: "Low" },
            { value: "MEDIUM", label: "Medium" },
            { value: "HIGH", label: "High" },
            { value: "URGENT", label: "Urgent" },
          ],
          queryParam: "priority",
        },
        {
          columnId: "category",
          label: "Category",
          filterType: "master",
          options: [
            { value: "INSTALLATION", label: "Installation" },
            { value: "PRODUCT", label: "Product" },
            { value: "BILLING", label: "Billing" },
            { value: "GENERAL", label: "General" },
            { value: "FEATURE_REQUEST", label: "Feature Request" },
            { value: "BUG", label: "Bug" },
          ],
          queryParam: "category",
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
        { columnId: "createdAt", label: "Created Date", filterType: "date", queryParam: "createdAt" },
      ],
    },
  ],
};
