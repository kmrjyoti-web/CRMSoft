"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";

import { TableFull, Input, SelectInput, NumberInput, Icon, Badge } from "@/components/ui";
import { useSidePanelStore } from "@/stores/side-panel.store";

import {
  usePurchaseMasterList,
  useCreatePurchaseMaster,
  useUpdatePurchaseMaster,
} from "../hooks/useAccounts";

// ── Constants ─────────────────────────────────────────────────────────────

const TAXABILITY_OPTIONS = [
  { value: "TAXABLE",    label: "Taxable" },
  { value: "EXEMPTED",   label: "Exempted" },
  { value: "NIL_RATED",  label: "Nil Rated" },
  { value: "ZERO_RATED", label: "Zero Rated" },
];

const NATURE_OPTIONS = [
  { value: "PURCHASE",        label: "Purchase" },
  { value: "PURCHASE_RETURN", label: "Purchase Return" },
  { value: "IMPORT",          label: "Import" },
  { value: "SEZ_PURCHASE",    label: "SEZ Purchase" },
];

const COLUMNS = [
  { id: "name",        label: "Purchase Type", visible: true },
  { id: "igstRate",    label: "IGST %",        visible: true },
  { id: "cgstRate",    label: "CGST %",        visible: true },
  { id: "sgstRate",    label: "SGST %",        visible: true },
  { id: "cessRate",    label: "CESS %",        visible: true },
  { id: "taxability",  label: "Taxability",    visible: true },
  { id: "isDefault",   label: "Default",       visible: true },
];

const INITIAL_FORM = {
  name: "",
  code: "",
  igstRate: null as number | null,
  cgstRate: null as number | null,
  sgstRate: null as number | null,
  cessRate: null as number | null,
  taxability: "TAXABLE",
  natureOfTransaction: "PURCHASE",
  isDefault: false,
  localLedgerId: "",
  centralLedgerId: "",
};

// ── Inner Form (rendered inside panel) ────────────────────────────────────

function PurchaseMasterForm({
  initialData,
  editId,
  onSuccess,
}: {
  initialData: typeof INITIAL_FORM;
  editId: string | null;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState(initialData);
  const createMutation = useCreatePurchaseMaster();
  const updateMutation = useUpdatePurchaseMaster();
  const set = (f: string, v: any) => setForm((p) => ({ ...p, [f]: v }));

  async function handleSave() {
    if (!form.name || !form.code) {
      toast.error("Name and Code are required");
      return;
    }
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, data: form });
        toast.success("Purchase master updated");
      } else {
        await createMutation.mutateAsync(form);
        toast.success("Purchase master created");
      }
      onSuccess();
    } catch {
      toast.error("Failed to save");
    }
  }

  return (
    <form
      id="sp-form-purchase-master"
      onSubmit={(e) => { e.preventDefault(); handleSave(); }}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Input
          label="Purchase Type Name *"
          value={form.name}
          onChange={(v) => set("name", v)}
          leftIcon={<Icon name="tag" size={16} />}
        />
        <Input
          label="Code *"
          value={form.code}
          onChange={(v) => set("code", v)}
          leftIcon={<Icon name="hash" size={16} />}
        />
        <NumberInput
          label="IGST %"
          value={form.igstRate}
          onChange={(v) => set("igstRate", v)}
        />
        <NumberInput
          label="CGST %"
          value={form.cgstRate}
          onChange={(v) => set("cgstRate", v)}
        />
        <NumberInput
          label="SGST %"
          value={form.sgstRate}
          onChange={(v) => set("sgstRate", v)}
        />
        <NumberInput
          label="CESS %"
          value={form.cessRate}
          onChange={(v) => set("cessRate", v)}
        />
        <SelectInput
          label="Taxability"
          value={form.taxability}
          options={TAXABILITY_OPTIONS}
          onChange={(v) => set("taxability", String(v ?? "TAXABLE"))}
          leftIcon={<Icon name="percent" size={16} />}
        />
        <SelectInput
          label="Nature of Transaction"
          value={form.natureOfTransaction}
          options={NATURE_OPTIONS}
          onChange={(v) => set("natureOfTransaction", String(v ?? "PURCHASE"))}
          leftIcon={<Icon name="file-text" size={16} />}
        />
      </div>
    </form>
  );
}

// ── List Component ─────────────────────────────────────────────────────────

export function PurchaseMasterList() {
  const { data } = usePurchaseMasterList();
  const { openPanel, closePanel } = useSidePanelStore();

  const rows = useMemo(() => {
    const list: any[] = (data as any)?.data ?? [];
    return list.map((pm: any) => ({
      id:         pm.id,
      name:       pm.name,
      igstRate:   Number(pm.igstRate ?? 0).toFixed(2),
      cgstRate:   Number(pm.cgstRate ?? 0).toFixed(2),
      sgstRate:   Number(pm.sgstRate ?? 0).toFixed(2),
      cessRate:   Number(pm.cessRate ?? 0).toFixed(2),
      taxability: pm.taxability,
      isDefault:  pm.isDefault ? <Badge variant="success">Default</Badge> : "—",
    }));
  }, [data]);

  function openCreatePanel() {
    const panelId = "create-purchase-master";
    openPanel({
      id:    panelId,
      title: "New Purchase Master",
      icon:  "tag",
      width: 600,
      content: (
        <PurchaseMasterForm
          initialData={INITIAL_FORM}
          editId={null}
          onSuccess={() => closePanel(panelId)}
        />
      ),
      footerButtons: [
        {
          id: "cancel", label: "Cancel", showAs: "text" as const, variant: "secondary" as const,
          onClick: () => useSidePanelStore.getState().closePanel(panelId),
        },
        {
          id: "save", label: "Create", icon: "check", showAs: "both" as const, variant: "primary" as const,
          onClick: () => {
            const f = document.getElementById("sp-form-purchase-master") as HTMLFormElement | null;
            f?.requestSubmit();
          },
        },
      ],
    });
  }

  function openEditPanel(row: any) {
    const list: any[] = (data as any)?.data ?? [];
    const pm = list.find((p: any) => p.id === row.id);
    if (!pm) return;
    const panelId = `edit-purchase-master-${pm.id}`;
    const initialData = {
      name:                pm.name,
      code:                pm.code,
      igstRate:            Number(pm.igstRate),
      cgstRate:            Number(pm.cgstRate),
      sgstRate:            Number(pm.sgstRate),
      cessRate:            Number(pm.cessRate),
      taxability:          pm.taxability,
      natureOfTransaction: pm.natureOfTransaction ?? "PURCHASE",
      isDefault:           pm.isDefault,
      localLedgerId:       pm.localLedgerId ?? "",
      centralLedgerId:     pm.centralLedgerId ?? "",
    };
    openPanel({
      id:    panelId,
      title: `Edit — ${pm.name}`,
      icon:  "tag",
      width: 600,
      content: (
        <PurchaseMasterForm
          initialData={initialData}
          editId={pm.id}
          onSuccess={() => closePanel(panelId)}
        />
      ),
      footerButtons: [
        {
          id: "cancel", label: "Cancel", showAs: "text" as const, variant: "secondary" as const,
          onClick: () => useSidePanelStore.getState().closePanel(panelId),
        },
        {
          id: "save", label: "Save Changes", icon: "check", showAs: "both" as const, variant: "primary" as const,
          onClick: () => {
            const f = document.getElementById("sp-form-purchase-master") as HTMLFormElement | null;
            f?.requestSubmit();
          },
        },
      ],
    });
  }

  return (
    <TableFull
      data={rows}
      title="Purchase Master"
      tableKey="purchase-masters"
      columns={COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onRowEdit={openEditPanel}
      onCreate={openCreatePanel}
    />
  );
}
