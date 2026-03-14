"use client";

import { useRouter } from "next/navigation";
import { Card, Badge, Button } from "@/components/ui";
import { Icon } from "@/components/ui";
import { useTransactionDashboard } from "../hooks/useAccounts";
import type { TransactionDashboard as TxnDash } from "../types/accounts.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatINR(value: number | string | null | undefined): string {
  if (value == null) return "\u2014";
  return `\u20B9${Number(value).toLocaleString("en-IN")}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

const TYPE_CONFIG: Record<
  string,
  { label: string; variant: "primary" | "success" | "danger" | "warning" | "secondary" }
> = {
  JOURNAL: { label: "Journal", variant: "primary" },
  PAYMENT_IN: { label: "Payment In", variant: "success" },
  PAYMENT_OUT: { label: "Payment Out", variant: "danger" },
  CONTRA: { label: "Contra", variant: "warning" },
  TDS: { label: "TDS", variant: "secondary" },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TransactionDashboard() {
  const router = useRouter();
  const { data, isLoading } = useTransactionDashboard();

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const d: TxnDash | undefined = data?.data;
  if (!d) return <div className="p-6 text-gray-400">No transaction data available</div>;

  // ── KPI Cards ──────────────────────────────────────────────────────────
  const kpis = [
    {
      label: "Journal Entries",
      sub: "Today",
      value: d.todayJournalEntries,
      amount: d.todayJournalAmount,
      icon: "book-open" as const,
      color: "bg-blue-50 text-blue-600",
      path: "/accounts/journal-entries",
    },
    {
      label: "Payments In",
      sub: "Total",
      value: d.paymentsInCount,
      amount: d.paymentsInAmount,
      icon: "arrow-down-circle" as const,
      color: "bg-green-50 text-green-600",
      path: "/accounts/payments?type=receipt",
    },
    {
      label: "Payments Out",
      sub: "Total",
      value: d.paymentsOutCount,
      amount: d.paymentsOutAmount,
      icon: "arrow-up-circle" as const,
      color: "bg-red-50 text-red-600",
      path: "/accounts/payments?type=payment",
    },
    {
      label: "Contra Entries",
      sub: "Today",
      value: d.contraEntriesToday,
      amount: d.contraAmount,
      icon: "arrow-left-right" as const,
      color: "bg-amber-50 text-amber-600",
      path: "/accounts/contra",
    },
    {
      label: "TDS Deducted",
      sub: "This Month",
      value: null,
      amount: d.tdsDeductedMonth,
      icon: "percent" as const,
      color: "bg-purple-50 text-purple-600",
      path: "/accounts/tds",
    },
    {
      label: "Pending Approvals",
      sub: "",
      value: d.pendingApprovals,
      amount: null,
      icon: "clock" as const,
      color: "bg-orange-50 text-orange-600",
      path: "/accounts/payments?status=pending",
    },
  ];

  // ── Max bar height for daily volume chart ──────────────────────────────
  const maxVol = Math.max(
    1,
    ...(d.dailyVolume?.map((v) => v.journal + v.paymentIn + v.paymentOut + v.contra) ?? [1]),
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header + Quick Actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Accounting Transactions</h1>
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push("/accounts/journal-entries?action=new")}
          >
            <Icon name="plus" size={16} className="mr-1" />
            Journal Entry
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/accounts/payments/new?type=receipt")}
          >
            <Icon name="arrow-down-circle" size={16} className="mr-1" />
            Payment In
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/accounts/payments/new?type=payment")}
          >
            <Icon name="arrow-up-circle" size={16} className="mr-1" />
            Payment Out
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((k) => (
          <Card
            key={k.label}
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(k.path)}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${k.color}`}>
                <Icon name={k.icon} size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 truncate">{k.label}</p>
                {k.value !== null && (
                  <p className="text-xl font-bold">{k.value}</p>
                )}
                {k.amount !== null && (
                  <p className={`text-sm font-semibold ${k.value !== null ? "text-gray-500" : "text-xl font-bold"}`}>
                    {formatINR(k.amount)}
                  </p>
                )}
                {k.sub && <p className="text-[10px] text-gray-400">{k.sub}</p>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Middle Row: Payment Mode Breakdown + Daily Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Mode Breakdown */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Payment Mode Breakdown</h2>
          {d.paymentModeBreakdown && d.paymentModeBreakdown.length > 0 ? (
            <div className="space-y-3">
              {d.paymentModeBreakdown.map((pm) => {
                const total = d.paymentModeBreakdown.reduce((s, x) => s + x.amount, 0) || 1;
                const pct = Math.round((pm.amount / total) * 100);
                return (
                  <div key={pm.mode}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{pm.mode}</span>
                      <span className="text-gray-500">
                        {pm.count} txns &middot; {formatINR(pm.amount)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No payment data</p>
          )}
        </Card>

        {/* Daily Transaction Volume (last 7 days) */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Daily Volume (Last 7 Days)</h2>
          {d.dailyVolume && d.dailyVolume.length > 0 ? (
            <div className="flex items-end gap-2 h-40">
              {d.dailyVolume.map((day) => {
                const total = day.journal + day.paymentIn + day.paymentOut + day.contra;
                const h = Math.max(4, (total / maxVol) * 100);
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-500 font-medium">{total}</span>
                    <div className="w-full flex flex-col-reverse rounded-t overflow-hidden" style={{ height: `${h}%` }}>
                      {day.journal > 0 && (
                        <div
                          className="bg-blue-400"
                          style={{ height: `${(day.journal / total) * 100}%` }}
                          title={`Journal: ${day.journal}`}
                        />
                      )}
                      {day.paymentIn > 0 && (
                        <div
                          className="bg-green-400"
                          style={{ height: `${(day.paymentIn / total) * 100}%` }}
                          title={`Payment In: ${day.paymentIn}`}
                        />
                      )}
                      {day.paymentOut > 0 && (
                        <div
                          className="bg-red-400"
                          style={{ height: `${(day.paymentOut / total) * 100}%` }}
                          title={`Payment Out: ${day.paymentOut}`}
                        />
                      )}
                      {day.contra > 0 && (
                        <div
                          className="bg-amber-400"
                          style={{ height: `${(day.contra / total) * 100}%` }}
                          title={`Contra: ${day.contra}`}
                        />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">{fmtDate(day.date)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No volume data</p>
          )}
          {/* Legend */}
          <div className="flex gap-4 mt-3 justify-center text-[10px] text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" />Journal</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" />Pay In</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />Pay Out</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />Contra</span>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <Button variant="ghost" size="sm" onClick={() => router.push("/accounts/journal-entries")}>
            View All
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Number</th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium text-right">Amount</th>
                <th className="pb-2 font-medium">Narration</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {d.recentTransactions?.map((txn) => {
                const cfg = TYPE_CONFIG[txn.type] ?? {
                  label: txn.type,
                  variant: "secondary" as const,
                };
                return (
                  <tr key={txn.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </td>
                    <td className="py-2 font-medium">{txn.number}</td>
                    <td className="py-2 text-gray-500">
                      {new Date(txn.date).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-2 text-right font-semibold">{formatINR(txn.amount)}</td>
                    <td className="py-2 text-gray-500 max-w-[200px] truncate">
                      {txn.narration || "\u2014"}
                    </td>
                    <td className="py-2">
                      <Badge
                        variant={
                          txn.status === "APPROVED"
                            ? "success"
                            : txn.status === "PENDING"
                              ? "warning"
                              : txn.status === "CANCELLED"
                                ? "danger"
                                : "secondary"
                        }
                      >
                        {txn.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
              {(!d.recentTransactions || d.recentTransactions.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No recent transactions
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* TDS Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 flex items-center gap-4 cursor-pointer hover:shadow-md" onClick={() => router.push("/accounts/tds")}>
          <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
            <Icon name="percent" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">TDS Deducted (This Month)</p>
            <p className="text-xl font-bold">{formatINR(d.tdsDeductedMonth)}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-gray-400">Deposited</p>
            <p className="text-lg font-semibold text-green-600">{formatINR(d.tdsDepositedMonth)}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 cursor-pointer hover:shadow-md" onClick={() => router.push("/accounts/payments?status=pending")}>
          <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
            <Icon name="clock" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Approvals</p>
            <p className="text-xl font-bold">{d.pendingApprovals}</p>
          </div>
          <div className="ml-auto">
            <Button variant="outline" size="sm">
              Review <Icon name="arrow-right" size={14} className="ml-1" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
