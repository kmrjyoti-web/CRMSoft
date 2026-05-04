import type { TableFilterConfig } from "@/components/ui";

export const PAYMENT_FILTER_CONFIG: TableFilterConfig = {
  sections: [
    {
      title: "Status & Method",
      defaultOpen: true,
      filters: [
        {
          columnId: "status",
          label: "Status",
          filterType: "master",
          options: [
            { value: "PENDING", label: "Pending" },
            { value: "AUTHORIZED", label: "Authorized" },
            { value: "CAPTURED", label: "Captured" },
            { value: "PAID", label: "Paid" },
            { value: "FAILED", label: "Failed" },
            { value: "REFUNDED", label: "Refunded" },
            { value: "PARTIALLY_REFUNDED", label: "Partially Refunded" },
          ],
          queryParam: "status",
        },
        {
          columnId: "method",
          label: "Payment Method",
          filterType: "master",
          options: [
            { value: "CASH", label: "Cash" },
            { value: "CHEQUE", label: "Cheque" },
            { value: "BANK_TRANSFER", label: "Bank Transfer" },
            { value: "UPI", label: "UPI" },
            { value: "CREDIT_CARD", label: "Credit Card" },
            { value: "DEBIT_CARD", label: "Debit Card" },
            { value: "NET_BANKING", label: "Net Banking" },
            { value: "WALLET", label: "Wallet" },
            { value: "RAZORPAY", label: "Razorpay" },
            { value: "STRIPE", label: "Stripe" },
            { value: "OTHER", label: "Other" },
          ],
          queryParam: "method",
        },
      ],
    },
    {
      title: "Value Fields",
      defaultOpen: false,
      filters: [
        { columnId: "amount", label: "Amount", filterType: "number", queryParam: "amount" },
      ],
    },
    {
      title: "Date Fields",
      defaultOpen: false,
      filters: [
        { columnId: "paidAt", label: "Paid Date", filterType: "date", queryParam: "paidAt" },
        { columnId: "createdAt", label: "Created Date", filterType: "date", queryParam: "createdAt" },
      ],
    },
  ],
};
