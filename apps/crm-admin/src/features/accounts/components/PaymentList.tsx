"use client";

import { useMemo, useState } from "react";

import { TableFull, Badge, Button, SelectInput } from "@/components/ui";
import { Icon } from "@/components/ui";
import { usePaymentList } from "../hooks/useAccounts";
import { useEntityPanel } from "@/hooks/useEntityPanel";
import { PaymentForm } from "./PaymentForm";

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const PAYMENT_COLUMNS = [
  { id: "paymentNumber", label: "Payment No", visible: true },
  { id: "paymentTypeBadge", label: "Type", visible: true },
  { id: "entityName", label: "Entity", visible: true },
  { id: "amountFormatted", label: "Amount", visible: true },
  { id: "paymentMode", label: "Mode", visible: true },
  { id: "paymentDateFormatted", label: "Date", visible: true },
  { id: "statusBadge", label: "Status", visible: true },
  { id: "tdsFormatted", label: "TDS", visible: true },
];

// ---------------------------------------------------------------------------
// Status color map
// ---------------------------------------------------------------------------

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  APPROVED: "success",
  DRAFT: "default",
  PENDING_APPROVAL: "warning",
  CANCELLED: "danger",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatINR(value: number | string | null | undefined): string {
  if (value == null) return "\u2014";
  return `\u20B9${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function flattenPayments(items: any[]): Record<string, unknown>[] {
  return items.map((p) => ({
    id: p.id,
    paymentNumber: p.paymentNumber || "\u2014",
    paymentType: p.paymentType,
    paymentTypeBadge: p.paymentType === "RECEIPT_IN" ? "Receipt" : "Payment",
    entityName: p.entityName || "\u2014",
    amountFormatted: formatINR(p.amount),
    paymentMode: p.paymentMode || "\u2014",
    paymentDateFormatted: p.paymentDate
      ? new Date(p.paymentDate).toLocaleDateString("en-IN")
      : "\u2014",
    status: p.status,
    statusBadge: p.status || "DRAFT",
    tdsFormatted: p.tdsAmount ? formatINR(p.tdsAmount) : "\u2014",
  }));
}

// ---------------------------------------------------------------------------
// Filter tabs
// ---------------------------------------------------------------------------

type TypeFilter = "ALL" | "RECEIPT_IN" | "PAYMENT_OUT";

const TYPE_TABS: { label: string; value: TypeFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Receipts", value: "RECEIPT_IN" },
  { label: "Payments", value: "PAYMENT_OUT" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PaymentList() {
  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "payment",
    entityLabel: "Payment",
    FormComponent: PaymentForm,
    idProp: "paymentId",
    editRoute: "/accounts/payments/:id",
    createRoute: "/accounts/payments/new",
    displayField: "paymentNumber",
    panelWidth: 700,
  });

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const params: Record<string, string> = {};
  if (typeFilter !== "ALL") params.type = typeFilter;
  if (statusFilter !== "ALL") params.status = statusFilter;
  const { data, isLoading } = usePaymentList(Object.keys(params).length ? params : undefined);

  const responseData = data?.data;
  const items: any[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as any;
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenPayments(items), [items]);

  if (isLoading) return <div className="p-6">Loading...</div>;

  const headerActions = (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* Type tabs */}
      <div style={{ display: "flex", gap: 2, background: "#f3f4f6", borderRadius: 8, padding: 3 }}>
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setTypeFilter(tab.value)}
            style={{
              padding: "4px 12px", fontSize: 12, fontWeight: typeFilter === tab.value ? 600 : 400,
              borderRadius: 6, border: "none", cursor: "pointer", transition: "all 0.15s",
              background: typeFilter === tab.value ? "#fff" : "transparent",
              color: typeFilter === tab.value ? "#111827" : "#6b7280",
              boxShadow: typeFilter === tab.value ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Status dropdown */}
      <div style={{ minWidth: 160 }}>
        <SelectInput
          value={statusFilter}
          onChange={(v) => setStatusFilter(String(v ?? "ALL"))}
          options={[
            { value: "ALL", label: "All Status" },
            { value: "DRAFT", label: "Draft" },
            { value: "PENDING_APPROVAL", label: "Pending Approval" },
            { value: "APPROVED", label: "Approved" },
            { value: "CANCELLED", label: "Cancelled" },
          ]}
        />
      </div>
    </div>
  );

  return (
    <TableFull
      data={tableData}
      title="Payments"
      columns={PAYMENT_COLUMNS}
      tableKey="accounts-payments"
      defaultViewMode="table"
      defaultDensity="compact"
      headerActions={headerActions}
      onCreate={handleCreate}
      onRowEdit={handleRowEdit}
    />
  );
}
