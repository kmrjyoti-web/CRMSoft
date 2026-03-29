"use client";

import { useState } from "react";
import { Card, Button, Badge, DatePicker } from "@/components/ui";
import { useTrialBalance } from "../hooks/useAccounts";

export function TrialBalanceReport() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [params, setParams] = useState<{ from: string; to: string } | null>(null);
  const { data, isLoading } = useTrialBalance(params?.from ?? "", params?.to ?? "");

  const result = data?.data;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Trial Balance</h1>

      <Card className="p-4">
        <div className="flex items-end gap-4">
          <div>
            <DatePicker label="From" value={from} onChange={(v) => setFrom(String(v ?? ""))} />
          </div>
          <div>
            <DatePicker label="To" value={to} onChange={(v) => setTo(String(v ?? ""))} />
          </div>
          <Button onClick={() => setParams({ from, to })} disabled={!from || !to}>
            Generate
          </Button>
        </div>
      </Card>

      {isLoading && <div>Loading...</div>}

      {result && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {result.period.from} to {result.period.to}
            </h2>
            <Badge variant={result.isBalanced ? "success" : "danger"}>
              {result.isBalanced ? "Balanced" : "Not Balanced"}
            </Badge>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b font-medium">
                <th className="text-left pb-2">Code</th>
                <th className="text-left pb-2">Ledger</th>
                <th className="text-left pb-2">Group</th>
                <th className="text-right pb-2">Debit (₹)</th>
                <th className="text-right pb-2">Credit (₹)</th>
              </tr>
            </thead>
            <tbody>
              {result.ledgers?.map((l: any) => (
                <tr key={l.ledgerId} className="border-b">
                  <td className="py-2">{l.code}</td>
                  <td className="py-2">{l.name}</td>
                  <td className="py-2">{l.groupType}</td>
                  <td className="py-2 text-right">{l.debit > 0 ? `₹${l.debit.toLocaleString("en-IN")}` : "-"}</td>
                  <td className="py-2 text-right">{l.credit > 0 ? `₹${l.credit.toLocaleString("en-IN")}` : "-"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold border-t-2">
                <td colSpan={3} className="py-2">Total</td>
                <td className="py-2 text-right">₹{result.totalDebit?.toLocaleString("en-IN")}</td>
                <td className="py-2 text-right">₹{result.totalCredit?.toLocaleString("en-IN")}</td>
              </tr>
            </tfoot>
          </table>
        </Card>
      )}
    </div>
  );
}
