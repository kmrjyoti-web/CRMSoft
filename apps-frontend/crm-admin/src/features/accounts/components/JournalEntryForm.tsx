"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";

import {
  Card,
  Button,
  Input,
  SelectInput,
  NumberInput,
  DatePicker,
  Icon,
} from "@/components/ui";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import { useChartOfAccounts, useCreateJournalEntry } from "../hooks/useAccounts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormState {
  transactionDate: string;
  debitLedgerId: string;
  creditLedgerId: string;
  amount: number | null;
  narration: string;
}

const INITIAL_FORM: FormState = {
  transactionDate: new Date().toISOString().slice(0, 10),
  debitLedgerId: "",
  creditLedgerId: "",
  amount: null,
  narration: "",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function JournalEntryForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const { data: chartData, isLoading: chartLoading } = useChartOfAccounts();
  const createEntry = useCreateJournalEntry();

  // Build ledger options
  const ledgerOptions = useMemo(() => {
    const ledgers: any[] = (chartData as any)?.data ?? chartData ?? [];
    return ledgers.map((l: any) => ({
      label: `${l.code} - ${l.name}`,
      value: l.id,
    }));
  }, [chartData]);

  // Lookup names for display
  const debitLedgerName = useMemo(() => {
    const opt = ledgerOptions.find((o) => o.value === form.debitLedgerId);
    return opt?.label ?? "";
  }, [ledgerOptions, form.debitLedgerId]);

  const creditLedgerName = useMemo(() => {
    const opt = ledgerOptions.find((o) => o.value === form.creditLedgerId);
    return opt?.label ?? "";
  }, [ledgerOptions, form.creditLedgerId]);

  const handleSubmit = () => {
    if (!form.transactionDate) {
      toast.error("Transaction date is required");
      return;
    }
    if (!form.debitLedgerId) {
      toast.error("Debit ledger is required");
      return;
    }
    if (!form.creditLedgerId) {
      toast.error("Credit ledger is required");
      return;
    }
    if (form.debitLedgerId === form.creditLedgerId) {
      toast.error("Debit and credit ledgers must be different");
      return;
    }
    if (!form.amount || form.amount <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }

    createEntry.mutate(
      {
        transactionDate: form.transactionDate,
        debitLedgerId: form.debitLedgerId,
        creditLedgerId: form.creditLedgerId,
        amount: form.amount,
        narration: form.narration || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Journal entry created successfully");
          setForm(INITIAL_FORM);
        },
        onError: () => {
          toast.error("Failed to create journal entry");
        },
      },
    );
  };

  if (chartLoading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader
        title="Journal Entry"
        subtitle="Create a new double-entry journal voucher"
      />

      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Transaction Date */}
            <DatePicker
              label="Transaction Date"
              value={form.transactionDate}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  transactionDate: v ? String(v) : "",
                }))
              }
            />

            {/* Amount */}
            <NumberInput
              label="Amount"
              value={form.amount}
              onChange={(v) => setForm((p) => ({ ...p, amount: v }))}
            />

            {/* Debit Ledger */}
            <div>
              <SelectInput
                label="Debit Ledger (Dr)"
                options={ledgerOptions}
                value={form.debitLedgerId}
                onChange={(v) =>
                  setForm((p) => ({ ...p, debitLedgerId: String(v ?? "") }))
                }
                leftIcon={<Icon name="arrow-up-right" size={16} />}
              />
              {debitLedgerName && (
                <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                  <Icon name="info" size={12} /> {debitLedgerName}
                </p>
              )}
            </div>

            {/* Credit Ledger */}
            <div>
              <SelectInput
                label="Credit Ledger (Cr)"
                options={ledgerOptions}
                value={form.creditLedgerId}
                onChange={(v) =>
                  setForm((p) => ({ ...p, creditLedgerId: String(v ?? "") }))
                }
                leftIcon={<Icon name="arrow-down-left" size={16} />}
              />
              {creditLedgerName && (
                <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                  <Icon name="info" size={12} /> {creditLedgerName}
                </p>
              )}
            </div>
          </div>

          {/* Narration */}
          <div style={{ marginTop: 16 }}>
            <Input
              label="Narration"
              value={form.narration}
              onChange={(v) => setForm((p) => ({ ...p, narration: v }))}
              leftIcon={<Icon name="align-left" size={16} />}
            />
          </div>

          {/* Submit */}
          <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <Button
              variant="outline"
              onClick={() => setForm(INITIAL_FORM)}
              disabled={createEntry.isPending}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={createEntry.isPending}
            >
              <Icon name="save" size={16} />
              {createEntry.isPending ? "Saving..." : "Save Journal Entry"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
