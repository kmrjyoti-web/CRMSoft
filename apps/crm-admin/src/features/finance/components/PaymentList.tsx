'use client';

import { useMemo } from "react";

import { TableFull } from "@/components/ui";
import { useEntityPanel } from "@/hooks/useEntityPanel";
import { useTableFilters } from "@/hooks/useTableFilters";
import { TableSkeleton } from "@/components/common/TableSkeleton";

import { HelpButton } from "@/components/common/HelpButton";

import { usePaymentsList } from "../hooks/useFinance";
import { PAYMENT_FILTER_CONFIG } from "../utils/payment-filters";
import { PaymentListUserHelp } from "../help/PaymentListUserHelp";
import { PaymentListDevHelp } from "../help/PaymentListDevHelp";
import type {
  PaymentListItem,
  PaymentListParams,
} from "../types/finance.types";

import { formatCurrency } from "@/lib/format-currency";

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const PAYMENT_COLUMNS = [
  { id: "paymentNo", label: "Payment No", visible: true },
  { id: "invoiceNo", label: "Invoice No", visible: true },
  { id: "amount", label: "Amount", visible: true },
  { id: "method", label: "Method", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "paidAt", label: "Paid At", visible: true },
  { id: "createdAt", label: "Created At", visible: false },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------


function flattenPayments(items: PaymentListItem[]): Record<string, unknown>[] {
  return items.map((payment) => ({
    id: payment.id,
    paymentNo: payment.paymentNo,
    invoiceNo: payment.invoice?.invoiceNo || "\u2014",
    amount: formatCurrency(payment.amount),
    method: payment.method,
    status: payment.status,
    paidAt: payment.paidAt
      ? new Date(payment.paidAt).toLocaleDateString("en-IN")
      : "\u2014",
    createdAt: payment.createdAt
      ? new Date(payment.createdAt).toLocaleDateString("en-IN")
      : "\u2014",
  }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PaymentList() {
  const { handleRowEdit } = useEntityPanel({
    entityKey: "payment",
    entityLabel: "Payment",
    FormComponent: () => null,
    idProp: "",
    editRoute: "/finance/payments/:id",
    createRoute: "/finance/payments/new",
    displayField: "paymentNo",
    viewOnly: true,
    viewContent: (row: Record<string, unknown>) => (
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Payment No</span><p className="font-medium">{(row.paymentNo as string) || "\u2014"}</p></div>
          <div><span className="text-gray-500">Invoice</span><p className="font-medium">{(row.invoiceNo as string) || "\u2014"}</p></div>
          <div><span className="text-gray-500">Amount</span><p className="font-medium">{(row.amount as string) || "\u2014"}</p></div>
          <div><span className="text-gray-500">Method</span><p className="font-medium">{(row.method as string) || "\u2014"}</p></div>
          <div><span className="text-gray-500">Status</span><p className="font-medium">{(row.status as string) || "\u2014"}</p></div>
          <div><span className="text-gray-500">Paid At</span><p className="font-medium">{(row.paidAt as string) || "\u2014"}</p></div>
        </div>
      </div>
    ),
  });

  const { activeFilters, filterParams, handleFilterChange, clearFilters } =
    useTableFilters(PAYMENT_FILTER_CONFIG);

  const params = useMemo<PaymentListParams>(
    () => ({ page: 1, limit: 50, ...filterParams }),
    [filterParams],
  );

  const { data, isLoading } = usePaymentsList(params);

  const responseData = data?.data;
  const items: PaymentListItem[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: PaymentListItem[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenPayments(items), [items]);

  if (isLoading) return <TableSkeleton title="Payments" />;

  return (
    <div className="h-full flex flex-col">
      <TableFull
        data={tableData as Record<string, unknown>[]}
        title="Payments"
        columns={PAYMENT_COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        filterConfig={PAYMENT_FILTER_CONFIG}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onFilterClear={clearFilters}
        onRowEdit={handleRowEdit}
        headerActions={
          <HelpButton
            panelId="payments-list-help"
            title="Payments — Help"
            userContent={<PaymentListUserHelp />}
            devContent={<PaymentListDevHelp />}
          />
        }
      />
    </div>
  );
}
