'use client';

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";

import { TableFull } from "@/components/ui";
import { useTableFilters } from "@/hooks/useTableFilters";
import { TableSkeleton } from "@/components/common/TableSkeleton";

import { usePaymentsList } from "../hooks/useFinance";
import { PAYMENT_FILTER_CONFIG } from "../utils/payment-filters";
import type {
  PaymentListItem,
  PaymentListParams,
} from "../types/finance.types";

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

function formatCurrency(amount: number | string | null | undefined): string {
  if (amount == null) return "\u2014";
  return `\u20B9${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

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
  const router = useRouter();

  const { activeFilters, filterParams, handleFilterChange, clearFilters } =
    useTableFilters(PAYMENT_FILTER_CONFIG);

  const params = useMemo<PaymentListParams>(
    () => ({ page: 1, limit: 10000, ...filterParams }),
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

  const handleRowEdit = useCallback(
    (row: Record<string, unknown>) => {
      router.push(`/finance/payments/${row.id}`);
    },
    [router],
  );

  if (isLoading) return <TableSkeleton title="Payments" />;

  return (
    <div className="h-full flex flex-col">
      <TableFull
        data={tableData as Record<string, any>[]}
        title="Payments"
        columns={PAYMENT_COLUMNS}
        defaultViewMode="table"
        defaultDensity="compact"
        filterConfig={PAYMENT_FILTER_CONFIG}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onFilterClear={clearFilters}
        onRowEdit={handleRowEdit}
      />
    </div>
  );
}
