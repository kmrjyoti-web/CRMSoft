"use client";

import { useState } from "react";
import { Card, Button, DatePicker } from "@/components/ui";
import { useDayBook } from "../hooks/useAccounts";

export function DayBookReport() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [queryDate, setQueryDate] = useState(date);
  const { data, isLoading } = useDayBook(queryDate);

  const entries = data?.data ?? [];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Day Book</h1>

      <Card className="p-4">
        <div className="flex items-end gap-4">
          <div>
            <DatePicker label="Date" value={date} onChange={(v) => setDate(String(v ?? ""))} />
          </div>
          <Button onClick={() => setQueryDate(date)}>View</Button>
        </div>
      </Card>

      {isLoading && <div>Loading...</div>}

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Transactions on {queryDate}</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b font-medium">
              <th className="text-left pb-2">Voucher</th>
              <th className="text-left pb-2">Type</th>
              <th className="text-left pb-2">Narration</th>
              <th className="text-right pb-2">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e: any) => (
              <tr key={e.id} className="border-b">
                <td className="py-2">{e.voucherNumber}</td>
                <td className="py-2">{e.voucherType}</td>
                <td className="py-2">{e.narration || "-"}</td>
                <td className="py-2 text-right">₹{Number(e.amount).toLocaleString("en-IN")}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={4} className="py-4 text-center text-gray-400">No transactions</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
