"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { TableFull, Badge, Icon, Input, SelectInput, NumberInput, DatePicker } from "@/components/ui";
import type { TableFilterConfig } from "@/components/ui";
import { useEntityPanel } from "@/hooks/useEntityPanel";
import { useJournalEntries, useChartOfAccounts, useCreateJournalEntry } from "../hooks/useAccounts";
import type { CreateJournalEntryPayload } from "../types/accounts.types";

// -- Columns -----------------------------------------------------------------

const COLUMNS = [
  { id: "entryNumber",  label: "Entry #",      visible: true },
  { id: "date",         label: "Date",          visible: true },
  { id: "debit",        label: "Debit A/c",     visible: true },
  { id: "credit",       label: "Credit A/c",    visible: true },
  { id: "amount",       label: "Amount",        visible: true },
  { id: "narration",    label: "Narration",     visible: true },
  { id: "status",       label: "Status",        visible: true },
];

const FILTER_CONFIG: TableFilterConfig = {
  sections: [
    {
      title: "Date",
      defaultOpen: true,
      filters: [
        { columnId: "transactionDate", label: "Transaction Date", filterType: "date", queryParam: "date" },
      ],
    },
    {
      title: "Status",
      defaultOpen: true,
      filters: [
        {
          columnId: "status",
          label: "Status",
          filterType: "master",
          queryParam: "status",
          options: [
            { value: "POSTED",  label: "Posted" },
            { value: "DRAFT",   label: "Draft" },
            { value: "VOIDED",  label: "Voided" },
          ],
        },
      ],
    },
  ],
};

const fmt = (n: number) => `\u20B9${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

// -- Create Form (adapted for useEntityPanel) --------------------------------

function JournalEntryForm({
  journalEntryId,
  onSuccess,
  panelId,
  mode,
}: {
  journalEntryId?: string;
  onSuccess?: () => void;
  panelId?: string;
  mode?: string;
}) {
  const { data: chartData } = useChartOfAccounts();
  const createMut = useCreateJournalEntry();

  const [form, setForm] = useState<{
    transactionDate: string;
    debitLedgerId:   string;
    creditLedgerId:  string;
    amount:          number | null;
    narration:       string;
  }>({
    transactionDate: new Date().toISOString().slice(0, 10),
    debitLedgerId:   "",
    creditLedgerId:  "",
    amount:          null,
    narration:       "",
  });

  const ledgerOptions = useMemo(() => {
    const arr: any[] = chartData?.data ?? chartData ?? [];
    return Array.isArray(arr)
      ? arr.map((l: any) => ({ label: `${l.code} \u2013 ${l.name}`, value: l.id }))
      : [];
  }, [chartData]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.transactionDate)               { toast.error("Transaction date is required"); return; }
    if (!form.debitLedgerId)                 { toast.error("Debit ledger is required"); return; }
    if (!form.creditLedgerId)                { toast.error("Credit ledger is required"); return; }
    if (form.debitLedgerId === form.creditLedgerId) { toast.error("Debit and credit ledgers must differ"); return; }
    if (!form.amount || form.amount <= 0)    { toast.error("Amount must be > 0"); return; }

    try {
      await createMut.mutateAsync({
        transactionDate: form.transactionDate,
        debitLedgerId:   form.debitLedgerId,
        creditLedgerId:  form.creditLedgerId,
        amount:          form.amount,
        narration:       form.narration || undefined,
      } as CreateJournalEntryPayload);
      toast.success("Journal entry created");
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to create journal entry");
    }
  };

  return (
    <form
      id={`sp-form-journal-entry-${journalEntryId ?? "new"}`}
      onSubmit={handleSubmit}
      className="p-5 space-y-4"
    >
      {/* Double entry visual */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12,
        alignItems: "center", padding: "14px", background: "#f8fafc",
        borderRadius: 10, border: "1px solid #e5e7eb",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Dr (Debit)</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>
            {ledgerOptions.find((o) => o.value === form.debitLedgerId)?.label ?? "\u2014"}
          </div>
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "#6b7280" }}>
          <Icon name="arrow-right" size={18} />
          <div style={{ fontWeight: 700, color: "#2563eb" }}>{form.amount ? fmt(form.amount) : "\u20B90.00"}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Cr (Credit)</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>
            {ledgerOptions.find((o) => o.value === form.creditLedgerId)?.label ?? "\u2014"}
          </div>
        </div>
      </div>

      <DatePicker
        label="Transaction Date"
        value={form.transactionDate}
        onChange={(v) => setForm((p) => ({ ...p, transactionDate: v ? String(v) : "" }))}
      />

      <NumberInput
        label="Amount (\u20B9)"
        value={form.amount}
        onChange={(v) => setForm((p) => ({ ...p, amount: v }))}
        min={0}
        step={0.01}
      />

      <SelectInput
        label="Debit Ledger (Dr)"
        leftIcon={<Icon name="arrow-up-right" size={16} />}
        options={ledgerOptions}
        value={form.debitLedgerId}
        onChange={(v) => setForm((p) => ({ ...p, debitLedgerId: String(v ?? "") }))}
      />

      <SelectInput
        label="Credit Ledger (Cr)"
        leftIcon={<Icon name="arrow-down-left" size={16} />}
        options={ledgerOptions}
        value={form.creditLedgerId}
        onChange={(v) => setForm((p) => ({ ...p, creditLedgerId: String(v ?? "") }))}
      />

      <Input
        label="Narration"
        leftIcon={<Icon name="align-left" size={16} />}
        value={form.narration}
        onChange={(v) => setForm((p) => ({ ...p, narration: v }))}
      />
    </form>
  );
}

// -- List Page ---------------------------------------------------------------

export function JournalEntryList() {
  const { data, isLoading } = useJournalEntries();

  const { handleCreate, handleRowEdit } = useEntityPanel({
    entityKey: "journal-entry",
    entityLabel: "Journal Entry",
    FormComponent: JournalEntryForm,
    idProp: "journalEntryId",
    editRoute: "/accounts/journal-entries/:id/edit",
    createRoute: "/accounts/journal-entries/new",
    displayField: "entryNumber",
  });

  const items: any[] = useMemo(() => {
    const raw = data?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const rows = useMemo(() => items.map((e: any) => ({
    id:          e.id,
    _raw:        e,
    entryNumber: <span style={{ fontWeight: 600, color: "#2563eb" }}>{e.entryNumber ?? e.id?.slice(0, 8)}</span>,
    date:        e.transactionDate ? new Date(e.transactionDate).toLocaleDateString("en-IN") : "\u2014",
    debit:       e.debitLedger?.name ?? e.debitLedgerId ?? "\u2014",
    credit:      e.creditLedger?.name ?? e.creditLedgerId ?? "\u2014",
    amount:      <span style={{ fontWeight: 700, color: "#111827" }}>{fmt(e.amount ?? 0)}</span>,
    narration:   <span style={{ fontSize: 12, color: "#6b7280" }}>{e.narration ?? "\u2014"}</span>,
    status:      <Badge variant={e.status === "POSTED" ? "success" : e.status === "VOIDED" ? "danger" : "secondary"}>
                   {e.status ?? "POSTED"}
                 </Badge>,
  })), [items]);

  return (
    <TableFull
      data={rows}
      title="Journal Entries"
      tableKey="journal-entries"
      columns={COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      filterConfig={FILTER_CONFIG}
      onCreate={handleCreate}
      onRowEdit={handleRowEdit}
    />
  );
}
