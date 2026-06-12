import type { TableFilterConfig } from "@/components/ui";

export const QUOTATION_FILTER_CONFIG: TableFilterConfig = {
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
            { value: "DRAFT", label: "Draft" },
            { value: "INTERNAL_REVIEW", label: "Internal Review" },
            { value: "SENT", label: "Sent" },
            { value: "VIEWED", label: "Viewed" },
            { value: "NEGOTIATION", label: "Negotiation" },
            { value: "ACCEPTED", label: "Accepted" },
            { value: "REJECTED", label: "Rejected" },
            { value: "EXPIRED", label: "Expired" },
            { value: "REVISED", label: "Revised" },
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
      title: "Value Fields",
      defaultOpen: false,
      filters: [
        { columnId: "totalAmount", label: "Total Amount", filterType: "number", queryParam: "totalAmount" },
      ],
    },
    {
      title: "Date Fields",
      defaultOpen: false,
      filters: [
        { columnId: "createdAt", label: "Created Date", filterType: "date", queryParam: "date" },
        { columnId: "validUntil", label: "Valid Until", filterType: "date", queryParam: "validUntil" },
      ],
    },
  ],
};
