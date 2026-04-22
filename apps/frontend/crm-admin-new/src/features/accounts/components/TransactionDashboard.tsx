"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Button, Icon } from "@/components/ui";
import { useTransactionDashboard } from "../hooks/useAccounts";
import type { TransactionDashboard as TxnDash } from "../types/accounts.types";

// ── Helpers ──────────────────────────────────────────────────────────────

function formatINR(value: number | string | null | undefined): string {
  if (value == null) return "\u2014";
  return `\u20B9${Number(value).toLocaleString("en-IN")}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

const TYPE_CONFIG: Record<string, { label: string; variant: "primary" | "success" | "danger" | "warning" | "secondary" }> = {
  JOURNAL: { label: "Journal", variant: "primary" },
  PAYMENT_IN: { label: "Payment In", variant: "success" },
  PAYMENT_OUT: { label: "Payment Out", variant: "danger" },
  CONTRA: { label: "Contra", variant: "warning" },
  TDS: { label: "TDS", variant: "secondary" },
};

// ── Nav links ────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Journal",    href: "/accounts/journal-entries", icon: "book-open" },
  { label: "Payments",   href: "/accounts/payments",        icon: "indian-rupee" },
  { label: "Contra",     href: "/accounts/contra",          icon: "arrow-left-right" },
  { label: "TDS",        href: "/accounts/tds",             icon: "percent" },
  { label: "Reports",    href: "/accounts/reports",         icon: "bar-chart-3" },
] as const;

// ── Component ────────────────────────────────────────────────────────────

export function TransactionDashboard() {
  const router = useRouter();
  const { data, isLoading } = useTransactionDashboard();

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-white">
        <header className="flex items-center px-4 py-2 border-b border-gray-200 bg-white shadow-sm">
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
        </header>
        <div className="p-6 grid grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const d: TxnDash | undefined = data?.data;
  if (!d) return <div className="p-6 text-gray-400">No transaction data available</div>;

  const kpiItems = [
    { label: "Journal",     value: d.todayJournalEntries, amount: formatINR(d.todayJournalAmount), color: "#3b82f6" },
    { label: "Pay In",      value: d.paymentsInCount,     amount: formatINR(d.paymentsInAmount),   color: "#22c55e" },
    { label: "Pay Out",     value: d.paymentsOutCount,    amount: formatINR(d.paymentsOutAmount),  color: "#ef4444" },
    { label: "Contra",      value: d.contraEntriesToday,  amount: formatINR(d.contraAmount),       color: "#f59e0b" },
    { label: "TDS",         value: null,                  amount: formatINR(d.tdsDeductedMonth),   color: "#8b5cf6" },
    { label: "Pending",     value: d.pendingApprovals,    amount: null,                            color: "#f97316" },
  ];

  // Daily volume chart
  const maxVol = Math.max(1, ...(d.dailyVolume?.map((v) => v.journal + v.paymentIn + v.paymentOut + v.contra) ?? [1]));

  return (
    <div className="h-full flex flex-col bg-white">
      {/* ── Toolbar (matches TableFull header bar) ────────────── */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shadow-sm z-40">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900">Accounting Transactions</h1>
          <div className="h-5 w-px bg-gray-300" />

          {/* Inline KPI stats */}
          <div className="flex items-center gap-4">
            {kpiItems.filter((k) => k.value !== null || k.amount !== null).map((k) => (
              <div key={k.label} className="flex items-center gap-1.5">
                {k.value !== null && (
                  <span className="text-base font-bold" style={{ color: k.color }}>{k.value}</span>
                )}
                {k.amount && k.value !== null && (
                  <span className="text-[10px] text-gray-300">({k.amount})</span>
                )}
                {k.amount && k.value === null && (
                  <span className="text-sm font-bold" style={{ color: k.color }}>{k.amount}</span>
                )}
                <span className="text-xs text-gray-400">{k.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Nav links as pill buttons */}
          <div className="flex items-center bg-gray-100 rounded-md p-0.5">
            {NAV_LINKS.map(({ label, href, icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 rounded transition-colors no-underline"
              >
                <Icon name={icon as any} size={11} />
                {label}
              </Link>
            ))}
          </div>

          <div className="h-5 w-px bg-gray-300" />

          <Button variant="primary" size="sm" onClick={() => router.push("/accounts/journal-entries?action=new")}>
            <Icon name="plus" size={14} />
            <span className="ml-1">Journal Entry</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push("/accounts/payments/new?type=receipt")}>
            <Icon name="arrow-down-circle" size={14} />
            <span className="ml-1">Pay In</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push("/accounts/payments/new?type=payment")}>
            <Icon name="arrow-up-circle" size={14} />
            <span className="ml-1">Pay Out</span>
          </Button>
        </div>
      </header>

      {/* ── Content area ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* Middle Row: Payment Mode + Daily Volume */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Payment Mode Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">Payment Mode Breakdown</span>
            </div>
            <div className="p-4">
              {d.paymentModeBreakdown && d.paymentModeBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {d.paymentModeBreakdown.map((pm) => {
                    const total = d.paymentModeBreakdown.reduce((s, x) => s + x.amount, 0) || 1;
                    const pct = Math.round((pm.amount / total) * 100);
                    return (
                      <div key={pm.mode}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{pm.mode}</span>
                          <span className="text-gray-500 text-xs">{pm.count} txns · {formatINR(pm.amount)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">No payment data</p>
              )}
            </div>
          </div>

          {/* Daily Volume */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-900">Daily Volume (Last 7 Days)</span>
            </div>
            <div className="p-4">
              {d.dailyVolume && d.dailyVolume.length > 0 ? (
                <>
                  <div className="flex items-end gap-2 h-36">
                    {d.dailyVolume.map((day) => {
                      const total = day.journal + day.paymentIn + day.paymentOut + day.contra;
                      const h = Math.max(4, (total / maxVol) * 100);
                      return (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[10px] text-gray-500 font-medium">{total}</span>
                          <div className="w-full flex flex-col-reverse rounded-t overflow-hidden" style={{ height: `${h}%` }}>
                            {day.journal > 0 && <div className="bg-blue-400" style={{ height: `${(day.journal / total) * 100}%` }} title={`Journal: ${day.journal}`} />}
                            {day.paymentIn > 0 && <div className="bg-green-400" style={{ height: `${(day.paymentIn / total) * 100}%` }} title={`Pay In: ${day.paymentIn}`} />}
                            {day.paymentOut > 0 && <div className="bg-red-400" style={{ height: `${(day.paymentOut / total) * 100}%` }} title={`Pay Out: ${day.paymentOut}`} />}
                            {day.contra > 0 && <div className="bg-amber-400" style={{ height: `${(day.contra / total) * 100}%` }} title={`Contra: ${day.contra}`} />}
                          </div>
                          <span className="text-[10px] text-gray-400">{fmtDate(day.date)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-4 mt-3 justify-center text-[10px] text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" />Journal</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" />Pay In</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />Pay Out</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />Contra</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">No volume data</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Recent Transactions</span>
            <Link href="/accounts/journal-entries" className="text-xs text-blue-600 no-underline hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {["Type", "Number", "Date", "Amount", "Narration", "Status"].map((h) => (
                    <th key={h} className={`px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide ${h === "Amount" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.recentTransactions?.map((txn) => {
                  const cfg = TYPE_CONFIG[txn.type] ?? { label: txn.type, variant: "secondary" as const };
                  return (
                    <tr key={txn.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2.5"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                      <td className="px-4 py-2.5 font-medium text-gray-900">{txn.number}</td>
                      <td className="px-4 py-2.5 text-gray-500">{new Date(txn.date).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-900">{formatINR(txn.amount)}</td>
                      <td className="px-4 py-2.5 text-gray-500 max-w-[200px] truncate">{txn.narration || "\u2014"}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant={txn.status === "APPROVED" ? "success" : txn.status === "PENDING" ? "warning" : txn.status === "CANCELLED" ? "danger" : "secondary"}>
                          {txn.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
                {(!d.recentTransactions || d.recentTransactions.length === 0) && (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400">No recent transactions</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TDS + Pending Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/accounts/tds")}
          >
            <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
              <Icon name="percent" size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500">TDS Deducted (This Month)</p>
              <p className="text-xl font-bold">{formatINR(d.tdsDeductedMonth)}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[10px] text-gray-400">Deposited</p>
              <p className="text-lg font-semibold text-green-600">{formatINR(d.tdsDepositedMonth)}</p>
            </div>
          </div>

          <div
            className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/accounts/payments?status=pending")}
          >
            <div className="p-2.5 rounded-lg bg-orange-50 text-orange-600">
              <Icon name="clock" size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pending Approvals</p>
              <p className="text-xl font-bold">{d.pendingApprovals}</p>
            </div>
            <div className="ml-auto">
              <Button variant="outline" size="sm">
                Review <Icon name="arrow-right" size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
