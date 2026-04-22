"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Button, Icon } from "@/components/ui";
import { useAccountDashboard } from "../hooks/useAccounts";

// ── Helpers ──────────────────────────────────────────────

function formatINR(value: number | string | null | undefined): string {
  if (value == null) return "\u2014";
  return `\u20B9${Number(value).toLocaleString("en-IN")}`;
}

function fmtShort(val: number): string {
  if (val >= 10_00_000) return `₹${(val / 10_00_000).toFixed(1)}Cr`;
  if (val >= 1_00_000) return `₹${(val / 1_00_000).toFixed(1)}L`;
  if (val >= 1_000) return `₹${(val / 1_000).toFixed(0)}K`;
  return `₹${val.toLocaleString("en-IN")}`;
}

// ── Nav links ────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Transactions", href: "/accounts/transactions", icon: "arrow-left-right" },
  { label: "Ledger",       href: "/accounts/ledger",       icon: "book-open" },
  { label: "Groups",       href: "/accounts/groups",       icon: "folder-tree" },
  { label: "GST",          href: "/accounts/gst",          icon: "percent" },
  { label: "Reports",      href: "/accounts/reports",      icon: "bar-chart-3" },
  { label: "Banks",        href: "/accounts/banks",        icon: "landmark" },
] as const;

// ── Component ────────────────────────────────────────────

export function AccountsDashboard() {
  const router = useRouter();
  const { data, isLoading } = useAccountDashboard();

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-white">
        <header className="flex items-center px-4 py-2 border-b border-gray-200 bg-white shadow-sm">
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
        </header>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const d = data?.data;
  if (!d) return <div className="p-6 text-gray-400">No data</div>;

  const kpiItems = [
    { label: "Receivable",  value: formatINR(d.totalReceivable), sub: `${d.receivableCount ?? 0} invoices`, color: "#22c55e", icon: "arrow-down-left" },
    { label: "Payable",     value: formatINR(d.totalPayable),    sub: `${d.payableCount ?? 0} invoices`,    color: "#ef4444", icon: "arrow-up-right" },
    { label: "Cash & Bank", value: formatINR(d.cashAndBank),     sub: null,                                  color: "#3b82f6", icon: "wallet" },
    { label: "GST Due",     value: formatINR(d.gstDue),          sub: null,                                  color: "#f59e0b", icon: "percent" },
    { label: "Pending",     value: d.pendingApprovals,           sub: "approvals",                            color: "#8b5cf6", icon: "clock" },
  ];

  // Chart data
  const monthlyData: any[] = d.monthlyData ?? [];
  const maxVal = Math.max(1, ...monthlyData.flatMap((m: any) => [m.revenue ?? 0, m.expenses ?? 0]));

  return (
    <div className="h-full flex flex-col bg-white">
      {/* ── Toolbar (matches TableFull header bar) ────────────── */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shadow-sm z-40">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900">Accounts</h1>
          <div className="h-5 w-px bg-gray-300" />

          {/* Inline KPI stats */}
          <div className="flex items-center gap-4">
            {kpiItems.map((k) => (
              <div key={k.label} className="flex items-center gap-1.5">
                <Icon name={k.icon as any} size={13} color={k.color} />
                <span className="text-sm font-bold" color={k.color}>
                  {k.value}
                </span>
                <span className="text-xs text-gray-400">{k.label}</span>
                {k.sub && <span className="text-[10px] text-gray-300">({k.sub})</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Nav links */}
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
        </div>
      </header>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* Revenue vs Expenses — Bar Chart */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Revenue vs Expenses (Last 6 Months)</span>
            <div className="flex items-center gap-4 text-[10px] text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Revenue</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />Expenses</span>
            </div>
          </div>
          <div className="p-4">
            {monthlyData.length > 0 ? (
              <div className="flex items-end gap-3 h-44">
                {monthlyData.map((m: any) => {
                  const revH = Math.max(4, ((m.revenue ?? 0) / maxVal) * 100);
                  const expH = Math.max(4, ((m.expenses ?? 0) / maxVal) * 100);
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      {/* Values */}
                      <div className="text-[10px] text-gray-400 text-center leading-tight">
                        <div className="text-green-600 font-semibold">{fmtShort(m.revenue ?? 0)}</div>
                        <div className="text-red-500 font-semibold">{fmtShort(m.expenses ?? 0)}</div>
                      </div>
                      {/* Bars */}
                      <div className="flex gap-1 items-end w-full justify-center" style={{ height: '100px' }}>
                        <div
                          className="w-3 rounded-t bg-green-500 transition-all"
                          style={{ height: `${revH}%` }}
                          title={`Revenue: ${formatINR(m.revenue)}`}
                        />
                        <div
                          className="w-3 rounded-t bg-red-400 transition-all"
                          style={{ height: `${expH}%` }}
                          title={`Expenses: ${formatINR(m.expenses)}`}
                        />
                      </div>
                      {/* Label */}
                      <span className="text-[10px] text-gray-500 font-medium">{m.month}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400 text-sm">No data for the period</div>
            )}
          </div>
        </div>

        {/* KPI Detail Cards — 5-col grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: "Receivables",       value: formatINR(d.totalReceivable), sub: `${d.receivableCount ?? 0} invoices`, color: "#22c55e", bg: "bg-green-50",  icon: "arrow-down-left",  href: "/accounts/payments?type=receipt" },
            { label: "Payables",          value: formatINR(d.totalPayable),    sub: `${d.payableCount ?? 0} invoices`,    color: "#ef4444", bg: "bg-red-50",    icon: "arrow-up-right",   href: "/accounts/payments?type=payment" },
            { label: "Cash & Bank",       value: formatINR(d.cashAndBank),     sub: null,                                  color: "#3b82f6", bg: "bg-blue-50",   icon: "wallet",           href: "/accounts/banks" },
            { label: "GST Due",           value: formatINR(d.gstDue),          sub: null,                                  color: "#f59e0b", bg: "bg-amber-50",  icon: "percent",          href: "/accounts/gst" },
            { label: "Pending Approvals", value: d.pendingApprovals,           sub: null,                                  color: "#8b5cf6", bg: "bg-purple-50", icon: "clock",            href: "/accounts/payments?status=pending" },
          ].map((k) => (
            <div
              key={k.label}
              onClick={() => router.push(k.href)}
              className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow flex items-start gap-3"
            >
              <div className={`p-2 rounded-lg ${k.bg} flex-shrink-0`}>
                <Icon name={k.icon as any} size={18} color={k.color} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-500 truncate">{k.label}</p>
                <p className="text-lg font-bold text-gray-900">{k.value}</p>
                {k.sub && <p className="text-[10px] text-gray-400">{k.sub}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Recent Payments</span>
            <Link href="/accounts/payments" className="text-xs text-blue-600 no-underline hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {["Number", "Type", "Amount", "Date", "Status"].map((h) => (
                    <th key={h} className={`px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide ${h === "Amount" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.recentPayments?.map((p: any) => (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-900">{p.paymentNumber}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant={p.paymentType === "RECEIPT_IN" ? "success" : "danger"}>
                        {p.paymentType === "RECEIPT_IN" ? "Receipt" : "Payment"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-gray-900">{formatINR(p.amount)}</td>
                    <td className="px-4 py-2.5 text-gray-500">{new Date(p.paymentDate).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant={p.status === "APPROVED" ? "success" : p.status === "PENDING" ? "warning" : "secondary"}>{p.status}</Badge>
                    </td>
                  </tr>
                ))}
                {(!d.recentPayments || d.recentPayments.length === 0) && (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-400">No recent payments</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
