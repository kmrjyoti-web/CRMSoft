"use client";

import { Card, Badge } from "@/components/ui";
import { Icon } from "@/components/ui";
import { useAccountDashboard } from "../hooks/useAccounts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatINR(value: number | string | null | undefined): string {
  if (value == null) return "\u2014";
  return `\u20B9${Number(value).toLocaleString("en-IN")}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AccountsDashboard() {
  const { data, isLoading } = useAccountDashboard();

  if (isLoading) return <div className="p-6">Loading...</div>;

  const d = data?.data;
  if (!d) return <div className="p-6">No data</div>;

  const kpis = [
    {
      label: "Receivables",
      value: d.totalReceivable,
      icon: "arrow-down-left" as const,
      color: "text-green-600",
      count: d.receivableCount,
    },
    {
      label: "Payables",
      value: d.totalPayable,
      icon: "arrow-up-right" as const,
      color: "text-red-600",
      count: d.payableCount,
    },
    {
      label: "Cash & Bank",
      value: d.cashAndBank,
      icon: "wallet" as const,
      color: "text-blue-600",
    },
    {
      label: "GST Due",
      value: d.gstDue,
      icon: "percent" as const,
      color: "text-orange-600",
    },
    {
      label: "Pending Approvals",
      value: d.pendingApprovals,
      icon: "clock" as const,
      color: "text-purple-600",
      isCount: true,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Accounts Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gray-100 ${k.color}`}>
                <Icon name={k.icon} size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{k.label}</p>
                <p className="text-xl font-bold">
                  {k.isCount ? k.value : formatINR(k.value)}
                </p>
                {k.count !== undefined && (
                  <p className="text-xs text-gray-400">{k.count} invoices</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Monthly Revenue vs Expenses */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">
          Revenue vs Expenses (Last 6 Months)
        </h2>
        <div className="grid grid-cols-6 gap-2">
          {d.monthlyData?.map((m: any) => (
            <div key={m.month} className="text-center">
              <div className="text-xs text-gray-500 mb-1">{m.month}</div>
              <div className="text-sm font-medium text-green-600">
                {"\u20B9"}
                {(m.revenue / 1000).toFixed(0)}K
              </div>
              <div className="text-sm font-medium text-red-600">
                {"\u20B9"}
                {(m.expenses / 1000).toFixed(0)}K
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Payments */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Recent Payments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2">Number</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {d.recentPayments?.map((p: any) => (
                <tr key={p.id} className="border-b">
                  <td className="py-2">{p.paymentNumber}</td>
                  <td className="py-2">
                    {p.paymentType === "RECEIPT_IN" ? "Receipt" : "Payment"}
                  </td>
                  <td className="py-2">{formatINR(p.amount)}</td>
                  <td className="py-2">
                    {new Date(p.paymentDate).toLocaleDateString("en-IN")}
                  </td>
                  <td className="py-2">
                    <Badge
                      variant={
                        p.status === "APPROVED" ? "success" : "warning"
                      }
                    >
                      {p.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {(!d.recentPayments || d.recentPayments.length === 0) && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-4 text-center text-gray-400"
                  >
                    No recent payments
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
