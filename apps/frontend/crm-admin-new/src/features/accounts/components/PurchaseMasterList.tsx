"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";

import { TableFull, Input, SelectInput, NumberInput, Icon, Badge } from "@/components/ui";
import { useEntityPanel } from "@/hooks/useEntityPanel";

import {
  usePurchaseMasterList,
  useCreatePurchaseMaster,
  useUpdatePurchaseMaster,
} from "../hooks/useAccounts";

// -- Constants ---------------------------------------------------------------

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

// -- Inner Form (adapted for useEntityPanel) ---------------------------------

function PurchaseMasterForm({
  purchaseMasterId,
  onSuccess,
  panelId,
  mode,
}: {
  purchaseMasterId?: string;
  onSuccess?: () => void;
  panelId?: string;
  mode?: string;
}) {
  const { data } = usePurchaseMasterList();
  const isEdit = !!purchaseMasterId;

  const initialData = useMemo(() => {
    if (!isEdit) return INITIAL_FORM;
    const list: any[] = data?.data ?? [];
    const pm = list.find((p: any) => p.id === purchaseMasterId);
    if (!pm) return INITIAL_FORM;
    return {
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
  }, [data, purchaseMasterId, isEdit]);

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
      if (isEdit) {
        await updateMutation.mutateAsync({ id: purchaseMasterId!, data: form });
        toast.success("Purchase master updated");
      } else {
        await createMutation.mutateAsync(form);
        toast.success("Purchase master created");
      }
      onSuccess?.();
    } catch {
      toast.error("Failed to save");
    }
  }

  return (
    <form
      id={`sp-form-purchase-master-${purchaseMasterId ?? "new"}`}
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

// -- List Component ----------------------------------------------------------

export function PurchaseMasterList() {
  const { data } = usePurchaseMasterList();

  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "purchase-master",
    entityLabel: "Purchase Master",
    FormComponent: PurchaseMasterForm,
    idProp: "purchaseMasterId",
    editRoute: "/accounts/purchase-masters/:id/edit",
    createRoute: "/accounts/purchase-masters/new",
    displayField: "name",
    panelWidth: 600,
  });

  const rows = useMemo(() => {
    const list: any[] = data?.data ?? [];
    return list.map((pm: any) => ({
      id:         pm.id,
      name:       pm.name,
      igstRate:   Number(pm.igstRate ?? 0).toFixed(2),
      cgstRate:   Number(pm.cgstRate ?? 0).toFixed(2),
      sgstRate:   Number(pm.sgstRate ?? 0).toFixed(2),
      cessRate:   Number(pm.cessRate ?? 0).toFixed(2),
      taxability: pm.taxability,
      isDefault:  pm.isDefault ? <Badge variant="success">Default</Badge> : "\u2014",
    }));
  }, [data]);

  return (
    <TableFull
      data={rows}
      title="Purchase Master"
      tableKey="purchase-masters"
      columns={COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onRowEdit={handleRowEdit}
      onCreate={handleCreate}
    />
  );
}
