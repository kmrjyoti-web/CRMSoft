"use client";

import { useState, useMemo } from "react";

import {
  Card,
  Button,
  DatePicker,
  Icon,
  Badge,
} from "@/components/ui";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";

import { useProfitLoss } from "../hooks/useAccounts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatINR(amount: number | null | undefined): string {
  if (amount == null) return "\u20B90.00";
  return `\u20B9${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

interface LineItem {
  name: string;
  amount: number;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionTable({
  title,
  icon,
  items,
  total,
  badgeVariant,
}: {
  title: string;
  icon: string;
  items: LineItem[];
  total: number;
  badgeVariant: string;
}) {
  return (
    <Card>
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Icon name={icon as any} size={18} />
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>
            {title}
          </h3>
          <Badge variant={badgeVariant as any}>{formatINR(total)}</Badge>
        </div>

        {items.length === 0 ? (
          <p style={{ fontSize: 13, color: "#94a3b8" }}>No items</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                  Account
                </th>
                <th style={{ padding: "8px 12px", textAlign: "right", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={idx}
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <td style={{ padding: "8px 12px", fontSize: 13, color: "#334155" }}>
                    {item.name}
                  </td>
                  <td style={{ padding: "8px 12px", fontSize: 13, color: "#334155", textAlign: "right" }}>
                    {formatINR(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "2px solid #e2e8f0" }}>
                <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
                  Total
                </td>
                <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 700, color: "#1e293b", textAlign: "right" }}>
                  {formatINR(total)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ProfitLossReport() {
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const [fromDate, setFromDate] = useState(thirtyDaysAgo);
  const [toDate, setToDate] = useState(today);
  const [appliedRange, setAppliedRange] = useState({ from: thirtyDaysAgo, to: today });

  const { data, isLoading } = useProfitLoss(appliedRange.from, appliedRange.to);

  const incomeItems: LineItem[] = useMemo(() => {
    return (data as any)?.income ?? (data as any)?.data?.income ?? [];
  }, [data]);

  const expenseItems: LineItem[] = useMemo(() => {
    return (data as any)?.expenses ?? (data as any)?.data?.expenses ?? [];
  }, [data]);

  const totalIncome = useMemo(
    () => incomeItems.reduce((sum, i) => sum + (i.amount ?? 0), 0),
    [incomeItems],
  );

  const totalExpenses = useMemo(
    () => expenseItems.reduce((sum, i) => sum + (i.amount ?? 0), 0),
    [expenseItems],
  );

  const netProfit = totalIncome - totalExpenses;

  const handleApply = () => {
    setAppliedRange({ from: fromDate, to: toDate });
  };

  return (
    <div>
      <PageHeader
        title="Profit & Loss Statement"
        subtitle="Income and expenses for the selected period"
      />

      {/* Date range picker */}
      <Card>
        <div style={{ padding: 16, display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
          <div style={{ minWidth: 180 }}>
            <DatePicker
              label="From Date"
              value={fromDate}
              onChange={(v) => setFromDate(v ? String(v) : "")}
            />
          </div>
          <div style={{ minWidth: 180 }}>
            <DatePicker
              label="To Date"
              value={toDate}
              onChange={(v) => setToDate(v ? String(v) : "")}
            />
          </div>
          <Button variant="primary" onClick={handleApply}>
            <Icon name="search" size={16} /> Generate
          </Button>
        </div>
      </Card>

      {/* Report body */}
      {isLoading ? (
        <LoadingSpinner fullPage />
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              marginTop: 20,
            }}
          >
            <SectionTable
              title="Income"
              icon="trending-up"
              items={incomeItems}
              total={totalIncome}
              badgeVariant="success"
            />
            <SectionTable
              title="Expenses"
              icon="trending-down"
              items={expenseItems}
              total={totalExpenses}
              badgeVariant="danger"
            />
          </div>

          {/* Summary */}
          <Card>
            <div
              style={{
                padding: 20,
                marginTop: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", gap: 32 }}>
                <div>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Total Income</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "#16a34a", margin: 0 }}>
                    {formatINR(totalIncome)}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Total Expenses</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "#dc2626", margin: 0 }}>
                    {formatINR(totalExpenses)}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Net Profit</p>
                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: netProfit >= 0 ? "#16a34a" : "#dc2626",
                    margin: 0,
                  }}
                >
                  {formatINR(netProfit)}
                </p>
                <Badge variant={netProfit >= 0 ? "success" : "danger"}>
                  {netProfit >= 0 ? "Profit" : "Loss"}
                </Badge>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
