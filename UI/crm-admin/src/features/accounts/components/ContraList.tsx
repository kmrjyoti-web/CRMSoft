"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { TableFull, Badge, Icon, Input, NumberInput, SelectInput, DatePicker } from "@/components/ui";
import type { TableFilterConfig } from "@/components/ui";
import { useEntityPanel } from "@/hooks/useEntityPanel";
import { useContraEntries, useCreateContraEntry, useChartOfAccounts } from "../hooks/useAccounts";

// -- Columns -----------------------------------------------------------------

const COLUMNS = [
  { id: "entryNumber",  label: "Contra #",      visible: true },
  { id: "date",         label: "Date",           visible: true },
  { id: "fromAccount",  label: "From Account",   visible: true },
  { id: "toAccount",    label: "To Account",     visible: true },
  { id: "transferMode", label: "Mode",           visible: true },
  { id: "amount",       label: "Amount",         visible: true },
  { id: "narration",    label: "Narration",      visible: true },
  { id: "status",       label: "Status",         visible: true },
];

const FILTER_CONFIG: TableFilterConfig = {
  sections: [
    {
      title: "Transfer Mode",
      defaultOpen: true,
      filters: [
        {
          columnId: "transferMode",
          label: "Mode",
          filterType: "master",
          queryParam: "transferMode",
          options: [
            { value: "CASH",   label: "Cash" },
            { value: "BANK",   label: "Bank Transfer" },
            { value: "NEFT",   label: "NEFT" },
            { value: "RTGS",   label: "RTGS" },
            { value: "IMPS",   label: "IMPS" },
            { value: "UPI",    label: "UPI" },
            { value: "CHEQUE", label: "Cheque" },
          ],
        },
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
    {
      title: "Date",
      defaultOpen: false,
      filters: [
        { columnId: "date", label: "Transfer Date", filterType: "date", queryParam: "date" },
      ],
    },
  ],
};

const fmt = (n: number) =>
  `\u20B9${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const MODE_VARIANT: Record<string, "primary" | "success" | "warning" | "secondary"> = {
  CASH: "warning", BANK: "primary", NEFT: "primary",
  RTGS: "success", IMPS: "success", UPI: "success", CHEQUE: "secondary",
};

// -- Create Form (adapted for useEntityPanel) --------------------------------

const TRANSFER_MODES = [
  { value: "CASH",   label: "Cash" },
  { value: "BANK",   label: "Bank Transfer" },
  { value: "NEFT",   label: "NEFT" },
  { value: "RTGS",   label: "RTGS" },
  { value: "IMPS",   label: "IMPS" },
  { value: "UPI",    label: "UPI" },
  { value: "CHEQUE", label: "Cheque" },
];

function ContraForm({
  contraId,
  onSuccess,
  panelId,
  mode,
}: {
  contraId?: string;
  onSuccess?: () => void;
  panelId?: string;
  mode?: string;
}) {
  const { data: chartData } = useChartOfAccounts();
  const createMut = useCreateContraEntry();

  const [form, setForm] = useState({
    transactionDate: new Date().toISOString().slice(0, 10),
    fromLedgerId:    "",
    toLedgerId:      "",
    transferMode:    "BANK",
    amount:          null as number | null,
    chequeNumber:    "",
    transactionRef:  "",
    narration:       "",
  });

  // Build account options: bank ledgers + cash ledgers from chart of accounts
  const accountOptions = useMemo(() => {
    const arr: any[] = (chartData as any)?.data ?? chartData ?? [];
    const list = Array.isArray(arr) ? arr : [];
    return list
      .filter((l: any) => ["BANK", "CASH", "BANK_ACCOUNT", "CASH_IN_HAND"].includes(l.accountType ?? l.type ?? ""))
      .map((l: any) => ({ label: `${l.code ?? ""} \u2013 ${l.name}`, value: l.id }));
  }, [chartData]);

  // Fallback: if no filtered ledgers, show all
  const allLedgerOptions = useMemo(() => {
    const arr: any[] = (chartData as any)?.data ?? chartData ?? [];
    const list = Array.isArray(arr) ? arr : [];
    return list.map((l: any) => ({ label: `${l.code ?? ""} \u2013 ${l.name}`, value: l.id }));
  }, [chartData]);

  const options = accountOptions.length > 0 ? accountOptions : allLedgerOptions;

  const fromName = options.find((o) => o.value === form.fromLedgerId)?.label ?? "\u2014";
  const toName   = options.find((o) => o.value === form.toLedgerId)?.label   ?? "\u2014";

  const showChequeRef  = form.transferMode === "CHEQUE";
  const showTxnRef     = ["NEFT", "RTGS", "IMPS", "UPI", "BANK"].includes(form.transferMode);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.transactionDate)               { toast.error("Date is required"); return; }
    if (!form.fromLedgerId)                  { toast.error("From account is required"); return; }
    if (!form.toLedgerId)                    { toast.error("To account is required"); return; }
    if (form.fromLedgerId === form.toLedgerId) { toast.error("From and To accounts must differ"); return; }
    if (!form.amount || form.amount <= 0)    { toast.error("Amount must be > 0"); return; }

    try {
      await createMut.mutateAsync({
        transactionDate: form.transactionDate,
        fromLedgerId:    form.fromLedgerId,
        toLedgerId:      form.toLedgerId,
        transferMode:    form.transferMode,
        amount:          form.amount,
        chequeNumber:    form.chequeNumber   || undefined,
        transactionRef:  form.transactionRef || undefined,
        narration:       form.narration      || undefined,
      });
      toast.success("Contra entry created");
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to create contra entry");
    }
  };

  return (
    <form
      id={`sp-form-contra-${contraId ?? "new"}`}
      onSubmit={handleSubmit}
      className="p-5 space-y-4"
    >
      {/* Transfer preview */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10,
        alignItems: "center", padding: "14px", background: "#f0f9ff",
        borderRadius: 10, border: "1px solid #bae6fd",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>From</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#0c4a6e" }}>{fromName}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 2 }}><Icon name="arrow-right" size={20} /></div>
          <div style={{ fontWeight: 700, color: "#2563eb", fontSize: 13 }}>
            {form.amount ? fmt(form.amount) : "\u20B90.00"}
          </div>
          <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{form.transferMode}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>To</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#14532d" }}>{toName}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DatePicker
          label="Transfer Date"
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
      </div>

      <SelectInput
        label="From Account"
        leftIcon={<Icon name="wallet" size={16} />}
        options={options}
        value={form.fromLedgerId}
        onChange={(v) => setForm((p) => ({ ...p, fromLedgerId: String(v ?? "") }))}
      />

      <SelectInput
        label="To Account"
        leftIcon={<Icon name="bank" size={16} />}
        options={options}
        value={form.toLedgerId}
        onChange={(v) => setForm((p) => ({ ...p, toLedgerId: String(v ?? "") }))}
      />

      <SelectInput
        label="Transfer Mode"
        leftIcon={<Icon name="credit-card" size={16} />}
        options={TRANSFER_MODES}
        value={form.transferMode}
        onChange={(v) => setForm((p) => ({ ...p, transferMode: String(v ?? "BANK") }))}
      />

      {showChequeRef && (
        <Input
          label="Cheque Number"
          leftIcon={<Icon name="hash" size={16} />}
          value={form.chequeNumber}
          onChange={(v) => setForm((p) => ({ ...p, chequeNumber: v }))}
        />
      )}

      {showTxnRef && (
        <Input
          label="Transaction Reference"
          leftIcon={<Icon name="link" size={16} />}
          value={form.transactionRef}
          onChange={(v) => setForm((p) => ({ ...p, transactionRef: v }))}
        />
      )}

      <Input
        label="Narration"
        leftIcon={<Icon name="align-left" size={16} />}
        value={form.narration}
        onChange={(v) => setForm((p) => ({ ...p, narration: v }))}
      />
    </form>
  );
}

// -- List Component ----------------------------------------------------------

export function ContraList() {
  const { data } = useContraEntries();

  const { handleCreate, handleRowEdit } = useEntityPanel({
    entityKey: "contra",
    entityLabel: "Contra Entry",
    FormComponent: ContraForm,
    idProp: "contraId",
    editRoute: "/accounts/contra/:id/edit",
    createRoute: "/accounts/contra/new",
    displayField: "entryNumber",
  });

  const items: any[] = useMemo(() => {
    const raw = (data as any)?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const rows = useMemo(() => items.map((e: any) => ({
    id:           e.id,
    _raw:         e,
    entryNumber:  <span style={{ fontWeight: 600, color: "#2563eb" }}>{e.entryNumber ?? e.id?.slice(0, 8)}</span>,
    date:         e.transactionDate ? new Date(e.transactionDate).toLocaleDateString("en-IN") : "\u2014",
    fromAccount:  e.fromLedger?.name ?? e.fromLedgerId ?? "\u2014",
    toAccount:    e.toLedger?.name   ?? e.toLedgerId   ?? "\u2014",
    transferMode: <Badge variant={MODE_VARIANT[e.transferMode] ?? "secondary"}>{e.transferMode ?? "\u2014"}</Badge>,
    amount:       <span style={{ fontWeight: 700, color: "#111827" }}>{fmt(e.amount ?? 0)}</span>,
    narration:    <span style={{ fontSize: 12, color: "#6b7280" }}>{e.narration ?? "\u2014"}</span>,
    status:       <Badge variant={e.status === "POSTED" ? "success" : e.status === "VOIDED" ? "danger" : "secondary"}>
                    {e.status ?? "POSTED"}
                  </Badge>,
  })), [items]);

  return (
    <TableFull
      data={rows}
      title="Contra Entries"
      tableKey="contra-entries"
      columns={COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      filterConfig={FILTER_CONFIG}
      onCreate={handleCreate}
      onRowEdit={handleRowEdit}
    />
  );
}
