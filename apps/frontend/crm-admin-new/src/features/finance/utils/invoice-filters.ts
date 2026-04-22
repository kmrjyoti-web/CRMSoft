import type { TableFilterConfig } from "@/components/ui";

export const INVOICE_FILTER_CONFIG: TableFilterConfig = {
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
            { value: "SENT", label: "Sent" },
            { value: "PARTIALLY_PAID", label: "Partially Paid" },
            { value: "PAID", label: "Paid" },
            { value: "OVERDUE", label: "Overdue" },
            { value: "CANCELLED", label: "Cancelled" },
            { value: "VOID", label: "Void" },
          ],
          queryParam: "status",
        },
      ],
    },
    {
      title: "Text Fields",
      defaultOpen: true,
      filters: [
        { columnId: "billingName", label: "Billing Name", filterType: "text", queryParam: "billingName" },
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
        { columnId: "invoiceDate", label: "Invoice Date", filterType: "date", queryParam: "invoiceDate" },
        { columnId: "dueDate", label: "Due Date", filterType: "date", queryParam: "dueDate" },
      ],
    },
  ],
};
