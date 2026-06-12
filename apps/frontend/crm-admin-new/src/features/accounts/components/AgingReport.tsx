"use client";

import { Card, Badge } from "@/components/ui";
import { Icon } from "@/components/ui";
import { useReceivableAging, usePayableAging } from "../hooks/useAccounts";

function AgingTable({ title, data }: { title: string; data: any }) {
  if (!data) return null;
  const buckets = [
    { key: "current", label: "Current", color: "text-green-600" },
    { key: "aging30", label: "1-30 Days", color: "text-yellow-600" },
    { key: "aging60", label: "31-60 Days", color: "text-orange-600" },
    { key: "aging90", label: "60+ Days", color: "text-red-600" },
  ];

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-4 gap-4 mb-4">
        {buckets.map((b) => (
          <div key={b.key} className="text-center">
            <p className="text-sm text-gray-500">{b.label}</p>
            <p className={`text-xl font-bold ${b.color}`}>
              ₹{(data.total?.[b.key] ?? 0).toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-gray-400">{(data[b.key] ?? []).length} items</p>
          </div>
        ))}
      </div>
      <div className="text-right font-bold">
        Total: ₹{Object.values(data.total ?? {}).reduce((s: number, v: any) => s + Number(v), 0).toLocaleString("en-IN")}
      </div>
    </Card>
  );
}

export function ReceivableAgingReport() {
  const { data, isLoading } = useReceivableAging();
  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Receivable Aging</h1>
      <AgingTable title="Accounts Receivable" data={data?.data} />
    </div>
  );
}

export function PayableAgingReport() {
  const { data, isLoading } = usePayableAging();
  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Payable Aging</h1>
      <AgingTable title="Accounts Payable" data={data?.data} />
    </div>
  );
}
