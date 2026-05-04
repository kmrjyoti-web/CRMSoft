import type { TableFilterConfig } from "@/components/ui";

export const PROFORMA_FILTER_CONFIG: TableFilterConfig = {
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
            { value: "PI_DRAFT", label: "Draft" },
            { value: "PI_SENT", label: "Sent" },
            { value: "PI_ACCEPTED", label: "Accepted" },
            { value: "PI_REJECTED", label: "Rejected" },
            { value: "PI_CONVERTED", label: "Converted" },
            { value: "PI_CANCELLED", label: "Cancelled" },
          ],
          queryParam: "status",
        },
      ],
    },
    {
      title: "Text Fields",
      defaultOpen: true,
      filters: [
        {
          columnId: "billingName",
          label: "Billing Name",
          filterType: "text",
          queryParam: "billingName",
        },
      ],
    },
    {
      title: "Value Fields",
      defaultOpen: false,
      filters: [
        {
          columnId: "totalAmount",
          label: "Total Amount",
          filterType: "number",
          queryParam: "totalAmount",
        },
      ],
    },
    {
      title: "Date Fields",
      defaultOpen: false,
      filters: [
        {
          columnId: "proformaDate",
          label: "Proforma Date",
          filterType: "date",
          queryParam: "proformaDate",
        },
        {
          columnId: "validUntil",
          label: "Valid Until",
          filterType: "date",
          queryParam: "validUntil",
        },
      ],
    },
  ],
};
