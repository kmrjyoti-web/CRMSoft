"use client";

import { useState } from "react";
import { Card, Button, Badge } from "@/components/ui";
import { Icon } from "@/components/ui";
import { useCashFlow } from "../hooks/useAccounts";

export function CashFlowReport() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [params, setParams] = useState<{ from: string; to: string } | null>(null);
  const { data, isLoading } = useCashFlow(params?.from ?? "", params?.to ?? "");

  const result = data?.data;
  const fmt = (v: number) => `₹${Math.abs(v).toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Cash Flow Statement</h1>

      <Card className="p-4">
        <div className="flex items-end gap-4">
          <div>
            <label className="text-sm text-gray-500">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="block border rounded px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-gray-500">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="block border rounded px-3 py-2" />
          </div>
          <Button onClick={() => setParams({ from, to })} disabled={!from || !to}>
            Generate
          </Button>
        </div>
      </Card>

      {isLoading && <div>Loading...</div>}

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Operating Activities", value: result.operating, icon: "activity" as const },
            { label: "Investing Activities", value: result.investing, icon: "trending-down" as const },
            { label: "Financing Activities", value: result.financing, icon: "landmark" as const },
          ].map((item) => (
            <Card key={item.label} className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Icon name={item.icon} size={20} />
                <span className="text-sm text-gray-500">{item.label}</span>
              </div>
              <p className={`text-2xl font-bold ${item.value >= 0 ? "text-green-600" : "text-red-600"}`}>
                {item.value >= 0 ? "+" : "-"}{fmt(item.value)}
              </p>
            </Card>
          ))}

          <Card className="p-4 md:col-span-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Net Cash Flow</span>
              <span className={`text-2xl font-bold ${result.netCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                {result.netCashFlow >= 0 ? "+" : "-"}{fmt(result.netCashFlow)}
              </span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
